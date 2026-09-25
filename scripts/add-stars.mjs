import { readFileSync, writeFileSync } from 'node:fs';

const BUILD = 'M97aJNMwRgARBSdoH5nPR';
const wanted = [
  ['olise', 'Michael Olise', 'מייקל אוליס'],
  ['raphinha', 'Raphinha', 'רפיניה'],
  ['dejong', 'Frenkie de Jong', 'פרנקי דה יונג'],
  ['gavi', 'Gavi (footballer)', 'גאבי'],
  ['ferran', 'Ferran Torres', 'פראן טורס'],
  ['fermin', 'Fermín López', 'פרמין לופס'],
  ['doue', 'Désiré Doué', 'דזירה דואה'],
  ['gakpo', 'Cody Gakpo', 'קודי חאקפו'],
  ['ekitike', 'Hugo Ekitiké', 'הוגו אקיטיקה'],
  ['simons', 'Xavi Simons', 'צ׳אבי סימונס'],
  ['upamecano', 'Dayot Upamecano', 'דאיו אופמקאנו'],
  ['kim', 'Kim Min-jae', 'קים מין-ג׳ה'],
  ['tah', 'Jonathan Tah', 'יונתן טאה'],
  ['pavlovic', 'Aleksandar Pavlović', 'אלכסנדר פבלוביץ׳'],
  ['gnabry', 'Serge Gnabry', 'סרז׳ גנאברי'],
  ['coman', 'Kingsley Coman', 'קינגסלי קומאן'],
  ['timber', 'Jurriën Timber', 'יוריאן טימבר'],
  ['zubimendi', 'Martín Zubimendi', 'מרטין סובימנדי'],
  ['madueke', 'Noni Madueke', 'נוני מדואקה'],
  ['trossard', 'Leandro Trossard', 'לאנדרו טרסאר'],
  ['huijsen', 'Dean Huijsen', 'דין האויסן'],
  ['ferland', 'Ferland Mendy', 'פרלן מנדי'],
  ['brahim', 'Brahim Díaz', 'בראהים דיאס'],
  ['endrick', 'Endrick', 'אנדריק'],
  ['carreras', 'Álvaro Carreras', 'אלווארו קררס'],
  ['estevao', 'Estêvão', 'אשטבאו'],
  ['delap', 'Liam Delap', 'ליאם דלאפ'],
  ['gusto', 'Malo Gusto', 'מאלו גוסטו'],
  ['fofana', 'Wesley Fofana', 'וסלי פופאנה'],
  ['sesko', 'Benjamin Šeško', 'בנימין ששקו'],
  ['rogers', 'Morgan Rogers', 'מורגן רוג׳רס'],
  ['mbeumo', 'Bryan Mbeumo', 'בריאן מבאומו'],
  ['semenyo', 'Antoine Semenyo', 'אנטואן סמניו'],
  ['tonali', 'Sandro Tonali', 'סנדרו טונאלי'],
  ['joelinton', 'Joelinton', 'ז׳ואלינטון'],
  ['deligt', 'Matthijs de Ligt', 'מתייס דה ליכט'],
  ['yoro', 'Leny Yoro', 'לני יורו'],
  ['amad', 'Amad Diallo', 'אמד דיאלו'],
  ['ugarte', 'Manuel Ugarte', 'מנואל אוגרטה'],
  ['gramos', 'Gonçalo Ramos', 'גונסאלו ראמוש'],
  ['chiesa', 'Federico Chiesa', 'פדריקו קייזה'],
  ['inigo', 'Íñigo Martínez', 'איניגו מרטינס'],
  ['garcia', 'Joan García', 'ז׳ואן גרסיה'],
  ['casado', 'Marc Casadó', 'מארק קאסאדו'],
  ['christensen', 'Andreas Christensen', 'אנדראס כריסטנסן'],
  ['szczesny', 'Wojciech Szczęsny', 'וויצ׳ך שצ׳סני'],
  ['merino', 'Mikel Merino', 'מיקל מרינו'],
  ['gallagher', 'Conor Gallagher', 'קונור גלאגר'],
];

const clubs = {
  'FC Bayern München': 'C.bayern',
  'FC Barcelona': 'C.barca',
  'Paris SG': 'C.psg',
  Liverpool: 'C.liverpool',
  Spurs: 'C.spurs',
  Arsenal: 'C.arsenal',
  'Beşiktaş': "'בשיקטאש'",
  'Real Madrid': 'C.real',
  Chelsea: 'C.chelsea',
  'Man Utd': 'C.united',
  'Manchester City': 'C.city',
  'Newcastle Utd': 'C.newcastle',
  'Al Nassr': "'אל-נסר'",
  'Milano FC': 'C.milan',
};
const leagues = {
  Bundesliga: 'L.bundes',
  'LALIGA EA SPORTS': 'L.laliga',
  "Ligue 1 McDonald's": 'L.ligue1',
  'Premier League': 'L.prem',
  'Trendyol Süper Lig': 'L.turkish',
  'ROSHN Saudi League': 'L.saudi',
  'Serie A Enilive': 'L.seriea',
};
const nations = {
  France: 'N.france',
  Brazil: 'N.brazil',
  Holland: 'N.netherlands',
  Spain: 'N.spain',
  Germany: 'N.germany',
  Belgium: 'N.belgium',
  Morocco: 'N.morocco',
  Portugal: 'N.portugal',
  England: 'N.england',
  Slovenia: 'N.slovenia',
  Cameroon: 'N.cameroon',
  Ghana: 'N.ghana',
  Italy: 'N.italy',
  Uruguay: 'N.uruguay',
  "Côte d'Ivoire": 'N.ivory',
  Poland: 'N.poland',
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
    return parts.length > 0 && parts.every((part) => full.includes(part) || common.includes(part));
  });
}

