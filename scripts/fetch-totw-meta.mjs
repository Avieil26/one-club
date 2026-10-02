import { readFile, writeFile } from 'node:fs/promises';

const ATTRS = [
  'Acceleration',
  'SprintSpeed',
  'Positioning',
  'Finishing',
  'ShotPower',
  'LongShots',
  'Volleys',
  'Penalties',
  'Vision',
  'Crossing',
  'FkAccuracy',
  'ShortPassing',
  'LongPassing',
  'Curve',
  'Agility',
  'Balance',
  'Reactions',
  'BallControl',
  'Dribbling',
  'Composure',
  'Interceptions',
  'HeadingAccuracy',
  'DefensiveAwareness',
  'StandingTackle',
  'SlidingTackle',
  'Jumping',
  'Stamina',
  'Strength',
  'Aggression',
  'GkDiving',
  'GkHandling',
  'GkKicking',
  'GkReflexes',
  'GkPositioning',
];

const totw = JSON.parse(await readFile('assets/data/totw.json', 'utf8'));
const players = JSON.parse(await readFile('assets/data/players.json', 'utf8'));
const byId = new Map(players.map((player) => [player.id, player]));
const gold = JSON.parse(await readFile('assets/data/playerMeta.json', 'utf8'));

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

const jobs = totw.map((card) => {
  if (card.baseId) {
    const player = byId.get(card.baseId);
    return { key: card.baseId, name: player?.en, eaId: player?.eaId, rating: card.rating };
  }
  return { key: card.id, name: card.en, eaId: null, rating: card.rating };
});

const out = {};
let cursor = 0;

async function worker() {
  while (cursor < jobs.length) {
    const job = jobs[cursor++];
    const queries = [job.name];
    const last = job.name?.split(' ').at(-1);
    if (last && last !== job.name) queries.push(last);
    let hit = null;
    for (const query of queries) {
      const hits = await search(query);
      hit = hits.find((row) => {
        const rarity = row.rarityName ?? '';
        const special = /Team of the Week|TOTW/i.test(rarity);
        const sameBase = job.eaId == null || row.basePlayerEaId === job.eaId;
        return special && row.overall === job.rating && sameBase;
      });
      if (hit) break;
    }
    if (!hit) {
      console.log('miss', job.key, job.name);
      continue;
    }
    const html = await (await fetch(`https://www.fut.gg${hit.url}`, { headers: { 'user-agent': 'Mozilla/5.0', accept: 'text/html' } })).text();
    const attrs = parseAttrs(html);
    if (!attrs) {
      console.log('no-attrs', job.key, hit.url);
      continue;
    }
    out[job.key] = {
      foot: hit.foot === 'Left' ? 'L' : 'R',
      sm: hit.skillMoves,
      wf: hit.weakFoot,
      attrs,
    };
    const base = gold.players[job.key]?.attrs;
    const higher = base ? attrs.filter((value, index) => value > base[index]).length : 0;
    console.log('ok', job.key, hit.eaId, 'higher', higher, 'acc', attrs[0], 'baseAcc', base?.[0]);
  }
}

await Promise.all([worker(), worker(), worker(), worker()]);
await writeFile('assets/data/totwCardMeta.json', JSON.stringify(out));
console.log('saved', Object.keys(out).length);
