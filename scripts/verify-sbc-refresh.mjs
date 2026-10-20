import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadRepositoryModule } from './load-player-catalogue.mjs';
const { officialChallenges, mergeOfficialSbcs, catalogChallenge, RETIRED_SBC_IDS } = loadRepositoryModule('lib/sbcCatalog.ts');
const { isOpen } = loadRepositoryModule('lib/selectors.ts');
const audit = JSON.parse(fs.readFileSync('assets/data/sbc-audit-20261020.json', 'utf8'));
assert.equal(new Set(officialChallenges.map((c) => c.id)).size, officialChallenges.length);
for (const c of audit.challenges) {
 assert(['classic','streamlined'].includes(c.kind));
 assert(Number.isFinite(Date.parse(c.endsAt)), `${c.id}: exact deadline missing`);
 assert(/^https:\/\/www\.(futbin\.com|fut\.gg)\//.test(c.sourceUrl));
 const current = catalogChallenge(c.id);
 assert.equal(current.targetScore, c.targetScore);
 assert.equal(current.endsAt, c.endsAt);
 const stale = { ...current, endsAt: null, requirements: 'Stale cached requirements', targetScore: 1 };
 assert(!mergeOfficialSbcs([stale], Date.parse(c.endsAt) + 1).some((x) => x.id === c.id), `${c.id}: expired cache resurrected challenge`);
 const active = mergeOfficialSbcs([stale], Date.parse(c.endsAt) - 1).find((x) => x.id === c.id);
 assert(active && active.requirements === c.requirements && active.targetScore === c.targetScore);
}
for (const id of audit.retiredIds) {
 assert(RETIRED_SBC_IDS.has(id)); assert(catalogChallenge(id), `History lookup lost for ${id}`);
 assert(!isOpen(catalogChallenge(id)));
 assert(!mergeOfficialSbcs([{ ...catalogChallenge(id), endsAt: null, archived: false }]).some((c) => c.id === id));
}
assert.equal(catalogChallenge('sbc-potm-pina').endsAt, '2026-11-03T17:00:00.000Z');
assert.equal(catalogChallenge('sbc-potm-olise').targetScore, 700000);
assert.equal(catalogChallenge('sbc-player-pick-79-20261019').playerCount, 10);
assert.equal(catalogChallenge('sbc-upgrade-80x5').endsAt, '2026-10-20T17:00:00.000Z');
assert.equal(catalogChallenge('sbc-gold-upgrade').reward, '2×78+ Gold Players Pack (Untradeable)');

const eveningAt = Date.parse('2026-10-20T18:25:51.360Z');
const eveningActive = mergeOfficialSbcs([], eveningAt);
for (const id of ['sbc-fs-espart', 'sbc-upgrade-80x5']) {
 assert(catalogChallenge(id), `Expired history lost: ${id}`);
 assert(!isOpen(catalogChallenge(id), eveningAt));
 assert(!eveningActive.some((c) => c.id === id), `Expired evening SBC remains active: ${id}`);
}
for (const [id, score] of [['sbc-fs-mls-pick-20261020', 13000], ['sbc-upgrade-83x2-20261020', 5500]]) {
 const challenge = catalogChallenge(id);
 assert(challenge, `Missing evening release: ${id}`);
 assert.equal(challenge.targetScore, score);
 assert.equal(challenge.endsAt, '2026-10-27T18:00:01.000Z');
 assert(eveningActive.some((c) => c.id === id), `Evening release is hidden: ${id}`);
}

const custom = { ...catalogChallenge('sbc-fs-challenge-3'), id: 'custom-community-challenge', endsAt: '2026-12-01T00:00:00Z' };
assert(mergeOfficialSbcs([custom], Date.parse(audit.checkedAt)).some((c) => c.id === custom.id));
const active = mergeOfficialSbcs([], Date.parse(audit.checkedAt));
console.log(`SBC refresh verified: ${audit.challenges.length} source-checked entries, ${audit.retiredIds.length} archived old editions; ${active.length} active entries including practice at audit time. Exact deadlines override stale server/cache data.`);