async function search(query) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 500 + attempt * 1500));
    const response = await fetch(
      `https://www.ea.com/_next/data/${BUILD}/games/ea-sports-fc/ratings.json?search=${encodeURIComponent(query)}&page=1`,
      { headers: { 'User-Agent': 'Mozilla/5.0', 'x-nextjs-data': '1' } },
    );
    const text = await response.text();
    if (text.startsWith('{')) {
      const data = JSON.parse(text);
      return pick(data.pageProps?.ratingDetails?.items ?? [], query);
    }
  }
  throw new Error(`EA rate limit on ${query}`);
}

const headers = { 'User-Agent': 'fc27-israel-dev/1.0 (portrait lookup for a community app)' };

async function portrait(title) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 800 + attempt * 2000));
    const params = new URLSearchParams({
      action: 'query', format: 'json', redirects: '1', prop: 'pageimages',
      piprop: 'thumbnail|original', pithumbsize: '500', titles: title,
    });
    const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { headers });
    const text = await response.text();
    if (!text.startsWith('{')) continue;
    const data = JSON.parse(text);
    const page = Object.values(data.query?.pages || {})[0];
    const source = page?.thumbnail?.source || page?.original?.source || '';
    if (source.includes('/wikipedia/commons/')) return source.split('?')[0];
    return '';
  }
  return '';
}

const already = readFileSync('lib/fcPlayers.ts', 'utf8');
const rows = [];
for (const [id, en, he] of wanted) {
  if (already.includes(`p('${id}',`)) {
    console.log('SKIP', id);
    continue;
  }
  const queries = id === 'kim' ? ['Minjae Kim', 'Kim Min Jae'] : id === 'estevao' ? ['Estêvão Willian', 'Estevao'] : id === 'amad' ? ['Amad Diallo'] : id === 'brahim' ? ['Brahim Díaz'] : id === 'fermin' ? ['Fermín López'] : id === 'gavi' ? ['Gavi'] : id === 'pavlovic' ? ['Aleksandar Pavlović', 'Aleksandar Pavlovic'] : id === 'joelinton' ? ['Joelinton'] : id === 'deligt' ? ['Matthijs de Ligt'] : [en];
  let item = null;
  for (const query of queries) {
    item = await search(query);
    if (item) break;
  }
  if (!item) {
    console.log('MISS', id);
    continue;
  }
  const name = item.commonName || `${item.firstName} ${item.lastName}`.trim();
  const photo = (await portrait(en)) || (await portrait(name)) || (await portrait(`${item.lastName} footballer`));
  if (!photo) {
    console.log('NO PHOTO', id, name);
    continue;
  }
  const check = await fetch(photo, { headers });
  const type = check.headers.get('content-type') || '';
  await check.body?.cancel();
  if (!check.ok || !type.startsWith('image/')) {
    console.log('BAD PHOTO', id, check.status);
    continue;
  }
  const team = clubs[item.team.label];
  const league = leagues[item.leagueName];
  const nation = nations[item.nationality.label];
  const pos = item.position.shortLabel;
  if (!team || !league || !nation || !pos) {
    console.log('UNMAPPED', id, item.team.label, item.leagueName, item.nationality.label, pos);
    continue;
  }
  const s = item.stats;
  rows.push({
    id, he, en: en.replace(/ \(.*\)$/, ''), pos, team, league, nation, photo,
    ovr: item.overallRating,
    pac: s.pac.value, sho: s.sho.value, pas: s.pas.value, dri: s.dri.value, def: s.def.value, phy: s.phy.value,
    ea: name, club: item.team.label,
  });
  console.log('OK', id, item.overallRating, pos, item.team.label);
}

const playerLines = rows.map((row) => `  p('${row.id}', '${row.he}', ${row.ovr}, '${row.pos}', ${row.nation}, ${row.league}, ${row.team}),`);
const faceLines = rows.map((row) => `  ${row.id}: f(${row.ovr}, ${row.pac}, ${row.sho}, ${row.pas}, ${row.dri}, ${row.def}, ${row.phy}),`);
const photoLines = rows.map((row) => `  ${row.id}: { en: ${JSON.stringify(row.en)}, photo: ${JSON.stringify(row.photo)} },`);

function insert(path, ending, lines) {
  if (!lines.length) return;
  const src = readFileSync(path, 'utf8');
  const idx = src.lastIndexOf(ending);
  if (idx < 0) throw new Error(`missing ${ending} in ${path}`);
  writeFileSync(path, `${src.slice(0, idx)}${lines.join('\n')}\n${src.slice(idx)}`);
}
insert('lib/fcPlayers.ts', '];', playerLines);
insert('lib/eaFace.ts', '};', faceLines);
insert('lib/playerPhotos.ts', '};', photoLines);
console.log('wrote', rows.length);
