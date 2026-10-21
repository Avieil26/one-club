import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadPlayerCatalogue, loadRepositoryModule } from './load-player-catalogue.mjs';
const { pointsSegments, pointsPlans, pointsPlanValid } = loadRepositoryModule('lib/sbcVerified.ts');
const { classicSegments, checkClassicSquad, communitySquadStatus } = loadRepositoryModule('lib/sbcClassic.ts');
const { officialChallenges } = loadRepositoryModule('lib/sbcCatalog.ts');
const { sbcCheckText } = loadRepositoryModule('lib/sbcLocalization.ts');
const ps=loadPlayerCatalogue();
const dataset=JSON.parse(fs.readFileSync('assets/data/sbc-verified-20261021.json'));
const ids=JSON.parse(fs.readFileSync('assets/data/priceEaIds.json'));
for(const p of JSON.parse(fs.readFileSync('assets/data/players.json')))if(p.eaId)ids[p.id]=p.eaId;
let points=0,classic=0;
for(const [id,data]of Object.entries(dataset.challenges)){
 const c=officialChallenges.find(c=>c.id===id);assert(c&&c.kind==='streamlined');
 assert.equal(data.segments.reduce((n,s)=>n+s.target,0),c.targetScore);
 for(const segment of pointsSegments(id)){
  for(const platform of ['ps5','pc']){
   for(const rate of segment.platforms[platform].rates)for(const id of rate.players){const p=ps.find(p=>p.id===id);assert(p&&!p.edition&&!p.icon);assert.equal(p.rating,rate.overall);assert(rate.eaIds.includes(ids[p.id]),'Identity was not sampled by the source');}
   const plans=pointsPlans(segment,platform);assert(plans.length,`${id}/${segment.name}: no verified plan`);
   for(const plan of plans){assert(pointsPlanValid(segment,plan,platform));
    const broken=structuredClone(plan);broken.lines[0].scoreEach++;assert(!pointsPlanValid(segment,broken,platform),'Wrong point value accepted');
    for(const line of plan.lines)for(const alternate of line.alternatives){const replaced={...plan,lines:plan.lines.map(l=>l===line?{...l,player:alternate}:l)};assert(pointsPlanValid(segment,replaced,platform),'Invalid swap');}
   }
   const partial=pointsPlans(segment,platform,segment.target-1);assert(partial.length);assert(partial.every(p=>p.total>=1));
   assert.deepEqual(pointsPlans(segment,platform,-1),[]);assert.deepEqual(pointsPlans(segment,platform,NaN),[]);assert.deepEqual(pointsPlans(segment,platform,segment.target),[]);
   points++;
  }
 }
}
for(const c of officialChallenges)for(const segment of classicSegments(c.id)){
 assert(segment.squad,`Missing example ${c.id}/${segment.name}`);
 const report=checkClassicSquad(segment,segment.formation,segment.squad);
 assert(report.ready,c.id+'/'+segment.name);
 for(const check of report.checks)assert(!/[\u0590-\u05ff]/.test(sbcCheckText(check.label,'en')),'Untranslated check: '+check.label);
 assert(!checkClassicSquad(segment,'invalid',segment.squad).ready);
 const slots=Object.keys(segment.squad);const broken={...segment.squad,[slots[0]]:'missing-player'};assert(!checkClassicSquad(segment,segment.formation,broken).ready);
 if(slots.length>1){const dup={...segment.squad,[slots[1]]:segment.squad[slots[0]]};assert(!checkClassicSquad(segment,segment.formation,dup).ready);}
 assert.equal(Object.keys(segment.squad).length,segment.rules.playerCount??11);
 if(segment.rules.minRating)assert(Object.values(segment.squad).every(id=>ps.find(p=>p.id===id).rating>=segment.rules.minRating),'Rated example must also pass without depending on rounding boosts');
 if(!segment.rules.chemistry)assert.equal(checkClassicSquad(segment,segment.formation,segment.squad).ready,true);
 classic++;
}
assert.equal(classicSegments('sbc-fs-challenge-3')[0].formation,'442');
assert.equal(classicSegments('sbc-mm-leeds-manutd-20261015')[0].formation,'5212');
assert.deepEqual(classicSegments('sbc-league-nation-advanced').map(s=>s.formation),['343','4141','3142']);
assert.equal(communitySquadStatus('sbc-gold-upgrade',null,null),'unverified');
const gold=classicSegments('sbc-gold-upgrade')[0];
assert.equal(communitySquadStatus('sbc-gold-upgrade',gold.formation,gold.squad),'checked');
assert.equal(communitySquadStatus('sbc-gold-upgrade',gold.formation,{}),'invalid');
assert.equal(communitySquadStatus('sbc-league-nation-advanced',gold.formation,gold.squad),'unverified');
console.log(`SBC solutions passed: ${points} platform/points segments, ${classic} classic segments; all item identities, scores, swaps, partial progress and complete squad rules checked. No EA account submission performed.`);
