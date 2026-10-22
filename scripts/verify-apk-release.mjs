import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = JSON.parse(fs.readFileSync('app.json', 'utf8')).expo;
const eas = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
function resolve(name, seen = new Set()) {
  assert(!seen.has(name), 'Circular EAS profile inheritance');
  seen.add(name);
  const own = eas.build[name];
  assert(own, `Missing EAS profile ${name}`);
  const parent = own.extends ? resolve(own.extends, seen) : {};
  return { ...parent, ...own, android: { ...parent.android, ...own.android } };
}
const apk = resolve('apk-season2');
assert.equal(app.version, '1.0.3');
assert.equal(app.runtimeVersion.policy, 'appVersion');
assert.equal(apk.channel, 'android-season2-20261022');
assert.notEqual(apk.channel, resolve('apk').channel);
assert.notEqual(apk.channel, resolve('preview').channel);
assert.equal(apk.developmentClient, false);
assert.equal(apk.distribution, 'internal');
assert.equal(apk.android.buildType, 'apk');
assert.equal(apk.autoIncrement, true);
assert.equal(apk.environment, 'production');
assert.equal(app.android.package, 'il.fc27.community');
assert.equal(app.extra.eas.projectId, '0031c456-43c5-4448-8dc4-da61052b3151');
assert.equal(JSON.parse(fs.readFileSync('public/gallery-data/catalogue.json', 'utf8')).sets.length, 128);
assert.equal(JSON.parse(fs.readFileSync('assets/data/season2.json', 'utf8')).length, 29);
for (const file of ['gallery-hall.webp', 'gallery-como.webp', 'gallery-arsenal.webp', 'gallery-barcelona.webp']) {
  assert(fs.existsSync(`assets/images/${file}`), `Missing Gallery scenery: ${file}`);
}
console.log('APK 1.0.3 verified: standalone APK, preserved package/project, new update channel/runtime, automatic build number, Gallery and Season 2 data.');
