import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadPlayerCatalogue, loadRepositoryModule } from './load-player-catalogue.mjs';

const cards = JSON.parse(fs.readFileSync('assets/data/recentCards20261108.json', 'utf8'));
const sbc = JSON.parse(fs.readFileSync('assets/data/sbc-refresh-20261108.json', 'utf8'));
const all = loadPlayerCatalogue();
const byId = new Map(all.map((c) => [c.id, c]));

assert.equal(cards.length, 85);
assert.equal(new Set(cards.map((c) => c.id)).size, 85);
assert.equal(cards.filter((c) => c.family === 'Team of the Week 8').length, 23);
assert.equal(cards.filter((c) => c.family === 'RTTK 1').length, 54);
assert.equal(cards.filter((c) => !['Team of the Week 8', 'RTTK 1'].includes(c.family)).length, 8);
assert.equal(all.length, 20343);
assert.equal(new Set(all.map((c) => c.id)).size, 20343);

for (const card of cards) {
  assert.equal(card.id, `recent-${card.itemId}`);
  assert.equal(byId.get(card.id)?.itemId, card.itemId, card.id);
  assert.equal(Object.keys(card.attributes).length, 34, card.id + ' full attributes');
  assert(['L', 'R'].includes(card.foot), card.id + ' foot');
  assert(card.weakFoot >= 1 && card.weakFoot <= 5, card.id + ' weak foot');
  assert(card.skillMoves >= 1 && card.skillMoves <= 5, card.id + ' skills');
  assert(card.face && Number.isInteger(card.face.ovr), card.id + ' face stats');
  assert(card.sourceUrl.startsWith('https://www.fut.gg/'), card.id + ' source');
  assert(card.artUrl && /^https:\/\//.test(card.artUrl), card.id + ' artwork');
  for (const value of Object.values(card.attributes)) assert(Number.isInteger(value) && value >= 0 && value <= 99, card.id + ' attribute range');
  for (const amount of [card.price.console, card.price.pc]) assert(amount === null || amount > 0, card.id + ' price');
}

const rttk = cards.filter((c) => c.family === 'RTTK 1');
const rttkByBase = Map.groupBy(rttk, (c) => c.baseId);
assert.equal(rttkByBase.size, 27);
for (const [baseId, versions] of rttkByBase) {
  assert.equal(versions.length, 2, baseId + ' RTTK pair');
  const standard = versions.find((c) => c.holographicType === null);
  const variant = versions.find((c) => c.holographicType !== null);
  assert(standard && variant, baseId + ' standard + variant');
  assert(['pristine', 'holographic'].includes(variant.holographicType), baseId + ' variant type');
  assert.equal(variant.rating, standard.rating);
  assert.deepEqual(variant.face, standard.face);
}
assert.equal(cards.find((c) => c.itemId === 67360718)?.holographicType, 'pristine');
assert.equal(cards.find((c) => c.itemId === 67340307)?.holographicType, 'pristine');
assert.equal(cards.find((c) => c.itemId === 84127801)?.holographicType, 'holographic');

for (const [id, itemId] of Object.entries({
  'recent-50575228': 50575228,
  'recent-50572392': 50572392,
  'recent-67344599': 67344599,
  'recent-50602173': 50602173,
  'recent-50597548': 50597548,
  'recent-50608200': 50608200,
  'recent-50609347': 50609347,
  'recent-50583987': 50583987,
})) assert.equal(byId.get(id)?.itemId, itemId, id + ' reward/objective card');

assert.equal(sbc.challenges.length, 11);
assert.equal(new Set(sbc.challenges.map((c) => c.id)).size, 11);
const { catalogChallenge } = loadRepositoryModule('lib/sbcCatalog.ts');
for (const challenge of sbc.challenges) {
  const live = catalogChallenge(challenge.id);
  assert(live, challenge.id + ' missing from official catalogue');
  assert.equal(live.endsAt, challenge.endsAt);
  assert.equal(live.reward, challenge.reward);
}

const { pointsSegments, pointsPlans, pointsPlanValid } = loadRepositoryModule('lib/sbcVerified.ts');
const pointTargets = {
  'sbc-ampadu-scream-20261103': 22000,
  'sbc-2x83-upgrade-20261103': 5500,
  'sbc-ojeda-scream-20261104': 24000,
  'sbc-openda-rttk-20261106': 96000,
  'sbc-totw1-8-upgrade-20261106': 18000,
  'sbc-schertenleib-showdown-20261107': 16000,
  'sbc-smith-showdown-20261107': 16000,
  'sbc-feller-showdown-20261107': 12000,
  'sbc-kett-showdown-20261107': 12000,
};
for (const [id, target] of Object.entries(pointTargets)) {
  const segments = pointsSegments(id);
  assert.equal(segments.length, 1, id + ' segment count');
  assert.equal(segments[0].target, target, id + ' target');
  for (const platform of ['ps5', 'pc']) {
    const plans = pointsPlans(segments[0], platform);
    assert(plans.length > 0, id + '/' + platform + ' solution');
    assert(plans.every((plan) => pointsPlanValid(segments[0], plan, platform)), id + '/' + platform + ' valid plans');
  }
}

const { classicSegments, checkClassicSquad } = loadRepositoryModule('lib/sbcClassic.ts');
const { sourceClassicRulesMatch } = loadRepositoryModule('lib/sbcSourceRules.ts');
for (const [id, expected] of [['sbc-rttk-challenge1-20261107', 1], ['sbc-marquee-20261105', 4]]) {
  const segments = classicSegments(id);
  assert.equal(segments.length, expected, id + ' classic segment count');
  for (const segment of segments) {
    assert(segment.squad, id + '/' + segment.name + ' solution');
    assert(sourceClassicRulesMatch(segment.sourceRequirements, segment.rules), id + '/' + segment.name + ' source rules');
    const report = checkClassicSquad(segment, segment.formation, segment.squad);
    assert(report.ready, id + '/' + segment.name + ' invalid solution: ' + JSON.stringify(report.checks));
  }
}

console.log('PASS: 85 Nov 8 cards (23 TOTW8, 54 RTTK, 8 reward/objective), 11 missing SBCs, both-platform points plans and 5 verified classic solutions; catalogue 20,343.');
