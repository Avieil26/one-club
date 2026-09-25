const people = {
  'di-maria': ['Ángel Di María', 'Di María'],
  'watkins-sub': ['John McGinn', 'McGinn'],
  'leao-sub': ['Cristian Romero', 'Romero'],
  'van-de-ven': ['Micky van de Ven', 'van de Ven'],
  'martinez-lisandro': ['Lisandro Martínez', 'Martínez'],
  'aké': ['Nathan Aké', 'Aké'],
  raskin: ['Nicolas Raskin', 'Raskin'],
  pandur: ['Ivor Pandur', 'Pandur'],
  kiwior: ['Jakub Kiwior', 'Kiwior'],
  trent: ['Trent Alexander-Arnold', 'Alexander-Arnold'],
  aitana: ['Aitana Bonmatí', 'Bonmatí'],
  hansen: ['Caroline Graham Hansen', 'Graham Hansen'],
  hegerberg: ['Ada Hegerberg', 'Hegerberg'],
  kerr: ['Sam Kerr', 'Kerr'],
  miedema: ['Vivianne Miedema', 'Miedema'],
  mead: ['Beth Mead', 'Mead'],
  'lauren-james': ['Lauren James', 'James'],
  earps: ['Mary Earps', 'Earps'],
  williamson: ['Leah Williamson', 'Williamson'],
  bronze: ['Lucy Bronze', 'Bronze'],
  walsh: ['Keira Walsh', 'Walsh'],
  katoto: ['Marie-Antoinette Katoto', 'Katoto'],
  renard: ['Wendie Renard', 'Renard'],
  karchaoui: ['Sakina Karchaoui', 'Karchaoui'],
  rodman: ['Trinity Rodman', 'Rodman'],
  wilson: ['Sophia Wilson (soccer)', 'Sophia Smith'],
  buhl: ['Klara Bühl', 'Bühl'],
  oberdorf: ['Lena Oberdorf', 'Oberdorf'],
  debinha: ['Debinha', 'Debinha'],
  hemp: ['Lauren Hemp', 'Hemp'],
  kelly: ['Chloe Kelly', 'Kelly'],
  russo: ['Alessia Russo', 'Russo'],
  guijarro: ['Patri Guijarro', 'Guijarro'],
  paraluelo: ['Salma Paralluelo', 'Paralluelo'],
  mapi: ['Mapi León', 'León'],
  paredes: ['Irene Paredes', 'Paredes'],
  'caicedo-w': ['Linda Caicedo', 'Caicedo'],
  banda: ['Barbra Banda', 'Banda'],
  berger: ['Ann-Katrin Berger', 'Berger'],
  endler: ['Christiane Endler', 'Endler'],
  nusken: ['Sjoeke Nüsken', 'Nüsken'],
  stanway: ['Georgia Stanway', 'Stanway'],
  mariona: ['Mariona Caldentey', 'Caldentey'],
  gwinn: ['Giulia Gwinn', 'Gwinn'],
  diani: ['Kadidiatou Diani', 'Diani'],
  lavelle: ['Rose Lavelle', 'Lavelle'],
  swanson: ['Mallory Swanson', 'Swanson'],
};

const headers = { 'User-Agent': 'fc27-israel-dev/1.0 (portrait lookup for a community app)' };

function norm(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function commons(page) {
  const source = page?.thumbnail?.source || page?.original?.source || '';
  return source.includes('/wikipedia/commons/') ? source : '';
}

async function wiki(params) {
  const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { headers });
  if (!response.ok) throw new Error(`wiki ${response.status}`);
  return response.json();
}

async function byTitles(titles) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    redirects: '1',
    prop: 'pageimages',
    piprop: 'thumbnail|original',
    pithumbsize: '500',
    titles: titles.join('|'),
  });
  const data = await wiki(params);
  const redirects = new Map((data.query.redirects || []).map((row) => [row.from, row.to]));
  const normalized = new Map((data.query.normalized || []).map((row) => [row.from, row.to]));
  const pages = Object.values(data.query.pages || {});
  const byTitle = new Map(pages.map((page) => [page.title, page]));
  function resolve(start) {
    let current = start;
    for (let i = 0; i < 6; i += 1) {
      const next = normalized.get(current) || redirects.get(current);
      if (!next || next === current) break;
      current = next;
    }
    return byTitle.get(current);
  }
  return { resolve, pages };
}

const ids = Object.keys(people);
const found = {};
for (let i = 0; i < ids.length; i += 20) {
  const slice = ids.slice(i, i + 20);
  const { resolve } = await byTitles(slice.map((id) => people[id][0]));
  for (const id of slice) {
    const page = resolve(people[id][0]);
    const photo = commons(page);
    if (photo) found[id] = { en: people[id][0].replace(/ \(.*\)$/, ''), photo, via: page.title };
  }
}

for (const id of ids) {
  if (found[id]) continue;
  const [full, last] = people[id];
  const query = `${last} footballer`;
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: query,
    gsrlimit: '6',
    gsrnamespace: '0',
    redirects: '1',
    prop: 'pageimages',
    piprop: 'thumbnail|original',
    pithumbsize: '500',
  });
  const data = await wiki(params);
  const pages = Object.values(data.query?.pages || {});
  const lastNorm = norm(last);
  const firstNorm = norm(full.split(' ')[0]);
  const ranked = pages
    .map((page) => {
      const title = norm(page.title);
      const photo = commons(page);
      if (!photo || !title.includes(lastNorm.split(' ').at(-1))) return null;
      let score = 0;
      if (title.includes(lastNorm)) score += 50;
      if (title.includes(firstNorm)) score += 40;
      if (title.includes('football') || title.includes('soccer')) score += 10;
      if (/fc\b|stadium|league|cup|national team/.test(title)) score -= 40;
      return { score, title: page.title, photo };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
  if (ranked[0] && ranked[0].score >= 50) {
    found[id] = { en: full.replace(/ \(.*\)$/, ''), photo: ranked[0].photo, via: ranked[0].title };
  } else {
    console.log('MISS', id, ranked.slice(0, 3).map((row) => row.title).join(' | ') || 'none');
  }
}

import { writeFileSync } from 'node:fs';
writeFileSync('scripts/new-photos.json', JSON.stringify(found, null, 2));
console.log('found', Object.keys(found).length, 'of', ids.length);
for (const [id, row] of Object.entries(found)) console.log(id, row.via);
