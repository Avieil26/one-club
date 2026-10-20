// Read-only verification of the two SBCs released on 20 October after content time.
// Public pages are parsed as data; remote scripts are never executed.
const sources = [
 { id: 'sbc-fs-mls-pick-20261020', eaId: 64, slug: '27-64-mls-future-stars-player-pick', name: 'MLS Future Stars Player Pick', score: 13000, sourceUrl: 'https://www.futbin.com/27/squad-building-challenge/1000032', expirySourceUrl: 'https://www.fut.gg/sbc/players/27-64-mls-future-stars-player-pick/' },
 { id: 'sbc-upgrade-83x2-20261020', eaId: 71, slug: '27-71-2x-83-upgrade', name: '2x 83+ Upgrade', score: 5500, sourceUrl: 'https://www.futbin.com/27/squad-building-challenge/1000033', expirySourceUrl: 'https://www.fut.gg/sbc/upgrades/27-71-2x-83-upgrade/' },
];
async function page(url) {
 const response = await fetch(url, { headers: { 'User-Agent': 'one-club-catalogue-check/1.0', Accept: 'text/html' }, signal: AbortSignal.timeout(25000) });
 if (!response.ok) throw new Error(`Source request failed: ${response.status} ${url}`);
 return response.text();
}
const facts = [];
for (const source of sources) {
 const [futbin, gg] = await Promise.all([page(source.sourceUrl), page(source.expirySourceUrl)]);
 const plain = futbin.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
 const required = [...plain.matchAll(/Required\s+(?:Squad\s+)?Score:\s*([\d,]+)/gi)].map((match) => Number(match[1].replaceAll(',', '')));
 if (!required.includes(source.score)) throw new Error(`Score could not be verified for ${source.name}`);
 const marker = `eaId:${source.eaId},slug:"${source.slug}"`;
 const offset = gg.indexOf(marker);
 if (offset < 0) throw new Error(`Metadata missing for ${source.name}`);
 const metadata = gg.slice(offset, offset + 1800);
 const end = /endTime:"([^"]+)"/.exec(metadata)?.[1];
 const created = /createdAt:"([^"]+)"/.exec(metadata)?.[1];
 const ends = Date.parse(end ?? '');
 const made = Date.parse(created ?? '');
 if (!Number.isFinite(ends) || !Number.isFinite(made) || ends <= Date.now() || ends > Date.now() + 15 * 86400_000 || made > Date.now() + 300_000) throw new Error(`Invalid source dates for ${source.name}`);
 facts.push({ ...source, endsAt: new Date(Math.floor(ends / 1000) * 1000).toISOString(), createdAt: new Date(made).toISOString(), checkedAt: new Date().toISOString() });
}
console.log('SBC_SOURCE_FACTS=' + JSON.stringify(facts));
