/**
 * Spot-check top roster ratings against live EA FC 27 API.
 * Usage: node scripts/verify-sample.mjs
 */
import fs from 'node:fs';

const BUILD = process.env.EA_BUILD || 'M97aJNMwRgARBSdoH5nPR';
const headers = { 'User-Agent': 'Mozilla/5.0', 'x-nextjs-data': '1', Accept: 'application/json' };

const roster = JSON.parse(fs.readFileSync(new URL('../assets/data/players.json', import.meta.url), 'utf8'));
const sample = roster
  .filter((p) => p.eaId && p.face)
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 50);

async function fetchById(eaId) {
  // Search pages are ranked; look up via search on name is more reliable than id path
  return null;
}

async function search(name) {
  const url = `https://www.ea.com/_next/data/${BUILD}/games/ea-sports-fc/ratings.json?search=${encodeURIComponent(name)}&page=1`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${name}`);
  const data = await res.json();
  return data.pageProps?.ratingDetails?.items ?? [];
}

const mismatches = [];
const ok = [];

for (const player of sample) {
  const items = await search(player.en);
  const hit = items.find((item) => item.id === player.eaId) || items[0];
  if (!hit) {
    mismatches.push({ id: player.id, en: player.en, reason: 'not found on EA' });
    console.log('MISS', player.en);
    continue;
  }
  const face = {
    ovr: hit.overallRating,
    pac: hit.stats.pac.value,
    sho: hit.stats.sho.value,
    pas: hit.stats.pas.value,
    dri: hit.stats.dri.value,
    def: hit.stats.def.value,
    phy: hit.stats.phy.value,
  };
  const ours = player.face;
  const same =
    face.ovr === ours.ovr &&
    face.pac === ours.pac &&
    face.sho === ours.sho &&
    face.pas === ours.pas &&
    face.dri === ours.dri &&
    face.def === ours.def &&
    face.phy === ours.phy;

  if (same && hit.id === player.eaId) {
    ok.push(player.en);
    console.log('OK', face.ovr, player.en);
  } else {
    mismatches.push({
      id: player.id,
      en: player.en,
      ours: { eaId: player.eaId, ...ours },
      ea: { eaId: hit.id, name: hit.commonName || `${hit.firstName} ${hit.lastName}`, ...face },
    });
    console.log('DIFF', player.en, JSON.stringify(ours), 'vs', JSON.stringify(face));
  }
  await new Promise((r) => setTimeout(r, 80));
}

const report = {
  checked: sample.length,
  ok: ok.length,
  mismatches: mismatches.length,
  mismatchDetails: mismatches,
  sampleNames: sample.map((p) => `${p.rating} ${p.en}`),
};
fs.writeFileSync(new URL('../assets/data/verify-sample.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ checked: report.checked, ok: report.ok, mismatches: report.mismatches }, null, 2));
