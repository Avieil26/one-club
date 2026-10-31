import assert from 'node:assert/strict';
import { loadPlayerCatalogue, loadRepositoryModule } from './load-player-catalogue.mjs';
const cards = loadPlayerCatalogue();
assert.equal(cards.length,20258,'Keep 20223 originals + 35 new editions');
assert.equal(cards.filter(x=>x.id.startsWith('scream2-')).length,35);
const {pointsSegments,pointsPlans,pointsPlanValid}=loadRepositoryModule('lib/sbcVerified.ts');
for(const [id,target] of [['sbc-reijnders-scream-20261030',60000],['sbc-81-totw1-7-upgrade-20261030',22000]]){
 const segments=pointsSegments(id);
 assert.equal(segments.length,1,id+' expected one valid points segment');
 assert.equal(segments[0].target,target);
 for(const platform of ['ps5','pc']){
  const plans=pointsPlans(segments[0],platform);
  assert(plans.length,id+'/'+platform+' must offer real generated options');
  for(const plan of plans)assert(pointsPlanValid(segments[0],plan,platform),'invalid '+id+' '+platform);
 }
}
const {officialChallenges}=loadRepositoryModule('lib/sbcCatalog.ts');
const zombie=officialChallenges.find(x=>x.id==='sbc-freaky-zombie-20261030');
assert(zombie && zombie.kind==='classic' && zombie.manualValidation!==true && zombie.rules?.playerCount===7);
const {recentCardFor}=loadRepositoryModule('lib/recentCards.ts');
for(const row of cards.filter(x=>x.id.startsWith('scream2-')&&!x.id.includes('reijnders'))){
 const card=recentCardFor(row.id);
 assert(card && Number.isInteger(card.itemId),row.id);
 assert(card.foot==='L'||card.foot==='R',row.id+' missing foot');
 assert(card.skillMoves>=1&&card.skillMoves<=5,row.id+' missing skill');
 assert(card.weakFoot>=1&&card.weakFoot<=5,row.id+' missing weak foot');
}
console.log('PASS: 20258 cards, 34 Team 2 edition foot/skill/wf details, both SBC score plans and 7-slot self builder.');
