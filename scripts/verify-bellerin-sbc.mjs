import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadRepositoryModule as load } from './load-player-catalogue.mjs';
const id = 'sbc-bellerin-20261027';
const { officialChallenges } = load('lib/sbcCatalog.ts');
const { pointsSegments, pointsPlans, pointsPlanValid } = load('lib/sbcVerified.ts');
const { rewardKind, filterSbcs } = load('lib/sbcBrowse.ts');
const { PLAYERS } = load('lib/fcPlayers.ts');
const { itemScore } = load('lib/sbcItemScore.ts');
const { eligiblePointsPlayer } = load('lib/sbcEligibility.ts');
const { sbcText } = load('lib/sbcLocalization.ts');
const challenge = officialChallenges.find(c => c.id === id);
assert(challenge);
assert.equal(challenge.targetScore, 30000);
assert.equal(challenge.endsAt, '2026-11-03T18:00:00.000Z');
assert.equal(rewardKind(challenge), 'players');
assert.equal(filterSbcs([challenge], 'bellerin', 'players', Date.parse('2026-10-28T10:00:00Z')).length, 1);
assert.equal(filterSbcs([challenge], 'הקטור', 'players', Date.parse('2026-10-28T10:00:00Z')).length, 1);
for(const locale of ['ar','pt-BR','es']) assert.notEqual(sbcText(challenge.requirements, locale), challenge.requirements);
assert.equal(PLAYERS.length, 20198);
const [segment] = pointsSegments(id);
assert.equal(segment.target, 30000);
assert.deepEqual(segment.requirements, ['Rating: Min. 45']);
const expected = {'verified-mixed': [27,30030], 'verified-six': [6,30200], 'verified-seven': [7,30100], 'verified-five': [5,30300], 'verified-four': [4,30400]};
for (const platform of ['ps5','pc']) {
 const plans = pointsPlans(segment,platform);
 for (const [key,[count,total]] of Object.entries(expected)) {
  const plan = plans.find(p=>p.key === key); assert(plan, `${platform}: ${key} absent`);
  assert.equal(plan.count,count); assert.equal(plan.total,total); assert(pointsPlanValid(segment,plan,platform));
  for (const line of plan.lines) {
    assert.equal(itemScore(line.player),line.scoreEach);
    assert(eligiblePointsPlayer(line.player,segment.requirements));
    assert(line.alternatives.every(p => p.rating === line.player.rating && itemScore(p) === line.scoreEach && eligiblePointsPlayer(p,segment.requirements)));
  }
 }
 const partial = pointsPlans(segment,platform,16000); assert(partial.length); assert(partial.every(p=>p.total>=14000));
 assert.equal(pointsPlans(segment,platform,30000).length,0);
 assert.equal(pointsPlans(segment,platform,-1).length,0);
}
const view = fs.readFileSync('components/SbcPointsSolution.tsx','utf8');
assert(view.includes('Submit at most 30 items at a time'));
console.log('Bellerín: 30,000 points; five cross-checked plans on both platforms; eligibility, expiry, partial progress, translations and catalogue verified.');
