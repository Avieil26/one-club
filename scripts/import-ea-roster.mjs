/**
 * Import EA FC 27 ratings (OVR >= 75) into assets/data/players.json
 * Preserves existing player ids / Hebrew names when name-matched.
 * Usage: node scripts/import-ea-roster.mjs
 */
import fs from 'node:fs';

const BUILD = process.env.EA_BUILD || 'k-zaXBBH8WXV4_dg4TYbd';
/** Gold (75+) plus high silver to reach 3000+ cards with icons. */
const MIN_OVR = 73;
const PAGE_SIZE = 100;
const DELAY_MS = 120;
const headers = {
  'User-Agent': 'Mozilla/5.0 (compatible; fc27-israel/1.0)',
  'x-nextjs-data': '1',
  Accept: 'application/json',
};

const NATION_HE = {
  Scotland: 'סקוטלנד',
  Portugal: 'פורטוגל',
  France: 'צרפת',
  Spain: 'ספרד',
  Brazil: 'ברזיל',
  England: 'אנגליה',
  Argentina: 'ארגנטינה',
  Germany: 'גרמניה',
  Netherlands: 'הולנד',
  Holland: 'הולנד',
  Norway: 'נורווגיה',
  Italy: 'איטליה',
  Belgium: 'בלגיה',
  Croatia: 'קרואטיה',
  Morocco: 'מרוקו',
  Japan: 'יפן',
  'United States': 'ארה״ב',
  USA: 'ארה״ב',
  Nigeria: 'ניגריה',
  Senegal: 'סנגל',
  Poland: 'פולין',
  Uruguay: 'אורוגוואי',
  Georgia: 'גאורגיה',
  Sweden: 'שוודיה',
  Denmark: 'דנמרק',
  Egypt: 'מצרים',
  'Korea Republic': 'קוריאה',
  'South Korea': 'קוריאה',
  Colombia: 'קולומביה',
  Turkey: 'טורקיה',
  Türkiye: 'טורקיה',
  Switzerland: 'שווייץ',
  Hungary: 'הונגריה',
  Ukraine: 'אוקראינה',
  Canada: 'קנדה',
  Slovenia: 'סלובניה',
  Gabon: 'גבון',
  'Czech Republic': 'צ׳כיה',
  Czechia: 'צ׳כיה',
  Serbia: 'סרביה',
  Algeria: 'אלג׳יריה',
  Austria: 'אוסטריה',
  Greece: 'יוון',
  Mexico: 'מקסיקו',
  "Côte d'Ivoire": 'חוף השנהב',
  "Cote d'Ivoire": 'חוף השנהב',
  Cameroon: 'קמרון',
  Ghana: 'גאנה',
  Mali: 'מאלי',
  Wales: 'ויילס',
  'Republic of Ireland': 'אירלנד',
  Ireland: 'אירלנד',
  Finland: 'פינלנד',
  Australia: 'אוסטרליה',
  Zambia: 'זמביה',
  Chile: 'צ׳ילה',
  Ecuador: 'אקוודור',
  Paraguay: 'פרגוואי',
  Peru: 'פרו',
  Venezuela: 'ונצואלה',
  Romania: 'רומניה',
  Slovakia: 'סלובקיה',
  Bosnia: 'בוסניה',
  'Bosnia and Herzegovina': 'בוסניה',
  Albania: 'אלבניה',
  Tunisia: 'תוניסיה',
  'Saudi Arabia': 'ערב הסעודית',
  Iran: 'איראן',
  Iraq: 'עיראק',
  'Costa Rica': 'קוסטה ריקה',
  Jamaica: 'ג׳מייקה',
  'North Macedonia': 'מקדוניה',
  Montenegro: 'מונטנגרו',
  Iceland: 'איסלנד',
  'Northern Ireland': 'צפון אירלנד',
  'New Zealand': 'ניו זילנד',
  China: 'סין',
  'China PR': 'סין',
};

