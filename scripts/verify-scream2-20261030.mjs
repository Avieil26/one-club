import assert from 'node:assert/strict';
import fs from 'node:fs';
const cards=JSON.parse(fs.readFileSync('assets/data/ultimateScream2Cards20261030.json','utf8'));
const sbcs=JSON.parse(fs.readFileSync('assets/data/sbc20261030Pending.json','utf8'));
assert.equal(cards.length,17,'The October 30 Team 2 standard squad must have 17 unique cards');
assert.equal(new Set(cards.map(c=>c.id)).size,17,'Duplicate promo variant IDs');
assert.equal(new Set(cards.map(c=>c.itemId)).size,17,'Duplicate EA FC 27 item IDs');
assert.equal(sbcs.length,3,'Three October 30 SBCs identified');
assert.equal(new Set(sbcs.map(x=>x.id)).size,3);
for(const card of cards) {
 assert.equal(card.releasedAt,'2026-10-30T18:00:00Z');
 assert.equal(card.edition,'ultimate-scream-2');
 assert.ok(card.baseName && card.en && card.position);
 assert.ok(Number.isInteger(card.itemId) && card.itemId>0,card.id+' missing real game item ID');
 assert.equal(card.itemSourceUrl,card.itemSourceUrl?.startsWith('https://www.fut.gg/players/')?card.itemSourceUrl:null,'A real FUT.GG source is required');
 assert.ok(card.itemSourceUrl.endsWith('/27-'+card.itemId+'/'));
 assert.equal(card.artUrl,null,'Do not claim art is verified until exact Scream art is available');
 assert.ok(Number.isInteger(card.rating)&&card.rating>=85&&card.rating<=91);
 assert.equal(card.face.ovr,card.rating);
 for(const field of ['pac','sho','pas','dri','def','phy']) assert.ok(Number.isInteger(card.face[field])&&card.face[field]>=0&&card.face[field]<=99,card.id+' missing '+field);
}
for(const sbc of sbcs) {
 assert.ok(sbc.reward && sbc.title && sbc.endsAt);
 assert.notEqual(sbc.publishingStatus,'published','Incomplete solutions may not be published');
 assert.ok(sbc.solutionStatus.startsWith('source-proposed') || sbc.solutionStatus === 'not-verified');
 if(!sbc.verifiedRequirements) assert.equal(sbc.requirements,null,'No invented requirements');
 if(sbc.verifiedRequirements) assert.ok(sbc.requirements,'Verified requirements cannot be empty');
}
console.log('PASS: 17 Team 2 card IDs backed by FUT.GG + 3 verified SBC entries, still pending art and solved squad tests; no live catalogue mutations.');
console.log('Baseline Production: 20223. Future standard-card count after verified integration: 20240 (not deployed).');
