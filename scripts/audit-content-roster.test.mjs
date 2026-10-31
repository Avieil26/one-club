import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const script=resolve('scripts/audit-content-roster.mjs');
async function run(baseIds,candidates){
 const dir=await mkdtemp(join(tmpdir(),'fc-audit-'));
 await mkdir(join(dir,'assets/data'),{recursive:true});
 await mkdir(join(dir,'artifacts/content-sync'),{recursive:true});
 await writeFile(join(dir,'assets/data/players.json'),JSON.stringify(baseIds.map(id=>({id}))));
 await writeFile(join(dir,'artifacts/content-sync/card-candidates.json'),JSON.stringify(candidates));
 const result=spawnSync(process.execPath,[script],{cwd:dir,encoding:'utf8'});
 return {...result,dir};
}
const baseline=Array.from({length:1001},(_,i)=>'player-'+i);
const candidate={externalId:'promo123',baseId:'player-42',player:{id:'feed-promo123'}};
test('retains original roster and audits added candidates',async()=>{
 const result=await run(baseline,[candidate]);
 assert.equal(result.status,0,result.stderr);
 const audit=JSON.parse(await readFile(join(result.dir,'artifacts/content-sync/roster-audit.json'),'utf8'));
 assert.equal(audit.baseRegularPlayers,1001);
 assert.equal(audit.stagedVariants,1);
 assert.equal(audit.candidateRegularAndStagedTotal,1002);
});
test('rejects missing original player',async()=>{
 const result=await run(baseline,[{...candidate,baseId:'absent'}]);
 assert.notEqual(result.status,0);
});
test('rejects collision with existing base player',async()=>{
 const result=await run(baseline,[{...candidate,player:{id:'player-42'}}]);
 assert.notEqual(result.status,0);
});
test('rejects unexpectedly truncated base roster',async()=>{
 const result=await run(baseline.slice(0,100),[candidate]);
 assert.notEqual(result.status,0);
});