const LEAGUE_HE = {
  'Premier League': 'פרמייר ליג',
  'English Premier League': 'פרמייר ליג',
  'LALIGA EA SPORTS': 'לה ליגה',
  'LaLiga EA SPORTS': 'לה ליגה',
  LALIGA: 'לה ליגה',
  'Ligue 1 McDonald\'s': 'ליג 1',
  'Ligue 1 Uber Eats': 'ליג 1',
  'Ligue 1': 'ליג 1',
  'Liga Portugal': 'ליגה פורטוגל',
  'Liga Portugal Betclic': 'ליגה פורטוגל',
  'Scottish Premiership': 'ליגת העל הסקוטית',
  'Serie A Enilive': 'סרייה א׳',
  'Serie A TIM': 'סרייה א׳',
  'Serie A': 'סרייה א׳',
  Bundesliga: 'בונדסליגה',
  Eredivisie: 'ארדיוויזי',
  MLS: 'MLS',
  'Major League Soccer': 'MLS',
  'ROSHN Saudi League': 'ליגת העל הסעודית',
  'Saudi Pro League': 'ליגת העל הסעודית',
  'Trendyol Süper Lig': 'סופר ליג',
  'Süper Lig': 'סופר ליג',
  'Jupiler Pro League': 'ליגת העל הבלגית',
  'Belgian Pro League': 'ליגת העל הבלגית',
  Championship: 'הצ׳מפיונשיפ',
  'EFL Championship': 'הצ׳מפיונשיפ',
  'Liga Profesional de Fútbol': 'ליגת העל הארגנטינאית',
  'Barclays WSL': 'WSL',
  WSL: 'WSL',
  'Liga F': 'ליגה F',
  NWSL: 'NWSL',
  'Arkema Première Ligue': 'ליג 1 נשים',
  'Google Pixel Frauen-Bundesliga': 'בונדסליגה נשים',
  'Frauen-Bundesliga': 'בונדסליגה נשים',
};

