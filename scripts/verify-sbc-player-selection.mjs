import assert from 'node:assert/strict';
import { loadRepositoryModule, loadPlayerCatalogue } from './load-player-catalogue.mjs';
const { itemScore, searchPointPlayers, selectedItems, selectedScore } = loadRepositoryModule('lib/sbcItemScore.ts');
const { pointsSegments, pointsPlans, pointsPlanValid } = loadRepositoryModule('lib/sbcVerified.ts');
const { uniquePointsPlan } = loadRepositoryModule('lib/sbcPointOptions.ts');
const { officialChallenges } = loadRepositoryModule('lib/sbcCatalog.ts');
const players = loadPlayerCatalogue();
const segment = pointsSegments('sbc-upgrade-83x2-20261020')[0];
for (const [rating, score] of [[45,20],[64,20],[65,35],[74,35],[75,90],[76,100],[83,410],[85,2100],[91,19000],[99,100000]]) {
  assert.equal(itemScore({rating}),score);
}
assert.equal(itemScore({rating:44}),null);assert.equal(itemScore({rating:100}),null);
assert.equal(itemScore({rating:85,edition:'totw'}),null,'Never use a base score for a special edition');
assert.equal(itemScore({rating:90,icon:true}),null);
const bronze=searchPointPlayers(segment,'60')[0],gold=searchPointPlayers(segment,'76')[0];
assert(bronze&&gold);assert.equal(itemScore(bronze),20);assert.equal(itemScore(gold),100);
assert(searchPointPlayers(segment,gold.en).some(p=>p.id===gold.id));
assert(searchPointPlayers(segment,gold.name).some(p=>p.id===gold.id));
assert(searchPointPlayers(segment,'76').every(p=>p.rating===76));
assert.equal(searchPointPlayers(segment,'zzzzzzzzzz').length,0);
const basket={[bronze.id]:1,[gold.id]:1};assert.equal(selectedScore(selectedItems(segment,basket)),120);
assert.equal(selectedScore(selectedItems(segment,{...basket,[gold.id]:2})),220);
assert.equal(selectedScore(selectedItems(segment,{[gold.id]:2})),200);
assert.equal(selectedScore(selectedItems(segment,{})),0);
assert.deepEqual(selectedItems(segment,{missing:1,[gold.id]:-1,[bronze.id]:1.5}),[]);
const restricted=pointsSegments('sbc-gold-reroll')[0];
assert.equal(searchPointPlayers(restricted,'60').length,0);assert.equal(selectedScore(selectedItems(restricted,basket)),0);
let checked=0;
for(const c of officialChallenges)for(const s of pointsSegments(c.id))for(const platform of ['ps5','pc']){
 const preset=pointsPlans(s,platform);
 for(const plan of preset){assert(pointsPlanValid(s,plan,platform));assert.equal(new Set(plan.lines.map(l=>l.player.id)).size,plan.lines.length,'Duplicate rows in a diversified preset');}
 const unique=uniquePointsPlan(s,platform,0,{});
 assert(unique,`No distinct-player option for ${c.id}/${s.name}/${platform}`);
 assert(pointsPlanValid(s,unique,platform));assert(unique.lines.every(l=>l.count===1));assert.equal(unique.lines.length,new Set(unique.lines.map(l=>l.player.id)).size);assert.equal(unique.priceKnown,false);
 const selected=unique.lines[0].player.id;const initialScore=unique.lines[0].scoreEach;
 const after=uniquePointsPlan(s,platform,Math.min(initialScore,s.target-1),{[selected]:1});
 if(after){assert(!after.lines.some(l=>l.player.id===selected));assert(after.total>=s.target-Math.min(initialScore,s.target-1));}
 checked++;
}
assert(pointsPlans(segment,'ps5')[0].lines.length>1,'Default option still repeats one player despite available alternatives');
assert.equal(players.filter(p=>itemScore(p)!==null).length,players.filter(p=>!p.edition&&!p.icon).length);
console.log(`SBC selection passed: 19,798 searchable base cards, official scores, HE/EN and OVR search, 20+100=120 basket math, quantity/removal, eligibility, ${checked} distinct-player options and diversified presets.`);
