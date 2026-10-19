import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadPlayerCatalogue } from './load-player-catalogue.mjs';

const players = loadPlayerCatalogue();
const readData = (name) => JSON.parse(fs.readFileSync(`assets/data/${name}.json`, 'utf8'));
const byId = new Map(players.map((player) => [player.id, player]));
const editionCounts = players.reduce((counts, player) => {
  const edition = player.edition ?? 'base';
  counts[edition] = (counts[edition] ?? 0) + 1;
  return counts;
}, {});

assert.equal(byId.size, players.length, 'Duplicate card IDs in the runtime catalogue');
for (const row of readData('players')) {
  const card = byId.get(row.id);
  assert.ok(card, `Regular player disappeared: ${row.id}`);
  assert.ok(!card.edition, `Regular player was replaced by a promo: ${row.id}`);
}
for (const [file, edition, expected] of [
  ['totw', 'totw', 92],
  ['futureStars', 'future-stars', 15],
  ['starPerformers', 'star-performer', 6],
]) {
  const rows = readData(file);
  assert.equal(rows.length, expected, `Unexpected ${file} source count`);
  assert.equal(editionCounts[edition], expected, `Missing ${edition} runtime cards`);
  for (const row of rows) {
    const id = row.baseId ? `${row.baseId}--${edition}` : row.id;
    const card = byId.get(id);
    assert.equal(card?.edition, edition, `Missing special card: ${id}`);
    assert.equal(card.rating, row.rating, `Wrong special-card rating: ${id}`);
    assert.equal(card.position, row.position, `Wrong special-card position: ${id}`);
  }
}
const destined = readData('destinedEditions');
assert.equal(Object.keys(destined).length, 30, 'Expected both DFG teams');
assert.equal(editionCounts.destined, 30, 'Missing DFG runtime cards');
for (const [baseId, row] of Object.entries(destined)) {
  const card = byId.get(`${baseId}--destined`);
  assert.equal(card?.rating, row.rating, `Wrong DFG rating: ${baseId}`);
  assert.deepEqual(card.face, row.face, `Wrong DFG face stats: ${baseId}`);
}

console.log(JSON.stringify({
  expected: 20118,
  calculated: players.length,
  uniqueIds: byId.size,
  missingFromTarget: 20118 - players.length,
  editionCounts,
}, null, 2));
assert.equal(players.length, 20118,
  `Runtime catalogue has ${players.length} cards; expected 20118. Refusing this build.`);
