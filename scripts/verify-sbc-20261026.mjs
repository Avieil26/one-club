import assert from 'node:assert/strict';import fs from 'node:fs';import {loadRepositoryModule,loadPlayerCatalogue} from './load-player-catalogue.mjs';
const data=JSON.parse(fs.readFileSync('assets/data/sbc-refresh-20261026.json'));
const {pointsSegments,pointsPlans,pointsPlanValid}=loadRepositoryModule('lib/sbcVerified.ts');
const {classicSegments,checkClassicSquad}=loadRepositoryModule('lib/sbcClassic.ts');
const {catalogChallenge,mergeOfficialSbcs}=loadRepositoryModule('lib/sbcCatalog.ts');
const {parseClassicRequirements}=loadRepositoryModule('lib/sbcSourceRules.ts');
const {evaluateSquad,formationById}=loadRepositoryModule('lib/chemistry.ts');
const {itemScore}=loadRepositoryModule('lib/sbcItemScore.ts');
const players=new Map(loadPlayerCatalogue().map(p=>[p.id,p]));
const ea={...Object.fromEntries(JSON.parse(fs.readFileSync('assets/data/players.json')).map(p=>[p.id,p.eaId])),...JSON.parse(fs.readFileSync('assets/data/priceEaIds.json'))};
assert.equal(data.challenges.length,4);assert.equal(data.activeSets.length,29);
for(const set of data.activeSets){assert(set.siteIds.length,set.name);for(const id of set.siteIds)assert(catalogChallenge(id),id);}
assert.deepEqual(pointsSegments('sbc-laliga-20261026').map(s=>s.target),[4500,4500]);assert.deepEqual(pointsSegments('sbc-premier-20261026').map(s=>s.target),[6000,6000]);assert.equal(pointsSegments('sbc-hero-20261026')[0].target,200000);
for(const challenge of data.challenges){
 const official=catalogChallenge(challenge.id);assert.equal(official.endsAt,challenge.endsAt);
 assert(mergeOfficialSbcs([{...official,targetScore:1,endsAt:null}],Date.parse(challenge.endsAt)-1).some(c=>c.id===challenge.id&&c.targetScore===challenge.targetScore));
 assert(!mergeOfficialSbcs([{...official,endsAt:null}],Date.parse(challenge.endsAt)+1).some(c=>c.id===challenge.id));
 for(const s of pointsSegments(challenge.id))for(const platform of ['ps5','pc']){
  for(const rate of s.platforms[platform].rates)for(let i=0;i<rate.players.length;i++){const p=players.get(rate.players[i]);assert(p&&!p.edition&&!p.icon);assert.equal(ea[p.id],rate.eaIds[i]);assert.equal(p.rating,rate.overall);assert.equal(itemScore(p),rate.score);}
  for(const submitted of [0,1,Math.floor(s.target/2),s.target-1]){
   const plans=pointsPlans(s,platform,submitted);assert(plans.length);for(const plan of plans){const remainder={...s,target:s.target-submitted};assert(pointsPlanValid(remainder,plan,platform));assert(!pointsPlanValid(remainder,{...plan,total:plan.total+1},platform));const wrong=structuredClone(plan);wrong.lines[0].scoreEach++;assert(!pointsPlanValid(remainder,wrong,platform));}
  }
  assert.deepEqual(pointsPlans({...s,requirements:['Unknown eligibility']},platform),[]);
 }
}
const c=classicSegments('sbc-candy-20261026')[0],report=checkClassicSquad(c,c.formation,c.squad);assert(report.ready,JSON.stringify(report));assert.equal(report.chemistry,16);assert.equal(Object.keys(c.squad).length,6);assert.deepEqual(parseClassicRequirements(c.sourceRequirements),c.rules);
for(const slot of ['lcam','cam','rcam','lcdm','rcdm']){const wrong={...c.squad,[slot]:c.squad.st};delete wrong.st;assert(!checkClassicSquad(c,c.formation,wrong).ready,'Locked '+slot);}
assert(!checkClassicSquad({...c,sourceRequirements:[...c.sourceRequirements,'Unknown rule']},c.formation,c.squad).ready);
assert(!checkClassicSquad({...c,rules:{...c.rules,maxNations:5}},c.formation,c.squad).ready,'Source max nations must agree');
const positions=Object.fromEntries(Object.entries(c.squad).map(([slot,id],i)=>[slot,{...players.get(id),nation:'nation-'+i}]));
const wrongNation=evaluateSquad(formationById(c.formation),positions,c.rules);assert.equal(wrongNation.checks.find(x=>x.label==='עד 4 מדינות').ok,false);
assert(catalogChallenge('sbc-hero-max87-20261019'),'Expired historical route retained');
console.log('PASS: all 29 active sets covered; 4 new sets / 6 segments; exact identities, both-platform plans, partial progress, separate group targets, source agreement, six-slot chemistry 16, maximum nations and locked-slot rejection.');
