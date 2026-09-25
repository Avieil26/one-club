import { readFileSync } from 'node:fs';

const headers = { 'User-Agent': 'fc27-israel-dev/1.0 (portrait lookup for a community app)' };
const params = new URLSearchParams({
  action: 'query', format: 'json', titles: 'File:Lebanon v South Korea, 14 November 2019 04 (Kim Min-jae).jpg',
  prop: 'imageinfo', iiprop: 'url', iiurlwidth: '500',
});
const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers });
const page = Object.values((await response.json()).query.pages)[0];
const url = (page.imageinfo?.[0]?.thumburl || '').split('?')[0];
console.log(url);

const ids = [...readFileSync('lib/fcPlayers.ts', 'utf8').matchAll(/p\('([^']+)'/g)].map((m) => m[1]);
const faces = readFileSync('lib/eaFace.ts', 'utf8');
const photos = readFileSync('lib/playerPhotos.ts', 'utf8');
const media = readFileSync('lib/playerMedia.ts', 'utf8');
const dup = ids.filter((id, index) => ids.indexOf(id) !== index);
function has(src, id) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^\\s+'?${escaped}'?:\\s*\\{[^}]*photo:`, 'm').test(src) || new RegExp(`^\\s+'?${escaped}'?:\\s*f\\(`, 'm').test(src);
}
const missFace = ids.filter((id) => !new RegExp(`^\\s+'?${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'?:\\s*f\\(`, 'm').test(faces));
const missPhoto = ids.filter((id) => !has(media, id) && !has(photos, id));
console.log('players', ids.length, 'dup', dup.join(',') || 'none');
console.log('missFace', missFace.join(',') || 'none');
console.log('missPhoto', missPhoto.join(',') || 'none');
