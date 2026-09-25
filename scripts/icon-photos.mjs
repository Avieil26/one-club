import { readFileSync, writeFileSync } from 'node:fs';

const file = new URL('./icons.json', import.meta.url);
const icons = JSON.parse(readFileSync(file, 'utf8'));

async function photo(name) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const search = new URL('https://en.wikipedia.org/w/api.php');
    search.searchParams.set('action', 'query');
    search.searchParams.set('generator', 'search');
    search.searchParams.set('gsrsearch', name);
    search.searchParams.set('gsrnamespace', '0');
    search.searchParams.set('gsrlimit', '1');
    search.searchParams.set('prop', 'pageimages');
    search.searchParams.set('piprop', 'thumbnail');
    search.searchParams.set('pithumbsize', '500');
    search.searchParams.set('format', 'json');
    const response = await fetch(search, { headers: { 'user-agent': 'FC27Israel/1.0 (educational; contact local)' } });
    const text = await response.text();
    if (!text.startsWith('{')) continue;
    const pages = Object.values(JSON.parse(text).query?.pages ?? {});
    const source = pages[0]?.original?.source ?? '';
    if (source.includes('upload.wikimedia.org')) return source;
    return '';
  }
  return '';
}

for (const icon of icons) {
  if (icon.photo) continue;
  const label = icon.url.split('/').pop().replace(/-/g, ' ');
  icon.photo = await photo(label);
  console.log(icon.name, icon.photo ? 'photo' : 'NO PHOTO');
  writeFileSync(file, JSON.stringify(icons, null, 2));
}

console.log('photos', icons.filter((item) => item.photo).length, '/', icons.length);
