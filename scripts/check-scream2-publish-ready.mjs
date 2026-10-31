#!/usr/bin/env node
/**
 * Pre-publication gate for October 30 Ultimate Scream Team 2.
 * Run ONLY against the 20,223-card production baseline. Does not mutate files.
 * Required before adding any card to PLAYERS or changing a Vercel alias.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = name => JSON.parse(fs.readFileSync(name,'utf8'));
const cards = read('assets/data/ultimateScream2Cards20261030.json');
const existing = [
 ...read('assets/data/recentCards20261024.json'),
 ...read('assets/data/showdownCards20261028.json'),
 ...read('assets/data/totw7Cards20261028.json'),
 ...read('assets/data/season2.json')
];
assert.equal(cards.length,17,'Team 2 must have exactly 17 regular variants');
const originalIds = new Set(existing.map(x=>x.id));
const originalItemIds = new Set(existing.map(x=>x.itemId));
const newItems = new Set();
const attributes = [
'acceleration','sprintSpeed','positioning','finishing','shotPower','longShots','volleys','penalties',
'vision','crossing','freeKickAccuracy','shortPassing','longPassing','curve',
'agility','balance','reactions','ballControl','dribbling','composure',
'interceptions','headingAccuracy','defensiveAwareness','standingTackle','slidingTackle',
'jumping','stamina','strength','aggression','gkDiving','gkHandling','gkKicking','gkReflexes','gkPositioning'];
const errors = [];
for(const card of cards) {
 if(originalIds.has(card.id)) errors.push('Existing ID collision: '+card.id);
 if(originalItemIds.has(card.itemId)||newItems.has(card.itemId)) errors.push('Existing or duplicate item ID: '+card.itemId);
 newItems.add(card.itemId);
 if(!/^https:\/\//.test(card.artUrl || '')) errors.push('Missing real card art: '+card.en);
 if(!card.attributes || attributes.some(k=>!Number.isInteger(card.attributes[k])||card.attributes[k]<0||card.attributes[k]>99)) errors.push('Missing 34 exact attributes: '+card.en);
 if(!card.artSourceApproved) errors.push('Missing verified artwork provenance: '+card.en);
}
console.log(JSON.stringify({productionBaseline:20223,stagedStandardCards:cards.length,expectedAfterStandard:20223+cards.length,otherExistingRecent:existing.length,unmetRequirements:errors.length},null,2));
if(errors.length) {
 console.error(errors.join('\n'));
 process.exitCode=1;
} else {
 console.log('READY FOR PREVIEW INTEGRATION ONLY. No files or Production changed.');
}
