import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const script=resolve('scripts/prepare-card-catalog.mjs');
const card={id:'2026-scream-variant',baseId:'player-1',name:'Example',program:'Ultimate Scream',rating:88,position:'ST',nation:'England',league:'Premier League',club:'Example FC',artSourceUrl:'https://example.org/art.png',face:{pac:88,sho:89,pas:78,dri:85,def:40,phy:81}};
async function run(cards){
 const dir=await mkdtemp(join(tmpdir(),'fc-card-test-'));
 const path=join(dir,'pending.json');
 await writeFile(path,JSON.stringify({status:'pending-review',cards}));
 const result=spawnSync(process.execPath,[script,path],{cwd:dir,encoding:'utf8'});
 return {...result,dir};
}
test('valid card is staged without publishing',async()=>{
 const result=await run([card]);
 assert.equal(result.status,0,result.stderr);
 const candidates=JSON.parse(await readFile(join(result.dir,'artifacts/content-sync/card-candidates.json'),'utf8'));
 assert.equal(candidates[0].status,'awaiting-visual-and-license-review');
 assert.equal(candidates[0].player.face.sho,89);
});
test('missing face stat is rejected',async()=>{
 const {def,...face}=card.face;
 const result=await run([{...card,face}]);
 assert.notEqual(result.status,0);
});
test('duplicate cards are rejected',async()=>{
 const result=await run([card,card]);
 assert.notEqual(result.status,0);
});
test('non-HTTPS provenance is rejected',async()=>{
 const result=await run([{...card,artSourceUrl:'http://example.org/art.png'}]);
 assert.notEqual(result.status,0);
});
