import fs from 'node:fs';

const BUILD = process.env.EA_BUILD || 'k-zaXBBH8WXV4_dg4TYbd';
const headers = {
  'User-Agent': 'Mozilla/5.0 (compatible; fc27-israel/1.0)',
  'x-nextjs-data': '1',
  Accept: 'application/json',
};

const src = fs.readFileSync(new URL('./import-ea-roster.mjs', import.meta.url), 'utf8');

function grab(name) {
  const start = src.indexOf(`const ${name} = {`);
  if (start < 0) throw new Error(`missing ${name}`);
  const end = src.indexOf('\n};', start);
  const block = src.slice(start, end);
  const map = {};
  for (const match of block.matchAll(/(?:'([^']+)'|(\w+)):\s*'([^']*)'/g)) {
    map[match[1] || match[2]] = match[3];
  }
  return map;
}

const CLUB_HE = {
  ...grab('CLUB_HE'),
  'Man Utd': 'מנצ׳סטר יונייטד',
  Spurs: 'טוטנהאם',
  'Lombardia FC': 'אינטר',
  'Milano FC': 'מילאן',
  'SSC Napoli': 'נאפולי',
  'AS Roma': 'רומא',
  Everton: 'אברטון',
  'Athletic Club': 'אתלטיק בילבאו',
  'Real Sociedad': 'ריאל סוסיאדד',
  'London City': 'לונדון סיטי',
  'London City Lionesses': 'לונדון סיטי',
  'Orlando Pride': 'אורלנדו פרייד',
  'Gotham FC': 'גות׳אם',
  'Portland Thorns': 'פורטלנד ת׳ורנס',
  'Portland Thorns FC': 'פורטלנד ת׳ורנס',
  'Washington Spirit': 'וושינגטון ספיריט',
  'KC Current': 'קנזס סיטי',
  'Chicago Stars FC': 'שיקגו סטארס',
  'OL Lyonnes': 'אולימפיק ליון',
  'Bergamo Calcio': 'אטאלנטה',
  'Crystal Palace': 'קריסטל פאלאס',
  "Nott'm Forest": 'נוטינגהאם פורסט',
  'Nottingham Forest': 'נוטינגהאם פורסט',
};

const LEAGUE_HE = {
  ...grab('LEAGUE_HE'),
  "Ligue 1 McDonald's": 'ליג 1',
  'Liga F Moeve': 'ליגה F',
  GPFBL: 'בונדסליגה נשים',
  'Arkema PL': 'ליג 1 נשים',
};

const mapClub = (label) => CLUB_HE[label] || label || 'לא ידוע';
const mapLeague = (label) => LEAGUE_HE[label] || label || 'לא ידוע';

function norm(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(page, attempt = 0) {
  const url = `https://www.ea.com/_next/data/${BUILD}/games/ea-sports-fc/ratings.json?page=${page}&sortBy=overallRating&sortDir=desc`;
  const response = await fetch(url, { headers });
  if ((response.status === 429 || response.status >= 500) && attempt < 5) {
    await sleep(800 * (attempt + 1));
    return fetchPage(page, attempt + 1);
  }
  if (!response.ok) throw new Error(`EA ${response.status} page=${page}`);
  const data = await response.json();
  return {
    items: data.pageProps?.ratingDetails?.items ?? [],
    total: data.pageProps?.ratingDetails?.totalItems ?? 0,
  };
}

const players = JSON.parse(fs.readFileSync(new URL('../assets/data/players.json', import.meta.url), 'utf8'));
const byEa = new Map();
for (const player of players) {
  if (player.eaId) byEa.set(player.eaId, player);
}

const first = await fetchPage(1);
const pages = Math.ceil(first.total / 100);
const byName = new Map();
let changed = 0;
const notable = [];

function move(player, item) {
  const club = mapClub(item.team?.label);
  const league = mapLeague(item.leagueName);
  if (!club || player.club === club) return;
  if ((player.rating || 0) >= 80) notable.push(`${player.en} ${player.rating}: ${player.club} -> ${club} (${league})`);
  player.club = club;
  player.league = league;
  changed++;
}

function remember(item) {
  const club = mapClub(item.team?.label);
  const league = mapLeague(item.leagueName);
  const names = [item.commonName, `${item.firstName || ''} ${item.lastName || ''}`].map(norm).filter(Boolean);
  for (const name of names) {
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push({ club, league, rating: item.overallRating });
  }
}

async function apply(items) {
  for (const item of items) {
    remember(item);
    const player = byEa.get(item.id);
    if (player) move(player, item);
  }
}

await apply(first.items);
for (let page = 2; page <= pages; page++) {
  const { items } = await fetchPage(page);
  await apply(items);
  if (page % 40 === 0) console.log('page', page, 'changed', changed);
  await sleep(80);
}

for (const player of players) {
  if (player.eaId) continue;
  const options = byName.get(norm(player.en));
  if (!options?.length) continue;
  const hit = [...options].sort((a, b) => Math.abs(a.rating - player.rating) - Math.abs(b.rating - player.rating))[0];
  if (!hit || player.club === hit.club) continue;
  if ((player.rating || 0) >= 80) notable.push(`${player.en} ${player.rating} [ללא מזהה]: ${player.club} -> ${hit.club} (${hit.league})`);
  player.club = hit.club;
  player.league = hit.league;
  changed++;
}

fs.writeFileSync(new URL('../assets/data/players.json', import.meta.url), JSON.stringify(players));
console.log('changed', changed);
console.log(notable.join('\n'));
