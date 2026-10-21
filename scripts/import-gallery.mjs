/** Import public FC27 set facts, exact item scores and source lineups. Never run at app startup. */
import fs from 'node:fs';
import vm from 'node:vm';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run=promisify(execFile);
const cache='scripts/gallery-cache';fs.mkdirSync(cache,{recursive:true});
function hydrate(html){
 const script=html.match(/<script class="\$tsr"[^>]*>([\s\S]*?)<\/script>/)?.[1];
 if(!script)throw Error('No public catalogue data');
 const context={ReadableStream:class {},TextEncoder,Uint8Array};context.self=context;
 // Evaluate only serialization in an isolated context with no I/O or Node globals.
 try{vm.runInNewContext(script,context,{timeout:1000});}catch(error){if(error.message!=='document is not defined')throw error;}
 return context.$_TSR.router.matches.find(m=>m.l)?.l;
}
async function page(url,key){const file=cache+'/'+key+'.json';if(fs.existsSync(file))return JSON.parse(fs.readFileSync(file));const {stdout}=await run('curl',['--fail','--max-time','35','--retry','1','-sS',url],{maxBuffer:5*1024*1024});const d=hydrate(stdout);fs.writeFileSync(file,JSON.stringify(d));return d;}
const listing=(await page('https://www.fut.gg/fut-gallery/','index')).listing;
const work=listing.categories.flatMap(c=>c.sets.map(s=>({category:c,set:s})));
const details=[];let cursor=0;const failures=[];
await Promise.all(Array.from({length:5},async()=>{while(cursor<work.length){const {category:c,set:s}=work[cursor++];try{const d=await page('https://www.fut.gg/fut-gallery/'+c.slug+'/'+s.slug+'/',String(s.id));details.push(d);}catch(e){failures.push({id:s.id,error:e.message});}if((details.length+failures.length)%16===0)console.log('Gallery import',details.length,'of',work.length);}}));
fs.writeFileSync(cache+'/listing.json',JSON.stringify(listing));
fs.writeFileSync(cache+'/failures.json',JSON.stringify(failures));
if(failures.length){console.log(failures);process.exitCode=1;}
console.log('Captured',details.length,'real gallery sets');
const poolFailures=[];cursor=0;
await Promise.all(Array.from({length:5},async()=>{while(cursor<work.length){const {set:s}=work[cursor++];const file=cache+'/pool-'+s.id+'.json';if(fs.existsSync(file))continue;try{const {stdout}=await run('curl',['--fail','--max-time','35','--retry','1','-sS','https://www.fut.gg/api/fut/gallery/fc27/sets/'+s.id+'/pool/'],{maxBuffer:15*1024*1024});const d=JSON.parse(stdout).data;if(d.game!=='fc27'||d.setId!==s.id||!Array.isArray(d.items))throw Error('Unexpected pool');fs.writeFileSync(file,JSON.stringify(d));}catch(e){poolFailures.push({id:s.id,error:e.message});}if(cursor%16===0)console.log('Gallery pools',cursor,'of',work.length);}}));
fs.writeFileSync(cache+'/pool-failures.json',JSON.stringify(poolFailures));
if(poolFailures.length){console.log(poolFailures);process.exitCode=1;}
console.log('Gallery pool import finished');
