import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const heroes = JSON.parse(await readFile('assets/data/heroes.json', 'utf8'));
const cacheDir = path.join(process.env.TEMP, 'hero-cache');
await mkdir(cacheDir, { recursive: true });

const ATTRS = [
  ['Acceleration', 'acceleration'],
  ['SprintSpeed', 'sprintSpeed'],
  ['Positioning', 'positioning'],
  ['Finishing', 'finishing'],
  ['ShotPower', 'shotPower'],
  ['LongShots', 'longShots'],
  ['Volleys', 'volleys'],
  ['Penalties', 'penalties'],
  ['Vision', 'vision'],
  ['Crossing', 'crossing'],
  ['FkAccuracy', 'freeKickAccuracy'],
  ['ShortPassing', 'shortPassing'],
  ['LongPassing', 'longPassing'],
  ['Curve', 'curve'],
  ['Agility', 'agility'],
  ['Balance', 'balance'],
  ['Reactions', 'reactions'],
  ['BallControl', 'ballControl'],
  ['Dribbling', 'dribbling'],
  ['Composure', 'composure'],
  ['Interceptions', 'interceptions'],
  ['HeadingAccuracy', 'headingAccuracy'],
  ['DefensiveAwareness', 'defensiveAwareness'],
  ['StandingTackle', 'standingTackle'],
  ['SlidingTackle', 'slidingTackle'],
  ['Jumping', 'jumping'],
  ['Stamina', 'stamina'],
  ['Strength', 'strength'],
  ['Aggression', 'aggression'],
  ['GkDiving', 'gkDiving'],
  ['GkHandling', 'gkHandling'],
  ['GkKicking', 'gkKicking'],
  ['GkReflexes', 'gkReflexes'],
  ['GkPositioning', 'gkPositioning'],
];

const EXTRA = {
  'hero-parkjisung': ['Park Ji-sung', 'Ji Sung', 'Jisung'],
  'hero-aljaber': ['Al Jaber', 'Sami Al-Jaber'],
  'hero-alowairan': ['Al Owairan', 'Owairan', 'Saeed Al-Owairan'],
};

function queries(hero) {
  const last = hero.en.split(' ').slice(-1)[0];
  const plain = (value) => value.normalize('NFD').replace(/\p{M}/gu, '');
  const fromId = hero.id.replace(/^hero-/, '');
  return [...new Set([...(EXTRA[hero.id] || []), hero.en, plain(hero.en), last, plain(last), fromId].filter((q) => q && q.replace(/[^A-Za-z]/g, '').length > 2))];
}

async function search(q) {
  const url = `https://www.fut.gg/api/fut/players/v2/search/?name=${encodeURIComponent(q)}&game=27`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const json = await res.json();
  return json.data || [];
}

function pick(rows, hero) {
  const pool = rows.filter((p) => p.isHero && String(p.game) === '27' && p.rarityName === 'Base Hero');
  return (
    pool.find((p) => p.overall === hero.rating && p.position === hero.position) ||
    pool.find((p) => p.overall === hero.rating) ||
    pool.find((p) => p.position === hero.position && Math.abs(p.overall - hero.rating) <= 1) ||
    null
  );
}

function faceFrom(hit) {
  const by = Object.fromEntries((hit.faceStats || []).map((s) => [s.name, s.rating]));
  if (hit.position === 'GK') {
    const order = ['DIV', 'HAN', 'KIC', 'REF', 'SPD', 'POS'];
    const nums = order.map((name) => by[name]);
    if (nums.every((n) => typeof n === 'number')) {
      return { ovr: hit.overall, pac: nums[0], sho: nums[1], pas: nums[2], dri: nums[3], def: nums[4], phy: nums[5] };
    }
  }
  return {
    ovr: hit.overall,
    pac: by.PAC,
    sho: by.SHO,
    pas: by.PAS,
    dri: by.DRI,
    def: by.DEF,
    phy: by.PHY,
  };
}

function parseAttrs(html) {
  const start = html.indexOf('attributeAcceleration:');
  if (start < 0) return null;
  const slice = html.slice(start, start + 1800);
  const raw = {};
  for (const match of slice.matchAll(/attribute([A-Za-z]+):(\d+)/g)) {
    if (raw[match[1]] == null) raw[match[1]] = Number(match[2]);
  }
  const attrs = ATTRS.map(([from]) => raw[from] ?? 0);
  if (attrs.filter((n) => n > 0).length < 10) return null;
  return attrs;
}

