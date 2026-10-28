import totw7Cards from '../assets/data/totw7Cards20261028.json';
import recentCards from '../assets/data/recentCards20261024.json';
import eaByCard from '../assets/data/priceEaIds.json';
import totw4EaByCard from '../assets/data/totw4PriceEaIds.json';

export const config = { runtime: 'edge' };

const headers = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  accept: 'application/json',
  referer: 'https://www.fut.gg/',
};

async function load(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

export default async function handler() {
  try {
    const manifest = await load('https://r2.fut.gg/27/manifest.json');
    const version = manifest._version;
    const file = (name) => `https://r2.fut.gg/27/${name}.v${version}.${manifest[name]}.json`;
    const [index, ps, pc] = await Promise.all([
      load(file('player-prices-index')),
      load(file('player-prices-ps5')),
      load(file('player-prices-pc')),
    ]);

    const decodeMarket = data => {
      let id = data.id0;
      const ids = [id, ...data.d.map(delta => id += delta)];
      return new Map(ids.map((eaId, i) => [eaId, data.s[i] === 0 ? data.p[i] || 0 : 0]));
    };
    const consolePrices = decodeMarket(ps);
    const pcPrices = decodeMarket(pc);
    const byEa = new Map();
    let id = index.id0;
    const ids = [id, ...index.d.map(delta => id += delta)];
    for (const eaId of ids) {
      const row = [consolePrices.get(eaId) || 0, pcPrices.get(eaId) || 0];
      if (row.some(amount => amount > 0)) byEa.set(eaId, row);
    }
    const recentIds = Object.fromEntries([...recentCards, ...totw7Cards].filter(c => c.price.kind === 'market').map(c => [c.id, c.itemId]));

    const prices = {};
    for (const [id, eaId] of Object.entries({ ...eaByCard, ...totw4EaByCard, ...recentIds })) {
      const row = byEa.get(eaId);
      if (row) prices[id] = row;
      else if (id.startsWith('recent-')) prices[id] = [0, 0];
    }

    return new Response(JSON.stringify(prices), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'failed' }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
}
