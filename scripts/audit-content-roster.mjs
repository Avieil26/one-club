#!/usr/bin/env node
/**
 * Audit staged player variants against the actual bundled roster.
 * Fails closed on duplicate IDs, missing base players, or collisions.
 * Never writes to the catalogue.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const cardsFile = process.argv[2] ?? 'artifacts/content-sync/card-candidates.json';
const baseRoster = JSON.parse(await readFile(resolve('assets/data/players.json'), 'utf8'));
const candidates = JSON.parse(await readFile(resolve(cardsFile), 'utf8'));
if (!Array.isArray(baseRoster) || !Array.isArray(candidates) || baseRoster.length < 1000) {
  throw new Error('Missing or unexpectedly small baseline roster: stop update');
}
const ids = new Set();
for (const p of baseRoster) {
  if (!p || typeof p.id !== 'string' || ids.has(p.id)) throw new Error('Corrupt base roster/duplicate ID: ' + p?.id);
  ids.add(p.id);
}
const baseIds = new Set(ids);
const newIds = new Set();
for (const record of candidates) {
  if (!record || typeof record.externalId !== 'string' || typeof record.baseId !== 'string' ||
      !record.player || typeof record.player.id !== 'string') throw new Error('Invalid candidate');
  if (!baseIds.has(record.baseId)) throw new Error('Unknown base player: ' + record.baseId);
  const id = record.player.id;
  if (ids.has(id) || newIds.has(id)) throw new Error('Candidate ID collision: ' + id);
  newIds.add(id);
}
const report = {
  status: 'review-required',
  baseRegularPlayers: baseRoster.length,
  stagedVariants: candidates.length,
  candidateRegularAndStagedTotal: baseRoster.length + candidates.length,
  baselineUnchanged: true,
  note: 'Total excludes ICON/HERO/TOTW and previously generated promo variants. No production writes.'
};
await mkdir('artifacts/content-sync', {recursive:true});
await writeFile('artifacts/content-sync/roster-audit.json', JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
