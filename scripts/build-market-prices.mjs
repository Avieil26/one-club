import fs from 'node:fs';

const root = new URL('..', import.meta.url);
const temp = process.env.TEMP;

function load(name) {
  return JSON.parse(fs.readFileSync(`${temp}/${name}`, 'utf8'));
}

function decode(blob) {
  const ids = [blob.id0];
  let current = blob.id0;
  for (const delta of blob.d) {
    current += delta;
    ids.push(current);
  }
  return ids;
}

const index = load('prices-index.json');
const ps = load('prices-ps5.json');
const pc = load('prices-pc.json');
const ids = decode(index);
const byEa = new Map();
for (let i = 0; i < ids.length; i++) {
  if (ps.s[i] !== 0) continue;
  const consolePrice = ps.p[i] || 0;
  const pcPrice = pc.p[i] || 0;
  if (consolePrice <= 0 && pcPrice <= 0) continue;
  byEa.set(ids[i], [consolePrice, pcPrice]);
}

const prices = {};
const eaIds = {};
function put(id, eaId) {
  const row = byEa.get(eaId);
  if (!row) return;
  prices[id] = row;
  eaIds[id] = eaId;
}

const players = JSON.parse(fs.readFileSync(new URL('../assets/data/players.json', import.meta.url), 'utf8'));
const byId = new Map(players.map((player) => [player.id, player]));
for (const player of players) {
  if (player.eaId) put(player.id, player.eaId);
}

const heroes = JSON.parse(fs.readFileSync(new URL('../assets/data/heroDetails.json', import.meta.url), 'utf8'));
for (const hero of heroes) put(hero.id, hero.eaId);

const destined = JSON.parse(fs.readFileSync(new URL('../assets/data/destinedEditions.json', import.meta.url), 'utf8'));
const totw = JSON.parse(fs.readFileSync(new URL('../assets/data/totw.json', import.meta.url), 'utf8'));

async function search(name) {
  const url = `https://www.fut.gg/api/fut/players/v2/search/?name=${encodeURIComponent(name)}&game=27`;
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0', accept: 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${name}`);
  const json = await res.json();
  return json.data ?? [];
}

const jobs = [];
for (const [id, edition] of Object.entries(destined)) {
  const player = byId.get(id);
  if (!player?.en) continue;
  jobs.push({ kind: 'destined', id, name: player.en, rating: edition.rating, eaId: player.eaId });
}
for (const card of totw) {
  if (!card.baseId) continue;
  const player = byId.get(card.baseId);
  if (!player?.en) continue;
  jobs.push({ kind: 'totw', id: card.baseId, name: player.en, rating: card.rating, eaId: player.eaId });
}

let cursor = 0;
function pick(hits, job) {
  const specials = hits.filter((row) => {
    const rarity = row.rarityName ?? '';
    const special = job.kind === 'destined' ? rarity.includes('Destined') : /Team of the Week|TOTW/i.test(rarity);
    return special && row.basePlayerEaId === job.eaId;
  });
  return specials.find((row) => row.overall === job.rating) ?? (specials.length === 1 ? specials[0] : undefined);
}

async function worker() {
  while (cursor < jobs.length) {
    const job = jobs[cursor++];
    let hits = await search(job.name);
    let hit = pick(hits, job);
    if (!hit) {
      const last = job.name.split(' ').at(-1);
      if (last && last !== job.name) hit = pick(await search(last), job);
    }
    if (!hit) {
      console.log('miss', job.kind, job.id, job.name);
      continue;
    }
    const key = job.kind === 'destined' ? `${job.id}--destined` : `${job.id}--totw`;
    put(key, hit.eaId);
    console.log(key, hit.eaId, hit.rarityName, prices[key] ?? 'no-market');
  }
}
await Promise.all([worker(), worker(), worker(), worker()]);

const ordered = Object.fromEntries(Object.entries(prices).sort(([a], [b]) => a.localeCompare(b)));
const orderedIds = Object.fromEntries(Object.entries(eaIds).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(new URL('../assets/data/marketPrices.json', import.meta.url), JSON.stringify(ordered));
fs.writeFileSync(new URL('../assets/data/priceEaIds.json', import.meta.url), JSON.stringify(orderedIds));
console.log('cards', Object.keys(ordered).length);
console.log('mbappe', ordered.mbappe, ordered['mbappe--destined']);
