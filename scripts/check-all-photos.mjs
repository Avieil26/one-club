import { readFileSync } from 'node:fs';

const players = [...readFileSync('lib/fcPlayers.ts', 'utf8').matchAll(/p\('([^']+)'/g)].map((m) => m[1]);
const media = readFileSync('lib/playerMedia.ts', 'utf8');
const photos = readFileSync('lib/playerPhotos.ts', 'utf8');

function block(src, id) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = src.match(new RegExp(`^\\s+'?${escaped}'?:\\s*\\{([^}]*)\\}`, 'm'));
  return match?.[1] || '';
}
function photoOf(body) {
  const match = body.match(/photo:\s*(?:photo\('([^']+)'\)|"([^"]+)"|'([^']+)')/);
  if (!match) return '';
  if (match[1]) return `https://upload.wikimedia.org/wikipedia/commons/thumb/${match[1]}`;
  return match[2] || match[3];
}

const rows = players.map((id) => {
  const fromMedia = photoOf(block(media, id));
  const fromPhotos = photoOf(block(photos, id));
  return { id, photo: fromMedia || fromPhotos };
});
const missing = rows.filter((row) => !row.photo);
console.log('missing', missing.map((row) => row.id).join(',') || 'none', 'of', players.length);

const headers = { 'User-Agent': 'fc27-israel-dev/1.0 (portrait check)' };
const bad = [];
for (let i = 0; i < rows.length; i += 12) {
  const slice = rows.slice(i, i + 12).filter((row) => row.photo);
  const results = await Promise.all(slice.map(async (row) => {
    try {
      const response = await fetch(row.photo, { headers });
      const type = response.headers.get('content-type') || '';
      await response.body?.cancel();
      if (!response.ok || !type.startsWith('image/')) return `${row.id} ${response.status} ${type}`;
    } catch (error) {
      return `${row.id} ${error.message}`;
    }
    return '';
  }));
  bad.push(...results.filter(Boolean));
}
console.log(bad.length ? bad.join('\n') : 'every photo url loads');
