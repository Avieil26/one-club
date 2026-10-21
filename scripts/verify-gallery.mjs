import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import ts from 'typescript';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
fs.writeFileSync(path.join(os.tmpdir(),'gallery-verify.cjs'),ts.transpileModule(fs.readFileSync('lib/galleryScore.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText);
const {galleryScore,validateGalleryPlan,gradeFor,gradeTokens}=require(path.join(os.tmpdir(),'gallery-verify.cjs'));
const index=JSON.parse(fs.readFileSync('public/gallery-data/catalogue.json'));
assert.equal(index.sets.length,128);
let plans=0,slots=0;
for(const summary of index.sets){const d=JSON.parse(fs.readFileSync('public/gallery-data/'+summary.id+'.json'));const {set,items,tags}=d;const map=new Map(items.map(p=>[p.eaId,p]));
 assert.deepEqual(set.grades.map(g=>g.name),['D','C','B','A','S']);assert.equal(new Set(set.itemIds).size,set.itemIds.length);assert(items.every(p=>Number.isSafeInteger(p.score)&&p.score>=0));
 assert.equal(gradeFor(set,1e9,0),null);assert.equal(galleryScore([],tags).total,0);assert.equal(gradeTokens(set,null),0);
 assert.equal(gradeTokens(set,'S'),set.totalTokens);
 for(const plan of set.plans){const lineup=plan.itemIds.map(id=>map.get(id));assert(lineup.every(Boolean));const result=validateGalleryPlan(set,lineup,tags,plan.grade,plan.firstOwnerIds);assert(result.valid);assert.equal(result.total,plan.expectedScore);assert(!validateGalleryPlan(set,lineup.slice(1),tags,plan.grade).valid);assert(!validateGalleryPlan(set,[...lineup.slice(1),lineup[1]],tags,plan.grade).valid);plans++;slots+=lineup.length;}
}
const starter=JSON.parse(fs.readFileSync('public/gallery-data/116.json'));
assert.deepEqual(starter.set.grades.map(g=>g.threshold),[10,250,500,1000,2000]);assert.equal(gradeTokens(starter.set,'S'),5);
const como=JSON.parse(fs.readFileSync('public/gallery-data/63.json'));
assert.equal(como.set.requiredCards,15);assert.deepEqual(como.set.grades.map(g=>g.threshold),[10,2000,13000,15500,19500]);assert.equal(gradeTokens(como.set,'S'),80);
const arsenal=JSON.parse(fs.readFileSync('public/gallery-data/30.json'));assert.equal(arsenal.set.requiredCards,20);
const example=como.items.slice(0,15);const first=galleryScore(example,como.tags,example.map(p=>p.eaId));const normal=galleryScore(example,como.tags);assert(first.total>=normal.total);
const audit=JSON.parse(fs.readFileSync('docs/gallery-data-audit.json'));assert(audit.audits.every(a=>a.matches));assert.equal(audit.failures.length,4);assert(audit.failures.every(f=>f.reason==='invalid lineup'));
console.log(`Gallery: 128 real sets, ${plans} distinct checked plans, ${slots} item slots, ${audit.audits.length} exact independent score comparisons; duplicate and incomplete lineups rejected.`);
