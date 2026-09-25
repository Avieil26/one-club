import { readFileSync, writeFileSync } from 'node:fs';

const BUILD = 'M97aJNMwRgARBSdoH5nPR';
const wanted = [
  ['kim', ['Kim Min Jae', 'Minjae Kim'], ['Kim Min-jae (footballer)', 'Kim Min-jae'], 'קים מין-ג׳ה'],
  ['pavlovic', ['Aleksandar Pavlović'], ['Aleksandar Pavlović (footballer)', 'Aleksandar Pavlovic'], 'אלכסנדר פבלוביץ׳'],
  ['estevao', ['Estêvão Willian', 'Estevao'], ['Estêvão Willian', 'Estevao Willian'], 'אשטבאו'],
  ['fofana', ['Wesley Fofana'], ['Wesley Fofana (footballer, born 2000)', 'Wesley Fofana'], 'וסלי פופאנה'],
  ['ugarte', ['Manuel Ugarte'], ['Manuel Ugarte (footballer)', 'Manuel Ugarte'], 'מנואל אוגרטה'],
  ['inigo', ['Íñigo Martínez', 'Inigo Martinez'], ['Íñigo Martínez', 'Inigo Martinez'], 'איניגו מרטינס'],
  ['christensen', ['Andreas Christensen'], ['Andreas Christensen'], 'אנדראס כריסטנסן'],
];
const clubs = {
  'FC Bayern München': 'C.bayern', 'FC Barcelona': 'C.barca', 'Paris SG': 'C.psg', Liverpool: 'C.liverpool',
  Spurs: 'C.spurs', Arsenal: 'C.arsenal', 'Beşiktaş': "'בשיקטאש'", 'Real Madrid': 'C.real', Chelsea: 'C.chelsea',
  'Man Utd': 'C.united', 'Manchester City': 'C.city', 'Newcastle Utd': 'C.newcastle', 'Al Nassr': "'אל-נסר'",
  'Milano FC': 'C.milan', 'Atletico Madrid': 'C.atletico', 'Atlético Madrid': 'C.atletico',
};
const leagues = {
  Bundesliga: 'L.bundes', 'LALIGA EA SPORTS': 'L.laliga', "Ligue 1 McDonald's": 'L.ligue1',
  'Premier League': 'L.prem', 'Trendyol Süper Lig': 'L.turkish', 'ROSHN Saudi League': 'L.saudi', 'Serie A Enilive': 'L.seriea',
};
const nations = {
  France: 'N.france', Brazil: 'N.brazil', Holland: 'N.netherlands', Spain: 'N.spain', Germany: 'N.germany',
  Belgium: 'N.belgium', Morocco: 'N.morocco', Portugal: 'N.portugal', England: 'N.england', Slovenia: 'N.slovenia',
  Cameroon: 'N.cameroon', Ghana: 'N.ghana', Italy: 'N.italy', Uruguay: 'N.uruguay', "Côte d'Ivoire": 'N.ivory',
  Poland: 'N.poland', Denmark: 'N.denmark', 'Korea Republic': 'N.korea', 'South Korea': 'N.korea', Korea: 'N.korea',
};
function norm(value) {
  return (value || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
}
function pick(items, query) {
  const target = norm(query);
  const parts = target.split(' ').filter((part) => part.length > 1);
  return items.find((player) => {
    const full = norm(`${player.firstName || ''} ${player.lastName || ''}`);
    const common = norm(player.commonName || '');
    if (full === target || common === target) return true;
    return parts.every((part) => full.includes(part) || common.includes(part));
  });
}
const headers = { 'User-Agent': 'fc27-israel-dev/1.0 (portrait lookup for a community app)' };
async function search(query) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  const response = await fetch(`https://www.ea.com/_next/data/${BUILD}/games/ea-sports-fc/ratings.json?search=${encodeURIComponent(query)}&page=1`, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'x-nextjs-data': '1' },
  });
  const text = await response.text();
  if (!text.startsWith('{')) return null;
  return pick(JSON.parse(text).pageProps?.ratingDetails?.items ?? [], query);
}
async function portrait(title) {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const params = new URLSearchParams({
    action: 'query', format: 'json', redirects: '1', prop: 'pageimages', piprop: 'thumbnail|original', pithumbsize: '500', titles: title,
  });
  const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { headers });
  const text = await response.text();
  if (!text.startsWith('{')) return '';
  const page = Object.values(JSON.parse(text).query?.pages || {})[0];
  const source = page?.thumbnail?.source || '';
  return source.includes('/wikipedia/commons/') ? source.split('?')[0] : '';
}
const rows = [];
for (const [id, queries, titles, he] of wanted) {
  let item = null;
  for (const query of queries) {
    item = await search(query);
    if (item) break;
  }
  if (!item) { console.log('MISS', id); continue; }
  let photo = '';
  for (const title of titles) {
    photo = await portrait(title);
    if (photo) break;
  }
  const check = photo ? await fetch(photo, { headers }) : null;
  if (check) await check.body?.cancel();
  const team = clubs[item.team.label];
  const league = leagues[item.leagueName];
  const nation = nations[item.nationality.label];
  console.log(id, item.overallRating, item.position.shortLabel, item.team.label, item.nationality.label, photo ? 'photo' : 'NO PHOTO', team && league && nation ? 'map' : 'UNMAPPED');
  if (!photo || !check?.ok || !team || !league || !nation) continue;
  const s = item.stats;
  rows.push({ id, he, en: titles[0].replace(/ \(.*\)$/, ''), pos: item.position.shortLabel, team, league, nation, photo, ovr: item.overallRating, pac: s.pac.value, sho: s.sho.value, pas: s.pas.value, dri: s.dri.value, def: s.def.value, phy: s.phy.value });
}
function insert(path, ending, lines) {
  if (!lines.length) return;
  const src = readFileSync(path, 'utf8');
  const idx = src.lastIndexOf(ending);
  writeFileSync(path, `${src.slice(0, idx)}${lines.join('\n')}\n${src.slice(idx)}`);
}
insert('lib/fcPlayers.ts', '];', rows.map((row) => `  p('${row.id}', '${row.he}', ${row.ovr}, '${row.pos}', ${row.nation}, ${row.league}, ${row.team}),`));
insert('lib/eaFace.ts', '};', rows.map((row) => `  ${row.id}: f(${row.ovr}, ${row.pac}, ${row.sho}, ${row.pas}, ${row.dri}, ${row.def}, ${row.phy}),`));
insert('lib/playerPhotos.ts', '};', rows.map((row) => `  ${row.id}: { en: ${JSON.stringify(row.en)}, photo: ${JSON.stringify(row.photo)} },`));
console.log('wrote', rows.length);
