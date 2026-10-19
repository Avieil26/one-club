import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadPlayerCatalogue, loadRepositoryModule } from './load-player-catalogue.mjs';

const catalogue = new Map(loadPlayerCatalogue().map((player) => [player.id, player]));
const restored = JSON.parse(fs.readFileSync('scripts/fixtures/restored-cards-20261019.json', 'utf8'));
assert.equal(restored.cards.length, 38);
for (const expected of restored.cards) {
  const card = catalogue.get(expected.id);
  assert.ok(card, `Restored card disappeared: ${expected.id}`);
  assert.equal(card.rating, expected.rating, expected.id);
  assert.equal(card.position, expected.position, expected.id);
}

const { createGrounds } = loadRepositoryModule('lib/logic.ts');
const { seedDatabase } = loadRepositoryModule('lib/seed.ts');
const { GROUNDS_PLAYSTYLES, sanitizeGroundsPlayStyles } = loadRepositoryModule('lib/groundsPlaystyles.ts');
assert.equal(GROUNDS_PLAYSTYLES.length, 36);
assert.deepEqual(sanitizeGroundsPlayStyles([
  { id: 'quick-step', tier: 'base' },
  { id: 'unknown-style', tier: 'plus' },
  { id: 'quick-step', tier: 'plus' },
]), [{ id: 'quick-step', tier: 'plus' }]);

const db = seedDatabase();
db.sessionUserId = db.profiles[0].id;
const input = {
  intent: 'looking_for_club', platform: 'ps5', position: 'ST', division: '7',
  playerLevel: 50, skillRating: '1250', archetype: 'Creator', region: 'מרכז',
  eaId: 'preview-regression-player', gamertag: '', avatarUri: null, levelImageUri: null,
  playStyles: [{ id: 'quick-step', tier: 'plus' }],
};
createGrounds(db, input);
const post = db.groundsPosts[0];
assert.equal(post.skillRating, 1250, 'Skill Rating must not be clamped to a card OVR');
assert.equal(post.playerLevel, 50, 'Archetype level stays separate from Skill Rating');
assert.deepEqual(post.playStyles, input.playStyles);
const count = db.groundsPosts.length;
for (const skillRating of ['0', '5001', '12.5', 'invalid']) {
  assert.throws(() => createGrounds(db, { ...input, skillRating }));
}
assert.throws(() => createGrounds(db, { ...input, eaId: '', gamertag: '' }));
assert.equal(db.groundsPosts.length, count, 'Rejected submissions must not create posts');
db.sessionUserId = null;
assert.throws(() => createGrounds(db, input));
console.log('Preservation checks passed: 38 restored identities; 36 PlayStyles; Grounds level, Skill Rating and input validation.');
