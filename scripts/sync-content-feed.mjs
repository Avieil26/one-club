#!/usr/bin/env node
// Safe staging importer for licensed/authorized FC content feeds.
// Usage: node scripts/sync-content-feed.mjs feed.json
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = process.argv[2];
if (!source) throw new Error('Provide a JSON feed path');
const feed = JSON.parse(await readFile(resolve(source), 'utf8'));
if (!Array.isArray(feed.cards) || !Array.isArray(feed.sbcs)) throw new Error('Expected cards and sbcs arrays');
const ids = new Set();
const clean = (v) => typeof v === 'string' && v.trim().length > 0;
const cards = feed.cards.map((c) => {
  if (!clean(c.id) || !clean(c.name) || !clean(c.program) || !Number.isInteger(c.rating) || c.rating < 1 || c.rating > 99) throw new Error('Invalid card');
  if (ids.has('card:' + c.id)) throw new Error('Duplicate card ' + c.id);
  ids.add('card:' + c.id);
  return c;
});
const sbcs = feed.sbcs.map((s) => {
  if (!clean(s.id) || !clean(s.name) || !Array.isArray(s.requirements) || !s.requirements.length || !clean(s.rewardCardId)) throw new Error('Invalid SBC');
  if (ids.has('sbc:' + s.id)) throw new Error('Duplicate SBC ' + s.id);
  ids.add('sbc:' + s.id);
  return s;
});
if (feed.source !== 'authorized' || !clean(feed.sourceUrl)) throw new Error('Source authorization and URL required');
const snapshot = { sourceUrl: feed.sourceUrl, checkedAt: new Date().toISOString(), status: 'pending-review', cards, sbcs };
await mkdir('artifacts/content-sync', { recursive: true });
await writeFile('artifacts/content-sync/pending.json', JSON.stringify(snapshot, null, 2) + '\n');
console.log('Staged ' + cards.length + ' cards and ' + sbcs.length + ' SBCs; no production data changed');
