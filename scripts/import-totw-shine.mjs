import { readFile, writeFile } from 'node:fs/promises';

const headers = { 'user-agent': 'Mozilla/5.0', accept: 'application/json', referer: 'https://www.fut.gg/' };
const manifest = await (await fetch('https://r2.fut.gg/27/manifest.json', { headers })).json();
const file = (name) => `https://r2.fut.gg/27/${name}.v${manifest._version}.${manifest[name]}.json`;
const [index, ps, pc] = await Promise.all([
  fetch(file('player-prices-index'), { headers }).then((res) => res.json()),
  fetch(file('player-prices-ps5'), { headers }).then((res) => res.json()),
  fetch(file('player-prices-pc'), { headers }).then((res) => res.json()),
]);
const byEa = new Map();
let current = index.id0;
function take(idx) {
  if (ps.s[idx] !== 0) return;
  const consolePrice = ps.p[idx] || 0;
  const pcPrice = pc.p[idx] || 0;
  if (consolePrice <= 0 && pcPrice <= 0) return;
  byEa.set(current, [consolePrice, pcPrice]);
}
take(0);
for (let i = 0; i < index.d.length; i++) {
  current += index.d[i];
  take(i + 1);
}

const first = await (await fetch('https://www.fut.gg/api/gg-club/community/holograph/?finish=all', { headers })).json();
const pages = first.data.cataloguePages;
const shineByStandard = new Map();
for (let page = 1; page <= pages; page++) {
  const json = page === 1 ? first : await (await fetch(`https://www.fut.gg/api/gg-club/community/holograph/?finish=all&page=${page}`, { headers })).json();
  for (const row of json.data.catalogue ?? []) {
    const prev = shineByStandard.get(row.standardItemEaId);
    if (prev?.finish === 'pristine' && row.finish !== 'pristine') continue;
    shineByStandard.set(row.standardItemEaId, {
      finish: row.finish,
      eaId: row.eaId,
      catalogue: row.price,
      name: row.commonName,
    });
  }
}

const priceIds = JSON.parse(await readFile('assets/data/priceEaIds.json', 'utf8'));
const prices = JSON.parse(await readFile('assets/data/marketPrices.json', 'utf8'));
const shine = {};
for (const [key, eaId] of Object.entries(priceIds)) {
  if (!key.endsWith('--totw')) continue;
  const live = byEa.get(eaId);
  if (live) prices[key] = live;
  const special = shineByStandard.get(eaId);
  if (!special) {
    console.log('no shine', key);
    continue;
  }
  const quote = byEa.get(special.eaId) ?? (special.catalogue > 0 ? [special.catalogue, 0] : null);
  if (!quote) {
    console.log('no shine price', key, special.eaId);
    continue;
  }
  const shineKey = `${key}-shine`;
  prices[shineKey] = quote;
  priceIds[shineKey] = special.eaId;
  shine[key.slice(0, -6)] = special.finish;
  console.log(key, 'regular', prices[key], special.finish, quote);
}

await writeFile('assets/data/marketPrices.json', JSON.stringify(prices));
await writeFile('assets/data/priceEaIds.json', JSON.stringify(priceIds));
await writeFile('assets/data/totwShine.json', JSON.stringify(shine));
console.log('shine cards', Object.keys(shine).length);
