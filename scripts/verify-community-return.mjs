import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { loadRepositoryModule } from './load-player-catalogue.mjs';
const values = new Map(); let clock = 1_000_000; let unavailable = false;
const storage = {
 getItem: async (key) => { if (unavailable) throw new Error('Offline storage'); return values.get(key) ?? null; },
 setItem: async (key, value) => { if (unavailable) throw new Error('Offline storage'); values.set(key, value); },
 removeItem: async (key) => { if (unavailable) throw new Error('Offline storage'); values.delete(key); },
};
const { outputText } = ts.transpileModule(fs.readFileSync('lib/communityReturn.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } });
const module = { exports: {} };
vm.runInNewContext(`(function(require,module,exports){${outputText}\n})`, { Date: { now: () => clock } })((name) => name.startsWith('@react-native') ? storage : loadRepositoryModule('lib/communityActivityLogic.ts'), module, module.exports);
const { rememberCommunityReturn, readCommunityReturn, clearCommunityReturn } = module.exports;
const route='/career/journeys/10000000-0000-4000-8000-000000000001';
await rememberCommunityReturn(route);
assert.equal(await readCommunityReturn(),route);
assert.equal(await readCommunityReturn(),route,'Repeated auth effects must not consume the invitation');
await clearCommunityReturn();assert.equal(await readCommunityReturn(),null);
await rememberCommunityReturn('https://example.com');assert.equal(values.size,0,'Block external redirects');
await rememberCommunityReturn(route);clock += 3600_001;assert.equal(await readCommunityReturn(),null,'Expire old intent');
unavailable=true;assert.equal(await readCommunityReturn(),null);await rememberCommunityReturn(route);await clearCommunityReturn();
console.log('Invitation return passed: local route whitelist, repeated auth effects, expiry, clearing and storage failure.');
