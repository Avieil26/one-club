import assert from 'node:assert/strict';
import fs from 'node:fs';
const cards=JSON.parse(fs.readFileSync('assets/data/ultimateScream2Cards20261030.json','utf8'));
const sbcs=JSON.parse(fs.readFileSync('assets/data/sbc20261030Pending.json','utf8'));
assert.equal(cards.length,17,'The October 30 Team 2 standard squad must have 17 unique cards');
assert.equal(new Set(cards.map(c=>c.id)).size,17,'Duplicate promo variant IDs');
assert.equal(sbcs.length,3,'Three October 30 SBCs identified');
assert.equal(new Set(sbcs.map(x=>x.id)).size,3);
for(const card of cards) {
 assert.equal(card.releasedAt,'2026-10-30T18:00:00Z');
 assert.equal(card.edition,'ultimate-scream-2');
 assert.ok(card.baseName && card.en && card.position);
 assert.ok(Number.isInteger(card.rating)&&card.rating>=85&&card.rating<=91);
 assert.equal(card.face.ovr,card.rating);
 for(const field of ['pac','sho','pas','dri','def','phy']) assert.ok(Number.isInteger(card.face[field])&&card.face[field]>=0&&card.face[field]<=99,card.id+' missing '+field);
}
for(const sbc of sbcs) {
 assert.ok(sbc.reward && sbc.title && sbc.endsAt);
 assert.equal(sbc.solutionStatus,'not-verified','Solutions must not be represented as verified without solving');
 if(!sbc.verifiedRequirements) assert.equal(sbc.requirements,null,'No invented requirements');
}
console.log('PASS: 17 documented Team 2 standard cards + 3 pending SBCs; no live catalogue mutations.');
console.log('Baseline Production: 20223. Future standard-card count after verified integration: 20240 (not deployed).');
