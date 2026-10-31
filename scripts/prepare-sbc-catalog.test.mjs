import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const script = resolve('scripts/prepare-sbc-catalog.mjs');
const app = {title:'Test Challenge',kind:'classic',requirements:'Full requirement description',reward:'Gold pack',createdAt:'2026-10-31T18:00:00Z',endsAt:'2026-11-05T18:00:00Z',targetScore:null,rules:{chemistry:20,minRating:83},previewFormation:null,previewSquad:null};
async function run(sbc) {
  const dir = await mkdtemp(join(tmpdir(),'fc-sbc-test-'));
  const path = join(dir,'pending.json');
  await writeFile(path,JSON.stringify({status:'pending-review',sbcs:[{id:'test-123',name:'Test',requirements:[{minRating:83}],rewardCardId:'reward',app:sbc}]}));
  const processResult = spawnSync(process.execPath,[script,path],{cwd:dir,encoding:'utf8'});
  return { ...processResult, dir };
}
test('complete challenge produces compatible candidate',async()=>{
  const result=await run(app);
  assert.equal(result.status,0,result.stderr);
  const candidates=JSON.parse(await readFile(join(result.dir,'artifacts/content-sync/sbc-candidates.json'),'utf8'));
  assert.equal(candidates[0].id,'feed-test-123');
  assert.equal(candidates[0].rules.minRating,83);
});
test('incomplete rules are rejected',async()=>{
  const result=await run({...app,rules:{minRating:83}});
  assert.notEqual(result.status,0);
});
test('unknown rule is never silently discarded',async()=>{
  const result=await run({...app,rules:{...app.rules,unknownRequirement:4}});
  assert.notEqual(result.status,0);
});
test('unverified preview is rejected',async()=>{
  const result=await run({...app,previewSquad:{gk:'missing'}});
  assert.notEqual(result.status,0);
});
