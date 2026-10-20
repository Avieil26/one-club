import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { createRequire } from 'node:module';

const root = process.cwd();
const requirePackage = createRequire(path.join(root, 'package.json'));
const memory = new Map();
const uid = '10000000-0000-4000-8000-000000000001';
const session = { user: { id: uid, email: 'native-qa@example.invalid', user_metadata: { full_name: 'Native QA', is_admin: true } } };
memory.set('auth-key', JSON.stringify(session));
let network = 0, avatarCalls = 0, storageCalls = 0, exchanges = 0;
let release;
const blocked = new Promise((resolve) => { release = resolve; });
const profiles = Array.from({length: 100}, (_, i) => ({id: i ? `profile-${i}` : uid, display_name: `Fixture ${i}`, is_admin: false, approved_count: 0, reputation: 0, created_at: '2026-01-01'}));
const supabase = {
  auth: { exchangeCodeForSession: async () => { exchanges++; return {error: null}; }, signInWithOAuth: async ({options}) => { assert.equal(options.redirectTo, 'fc27israel://auth/callback'); assert.equal(options.skipBrowserRedirect,true); return {data:{url:'https://accounts.google.com/fixture'},error:null}; }, getSession: async () => { network++; await blocked; return {data: {session}, error: null}; } },
  from: (table) => {
    const query = { select: () => query, like: () => query, then: (done, fail) => Promise.resolve({data: table === 'profiles' ? profiles : [], error: null}).then(done, fail) };
    return query;
  },
  rpc: async (name) => { assert.equal(name, 'profile_avatar_paths'); avatarCalls++; return {data: [{user_id: uid, object_name: `${uid}/avatar/fixture.jpg`}], error: null}; },
  storage: { from: () => ({ list: () => { storageCalls++; throw Error('Per-user Storage list must not run during native hydration'); }, getPublicUrl: (name) => ({data: {publicUrl: `https://example.invalid/${name}`}}) }) },
};
const mocks = {
  'react-native': {Platform: {OS: 'android'}},
  'expo-web-browser': {openAuthSessionAsync: async (_, redirect, options) => {assert.equal(redirect,'fc27israel://auth/callback');assert.equal(options.showInRecents,false);return {type:'success',url:redirect+'?code=warm-fixture'};}},
  '@react-native-async-storage/async-storage': {getItem: async (key) => memory.get(key) ?? null, setItem: async (key,value) => { memory.set(key,value); }, removeItem: async (key) => {memory.delete(key);}},
  '@/lib/supabase': {AUTH_STORAGE_KEY: 'auth-key', getSupabase: () => supabase},
  '@/lib/authGoogle': {},
};
const modules = new Map();
function load(filename) {
  filename = path.resolve(root, filename);
  if (!path.extname(filename)) filename += '.ts';
  if (modules.has(filename)) return modules.get(filename).exports;
  const module = {exports: {}};modules.set(filename,module);
  if (filename.endsWith('.json')) {module.exports=JSON.parse(fs.readFileSync(filename,'utf8'));return module.exports;}
  const source=fs.readFileSync(filename,'utf8');
  const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true},fileName:filename}).outputText;
  const localRequire=(id)=> {
    if(id in mocks)return mocks[id];
    if(id.startsWith('@/'))return load(id.slice(2));
    if(id.startsWith('.'))return load(path.resolve(path.dirname(filename),id));
    return requirePackage(id);
  };
  new Function('require','module','exports',js)(localRequire,module,module.exports);
  return module.exports;
}
const {nativeStartupSnapshot,serializeNativeSnapshot,NATIVE_SNAPSHOT_KEY}=load('lib/nativeStartup.ts');
const {createRemoteBackend}=load('lib/remoteBackend.ts');
const backend=createRemoteBackend();
const before=performance.now();
const initial=await Promise.race([backend.init(),new Promise((_,reject)=>setTimeout(()=>reject(Error('Native init waited for blocked network')),300))]);
assert.equal(initial.user.id,uid);assert.equal(initial.user.isAdmin,false,'Editable user metadata cannot grant admin');
assert.equal(network,0,'Opening native shell must perform zero auth/network calls');
const bootstrapMs=performance.now()-before;
const one=backend.reload(),two=backend.reload();assert.equal(one,two,'Concurrent hydration must share one request');
release();const hydrated=await one;
assert.equal(network,1);assert.equal(avatarCalls,1);assert.equal(storageCalls,0);assert.equal(hydrated.profiles.length,100);
await Promise.resolve();
const cached=serializeNativeSnapshot(hydrated);memory.set(NATIVE_SNAPSHOT_KEY,cached);
assert.equal(nativeStartupSnapshot(JSON.stringify(session),cached).profiles.length,100);
assert.equal(nativeStartupSnapshot(null,cached).user,null,'Signed-out users must not see a cached account');
assert.equal(nativeStartupSnapshot('{broken',cached).user,null);
const other=JSON.stringify({user:{id:'20000000-0000-4000-8000-000000000002',email:'other@example.invalid'}});
assert.equal(nativeStartupSnapshot(other,cached).profiles.length,1,'Never reuse another account’s cached data');
assert(!cached.includes('access_token')&&!cached.includes('refresh_token'));
const {isNativeAuthReturn,authReturnParams,NATIVE_AUTH_CALLBACK}=load('lib/nativeAuthReturn.ts');
assert(isNativeAuthReturn(NATIVE_AUTH_CALLBACK+'?code=fixture'));
assert(isNativeAuthReturn('fc27israel:///auth/callback#access_token=fixture'));
for(const url of ['https://fc27-israel.vercel.app/','https://evil.invalid/auth/callback','fc27israel://other/callback','fc27israel://auth/callback/evil'])assert(!isNativeAuthReturn(url));
assert.equal(authReturnParams(NATIVE_AUTH_CALLBACK+'?code=a%3Db').code,'a=b');
assert.equal(authReturnParams(NATIVE_AUTH_CALLBACK+'#access_token=a%3Db&refresh_token=c%2Bd').refresh_token,'c+d');
const {completeNativeAuthReturn,signInWithGoogleOAuth}=load('lib/authGoogle.ts');
await Promise.all([completeNativeAuthReturn(NATIVE_AUTH_CALLBACK+'?code=cold-fixture'),completeNativeAuthReturn(NATIVE_AUTH_CALLBACK+'?code=cold-fixture')]);
assert.equal(exchanges,1,'Cold/warm callback handlers must not exchange a code twice');
await completeNativeAuthReturn(NATIVE_AUTH_CALLBACK+'?code=cold-fixture');assert.equal(exchanges,1);
await signInWithGoogleOAuth();assert.equal(exchanges,2);
await assert.rejects(completeNativeAuthReturn('https://evil.invalid/?code=fixture'));
console.log(`Native startup verified: shell resolves while network is blocked (${bootstrapMs.toFixed(1)} ms in Node fixture); one coalesced hydration; 100 profiles use one avatar RPC and zero Storage lists; cache account isolation and native OAuth callback parsing pass. This is not a device timing.`);
