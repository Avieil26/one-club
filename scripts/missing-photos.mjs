import { readFileSync } from 'node:fs';

const playersSrc = readFileSync('lib/fcPlayers.ts', 'utf8');
const media = readFileSync('lib/playerMedia.ts', 'utf8');
const photos = readFileSync('lib/playerPhotos.ts', 'utf8');
const ids = [...playersSrc.matchAll(/p\('([^']+)'/g)].map((m) => m[1]);
const en = {};
for (const src of [media, photos]) {
  for (const match of src.matchAll(/^\s+'?([A-Za-z0-9\-]+)'?:\s*\{[^}]*en:\s*['"]([^'"]+)['"]/gm)) en[match[1]] = match[2];
}
function hasPhoto(src, id) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^\\s+'?${escaped}'?:\\s*\\{[^}]*photo:`, 'm');
  return re.test(src);
}
const missing = ids.filter((id) => !hasPhoto(media, id) && !hasPhoto(photos, id));
console.log(missing.map((id) => `${id}\t${en[id] || '?'}`).join('\n'));
console.log('count', missing.length, 'of', ids.length);