const CLUB_HE = {
  Celtic: 'סלטיק',
  Rangers: 'ריינג׳רס',
  Porto: 'פורטו',
  'FC Porto': 'פורטו',
  Benfica: 'בנפיקה',
  'Sporting CP': 'ספורטינג',
  'Paris Saint Germain': 'פריז סן ז׳רמן',
  'Paris SG': 'פריז סן ז׳רמן',
  'Olympique de Marseille': 'אולימפיק מרסיי',
  'Olympique Marseille': 'אולימפיק מרסיי',
  'Real Madrid': 'ריאל מדריד',
  'Atlético de Madrid': 'אתלטיקו מדריד',
  'Atletico de Madrid': 'אתלטיקו מדריד',
  'FC Barcelona': 'ברצלונה',
  Barcelona: 'ברצלונה',
  'Manchester City': 'מנצ׳סטר סיטי',
  Liverpool: 'ליברפול',
  Arsenal: 'ארסנל',
  Chelsea: 'צ׳לסי',
  'Manchester United': 'מנצ׳סטר יונייטד',
  Tottenham: 'טוטנהאם',
  'Tottenham Hotspur': 'טוטנהאם',
  'Newcastle United': 'ניוקאסל',
  'FC Bayern München': 'באיירן מינכן',
  'Bayern Munich': 'באיירן מינכן',
  'Bayer 04 Leverkusen': 'באייר לברקוזן',
  'Borussia Dortmund': 'בורוסיה דורטמונד',
  Inter: 'אינטר',
  'Inter Milan': 'אינטר',
  Milan: 'מילאן',
  'AC Milan': 'מילאן',
  Juventus: 'יובנטוס',
  Napoli: 'נאפולי',
  Roma: 'רומא',
  Ajax: 'אייאקס',
  PSV: 'פ.ס.וו',
  Galatasaray: 'גלאטסראיי',
  'Club Brugge': 'קלאב ברוז׳',
  'Inter Miami': 'אינטר מיאמי',
  'Inter Miami CF': 'אינטר מיאמי',
  'Al Hilal': 'אל-הילאל',
  Brighton: 'ברייטון',
  'Brighton & Hove Albion': 'ברייטון',
  'Aston Villa': 'אסטון וילה',
  Trabzonspor: 'טרבזונספור',
  LAFC: 'לוס אנג׳לס',
  'Los Angeles FC': 'לוס אנג׳לס',
  'Los Angeles Galaxy': 'לוס אנג׳לס גלאקסי',
  'Al Nassr': 'אל-נסר',
  'Al Ittihad': 'אל-איתיחאד',
  'Al Ahli': 'אל-אהלי',
  'Al Qadsiah': 'אל-קאדסיה',
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function norm(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function displayName(item) {
  return (item.commonName || `${item.firstName || ''} ${item.lastName || ''}`).trim();
}

function slugId(item) {
  const base = norm(displayName(item)).replace(/\s+/g, '-') || `player-${item.id}`;
  return `ea-${item.id}-${base}`.slice(0, 64);
}

function mapNation(label) {
  return NATION_HE[label] || label || 'לא ידוע';
}

function mapLeague(label) {
  return LEAGUE_HE[label] || label || 'לא ידוע';
}

function mapClub(label) {
  return CLUB_HE[label] || label || 'לא ידוע';
}

function faceOf(item) {
  const s = item.stats || {};
  const num = (key) => Number(s[key]?.value ?? 0);
  return {
    ovr: item.overallRating,
    pac: num('pac'),
    sho: num('sho'),
    pas: num('pas'),
    dri: num('dri'),
    def: num('def'),
    phy: num('phy'),
  };
}

function playstylesOf(item) {
  const abilities = item.playerAbilities || [];
  return abilities.slice(0, 8).map((ability) => ({
    name: ability.label || ability.name || 'PlayStyle',
    plus: Boolean(ability.isPlus || ability.plus || /plus/i.test(ability.id || '')),
  }));
}

function positionsOf(item) {
  const primary = item.position?.shortLabel;
  const alts = (item.alternatePositions || []).map((p) => p.shortLabel || p.label).filter(Boolean);
  const all = [primary, ...alts].filter(Boolean);
  return [...new Set(all)];
}

function loadExisting() {
  const playersSrc = fs.readFileSync(new URL('../lib/fcPlayers.ts', import.meta.url), 'utf8');
  const mediaSrc = fs.readFileSync(new URL('../lib/playerMedia.ts', import.meta.url), 'utf8');
  const photosSrc = fs.readFileSync(new URL('../lib/playerPhotos.ts', import.meta.url), 'utf8');
  const iconSrc = fs.readFileSync(new URL('../lib/iconPlayers.ts', import.meta.url), 'utf8');

  const regular = [...playersSrc.matchAll(/p\('([^']+)', '([^']+)', (\d+), '([^']+)', ([^,]+), ([^,]+), ([^)]+)\)/g)].map((m) => ({
    id: m[1],
    name: m[2],
    rating: Number(m[3]),
    position: m[4],
    nationExpr: m[5].trim(),
    leagueExpr: m[6].trim(),
    clubExpr: m[7].trim(),
  }));

  // Resolve N.x / L.x / C.x / string literals by evaluating against exported maps via regex on source
  const nationMap = Object.fromEntries([...playersSrc.matchAll(/^\s+(\w+):\s*'([^']+)'/gm)].filter(() => true));
  // Better: parse N, L, C blocks
  function parseConst(name) {
    const block = playersSrc.match(new RegExp(`export const ${name} = \\{([\\s\\S]*?)\\} as const;`));
    if (!block) return {};
    return Object.fromEntries([...block[1].matchAll(/(\w+):\s*'([^']*)'/g)].map((m) => [m[1], m[2]]));
  }
  const N = parseConst('N');
  const L = parseConst('L');
  const C = parseConst('C');

  function resolve(expr, maps) {
    const str = expr.match(/^'([^']*)'$/);
    if (str) return str[1];
    const ref = expr.match(/^([NLC])\.(\w+)$/);
    if (ref) return maps[ref[1]][ref[2]] || expr;
    return expr.replace(/^'|'$/g, '');
  }

  const en = {};
  for (const src of [mediaSrc, photosSrc, iconSrc]) {
    for (const match of src.matchAll(/^\s+'?([a-z0-9\-]+)'?:\s*\{[^}]*en:\s*"([^"]+)"/gm)) en[match[1]] = match[2];
    for (const match of src.matchAll(/^\s+'?([a-z0-9\-]+)'?:\s*\{[^}]*en:\s*'([^']+)'/gm)) en[match[1]] = match[2];
  }

  const players = regular.map((row) => ({
    id: row.id,
    name: row.name,
    rating: row.rating,
    position: row.position,
    nation: resolve(row.nationExpr, { N, L, C }),
    league: resolve(row.leagueExpr, { N, L, C }),
    club: resolve(row.clubExpr, { N, L, C }),
    en: en[row.id] || row.id,
  }));

  const iconIds = new Set([...iconSrc.matchAll(/id: '([^']+)'/g)].map((m) => m[1]));

  return { players, en, iconIds };
}

function scoreMatch(item, candidateEn) {
  const target = norm(candidateEn);
  if (!target) return 0;
  const full = norm(`${item.firstName || ''} ${item.lastName || ''}`);
  const common = norm(item.commonName || '');
  const last = norm(item.lastName || '');
  if (common && common === target) return 100;
  if (full === target) return 95;
  if (common && (common.includes(target) || target.includes(common)) && Math.min(common.length, target.length) >= 4) return 85;
  if (last === target && target.length > 3) return 70;
  const parts = target.split(' ');
  if (parts.length > 1 && last === parts.at(-1) && (full.includes(parts[0]) || common.includes(parts[0]))) return 90;
  return 0;
}

async function fetchPage(page, attempt = 0) {
  const url = `https://www.ea.com/_next/data/${BUILD}/games/ea-sports-fc/ratings.json?page=${page}&sortBy=overallRating&sortDir=desc`;
  const response = await fetch(url, { headers });
  if (response.status === 404) throw new Error(`EA build hash expired (${BUILD}). Set EA_BUILD env to the new _next/data hash.`);
  if ((response.status === 429 || response.status >= 500) && attempt < 5) {
    await sleep(1000 * (attempt + 1));
    return fetchPage(page, attempt + 1);
  }
  if (!response.ok) throw new Error(`EA ${response.status} page=${page}`);
  const data = await response.json();
  return {
    items: data.pageProps?.ratingDetails?.items ?? [],
    total: data.pageProps?.ratingDetails?.totalItems ?? 0,
  };
}

function playerFromItem(item) {
  const en = displayName(item);
  const photo = (item.avatarUrl || '').split('?')[0] || undefined;
  const positions = positionsOf(item);
  const playstyles = playstylesOf(item);
  return {
    id: slugId(item),
    eaId: item.id,
    name: en,
    en,
    rating: item.overallRating,
    position: item.position?.shortLabel || 'CM',
    nation: mapNation(item.nationality?.label),
    league: mapLeague(item.leagueName),
    club: mapClub(item.team?.label),
    ...(photo ? { photo } : {}),
    face: faceOf(item),
    ...(positions.length ? { positions } : {}),
    ...(playstyles.length ? { playstyles } : {}),
    ...(item.gender?.label ? { gender: item.gender.label } : {}),
    matched: false,
  };
}

/** Add every EA player whose id is not already in players.json. No rating floor. */
async function importMissing() {
  const file = new URL('../assets/data/players.json', import.meta.url);
  const roster = JSON.parse(fs.readFileSync(file, 'utf8'));
  const have = new Set(roster.map((player) => player.eaId).filter(Boolean));
  const added = [];
  let page = 1;
  let total = null;

  while (true) {
    const { items, total: catalog } = await fetchPage(page);
    if (total === null) {
      total = catalog;
      console.log(`EA total catalog=${total}, already have=${have.size}`);
    }
    if (!items.length) break;
    for (const item of items) {
      if (!item.id || have.has(item.id)) continue;
      added.push(playerFromItem(item));
      have.add(item.id);
    }
    console.log(`page ${page}: new ${added.length}, lastOvr=${items.at(-1)?.overallRating}`);
    if (items.length < PAGE_SIZE) break;
    if (page % 40 === 0) {
      const checkpoint = [...roster, ...added].sort((a, b) => b.rating - a.rating || a.en.localeCompare(b.en));
      fs.writeFileSync(file, JSON.stringify(checkpoint));
      console.log(`checkpoint ${checkpoint.length}`);
    }
    page += 1;
    await sleep(DELAY_MS);
  }

  const next = [...roster, ...added].sort((a, b) => b.rating - a.rating || a.en.localeCompare(b.en));
  fs.writeFileSync(file, JSON.stringify(next));
  console.log(JSON.stringify({
    before: roster.length,
    added: added.length,
    after: next.length,
    eaTotal: total,
    highestNew: added[0]?.rating,
    lowestNew: added.at(-1)?.rating,
  }));
}

async function appendPlayers(count) {
  const file = new URL('../assets/data/players.json', import.meta.url);
  const roster = JSON.parse(fs.readFileSync(file, 'utf8'));
  const have = new Set(roster.map((player) => player.eaId).filter(Boolean));
  const added = [];
  let page = 1;

  while (added.length < count) {
    const { items } = await fetchPage(page);
    if (!items.length) break;
    for (const item of items) {
      if (added.length >= count) break;
      if (!item.id || have.has(item.id)) continue;
      const en = displayName(item);
      const photo = (item.avatarUrl || '').split('?')[0] || undefined;
      const positions = positionsOf(item);
      const playstyles = playstylesOf(item);
      added.push({
        id: slugId(item),
        eaId: item.id,
        name: en,
        en,
        rating: item.overallRating,
        position: item.position?.shortLabel || 'CM',
        nation: mapNation(item.nationality?.label),
        league: mapLeague(item.leagueName),
        club: mapClub(item.team?.label),
        ...(photo ? { photo } : {}),
        face: faceOf(item),
        ...(positions.length ? { positions } : {}),
        ...(playstyles.length ? { playstyles } : {}),
        ...(item.gender?.label ? { gender: item.gender.label } : {}),
        matched: false,
      });
      have.add(item.id);
    }
    console.log(`page ${page}: added ${added.length}/${count}, lastOvr=${items.at(-1)?.overallRating}`);
    if (items.length < PAGE_SIZE) break;
    page += 1;
    await sleep(DELAY_MS);
  }

  if (added.length < count) throw new Error(`EA list ended after ${added.length} new players`);
  fs.writeFileSync(file, JSON.stringify([...roster, ...added]));
  console.log(JSON.stringify({
    before: roster.length,
    added: added.length,
    after: roster.length + added.length,
    highestNew: added[0]?.rating,
    lowestNew: added.at(-1)?.rating,
  }));
}

async function main() {
  if (process.env.IMPORT_MISSING === '1') {
    await importMissing();
    return;
  }
  const append = Number(process.env.APPEND_COUNT || 0);
  if (append > 0) {
    await appendPlayers(append);
    return;
  }
  const { players: existing, iconIds } = loadExisting();
  const byEn = existing.map((p) => ({ ...p, key: norm(p.en) }));

  console.log(`existing regular=${existing.length} icons=${iconIds.size}`);

  const imported = [];
  const usedExisting = new Set();
  let page = 1;
  let total = null;
  let stopped = false;

  while (!stopped) {
    const { items, total: t } = await fetchPage(page);
    if (total === null) {
      total = t;
      console.log(`EA total catalog=${total}`);
    }
    if (!items.length) break;

    for (const item of items) {
      const ovr = item.overallRating;
      if (ovr < MIN_OVR) {
        stopped = true;
        break;
      }

      let best = null;
      let bestScore = 0;
      for (const cand of byEn) {
        if (usedExisting.has(cand.id)) continue;
        const value = scoreMatch(item, cand.en);
        if (value > bestScore) {
          bestScore = value;
          best = cand;
        }
      }

      const matched = best && bestScore >= 85 ? best : null;
      if (matched) usedExisting.add(matched.id);

      const en = displayName(item);
      const photo = (item.avatarUrl || '').split('?')[0] || undefined;
      const positions = positionsOf(item);
      const playstyles = playstylesOf(item);

      imported.push({
        id: matched?.id || slugId(item),
        eaId: item.id,
        name: matched?.name || en,
        en,
        rating: ovr,
        position: item.position?.shortLabel || matched?.position || 'CM',
        nation: matched?.nation || mapNation(item.nationality?.label),
        league: matched?.league || mapLeague(item.leagueName),
        club: matched?.club || mapClub(item.team?.label),
        photo,
        face: faceOf(item),
        positions: positions.length ? positions : undefined,
        playstyles: playstyles.length ? playstyles : undefined,
        gender: item.gender?.label || undefined,
        matched: Boolean(matched),
        matchScore: matched ? bestScore : undefined,
      });
    }

    const lastOvr = items[items.length - 1]?.overallRating ?? 0;
    console.log(`page ${page}: got ${items.length}, imported ${imported.length}, lastOvr=${lastOvr}`);
    if (stopped || items.length < PAGE_SIZE) break;
    page += 1;
    await sleep(DELAY_MS);
  }

  // Include existing players below 75 or unmatched so we don't drop Hebrew roster cards
  const importedIds = new Set(imported.map((p) => p.id));
  const keptBelow = [];
  for (const old of existing) {
    if (importedIds.has(old.id)) continue;
    keptBelow.push({
      id: old.id,
      name: old.name,
      en: old.en,
      rating: old.rating,
      position: old.position,
      nation: old.nation,
      league: old.league,
      club: old.club,
      legacy: true,
    });
  }

  const roster = [...imported, ...keptBelow].sort((a, b) => b.rating - a.rating || a.en.localeCompare(b.en));

  const outDir = new URL('../assets/data/', import.meta.url);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(new URL('players.json', outDir), JSON.stringify(roster));

  const matchedCount = imported.filter((p) => p.matched).length;
  const missingFromImport = existing.filter((p) => !importedIds.has(p.id));
  const topMissing = [...imported]
    .filter((p) => !p.matched)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 100)
    .map((p) => ({ id: p.id, en: p.en, rating: p.rating, club: p.club }));

  const report = {
    generatedAt: new Date().toISOString(),
    eaBuild: BUILD,
    minOvr: MIN_OVR,
    eaTotalCatalog: total,
    importedGold: imported.length,
    legacyKept: keptBelow.length,
    rosterTotal: roster.length,
    matchedExisting: matchedCount,
    unmatchedExisting: missingFromImport.map((p) => ({ id: p.id, en: p.en, rating: p.rating })),
    topNewPlayers: topMissing,
    iconsSeparate: iconIds.size,
    projectedWithIcons: roster.length + iconIds.size,
  };

  fs.writeFileSync(new URL('import-report.json', outDir), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    importedGold: imported.length,
    legacyKept: keptBelow.length,
    rosterTotal: roster.length,
    matchedExisting: matchedCount,
    withIcons: roster.length + iconIds.size,
  }, null, 2));
  console.log('wrote assets/data/players.json + assets/data/import-report.json');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
