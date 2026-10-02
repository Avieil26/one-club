import fs from 'node:fs';

const root = new URL('../assets/crests/', import.meta.url);
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  Accept: 'text/html',
};
const pages = [
  ["Women's_Super_League", 'wsl.png'],
  ['FA_Women%27s_Super_League', 'wsl.png'],
  ['Cypriot_First_Division', 'cyprus.png'],
  ['Toppserien', 'norwayw.png'],
  ['Swiss_Women%27s_Super_League', 'swissw.png'],
  ['Eredivisie_Vrouwen', 'eredivisiew.png'],
  ['Czech_Women%27s_Football_League', 'czechw.png'],
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

for (const [title, file] of pages) {
  const response = await fetch(`https://en.wikipedia.org/wiki/${title}`, { headers, redirect: 'follow' });
  const html = await response.text();
  const match = html.match(/class="infobox-image"[\s\S]{0,1200}?src="([^"]+)"/);
  if (!match) {
    console.log('MISS', title, response.status, response.url);
    await sleep(800);
    continue;
  }
  let src = match[1].replace(/&amp;/g, '&').split('?')[0];
  if (src.startsWith('//')) src = `https:${src}`;
  const image = await fetch(src, { headers });
  const bytes = Buffer.from(await image.arrayBuffer());
  if (bytes[0] === 0x89) {
    fs.writeFileSync(new URL(file, root), bytes);
    console.log('OK', file, bytes.length, title);
  } else {
    console.log('BAD', title, image.status);
  }
  await sleep(800);
}
