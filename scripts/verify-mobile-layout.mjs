import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadRepositoryModule } from './load-player-catalogue.mjs';

const { FORMATIONS } = loadRepositoryModule('lib/chemistry.ts');
const { spotsFor, squadPitchMetrics, pitchCardPosition } = loadRepositoryModule('lib/mobileLayout.ts');
let checked = 0;
for (const formation of FORMATIONS) {
  const widest = Math.max(...formation.lines.map((line) => line.length));
  for (const width of [240, 260, 288, 320, 360, 390, 430, 600, 900]) {
    const { height, cardWidth, cardHeight } = squadPitchMetrics(width, widest, formation.lines.length);
    const spots = spotsFor(formation);
    const allBoxes = [];
    for (const line of formation.lines) {
      for (const slot of line) {
        const spot = spots[slot.id];
        assert(spot, `${formation.id}/${slot.id}: missing pitch position`);
        const box = pitchCardPosition(spot.x, spot.y, width, height, cardWidth, cardHeight);
        assert(box.left >= 0 && box.left + cardWidth <= width, `${formation.id} clipped horizontally at ${width}`);
        assert(box.top >= 0 && box.top + cardHeight <= height, `${formation.id} clipped vertically at ${width}`);
        for (const other of allBoxes) {
          const intersects = box.left < other.left + cardWidth && box.left + cardWidth > other.left && box.top < other.top + cardHeight && box.top + cardHeight > other.top;
          assert(!intersects, `${formation.id} cards overlap at ${width}`);
        }
        allBoxes.push(box);
        checked++;
      }
    }
  }
}
const app = JSON.parse(fs.readFileSync('app.json', 'utf8')).expo;
const eas = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
const profile = { ...eas.build.preview, ...eas.build.apk, android: { ...eas.build.preview.android, ...eas.build.apk.android } };
assert.equal(profile.developmentClient, false, 'APK must run without a development server');
assert.equal(profile.distribution, 'internal');
assert.equal(profile.android.buildType, 'apk');
assert.equal(app.android.package, 'il.fc27.community', 'Keep the existing installed app identity');
assert.equal(app.extra.eas.projectId, '0031c456-43c5-4448-8dc4-da61052b3151');
assert.equal(app.android.softwareKeyboardLayoutMode, 'resize');
assert.notEqual(app.version, '1.0.0', 'Isolate this release from older appVersion OTA updates');
assert.notEqual(app.version, '1.0.1', 'Isolate this hotfix from the previous APK runtime');
assert.notEqual(profile.channel, eas.build.preview.channel, 'Old Preview updates must not replace this APK');
console.log(`Mobile checks passed: ${checked} card positions across ${FORMATIONS.length} formations at 9 phone/tablet widths; no overlap/clipping; standalone APK identity, keyboard and OTA isolation.`);
