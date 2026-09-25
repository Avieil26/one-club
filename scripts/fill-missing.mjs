import fs from 'node:fs';

const BUILD = 'M97aJNMwRgARBSdoH5nPR';
const root = new URL('..', import.meta.url);

const playersSrc = fs.readFileSync(new URL('../lib/fcPlayers.ts', import.meta.url), 'utf8');
const faceSrc = fs.readFileSync(new URL('../lib/eaFace.ts', import.meta.url), 'utf8');
const mediaSrc = fs.readFileSync(new URL('../lib/playerMedia.ts', import.meta.url), 'utf8');
const photosSrc = fs.readFileSync(new URL('../lib/playerPhotos.ts', import.meta.url), 'utf8');

const players = [...playersSrc.matchAll(/p\('([^']+)', '([^']+)', (\d+), '([^']+)'/g)].map((m) => ({
  id: m[1],
  he: m[2],
  rating: Number(m[3]),
  position: m[4],
}));
const faceIds = new Set([...faceSrc.matchAll(/^\s+'?([a-z0-9\-]+)'?:/gm)].map((m) => m[1]));
const en = {};
for (const src of [mediaSrc, photosSrc]) {
  for (const match of src.matchAll(/^\s+'?([a-z0-9\-]+)'?:\s*\{[^}]*en:\s*"([^"]+)"/gm)) en[match[1]] = match[2];
  for (const match of src.matchAll(/^\s+'?([a-z0-9\-]+)'?:\s*\{[^}]*en:\s*'([^']+)'/gm)) en[match[1]] = match[2];
}
en['di-maria'] = 'Ángel Di María';
en.montgomery = 'Adam Montgomery';

const manual = {
  paqueta: ['Lucas Paquetá', 'Lucas Paqueta', 'Paquetá'],
  pepe: ['Pepe'],
  neymar: ['Neymar'],
  king: ['Leon King'],
  silva: ['António Silva'],
};

function norm(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function score(item, query) {
  const target = norm(query);
  const full = norm(`${item.firstName || ''} ${item.lastName || ''}`);
  const common = norm(item.commonName || '');
  const last = norm(item.lastName || '');
  if (common && common === target) return 100;
  if (full === target) return 95;
  if (last === target && target.length > 3) return 80;
  if (full.endsWith(target) || common.endsWith(target)) return 70;
  const parts = target.split(' ');
  if (parts.length > 1 && last === parts.at(-1) && (full.includes(parts[0]) || common.includes(parts[0]))) return 90;
  return 0;
}

async function search(query) {
  const url = `https://www.ea.com/_next/data/${BUILD}/games/ea-sports-fc/ratings.json?search=${encodeURIComponent(query)}&page=1`;
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'x-nextjs-data': '1' } });
  if (!response.ok) throw new Error(`${response.status} ${query}`);
  const data = await response.json();
  return data.pageProps?.ratingDetails?.items ?? [];
}

function faceOf(item) {
  const s = item.stats;
  return {
    ovr: item.overallRating,
    pac: s.pac.value,
    sho: s.sho.value,
    pas: s.pas.value,
    dri: s.dri.value,
    def: s.def.value,
    phy: s.phy.value,
    pos: item.position?.shortLabel,
    team: item.team?.label,
    league: item.leagueName,
    nation: item.nationality?.label,
    name: item.commonName || `${item.firstName} ${item.lastName}`.trim(),
    gender: item.gender?.label,
    id: item.id,
  };
}

async function best(queries, position) {
  let winner = null;
  let winnerScore = 0;
  const seen = [];
  for (const query of queries) {
    const items = await search(query);
    for (const item of items) {
      let value = Math.max(...queries.map((q) => score(item, q)));
      if (position && item.position?.shortLabel === position) value += 5;
      const row = faceOf(item);
      seen.push({ value, ...row });
      if (value > winnerScore) {
        winnerScore = value;
        winner = row;
      }
    }
    if (winnerScore >= 90) break;
  }
  return { winner: winnerScore >= 70 ? winner : null, winnerScore, seen: seen.sort((a, b) => b.value - a.value).slice(0, 4) };
}

