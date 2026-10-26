/** Run deliberately when refreshing the planner snapshot; never at application startup. */
import fs from 'node:fs';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);
const read=async url=>JSON.parse((await run('curl',['--fail','--max-time','35','-sS',url],{maxBuffer:10*1024*1024})).stdout);
const manifest=await read('https://r2.fut.gg/27/manifest.json');
const url=`https://r2.fut.gg/27/player-prices-ps5.v${manifest._version}.${manifest['player-prices-ps5']}.json`;
const source=await read(url);
if(!Number.isSafeInteger(source.id0)||!Array.isArray(source.d)||source.p?.length!==source.d.length+1||source.s?.length!==source.p.length)throw Error('Unexpected market price format');
const needed=new Set();const index=JSON.parse(fs.readFileSync('public/gallery-data/catalogue.json'));
for(const set of index.sets){const d=JSON.parse(fs.readFileSync(`public/gallery-data/${set.id}.json`));for(const p of d.set.plans)for(const id of p.itemIds)needed.add(id);}
let id=source.id0;const items={};
for(let i=0;i<source.p.length;i++){if(i)id+=source.d[i-1];if(needed.has(id))items[id]={status:source.s[i],price:source.s[i]===0&&source.p[i]>0?source.p[i]:null};}
fs.writeFileSync('assets/data/galleryPlannerMarket.json',JSON.stringify({checkedAt:new Date().toISOString(),source:url,items}));
console.log(`Market snapshot: ${Object.keys(items).length} exact editions; SBC costs and absent prices excluded.`);
