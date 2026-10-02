/**
 * In-game heights are blank on EA's ratings feed.
 * fut.gg publishes the same EA id with a schema.org height in centimetres.
 */
import fs from 'node:fs';

const roster = JSON.parse(fs.readFileSync(new URL('../assets/data/players.json', import.meta.url), 'utf8'));
const outUrl = new URL('../assets/data/playerHeight.json', import.meta.url);
const saved = fs.existsSync(outUrl) ? JSON.parse(fs.readFileSync(outUrl, 'utf8')) : {};
const heights = saved.players && typeof saved.players === 'object' ? saved.players : {};
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  Accept: 'text/html',
};

const pending = roster.filter((player) => player.eaId && heights[player.id] == null);
let cursor = 0;
let ok = 0;
let miss = 0;

async function one(player) {
  const url = `https://www.fut.gg/players/${player.eaId}/`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(url, { headers, redirect: 'follow' });
    if (response.status === 429 || response.status >= 500) {
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
      continue;
    }
    const text = await response.text();
    const match = text.match(/"height":"(\d{3})\s*cm"/);
    if (match) {
      heights[player.id] = Number(match[1]);
      ok += 1;
    } else {
      miss += 1;
    }
    return;
  }
  miss += 1;
}

async function worker() {
  while (cursor < pending.length) {
    const player = pending[cursor];
    cursor += 1;
    await one(player);
    if ((ok + miss) % 40 === 0) {
      fs.writeFileSync(outUrl, JSON.stringify({ players: heights }));
      console.log(`saved ok=${ok} miss=${miss} left=${pending.length - ok - miss}`);
    }
  }
}

await Promise.all(Array.from({ length: 6 }, () => worker()));
fs.writeFileSync(outUrl, JSON.stringify({ players: heights }));
console.log(JSON.stringify({
  ok,
  miss,
  total: Object.keys(heights).length,
  haaland: heights.haaland,
  dembele: heights.dembele,
  mbappe: heights.mbappe,
  pedri: heights.pedri,
}));
