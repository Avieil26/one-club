import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import ts from 'typescript';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const compiled=ts.transpileModule(fs.readFileSync('lib/galleryScore.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
fs.writeFileSync(path.join(os.tmpdir(),'fc27-gallery-score.cjs'),compiled);
const {galleryScore}=require(path.join(os.tmpdir(),'fc27-gallery-score.cjs'));
const cache='scripts/gallery-cache',listing=JSON.parse(fs.readFileSync(cache+'/listing.json'));
const roster=JSON.parse(fs.readFileSync('assets/data/players.json'));const byEa=new Map(roster.map(p=>[p.eaId,p]));
const facts=JSON.parse(fs.readFileSync('docs/gallery-futbin-facts-20261026.json'));
const factsById=new Map(facts.sets.map(s=>[s.setId,s]));
const summaries=[],audits=[],failures=[],sourceDifferences=[];const now=new Date().toISOString();
fs.mkdirSync('public/gallery-data',{recursive:true});
for(const category of listing.categories)for(const entry of category.sets){
 if(!factsById.has(entry.id))continue;
 const d=JSON.parse(fs.readFileSync(cache+'/'+entry.id+'.json'));
 const fact=factsById.get(entry.id);
 if(d.set.requiredCards!==fact.requiredCards)throw Error('Source item-count mismatch '+entry.id);
 for(const grade of d.set.grades){
  const verified=fact.grades.find(g=>g.grade===grade.name);
  if(!verified)throw Error('Missing FUTBIN grade '+entry.id);
  const tokens=grade.rewards.filter(r=>r.type==='event_token_1').reduce((sum,r)=>sum+r.value*r.count,0);
  if(grade.threshold!==verified.threshold||tokens!==verified.tokens)sourceDifferences.push({setId:entry.id,name:entry.name,grade:grade.name,secondaryThreshold:grade.threshold,futbinThreshold:verified.threshold,secondaryTokens:tokens,futbinTokens:verified.tokens});
  grade.threshold=verified.threshold;
  if(tokens!==verified.tokens){grade.rewards=grade.rewards.filter(r=>r.type!=='event_token_1');if(verified.tokens)grade.rewards.push({type:'event_token_1',value:verified.tokens,count:1,label:verified.tokens+' Gallery Tokens',imagePath:null});}
 }
 d.set.totalTokens=d.set.grades.flatMap(g=>g.rewards).reduce((sum,r)=>sum+(r.type==='event_token_1'?r.value*r.count:0),0);
 const poolFile=cache+'/pool-'+entry.id+'.json';
 if(!fs.existsSync(poolFile)){failures.push({id:entry.id,reason:'pool missing'});continue;}
 const pool=JSON.parse(fs.readFileSync(poolFile));
 const quotes=new Map;for(const plan of [d.solution,...(d.solution?.costTiers??[])])for(const item of plan?.items??[])if(Number.isFinite(item.price)&&item.price>0)quotes.set(item.eaId,item.price);
 const items=pool.items.map(p=>({...p,he:byEa.get(p.playerEaId)?.name,price:quotes.get(p.eaId)??null}));
 const byId=new Map(items.map(p=>[p.eaId,p]));
 const plans=[];const seen=new Set;
 for(const candidate of [...(d.solution?.costTiers??[]),d.solution]){
  if(!candidate?.items?.length||!candidate.grade)continue;
  const ids=candidate.items.map(p=>p.eaId),full=ids.map(id=>byId.get(id));
  if(full.some(p=>!p)||new Set(ids).size!==ids.length||ids.length!==entry.requiredCards){failures.push({id:entry.id,grade:candidate.grade,reason:'invalid lineup'});continue;}
  const result=galleryScore(full,d.tags);
  const expected=candidate.totalScore;
  const threshold=d.set.grades.find(g=>g.name===candidate.grade)?.threshold;
  const matches=result.total===expected;
  audits.push({setId:entry.id,target:candidate.grade,expected,calculated:result.total,matches});
  if(!matches||result.total<threshold){failures.push({id:entry.id,grade:candidate.grade,expected,actual:result.total,reason:matches?'below verified FUTBIN threshold':'score mismatch'});continue;}
  const key=[...ids].sort((a,b)=>a-b).join(',');if(seen.has(key))continue;seen.add(key);
  plans.push({id:entry.id+'-'+candidate.grade+'-'+plans.length,grade:candidate.grade,itemIds:ids,firstOwnerIds:[],expectedScore:result.total,checkedAt:now,validation:'calculated'});
 }
 const badgeReward=d.set.grades.flatMap(g=>g.rewards).find(r=>r.imagePath&&r.itemCategory===1);
 const set={...d.set,category:category.name,categorySlug:category.slug,itemIds:items.map(p=>p.eaId),plans,badge:badgeReward?'https://game-assets.fut.gg/'+badgeReward.imagePath:undefined,checkedAt:now};
 const detail={checkedAt:now,definitionsCapturedAt:d.capturedAt,set,items,tags:d.tags,poolTruncated:pool.isTruncated};
 fs.writeFileSync('public/gallery-data/'+set.id+'.json',JSON.stringify(detail));
 summaries.push({...set,itemIds:undefined,plans:undefined,planCount:plans.length,preview:[...new Map(items.filter(p=>!p.holographic).map(p=>[p.playerEaId,p])).values()].sort((a,b)=>b.overall-a.overall).slice(0,3),availableGrade:plans.length?[...d.set.grades].reverse().find(g=>plans.some(p=>p.expectedScore>=g.threshold))?.name:null});
}
fs.writeFileSync('public/gallery-data/catalogue.json',JSON.stringify({checkedAt:now,definitionsCapturedAt:listing.capturedAt,sets:summaries}));
fs.mkdirSync('docs',{recursive:true});
fs.writeFileSync('docs/gallery-data-audit.json',JSON.stringify({checkedAt:now,sources:['https://help.ea.com/en/articles/ea-sports-fc/gallery-hub/','https://www.fut.gg/fut-gallery/','https://www.futbin.com/27/gallery'],sets:summaries.length,audits,failures,sourceDifferences},null,2));
console.log(JSON.stringify({sets:summaries.length,checked:audits.length,matches:audits.filter(a=>a.matches).length,failures:failures.map(f=>({id:f.id,grade:f.grade,expected:f.expected,actual:f.actual,reason:f.reason}))},null,2));
