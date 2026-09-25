import { readFileSync, writeFileSync } from 'node:fs';

const found = JSON.parse(readFileSync('scripts/new-photos.json', 'utf8'));
const lines = Object.entries(found).map(([id, row]) => {
  const photo = row.photo.split('?')[0];
  const key = /^[A-Za-z_][A-Za-z0-9_]*$/.test(id) ? id : `'${id}'`;
  return `  ${key}: { en: ${JSON.stringify(row.en)}, photo: ${JSON.stringify(photo)} },`;
});
const src = readFileSync('lib/playerPhotos.ts', 'utf8').replace(/\n};\s*$/, `\n${lines.join('\n')}\n};\n`);
writeFileSync('lib/playerPhotos.ts', src);

const headers = { 'User-Agent': 'fc27-israel-dev/1.0 (portrait check)' };
const bad = [];
const entries = Object.entries(found);
for (let i = 0; i < entries.length; i += 8) {
  const slice = entries.slice(i, i + 8);
  const results = await Promise.all(slice.map(async ([id, row]) => {
    const url = row.photo.split('?')[0];
    const response = await fetch(url, { headers, method: 'GET' });
    const type = response.headers.get('content-type') || '';
    await response.body?.cancel();
    if (!response.ok || !type.startsWith('image/')) return `${id} ${response.status} ${type}`;
    return '';
  }));
  bad.push(...results.filter(Boolean));
}
console.log(bad.length ? bad.join('\n') : 'all 47 images load');
