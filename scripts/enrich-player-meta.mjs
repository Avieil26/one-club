/**
 * Pull official EA FC 27 list data: preferred foot, skill moves, weak foot, and attribute values.
 * Matches roster cards by eaId. Icons match only on a unique name, never a guess.
 */
import fs from 'node:fs';

const BUILD = 'A3s8tSa-x4nSQPIQLoxTm';
const MIN_OVR = 73;
const PAGE_SIZE = 100;
const headers = {
  'User-Agent': 'Mozilla/5.0 (compatible; fc27-israel/1.0)',
  'x-nextjs-data': '1',
  Accept: 'application/json',
};

const ATTRS = [
  'acceleration',
  'sprintSpeed',
  'positioning',
  'finishing',
  'shotPower',
  'longShots',
  'volleys',
  'penalties',
  'vision',
  'crossing',
  'freeKickAccuracy',
  'shortPassing',
  'longPassing',
  'curve',
  'agility',
  'balance',
  'reactions',
  'ballControl',
  'dribbling',
  'composure',
  'interceptions',
  'headingAccuracy',
  'defensiveAwareness',
  'standingTackle',
  'slidingTackle',
  'jumping',
  'stamina',
  'strength',
  'aggression',
  'gkDiving',
  'gkHandling',
  'gkKicking',
  'gkReflexes',
  'gkPositioning',
];

function norm(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pack(item) {
  const stats = item.stats || {};
  const attrs = ATTRS.map((key) => Number(stats[key]?.value ?? 0));
  const foot = Number(item.preferredFoot) === 2 ? 'L' : 'R';
  return {
    foot,
    sm: Number(item.skillMoves) || 0,
    wf: Number(item.weakFootAbility) || 0,
    attrs,
  };
}

async function fetchPage(page) {
  const url = `https://www.ea.com/_next/data/${BUILD}/games/ea-sports-fc/ratings.json?page=${page}&sortBy=overallRating&sortDir=desc`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`EA ${response.status} page=${page}`);
  const data = await response.json();
  return data.pageProps?.ratingDetails?.items ?? [];
}

const byEa = new Map();
const byName = new Map();

let page = 1;
while (page < 80) {
  const items = await fetchPage(page);
  if (!items.length) break;
  let low = false;
  for (const item of items) {
    if (item.overallRating < MIN_OVR) {
      low = true;
      continue;
    }
    const meta = pack(item);
    byEa.set(item.id, meta);
    const names = [item.commonName, item.lastName, `${item.firstName || ''} ${item.lastName || ''}`]
      .map(norm)
      .filter((name) => name.length > 2);
    for (const name of names) {
      const list = byName.get(name) || [];
      list.push({ meta, ovr: item.overallRating, name: item.commonName || item.lastName });
      byName.set(name, list);
    }
  }
  console.log(`page ${page} items=${items.length} ea=${byEa.size}`);
  if (low || items.length < PAGE_SIZE) break;
  page += 1;
  await sleep(80);
}

const roster = JSON.parse(fs.readFileSync(new URL('../assets/data/players.json', import.meta.url), 'utf8'));
const meta = {};
let rosterHits = 0;
for (const player of roster) {
  const found = byEa.get(player.eaId);
  if (!found || !found.sm || !found.wf) continue;
  meta[player.id] = found;
  rosterHits += 1;
}

const iconSrc = fs.readFileSync(new URL('../lib/iconPlayers.ts', import.meta.url), 'utf8');
const iconCards = [...iconSrc.matchAll(/id: '([^']+)'[\s\S]*?rating: (\d+)/g)].map((match) => ({ id: match[1], rating: Number(match[2]) }));
const iconEn = Object.fromEntries([...iconSrc.matchAll(/'([^']+)':\s*\{\s*en:\s*"([^"]+)"/g)].map((match) => [match[1], match[2]]));
let iconHits = 0;
for (const icon of iconCards) {
  const key = norm(iconEn[icon.id] || '');
  if (!key) continue;
  const hits = (byName.get(key) || []).filter((item) => item.ovr === icon.rating);
  if (hits.length !== 1) continue;
  meta[icon.id] = hits[0].meta;
  iconHits += 1;
}

fs.writeFileSync(new URL('../assets/data/playerMeta.json', import.meta.url), JSON.stringify({ attrs: ATTRS, players: meta }));
const left = Object.values(meta).filter((row) => row.foot === 'L').length;
console.log(JSON.stringify({ rosterHits, roster: roster.length, left, iconHits, mbappe: meta.mbappe, putellas: meta.putellas, zlatan: meta['icon-zlatan-ibrahimovic'] }, null, 2));
