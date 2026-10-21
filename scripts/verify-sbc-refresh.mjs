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

const { openSbcChallenges } = loadRepositoryModule('lib/selectors.ts');
const sorted = openSbcChallenges(officialChallenges, eveningAt);
assert.deepEqual(sorted.slice(0, 2).map((c) => c.id), ['sbc-fs-mls-pick-20261020', 'sbc-upgrade-83x2-20261020']);
assert(sorted.findIndex((c) => c.id === 'sbc-hero-max87-20261019') < sorted.findIndex((c) => c.id === 'sbc-potm-ferran'));
const { countryOptions, countryName, COUNTRY_CODES } = loadRepositoryModule('lib/countries.ts');
assert.equal(COUNTRY_CODES.size, 249);
assert.equal(countryName('DE', 'he'), 'גרמניה');
assert.equal(countryName('DE', 'en'), 'Germany');
assert(countryOptions('גרמניה', 'en').some((c) => c.code === 'DE'));
assert(countryOptions('Germany', 'he').some((c) => c.code === 'DE'));
assert.equal(countryName('Europe', 'en'), 'Country not selected', 'Do not infer a country from an old broad region');
assert.equal(countryName('מרכז', 'en'), 'Israel');
const artwork = JSON.parse(fs.readFileSync('assets/data/sbc-reward-art-20261020.json', 'utf8'));
for (const c of audit.challenges.filter((c) => /sbc-potm-|sbc-fs-(diao|manzambi|zicai)|sbc-intro-espinoza/.test(c.id))) {
 const art = artwork[c.id];
 assert.equal(art?.kind, 'player', c.id + ': missing actual player reward');
 const item = art.sourceUrl.split('/').filter(Boolean).at(-1).slice(3);
 assert(art.portrait.includes('/2027/player-item/27-' + item + '.'), c.id + ': wrong edition portrait');
 assert(art.background.includes('/2027/rarities-level-0-large/'), c.id + ': missing actual promo frame');
}
// Detailed points eligibility, named items and score totals are tested by verify-sbc-solutions.mjs.
console.log('Newest-first SBC order, matching reward editions, challenge eligibility and bilingual country search passed.');

const { evaluateSquad, formationById } = loadRepositoryModule('lib/chemistry.ts');
const { placedPreview } = loadRepositoryModule('lib/sbcCatalog.ts');
const readyClassic = catalogChallenge('sbc-fs-challenge-3');
const squadReport = evaluateSquad(formationById(readyClassic.previewFormation), placedPreview(readyClassic.previewSquad), readyClassic.rules);
assert.equal(new Set(Object.values(readyClassic.previewSquad)).size, 11);
assert(squadReport.ready, 'Ready example squad must meet every published rule');
assert(squadReport.chemistry >= 18);

const crypto = await import('node:crypto');
const media = JSON.parse(fs.readFileSync('assets/data/sbc-local-art-manifest.json', 'utf8'));
const urls = new Set(media.assets.map((a) => a.url));
for (const asset of media.assets) {
 const bytes = fs.readFileSync(asset.path);
 assert.equal(bytes.length, asset.bytes);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), asset.sha256, 'Corrupted reward artwork: '+asset.path);
}
for (const [id, art] of Object.entries(artwork)) {
 for (const field of ['background','portrait','nation','league','club','image']) if (art[field]) assert(urls.has(art[field]), id+': missing local '+field);
}
for (const [id, url] of Object.entries(media.complete)) {
 const item = artwork[id].sourceUrl.split('/').filter(Boolean).at(-1);
 assert(url.includes('/2027/futgg-player-item-card/'+item+'.'), 'Wrong complete card edition: '+id);
 assert(urls.has(url));
}
const { sbcTileTheme } = loadRepositoryModule('lib/sbcTileTheme.ts');
assert.equal(sbcTileTheme(catalogChallenge('sbc-upgrade-83x2-20261020')).packLabel, '83+');
console.log('All SBC reward images are locally bundled, intact and mapped to the correct current card edition.');
