#!/usr/bin/env node
/**
 * Convert reviewed feed entries into the app's SbcChallenge shape.
 * Only complete, supported challenges are eligible. No DB writes/deployment.
 * Usage: node scripts/prepare-sbc-catalog.mjs artifacts/content-sync/pending.json
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const path = process.argv[2];
if (!path) throw new Error('Pending feed file is required');
const pending = JSON.parse(await readFile(resolve(path), 'utf8'));
if (pending.status !== 'pending-review' || !Array.isArray(pending.sbcs)) {
  throw new Error('Only validated pending-review feeds are accepted');
}
const text = (x) => typeof x === 'string' && x.trim().length > 0;
const validDate = (x) => typeof x === 'string' && Number.isFinite(Date.parse(x));
const inRange = (x, low, high) => Number.isInteger(x) && x >= low && x <= high;
const supportedRules = new Set([
  'chemistry', 'minRating', 'minNations', 'maxSameLeague', 'maxLeagues',
  'minClubs', 'maxClubs', 'minSameClub', 'maxSameClub', 'minSameLeague',
  'sameNationAtLeast', 'minGold', 'minSilver', 'minBronze', 'minQuality', 'exactQuality',
]);
function checkRules(rules) {
  if (!rules || typeof rules !== 'object' || Array.isArray(rules)) return false;
  if (!inRange(rules.chemistry, 0, 33)) return false;
  for (const [key, value] of Object.entries(rules)) {
    if (!supportedRules.has(key)) return false; // No silent dropping of rules
    if (key === 'minQuality' || key === 'exactQuality') {
      if (!['gold','silver','bronze'].includes(value)) return false;
    } else if (!inRange(value, 0, key === 'minRating' ? 99 : 33)) return false;
  }
  return true;
}
const results = [];
for (const s of pending.sbcs) {
  const a = s.app;
  if (!a || typeof a !== 'object') throw new Error('Missing production mapping for SBC ' + s.id);
  if (!text(a.title) || !text(a.requirements) || !text(a.reward) || !validDate(a.createdAt)) {
    throw new Error('Missing title, requirements, reward or createdAt for ' + s.id);
  }
  if (a.endsAt !== null && !validDate(a.endsAt)) throw new Error('Invalid expiry for ' + s.id);
  if (!['classic','streamlined'].includes(a.kind)) throw new Error('Invalid SBC kind ' + s.id);
  if (a.kind === 'classic' && (!checkRules(a.rules) || a.targetScore !== null)) {
    throw new Error('Incomplete classic SBC rules for ' + s.id);
  }
  if (a.kind === 'streamlined' && (a.rules !== null || !inRange(a.targetScore, 1, 1_000_000))) {
    throw new Error('Incomplete streamlined SBC score for ' + s.id);
  }
  // Do not promise a solution or reward preview before it has been verified.
  if (a.previewSquad != null || a.previewFormation != null) {
    throw new Error('Preview must be separately verified against existing roster for ' + s.id);
  }
  results.push({
    id: 'feed-' + s.id,
    title: a.title,
    kind: a.kind,
    requirements: a.requirements,
    endsAt: a.endsAt,
    createdBy: 'content-sync',
    targetScore: a.targetScore,
    rules: a.rules,
    createdAt: a.createdAt,
    reward: a.reward,
    clubs: [],
    previewFormation: null,
    previewSquad: null,
  });
}
await mkdir('artifacts/content-sync', { recursive: true });
await writeFile('artifacts/content-sync/sbc-candidates.json', JSON.stringify(results, null, 2) + '\n');
console.log('Prepared ' + results.length + ' compatible SBC candidates for human review; none published');