function playstyles(html) {
  const cut = html.indexOf('Switch platform');
  const head = cut > 0 ? html.slice(0, cut) : html;
  const out = [];
  const re = /title="([^"]+)"><svg viewBox="0 0 256 256"/g;
  let match;
  while ((match = re.exec(head))) {
    const name = match[1];
    const after = head.slice(match.index, match.index + 900);
    const plus = after.includes('fill="#e3c075"');
    if (!out.some((row) => row.name === name)) out.push({ name, plus });
  }
  return out;
}

async function one(hero) {
  const cache = path.join(cacheDir, `${hero.id}.json`);
  try {
    return JSON.parse(await readFile(cache, 'utf8'));
  } catch {
    /* fetch */
  }
  let hit = null;
  for (const q of queries(hero)) {
    const rows = await search(q);
    hit = pick(rows, hero);
    if (hit) break;
  }
  if (!hit) {
    console.log('MISSING', hero.id, hero.en);
    return null;
  }
  const pageUrl = `https://www.fut.gg${hit.url}`;
  const html = await (await fetch(pageUrl, { headers: { accept: 'text/html' } })).text();
  const attrs = parseAttrs(html);
  const detail = {
    id: hero.id,
    eaId: hit.eaId,
    cardName: hit.cardName,
    rating: hit.overall,
    position: hit.position,
    positions: hit.alternativePositions || [],
    nation: hit.nation?.name || hero.nation,
    league: hit.league?.name || hero.league,
    foot: hit.foot === 'Left' ? 'L' : 'R',
    skillMoves: hit.skillMoves,
    weakFoot: hit.weakFoot,
    height: hit.height,
    face: faceFrom(hit),
    faceNames: (hit.faceStats || []).map((s) => s.name),
    attrs,
    playstyles: playstyles(html),
    imagePath: hit.imagePath,
    nationImage: hit.nation?.imagePath || hit.nationImagePath,
    leagueImage: hit.league?.imagePath || hit.leagueImagePath,
  };
  await writeFile(cache, JSON.stringify(detail));
  console.log('ok', hero.id, detail.cardName, detail.rating, detail.position, detail.league, detail.playstyles.map((s) => s.name).join(','));
  return detail;
}

const results = [];
let cursor = 0;
async function worker() {
  while (cursor < heroes.length) {
    const hero = heroes[cursor++];
    try {
      results.push(await one(hero));
    } catch (error) {
      console.log('ERR', hero.id, error.message);
      results.push(null);
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));

const details = results.filter(Boolean);
const byId = new Map(details.map((row) => [row.id, row]));
const nextHeroes = heroes.map((hero) => {
  const row = byId.get(hero.id);
  if (!row) return hero;
  return {
    ...hero,
    en: row.cardName || hero.en,
    rating: row.rating,
    position: row.position,
    nation: row.nation,
    league: row.league,
    face: row.face,
    positions: [row.position, ...row.positions.filter((p) => p !== row.position)],
    playstyles: row.playstyles,
  };
});

const meta = {};
const heights = {};
for (const row of details) {
  if (row.attrs) meta[row.id] = { foot: row.foot, sm: row.skillMoves, wf: row.weakFoot, attrs: row.attrs };
  if (row.height) heights[row.id] = row.height;
}

await writeFile('assets/data/heroes.json', JSON.stringify(nextHeroes));
await writeFile('assets/data/heroCardMeta.json', JSON.stringify(meta));
await writeFile('assets/data/heroHeights.json', JSON.stringify(heights));
await writeFile('assets/data/heroDetails.json', JSON.stringify(details));
const leagues = [...new Set(details.map((row) => row.league))].sort();
const nations = [...new Set(details.map((row) => row.nation))].sort();
const missingFace = details.filter((row) => !row.face?.pac && row.face?.pac !== 0).map((row) => row.id);
const missingAttrs = details.filter((row) => !row.attrs).map((row) => row.id);
console.log(JSON.stringify({ got: details.length, of: heroes.length, leagues, nations, missingFace, missingAttrs, gk: details.filter((r) => r.position === 'GK').map((r) => [r.id, r.faceNames, r.face]) }, null, 2));
