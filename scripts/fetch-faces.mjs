const pages = {
  'croatia/10': ['gvardiol', 'kovacic'],
  'egypt/111': ['salah', 'marmoush'],
  'morocco/129': ['hakimi', 'condogno', 'onaia', 'amrabat'],
  'japan/163': ['hatate', 'maeda', 'kubo', 'mitoma'],
  'united-states/95': ['carter', 'trusty', 'pulisic', 'mckennie'],
  'nigeria/133': ['dessers', 'boniface', 'osimhen', 'lookman'],
  'senegal/136': ['jackson', 'mane', 'koulibaly', 'sarr'],
  'poland/37': ['lewandowski', 'cash'],
  'uruguay/60': ['valverde', 'araujo', 'suarez'],
  'georgia/20': ['kvara', 'mikautadze'],
  'sweden/46': ['gyokeres', 'isak', 'elanga', 'kulusevski'],
  'denmark/13': ['bah', 'hjulmand', 'hojlund'],
  'korea-republic/167': ['son'],
  'colombia/56': ['diaz'],
  'turkey/48': ['arda', 'kokcu', 'akturkoglu', 'calhanoglu'],
  'switzerland/47': ['xhaka', 'kobel'],
  'hungary/23': ['szoboszlai'],
  'ukraine/49': ['trubin', 'dovbyk'],
  'canada/70': ['eustaquio', 'davies'],
  'slovenia/44': ['oblak'],
  'gabon/115': ['aubameyang'],
  'czech-republic/12': ['cerny', 'schick'],
  'serbia/51': ['vlahovic'],
  'algeria/97': ['mahrez'],
  'austria/4': ['alaba', 'sabitzer'],
  'republic-of-ireland/25': ['keane'],
  'ecuador/57': ['caicedo'],
  'jamaica/82': ['bailey'],
  'guinea/118': ['guirassy'],
  'scotland/42': ['mcgregor', 'tierney', 'robertson', 'souttar', 'ralston', 'montgomery', 'king', 'mctominay', 'watkins-sub'],
  'cote-divoire/108': ['diomande'],
  'cameroon/103': ['onzana'],
  'ghana/117': ['kudus'],
  'england/14': ['tavernier', 'butland', 'trippier', 'tomori', 'solanke', 'colwill', 'mount', 'shaw', 'rashford', 'grealish', 'stones', 'walker'],
  'spain/45': ['carvajal', 'alba', 'busquets', 'cucurella', 'sanchez', 'simon'],
  'france/18': ['nkunku', 'varane', 'theo'],
  'germany/21': ['fullkrug', 'havertz'],
  'portugal/38': ['pepe', 'neto', 'bernardo'],
  'brazil/54': ['luishenrique', 'neymar', 'paqueta', 'jesus', 'antony', 'casemiro', 'savinho'],
  'argentina/52': ['icardi', 'garnacho', 'martinez-lisandro', 'leao-sub'],
  'italy/27': ['udogie'],
  'belgium/7': ['doku'],
  'holland/34': ['depay', 'van-de-ven', 'aké'],
};

