import { writeFileSync } from 'node:fs';

const START = 'https://wefut.com/player/type/27/12';

async function get(url) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) });
      if (response.ok) return response.text();
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
  }
  throw new Error(`failed ${url}`);
}

function cards(html) {
  const out = [];
  const re =
    /<a href="(https:\/\/wefut.com\/player\/27\/[^"]+)"[\s\S]*?<span class="rating"[^>]*>(\d+)<\/span>[\s\S]*?<span class="position">([^<]+)<\/span>[\s\S]*?<span class="marquee">([^<]+)<\/span>[\s\S]*?<span class="pace">(\d+)<\/span>\s*<span class="shooting">(\d+)<\/span>\s*<span class="passing">(\d+)<\/span>\s*<span class="dribbling">(\d+)<\/span>\s*<span class="defending">(\d+)<\/span>\s*<span class="heading">(\d+)<\/span>/g;
  let match;
  while ((match = re.exec(html))) {
    out.push({
      url: match[1],
      ovr: Number(match[2]),
      position: match[3].trim(),
      name: match[4].trim(),
      pac: Number(match[5]),
      sho: Number(match[6]),
      pas: Number(match[7]),
      dri: Number(match[8]),
      def: Number(match[9]),
      phy: Number(match[10]),
    });
  }
  return out;
}

function detail(html) {
  const playstyles = [];
  const styleRe = /\/playstyles\/27\/\d+\/([^/"']+)\/(plus|normal)/g;
  let match;
  const seen = new Set();
  while ((match = styleRe.exec(html))) {
    const name = match[1].replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
    const key = `${name}:${match[2]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    playstyles.push({ name, plus: match[2] === 'plus' });
  }
  const positions = [];
  const posRe = /<label class="statlabel (darkgreen|green)">(\d+)<\/label>[\s\S]*?<span class="label label-default">([A-Z]+)<\/span>/g;
  const seenPos = new Set();
  while ((match = posRe.exec(html))) {
    if (seenPos.has(match[3])) continue;
    seenPos.add(match[3]);
    positions.push(match[3]);
  }
  const nation = html.match(/Nationality<\/td><td><a [^>]*>([^<]+)<\/a>/)?.[1] ?? '';
  return { playstyles, positions, nation };
}

async function photo(name) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
    const search = new URL('https://en.wikipedia.org/w/api.php');
    search.searchParams.set('action', 'query');
    search.searchParams.set('list', 'search');
    search.searchParams.set('srsearch', `${name} footballer`);
    search.searchParams.set('srlimit', '1');
    search.searchParams.set('format', 'json');
    const response = await fetch(search);
    const text = await response.text();
    if (!text.startsWith('{')) continue;
    const found = JSON.parse(text);
    const title = found.query?.search?.[0]?.title;
    if (!title) return '';
    const summaryResponse = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    const summaryText = await summaryResponse.text();
    if (!summaryText.startsWith('{')) continue;
    const summary = JSON.parse(summaryText);
    const source = summary.originalimage?.source || summary.thumbnail?.source || '';
    if (!source.includes('upload.wikimedia.org')) return '';
    return source;
  }
  return '';
}

let url = START;
const unique = new Map();
const seenPages = new Set();
while (url && !seenPages.has(url)) {
  seenPages.add(url);
  const html = await get(url);
  for (const card of cards(html)) {
    if (!unique.has(card.url)) unique.set(card.url, card);
  }
  const next = html.match(/<a href="(\/player\/type\/27\/12\/all\/\d+)">Next/);
  const nextUrl = next ? `https://wefut.com${next[1]}` : '';
  url = nextUrl && nextUrl !== url ? nextUrl : '';
}

const byName = new Map();
for (const card of unique.values()) {
  const key = card.name.toLowerCase();
  const previous = byName.get(key);
  if (!previous || card.ovr > previous.ovr) byName.set(key, card);
}
const list = [...byName.values()];
console.log('unique', list.length);
const icons = [];
let cursor = 0;
async function worker() {
  while (cursor < list.length) {
    const card = list[cursor];
    cursor += 1;
    try {
      const html = await get(card.url);
      const extra = detail(html);
      icons.push({ ...card, ...extra, photo: '' });
      console.log(`${icons.length} ${card.name}`);
    } catch (error) {
      console.log('skip', card.name, error.message);
    }
  }
}
await Promise.all(Array.from({ length: 2 }, () => worker()));

writeFileSync(new URL('./icons.json', import.meta.url), JSON.stringify(icons, null, 2));
console.log('icons', icons.length, 'photos', icons.filter((item) => item.photo).length);