const missing = players.filter((player) => !faceIds.has(player.id));
console.log('players', players.length, 'faces', faceIds.size, 'missing', missing.map((p) => p.id).join(','));

const results = [];
for (const player of missing) {
  const queries = manual[player.id] ?? [en[player.id] || player.id];
  const found = await best(queries, player.position);
  results.push({ ourId: player.id, queries, he: player.he, ourRating: player.rating, ourPos: player.position, ...found });
  const row = found.winner;
  console.log(player.id, row ? `${row.ovr} ${row.pac}/${row.sho}/${row.pas}/${row.dri}/${row.def}/${row.phy} ${row.pos} ${row.team} (${found.winnerScore})` : `MISS ${found.seen.map((s) => s.name).join('|')}`);
}

const probes = [
  'player-ratings/lucas-paqueta/233927',
  'player-ratings/lucas-paqueta/257534',
  'player-ratings/paqueta/233927',
];
for (const path of probes) {
  const response = await fetch(`https://www.ea.com/_next/data/${BUILD}/games/ea-sports-fc/ratings/${path}.json`, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'x-nextjs-data': '1' },
  });
  const text = await response.text();
  console.log('probe', response.status, path, /Paquet/i.test(text), text.slice(0, 80));
}

const women = [
  ['aitana', 'Aitana Bonmatí'],
  ['hansen', 'Caroline Graham Hansen'],
  ['hegerberg', 'Ada Hegerberg'],
  ['kerr', 'Sam Kerr'],
  ['miedema', 'Vivianne Miedema'],
  ['mead', 'Beth Mead'],
  ['lauren-james', 'Lauren James'],
  ['earps', 'Mary Earps'],
  ['williamson', 'Leah Williamson'],
  ['bronze', 'Lucy Bronze'],
  ['walsh', 'Keira Walsh'],
  ['katoto', 'Marie-Antoinette Katoto'],
  ['renard', 'Wendie Renard'],
  ['karchaoui', 'Sakina Karchaoui'],
  ['rodman', 'Trinity Rodman'],
  ['smith', 'Sophia Smith'],
  ['horan', 'Lindsey Horan'],
  ['buhl', 'Klara Bühl'],
  ['oberdorf', 'Lena Oberdorf'],
  ['debinha', 'Debinha'],
  ['hemp', 'Lauren Hemp'],
  ['kelly', 'Chloe Kelly'],
  ['russo', 'Alessia Russo'],
  ['guijarro', 'Patri Guijarro'],
  ['paraluelo', 'Salma Paralluelo'],
  ['mapi', 'Mapi León'],
  ['paredes', 'Irene Paredes'],
  ['caicedo-w', 'Linda Caicedo'],
  ['banda', 'Barbra Banda'],
  ['berger', 'Ann-Katrin Berger'],
  ['endler', 'Christiane Endler'],
  ['nusken', 'Sjoeke Nüsken'],
  ['stanway', 'Georgia Stanway'],
  ['caldentey', 'Mariona Caldentey'],
  ['popp', 'Alexandra Popp'],
  ['gwinn', 'Giulia Gwinn'],
  ['diani', 'Kadidiatou Diani'],
  ['morgan', 'Alex Morgan'],
  ['lavelle', 'Rose Lavelle'],
  ['swanson', 'Mallory Swanson'],
];

const womenResults = [];
for (const [id, name] of women) {
  const found = await best([name], null);
  womenResults.push({ ourId: id, name, ...found });
  const row = found.winner;
  console.log('W', id, row ? `${row.ovr} ${row.pac}/${row.sho}/${row.pas}/${row.dri}/${row.def}/${row.phy} ${row.pos} ${row.team} ${row.league}` : 'MISS');
}

fs.writeFileSync(new URL('../scripts/ea-missing.json', import.meta.url), JSON.stringify({ results, womenResults }, null, 2));
console.log('wrote scripts/ea-missing.json');