const needles = {
  gvardiol: 'gvardiol',
  kovacic: 'kovacic',
  salah: 'salah',
  marmoush: 'marmoush',
  hakimi: 'hakimi',
  condogno: 'harit',
  onaia: 'ounahi',
  amrabat: 'amrabat',
  hatate: 'hatate',
  maeda: 'maeda',
  kubo: 'kubo',
  mitoma: 'mitoma',
  carter: 'carter-vickers',
  trusty: 'trusty',
  pulisic: 'pulisic',
  mckennie: 'mckennie',
  dessers: 'dessers',
  boniface: 'boniface',
  osimhen: 'osimhen',
  lookman: 'lookman',
  jackson: 'nicolas jackson',
  mane: 'mane',
  koulibaly: 'koulibaly',
  sarr: 'sarr',
  lewandowski: 'lewandowski',
  cash: 'matty cash',
  valverde: 'valverde',
  araujo: 'araujo',
  suarez: 'luis suarez',
  kvara: 'kvaratskhelia',
  mikautadze: 'mikautadze',
  gyokeres: 'gyokeres',
  isak: 'isak',
  elanga: 'elanga',
  kulusevski: 'kulusevski',
  bah: 'alexander bah',
  hjulmand: 'hjulmand',
  hojlund: 'hojlund',
  son: 'heung',
  diaz: 'luis diaz',
  arda: 'guler',
  kokcu: 'kokcu',
  akturkoglu: 'akturkoglu',
  calhanoglu: 'calhanoglu',
  xhaka: 'xhaka',
  kobel: 'kobel',
  szoboszlai: 'szoboszlai',
  trubin: 'trubin',
  dovbyk: 'dovbyk',
  eustaquio: 'eustaquio',
  davies: 'alphonso',
  oblak: 'oblak',
  aubameyang: 'aubameyang',
  cerny: 'cerny',
  schick: 'schick',
  vlahovic: 'vlahovic',
  mahrez: 'mahrez',
  alaba: 'alaba',
  sabitzer: 'sabitzer',
  keane: 'michael keane',
  caicedo: 'caicedo',
  bailey: 'leon bailey',
  guirassy: 'guirassy',
  mcgregor: 'mcgregor',
  tierney: 'tierney',
  robertson: 'robertson',
  souttar: 'souttar',
  ralston: 'ralston',
  montgomery: 'montgomery',
  king: 'leon king',
  mctominay: 'mctominay',
  'watkins-sub': 'mcginn',
  diomande: 'diomande',
  onzana: 'onana',
  kudus: 'kudus',
  tavernier: 'tavernier',
  butland: 'butland',
  trippier: 'trippier',
  tomori: 'tomori',
  solanke: 'solanke',
  colwill: 'colwill',
  mount: 'mason mount',
  shaw: 'luke shaw',
  rashford: 'rashford',
  grealish: 'grealish',
  stones: 'john stones',
  walker: 'kyle walker',
  carvajal: 'carvajal',
  alba: 'jordi alba',
  busquets: 'busquets',
  cucurella: 'cucurella',
  sanchez: 'robert sanchez',
  simon: 'unai simon',
  nkunku: 'nkunku',
  varane: 'varane',
  theo: 'theo hernandez',
  fullkrug: 'fullkrug',
  havertz: 'havertz',
  pepe: 'pepe',
  neto: 'pedro neto',
  bernardo: 'bernardo silva',
  luishenrique: 'luis henrique',
  neymar: 'neymar',
  paqueta: 'paqueta',
  jesus: 'gabriel jesus',
  antony: 'antony',
  casemiro: 'casemiro',
  savinho: 'savinho',
  icardi: 'icardi',
  garnacho: 'garnacho',
  'martinez-lisandro': 'lisandro',
  'leao-sub': 'cristian romero',
  udogie: 'udogie',
  doku: 'doku',
  depay: 'depay',
  'van-de-ven': 'van de ven',
  aké: 'ake',
};

const fallbacks = {
  'united-states/95': ['usa/95', 'united-states-of-america/95'],
  'korea-republic/167': ['south-korea/167', 'korea/167'],
  'turkey/48': ['turkiye/48'],
  'czech-republic/12': ['czechia/12'],
  'republic-of-ireland/25': ['ireland/25'],
  'cote-divoire/108': ['ivory-coast/108'],
  'jamaica/82': ['jamaica/140'],
};

function norm(value) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

const rowRe = /([\p{L}'’.\- ]{2,60}?) (GK|CB|LB|RB|CDM|CM|CAM|LW|RW|LM|RM|ST|CF) Vote \2 OVR (\d+) PAC (\d+) SHO (\d+) PAS (\d+) DRI (\d+) DEF (\d+) PHY (\d+)/gu;

async function load(path) {
  const response = await fetch(`https://www.ea.com/games/ea-sports-fc/ratings/nations-ratings/${path}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  if (!response.ok) return null;
  const text = await response.text();
  if (!text.includes('totw-ratings-table')) return null;
  const table = text.slice(text.indexOf('id="totw-ratings-table"'), text.indexOf('ratingsEntries'));
  const plain = table.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
  return [...plain.matchAll(rowRe)].map((match) => ({
    name: norm(match[1]),
    ovr: Number(match[3]),
    pac: Number(match[4]),
    sho: Number(match[5]),
    pas: Number(match[6]),
    dri: Number(match[7]),
    def: Number(match[8]),
    phy: Number(match[9]),
  }));
}

const found = {};
const missed = [];
const paths = Object.keys(pages);
for (let i = 0; i < paths.length; i += 4) {
  const slice = paths.slice(i, i + 4);
  await Promise.all(slice.map(async (path) => {
    let rows = await load(path);
    if (!rows) {
      for (const alt of fallbacks[path] || []) {
        rows = await load(alt);
        if (rows) break;
      }
    }
    if (!rows) {
      for (const id of pages[path]) missed.push(`${id} PAGE ${path}`);
      return;
    }
    for (const id of pages[path]) {
      const needle = norm(needles[id]);
      const row = rows.find((item) => item.name.includes(needle));
      if (!row) missed.push(`${id} NOT ON ${path} (${rows.length} rows)`);
      else found[id] = row;
    }
  }));
}

const lines = Object.entries(found).map(([id, row]) => {
  const key = /^[a-z0-9]+$/.test(id) ? id : `'${id}'`;
  return `  ${key}: f(${row.ovr}, ${row.pac}, ${row.sho}, ${row.pas}, ${row.dri}, ${row.def}, ${row.phy}),`;
});
console.log(lines.join('\n'));
console.log('\nMISSED');
console.log(missed.join('\n'));
console.log('found', lines.length, 'missed', missed.length);
