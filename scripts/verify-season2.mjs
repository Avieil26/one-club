import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { loadPlayerCatalogue, loadRepositoryModule } from './load-player-catalogue.mjs';

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const all = loadPlayerCatalogue();
const audit = JSON.parse(fs.readFileSync('docs/season2-data-audit.json', 'utf8'));
const cards = JSON.parse(fs.readFileSync('assets/data/season2.json', 'utf8'));
const prior = all.filter((card) => card.edition !== 'season2');
assert.equal(prior.length, 20118);
assert.equal(hash(JSON.stringify(prior)), audit.previousCatalogueSha256, 'Existing cards or their order changed');
assert.equal(all.length, 20147);
assert.equal(cards.length, 29);
assert.equal(new Set(all.map((card) => card.id)).size, all.length);
assert.equal(new Set(cards.map((card) => card.backgroundId)).size, 4);
const { META_ATTRS } = loadRepositoryModule('lib/playerMeta.ts');
const { season2CardMeta } = loadRepositoryModule('lib/season2.ts');
const { playerMatches, EMPTY_FILTERS } = loadRepositoryModule('lib/playerFilter.ts');
assert.equal(all.filter((card) => playerMatches(card, { ...EMPTY_FILTERS, kind: 'season2' })).length, 29);
for (const card of cards) {
  const expected = audit.cards.find((row) => row.itemId === card.itemId);
  assert.equal(card.rating, expected.rating, card.id);
  assert.equal(card.backgroundId, expected.backgroundId, card.id);
  assert.deepEqual(card.attributes, expected.attributes, card.id);
  for (const key of META_ATTRS) assert.equal(typeof season2CardMeta(card).stats[key], 'number', `${card.id} missing ${key}`);
  assert.equal(hash(fs.readFileSync(`assets/images/cards/season2/${card.itemId}.webp`)), expected.artSha256, 'Original card render changed');
  assert.equal(playerMatches(card, { ...EMPTY_FILTERS, kind: 'gold' }), false);
  const a = card.acquisition;
  if (a.kind.endsWith('-pass')) {
    assert.equal(a.seasonPoints, a.level * 1000);
    assert.equal(a.premium, a.kind === 'premium-pass');
  }
  if (a.kind === 'objective') {
    assert.ok(a.tasks.length > 0);
    for (const task of [...a.tasks, ...(a.dependencies ?? []).flatMap((g) => g.tasks)]) {
      assert.ok(task.he && task.en);
    }
  }
}
for (const itemId of [50531562]) assert.equal(cards.find((card) => card.itemId === itemId).acquisition.seasonPoints, 5000);
for (const name of ['Timo Werner', 'Silas', 'Nabil Fekir']) assert.equal(cards.find((card) => card.en === name).acquisition.seasonPoints, 20000);
assert.equal(cards.find((card) => card.en === 'Marcus Rashford').acquisition.seasonPoints, 30000);
assert.match(cards.find((card) => card.en === 'Olga Carmona').acquisition.summaryHe, /7 מתוך 8/);
assert.equal(cards.find((card) => card.en === 'Jeremiah St. Juste').acquisition.dependencies.length, 3);
assert.equal(cards.filter((card) => card.acquisition.kind === 'unverified').length, 9);
console.log('Season 2 verified: 29 exact cards, four original backgrounds, full attributes, SP thresholds, objective tasks; all 20,118 existing cards unchanged.');
