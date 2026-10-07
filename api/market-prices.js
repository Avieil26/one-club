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

    const byEa = new Map();
    let current = index.id0;
    const ids = [current];
    for (const delta of index.d) {
      current += delta;
      ids.push(current);
    }
    for (let i = 0; i < ids.length; i++) {
      if (ps.s[i] !== 0) continue;
      const consolePrice = ps.p[i] || 0;
      const pcPrice = pc.p[i] || 0;
      if (consolePrice <= 0 && pcPrice <= 0) continue;
      byEa.set(ids[i], [consolePrice, pcPrice]);
    }

    const prices = {};
    for (const [id, eaId] of Object.entries({ ...eaByCard, ...totw4EaByCard })) {
      const row = byEa.get(eaId);
      if (row) prices[id] = row;
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
