import { readFile, writeFile } from 'node:fs/promises';

const ATTRS = [
  'Acceleration', 'SprintSpeed', 'Positioning', 'Finishing', 'ShotPower', 'LongShots', 'Volleys', 'Penalties',
  'Vision', 'Crossing', 'FkAccuracy', 'ShortPassing', 'LongPassing', 'Curve', 'Agility', 'Balance', 'Reactions',
  'BallControl', 'Dribbling', 'Composure', 'Interceptions', 'HeadingAccuracy', 'DefensiveAwareness',
  'StandingTackle', 'SlidingTackle', 'Jumping', 'Stamina', 'Strength', 'Aggression',
  'GkDiving', 'GkHandling', 'GkKicking', 'GkReflexes', 'GkPositioning',
];

const QUERIES = [
  ['Temwa Chawinga', 90],
  ['Odegaard', 87],
  ['Gyokeres', 87],
  ['Modric', 86],
  ['Ellie Carpenter', 86],
  ['Joao Felix', 84],
  ['Alex Baena', 84],
  ['Heung Min Son', 83],
  ['Michael Kayode', 83],
  ['Felicia Schroder', 82],
  ['Jaedyn Shaw', 82],
  ['Tzolakis', 81],
  ['Mbemba', 80],
  ['Mwene', 80],
  ['Henry Martin', 80],
  ['Namaso', 80],
  ['Ayase Ueda', 80],
  ['Berhalter', 80],
  ['Iloski', 80],
  ['Amdouni', 80],
  ['Meerdink', 80],
  ['Sara Ortega', 80],
  ['Shea Charles', 80],
];

async function search(name) {
  const url = `https://www.fut.gg/api/fut/players/v2/search/?name=${encodeURIComponent(name)}&game=27`;
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0', accept: 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${name}`);
  const json = await res.json();
  return json.data ?? [];
}

function parseAttrs(html) {
  const start = html.indexOf('attributeAcceleration:');
  if (start < 0) return null;
  const slice = html.slice(start, start + 1800);
  const raw = {};
  for (const match of slice.matchAll(/attribute([A-Za-z]+):(\d+)/g)) {
    if (raw[match[1]] == null) raw[match[1]] = Number(match[2]);
  }
  const attrs = ATTRS.map((name) => raw[name] ?? 0);
  if (attrs.filter((n) => n > 0).length < 10) return null;
  return attrs;
}

function parsePlaystyles(html, plusCount) {
  const at = html.indexOf('flex flex-row gap-2 justify-center flex-wrap max-w-full');
  if (at < 0) return [];
  const block = html.slice(at, at + 120000);
  const titles = [...block.matchAll(/<div title="([^"]+)">/g)].map((match) => match[1]);
  const names = titles.filter((title) => title.length < 28);
  return names.slice(0, plusCount + 12).map((name, index) => ({ name, plus: index < plusCount }));
}

function faceOf(hit) {
  const face = hit.faceStatsV2 ?? {};
  const gk = hit.position === 'GK';
  return {
    ovr: hit.overall,
    pac: gk ? face.gkFaceDiving : face.facePace,
    sho: gk ? face.gkFaceHandling : face.faceShooting,
    pas: gk ? face.gkFaceKicking : face.facePassing,
    dri: gk ? face.gkFaceReflexes : face.faceDribbling,
    def: gk ? face.gkFaceSpeed : face.faceDefending,
    phy: gk ? face.gkFacePositioning : face.facePhysicality,
  };
}

const players = JSON.parse(await readFile('assets/data/players.json', 'utf8'));
const byEa = new Map(players.filter((player) => player.eaId).map((player) => [player.eaId, player]));
const totw = JSON.parse(await readFile('assets/data/totw.json', 'utf8'));
const meta = JSON.parse(await readFile('assets/data/totwCardMeta.json', 'utf8'));
const have = new Set(totw.map((row) => row.baseId).filter(Boolean));

