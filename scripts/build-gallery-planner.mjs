import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import ts from 'typescript';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const compiled=ts.transpileModule(fs.readFileSync('lib/galleryScore.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const file=path.join(os.tmpdir(),'gallery-planner-score.cjs');fs.writeFileSync(file,compiled);
const {validateGalleryPlan,gradeTokens}=require(file);
const index=JSON.parse(fs.readFileSync('public/gallery-data/catalogue.json'));
const market=JSON.parse(fs.readFileSync('assets/data/galleryPlannerMarket.json'));
const prices={},options=[],sets=[];
for(const summary of index.sets){
 const d=JSON.parse(fs.readFileSync(`public/gallery-data/${summary.id}.json`));const map=new Map(d.items.map(i=>[i.eaId,i]));
 sets.push({id:summary.id,name:summary.name,category:summary.category,requiredCards:summary.requiredCards,tokens:Object.fromEntries(summary.grades.map(g=>[g.name,gradeTokens(d.set,g.name)]))});
 for(const p of d.set.plans){
  const items=p.itemIds.map(id=>map.get(id));
  if(items.some(i=>!i))throw Error('Missing item '+p.id);
  const result=validateGalleryPlan(d.set,items,d.tags,p.grade,p.firstOwnerIds);
  if(!result.valid||!result.grade)throw Error('Invalid lineup '+p.id);
  if(p.firstOwnerIds.length)throw Error('Planner must not assume First Owner');
  options.push({id:p.id,setId:summary.id,grade:result.grade,tokens:gradeTokens(d.set,result.grade),itemIds:p.itemIds});
  for(const i of items){
   // Only exact-edition tradeable console quotes. SBC completion costs are not purchase prices.
   const quote=market.items[i.eaId];
   prices[i.eaId]=quote?.status===0&&Number.isFinite(quote.price)&&quote.price>0?quote.price:null;
  }
 }
}
fs.writeFileSync('public/gallery-data/planner.json',JSON.stringify({checkedAt:market.checkedAt,definitionsCheckedAt:index.checkedAt,sets,prices,options}));
console.log(`Planner: ${sets.length} sets, ${options.length} verified lineups, ${Object.keys(prices).length} item quotes; ${fs.statSync('public/gallery-data/planner.json').size} bytes.`);
