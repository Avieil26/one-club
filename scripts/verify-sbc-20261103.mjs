import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadRepositoryModule } from './load-player-catalogue.mjs';

const data = JSON.parse(fs.readFileSync('assets/data/sbc-refresh-20261103.json', 'utf8'));
const { catalogChallenge } = loadRepositoryModule('lib/sbcCatalog.ts');
const { pointsSegments, pointsPlans, pointsPlanValid } = loadRepositoryModule('lib/sbcVerified.ts');
const { sbcTileTheme } = loadRepositoryModule('lib/sbcTileTheme.ts');

assert.equal(new Set(data.challenges.map((c) => c.id)).size, data.challenges.length, 'Duplicate Nov 3 SBC ids');
const expected = {
  'sbc-laliga-ligaf-20261103': { total: 6000, segments: [3000, 3000], names: ['LALIGA', 'Liga F'] },
  'sbc-premier-wsl-20261103': { total: 9000, segments: [4500, 4500], names: ['Premier League', 'Barclays WSL'] },
};

for (const [id, e] of Object.entries(expected)) {
  const c = catalogChallenge(id);
  assert(c, id + ': missing from official catalogue');
  assert.equal(c.kind, 'streamlined');
  assert.equal(c.targetScore, e.total);
  assert.equal(c.createdAt, '2026-11-03T18:00:00.000Z');
  assert.equal(c.reward, '2x Max 85 Gold Players Pack (Untradeable)');
  const segments = pointsSegments(id);
  assert.deepEqual(segments.map((s) => s.target), e.segments);
  assert.deepEqual(segments.map((s) => s.name), e.names);
  assert(segments.every((s) => s.requirements.length === 1 && s.requirements[0] === 'Rating: Min. 45'));
  assert.equal(segments.reduce((n, s) => n + s.target, 0), c.targetScore);
  for (const segment of segments) {
    for (const platform of ['ps5', 'pc']) {
      const plans = pointsPlans(segment, platform);
      assert(plans.length, id + '/' + segment.name + '/' + platform + ': no solution');
      assert(plans.every((p) => pointsPlanValid(segment, p, platform)), id + ': invalid generated solution');
    }
  }
  const theme = sbcTileTheme(c);
  assert.equal(theme.packLabel, '2× MAX 85');
}

console.log('PASS: Nov 3 20:00 league SBCs are unique, source-shaped, solution-ready on both platforms and use the correct group reward.');