const found = [];
for (const [query, rating] of QUERIES) {
  const hits = await search(query);
  const hit = hits.find((row) => row.rarityName === 'Team of the week' && row.overall === rating);
  if (!hit) {
    console.log('MISS', query, rating);
    continue;
  }
  const base = byEa.get(hit.basePlayerEaId);
  if (!base) {
    console.log('NO BASE', query, hit.basePlayerEaId, hit.commonName);
    continue;
  }
  if (have.has(base.id)) {
    console.log('ALREADY', base.id);
    continue;
  }
  const html = await (await fetch(`https://www.fut.gg${hit.url}`, { headers: { 'user-agent': 'Mozilla/5.0' } })).text();
  const attrs = parseAttrs(html);
  const face = faceOf(hit);
  const playstyles = parsePlaystyles(html, (hit.playStylePlusEaIds ?? []).length);
  const positions = [hit.position, ...(hit.alternativePositions ?? [])].filter((pos, index, all) => pos && all.indexOf(pos) === index);
  found.push({
    id: base.id,
    q: base.en,
    eaId: hit.basePlayerEaId,
    cardEaId: hit.eaId,
    imagePath: hit.imagePath,
    rating: hit.overall,
    position: hit.position,
    face: [face.pac, face.sho, face.pas, face.dri, face.def, face.phy],
    row: {
      baseId: base.id,
      position: hit.position,
      rating: hit.overall,
      face,
      positions,
      playstyles,
    },
    meta: attrs
      ? { foot: hit.foot === 'Left' ? 'L' : 'R', sm: hit.skillMoves, wf: hit.weakFoot, attrs }
      : null,
  });
  console.log('ok', base.id, hit.cardName, hit.overall, hit.position, face, playstyles.map((style) => `${style.name}${style.plus ? '+' : ''}`).join(', '), attrs ? 'attrs' : 'NO ATTRS');
}

const headers = { 'user-agent': 'Mozilla/5.0', accept: 'application/json', referer: 'https://www.fut.gg/' };
const manifest = await (await fetch('https://r2.fut.gg/27/manifest.json', { headers })).json();
const version = manifest._version;
const file = (name) => `https://r2.fut.gg/27/${name}.v${version}.${manifest[name]}.json`;
const [index, ps, pc] = await Promise.all([
  fetch(file('player-prices-index'), { headers }).then((res) => res.json()),
  fetch(file('player-prices-ps5'), { headers }).then((res) => res.json()),
  fetch(file('player-prices-pc'), { headers }).then((res) => res.json()),
]);
const wanted = new Set(found.map((row) => row.cardEaId));
const prices = new Map();
let current = index.id0;
if (wanted.has(current) && ps.s[0] === 0) prices.set(current, [ps.p[0] || 0, pc.p[0] || 0]);
for (let i = 0; i < index.d.length; i++) {
  current += index.d[i];
  const idx = i + 1;
  if (!wanted.has(current) || ps.s[idx] !== 0) continue;
  prices.set(current, [ps.p[idx] || 0, pc.p[idx] || 0]);
}

const priceTable = JSON.parse(await readFile('assets/data/marketPrices.json', 'utf8'));
const priceIds = JSON.parse(await readFile('assets/data/priceEaIds.json', 'utf8'));
for (const row of found) {
  totw.push(row.row);
  if (row.meta) meta[row.id] = row.meta;
  const quote = prices.get(row.cardEaId);
  const key = `${row.id}--totw`;
  priceIds[key] = row.cardEaId;
  if (quote && (quote[0] > 0 || quote[1] > 0)) {
    priceTable[key] = quote;
    console.log('price', key, quote);
  } else {
    console.log('NO PRICE', key, row.cardEaId);
  }
}

await writeFile('assets/data/totw.json', JSON.stringify(totw));
await writeFile('assets/data/totwCardMeta.json', JSON.stringify(meta));
await writeFile('assets/data/marketPrices.json', JSON.stringify(priceTable));
await writeFile('assets/data/priceEaIds.json', JSON.stringify(priceIds));
await writeFile('assets/data/totw3-specs.json', JSON.stringify(found.map(({ id, q, eaId, imagePath, rating, position, face }) => ({ id, q, eaId, imagePath, rating, position, face }))));
console.log('saved', found.length);
