import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const script = resolve('scripts/sync-content-feed.mjs');
async function run(feed) {
  const dir = await mkdtemp(join(tmpdir(), 'fc-content-test-'));
  const path = join(dir, 'feed.json');
  await writeFile(path, JSON.stringify(feed));
  const proc = spawnSync(process.execPath, [script, path], { cwd: dir, encoding: 'utf8' });
  return { ...proc, dir };
}
const good = { source:'authorized', sourceUrl:'https://example.org', cards:[{id:'sample-1',name:'Sample Player',program:'Ultimate Scream',rating:85}], sbcs:[{id:'sbc-1',name:'Sample Challenge',rewardCardId:'sample-1',requirements:[{minRating:82}]}] };
test('valid feed is staged, not published', async () => {
  const result = await run(good);
  assert.equal(result.status,0,result.stderr);
  const pending = JSON.parse(await readFile(join(result.dir,'artifacts/content-sync/pending.json'),'utf8'));
  assert.equal(pending.status,'pending-review');
  assert.equal(pending.cards.length,1);
});
test('duplicates block whole import', async () => {
  const result = await run({...good,cards:[good.cards[0],good.cards[0]]});
  assert.notEqual(result.status,0);
});
test('invalid rating blocks import', async () => {
  const result = await run({...good,cards:[{...good.cards[0],rating:109}]});
  assert.notEqual(result.status,0);
});
test('untrusted feed blocks import', async () => {
  const result = await run({...good,source:'unknown'});
  assert.notEqual(result.status,0);
});
