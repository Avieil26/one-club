import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadRepositoryModule,loadPlayerCatalogue} from './load-player-catalogue.mjs';
const data=JSON.parse(fs.readFileSync('assets/data/sbc-refresh-20261025.json'));
const {classicSegments,checkClassicSquad,communitySquadStatus}=loadRepositoryModule('lib/sbcClassic.ts');
const {pointsSegments,pointsPlans,pointsPlanValid}=loadRepositoryModule('lib/sbcVerified.ts');
const {parseClassicRequirements}=loadRepositoryModule('lib/sbcSourceRules.ts');
const {catalogChallenge,mergeOfficialSbcs}=loadRepositoryModule('lib/sbcCatalog.ts');
const {openSbcChallenges}=loadRepositoryModule('lib/selectors.ts');
const players=new Map(loadPlayerCatalogue().map(p=>[p.id,p]));
const eaIds={...Object.fromEntries(JSON.parse(fs.readFileSync('assets/data/players.json')).map(p=>[p.id,p.eaId])),...JSON.parse(fs.readFileSync('assets/data/priceEaIds.json'))};
for(const audit of data.existingPointsRequirementAudit){
 const segment=pointsSegments(audit.id).find(s=>s.eaId===audit.eaId);assert(segment);
 assert.equal(segment.target,audit.target);assert.deepEqual(segment.requirements,audit.effectiveRequirements);
 if(audit.knownSourceDisagreement){assert(audit.correctionSources.length>=2);assert.deepEqual(segment.reportedRequirements,audit.reportedRequirements);assert.notDeepEqual(segment.requirements,audit.reportedRequirements);}
 else assert.deepEqual(segment.requirements,audit.reportedRequirements);
}
assert.equal(data.existingPointsRequirementAudit.filter(a=>a.knownSourceDisagreement).length,4);
assert.deepEqual(data.challenges.filter(c=>c.kind==='streamlined').map(c=>c.targetScore),[24000,50000,22000,16000]);
assert.equal(data.challenges.length,9);
assert.equal(data.activeSets.length,27);
for(const set of data.activeSets){assert(set.siteIds.length,set.name+' missing');for(const id of set.siteIds)assert(catalogChallenge(id),id);}
for(const c of data.challenges){
 const current=catalogChallenge(c.id);assert(current);
 assert.equal(current.targetScore,c.targetScore);assert.equal(current.endsAt,c.endsAt);
 assert(mergeOfficialSbcs([{...current,targetScore:1,endsAt:null}],Date.parse(c.endsAt)-1).some(x=>x.id===c.id&&x.targetScore===c.targetScore));
 assert(!mergeOfficialSbcs([{...current,endsAt:null}],Date.parse(c.endsAt)+1).some(x=>x.id===c.id));
 if(c.kind==='streamlined'){
  const s=pointsSegments(c.id)[0];assert.equal(s.target,c.targetScore);assert.deepEqual(s.requirements,['Rating: Min. 45']);
  for(const platform of ['ps5','pc']){
   for(const rate of s.platforms[platform].rates)for(let i=0;i<rate.players.length;i++){
    const p=players.get(rate.players[i]);assert(p&&!p.edition&&!p.icon);assert.equal(p.rating,rate.overall);assert.equal(eaIds[p.id],rate.eaIds[i]);
   }
   for(const submitted of [0,1,Math.floor(s.target/2),s.target-1]){
    const plans=pointsPlans(s,platform,submitted);assert(plans.length);
    for(const plan of plans){const remainder={...s,target:s.target-submitted};assert(pointsPlanValid(remainder,plan,platform));assert(!pointsPlanValid(remainder,{...plan,total:plan.total+1},platform));const wrong=structuredClone(plan);wrong.lines[0].scoreEach++;assert(!pointsPlanValid(remainder,wrong,platform));}
   }
   assert.deepEqual(pointsPlans({...s,requirements:[...s.requirements,'Rare: Min. 1']},platform),[],'Unknown eligibility must block suggestions');
  }
 }else{
  const s=classicSegments(c.id)[0];const report=checkClassicSquad(s,s.formation,s.squad);assert(report.ready,c.id);
  assert.equal(Object.keys(s.squad).length,s.rules.playerCount);
  assert.equal(communitySquadStatus(c.id,s.formation,s.squad),'checked');
  assert(!checkClassicSquad({...s,rules:{...s.rules,unsupportedRareRule:1}},s.formation,s.squad).ready);
  assert(!checkClassicSquad({...s,sourceRequirements:[...s.sourceRequirements,'Rare: Min. 1']},s.formation,s.squad).ready);
  assert(!checkClassicSquad({...s,rules:{...s.rules,chemistry:0}},s.formation,s.squad).ready,'Rules must agree with source');
  assert.equal(parseClassicRequirements(['Unknown requirement']),null);
  assert(!checkClassicSquad({...s,rules:{...s.rules,playerCount:1}},s.formation,s.squad).ready);
  const missing={...s.squad};delete missing[Object.keys(missing)[0]];assert(!checkClassicSquad(s,s.formation,missing).ready);
  const duplicate={...s.squad};duplicate[Object.keys(duplicate)[1]]=Object.values(duplicate)[0];assert(!checkClassicSquad(s,s.formation,duplicate).ready);
  const unknown={...s.squad};unknown[Object.keys(unknown)[0]]='not-a-player';assert(!checkClassicSquad(s,s.formation,unknown).ready);
 }
}
const spooky=classicSegments('sbc-spooky-20261025')[0];
assert.equal(checkClassicSquad(spooky,spooky.formation,spooky.squad).chemistry,14);
const misplaced={...spooky.squad,lw:spooky.squad.st};delete misplaced.st;
assert(!checkClassicSquad(spooky,'343',misplaced).ready,'Locked slot must fail even with seven players');
assert(!checkClassicSquad({...spooky,activeSlots:['st']},'343',spooky.squad).ready);
assert(!checkClassicSquad(spooky,'433',spooky.squad).ready);
assert(!openSbcChallenges(data.challenges,Date.parse('2026-10-20T18:00:00Z')).length,'Future releases cannot appear at an earlier checkpoint');
assert(catalogChallenge('sbc-totw-upgrade'),'Old TOTW history preserved');
console.log('27 source sets covered; nine new entries; both platform plans and classic squads verified; invalid rules, items, totals and brick slots rejected.');
