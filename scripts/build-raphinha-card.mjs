import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire('file:///C:/Users/aviel/AppData/Local/Temp/sharpbox/package.json');
const sharp = require('sharp');

const previewPath = 'C:/Users/aviel/.cursor/projects/c-Users-aviel-Desktop/assets/preview-totw-card.png';
const renderPath = path.resolve('assets/images/cards/raphinha-totw-render.png');
const outPath = path.resolve('assets/images/cards/raphinha-totw-built.png');

const W = 864;
const H = 1152;

const original = await sharp(previewPath).ensureAlpha().raw().toBuffer();
const px = Buffer.from(original);

function isGold(r, g, b) {
  return r > 150 && g > 110 && b < 120 && g - b > 40;
}
function isLine(r, g, b) {
  return r > 155 && g > 130 && b > 55 && b < 155 && g - b > 25 && r - g < 60;
}
function isPlayer(r, g, b) {
  if (isLine(r, g, b)) return false;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min > 22 && max > 42;
}
function isHair(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max < 95 && max - min < 25 && max > 28;
}
function protectedZone(x, y) {
  if (x >= 188 && x <= 312 && y >= 205 && y <= 320) return true;
  if (x >= 205 && x <= 295 && y >= 318 && y <= 375) return true;
  if (x >= 198 && x <= 308 && y >= 375 && y <= 455) return true;
  if (x >= 198 && x <= 318 && y >= 450 && y <= 585) return true;
  if (y >= 715 && y <= 950 && x >= 175 && x <= 710) return true;
  return false;
}
function bright(r, g, b) {
  return Math.max(r, g, b) > 32 || Math.max(r, g, b) - Math.min(r, g, b) > 22;
}

const gold = new Uint8Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    if (isGold(px[i], px[i + 1], px[i + 2])) gold[y * W + x] = 1;
  }
}

const wall = new Uint8Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (!gold[y * W + x]) continue;
    for (let dy = -6; dy <= 6; dy++) {
      for (let dx = -6; dx <= 6; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        wall[ny * W + nx] = 1;
      }
    }
  }
}

const outside = new Uint8Array(W * H);
const stack = [];
function push(x, y) {
  const k = y * W + x;
  if (outside[k] || wall[k]) return;
  outside[k] = 1;
  stack.push(k);
}
for (let x = 0; x < W; x++) {
  push(x, 0);
  push(x, H - 1);
}
for (let y = 0; y < H; y++) {
  push(0, y);
  push(W - 1, y);
}
while (stack.length) {
  const k = stack.pop();
  const x = k % W;
  const y = (k - x) / W;
  if (x > 0) push(x - 1, y);
  if (x + 1 < W) push(x + 1, y);
  if (y > 0) push(x, y - 1);
  if (y + 1 < H) push(x, y + 1);
}

const frame = new Uint8Array(W * H);
for (let y = 2; y < H - 2; y++) {
  for (let x = 2; x < W - 2; x++) {
    if (!gold[y * W + x]) continue;
    let near = false;
    for (let dy = -8; dy <= 8 && !near; dy++) {
      for (let dx = -8; dx <= 8; dx++) {
        if (outside[(y + dy) * W + (x + dx)]) {
          near = true;
          break;
        }
      }
    }
    if (near) frame[y * W + x] = 1;
  }
}

const outsideCount = outside.reduce((a, b) => a + b, 0);
if (outsideCount > 620000) throw new Error(`flood leaked: ${outsideCount}`);

const rim = new Uint8Array(W * H);
{
  const dist = new Int16Array(W * H);
  dist.fill(999);
  const q = [];
  for (let k = 0; k < W * H; k++) {
    if (!outside[k]) continue;
    dist[k] = 0;
    q.push(k);
  }
  for (let qi = 0; qi < q.length; qi++) {
    const k = q[qi];
    const d = dist[k];
    if (d >= 42) continue;
    const x = k % W;
    const y = (k - x) / W;
    const next = [
      x > 0 ? k - 1 : -1,
      x + 1 < W ? k + 1 : -1,
      y > 0 ? k - W : -1,
      y + 1 < H ? k + W : -1,
    ];
    for (const n of next) {
      if (n < 0 || dist[n] <= d + 1) continue;
      dist[n] = d + 1;
      q.push(n);
    }
  }
  for (let k = 0; k < W * H; k++) if (dist[k] <= 38) rim[k] = 1;
}

let wiped = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const k = y * W + x;
    if (outside[k] || protectedZone(x, y)) continue;
    const i = k * 4;
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    if (isLine(r, g, b)) continue;
    const head = x > 300 && x < 660 && y > 145 && y < 440;
    if (!isPlayer(r, g, b) && !(head && isHair(r, g, b))) continue;
    px[i] = 8;
    px[i + 1] = 6;
    px[i + 2] = 4;
    px[i + 3] = 255;
    wiped++;
  }
}
console.log('wiped', wiped, 'outside', outsideCount);

const trimmed = await sharp(renderPath).ensureAlpha().trim({ threshold: 8 }).png().toBuffer();
const tmeta = await sharp(trimmed).metadata();
console.log('trim', tmeta.width, tmeta.height);
const targetH = 760;
const scale = targetH / tmeta.height;
const targetW = Math.round(tmeta.width * scale);
const player = await sharp(trimmed).resize(targetW, targetH).png().toBuffer();
const left = 700 - targetW;
const top = 118;
console.log('place', { left, top, targetW, targetH });

const composed = await sharp(px, { raw: { width: W, height: H, channels: 4 } })
  .composite([{ input: player, left, top }])
  .raw()
  .toBuffer();

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const k = y * W + x;
    const i = k * 4;
    const keepRim = outside[k] || (rim[k] && !isPlayer(original[i], original[i + 1], original[i + 2]) && !isHair(original[i], original[i + 1], original[i + 2]));
    const keepBadge = protectedZone(x, y) && bright(original[i], original[i + 1], original[i + 2]);
    if (!keepRim && !keepBadge) continue;
    composed[i] = original[i];
    composed[i + 1] = original[i + 1];
    composed[i + 2] = original[i + 2];
    composed[i + 3] = original[i + 3];
  }
}

let ghosts = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const k = y * W + x;
    if (outside[k]) continue;
    const i = k * 4;
    const r = composed[i];
    const g = composed[i + 1];
    const b = composed[i + 2];
    if (isLine(r, g, b) || isGold(r, g, b)) continue;
    if (protectedZone(x, y) && bright(r, g, b)) continue;
    const same =
      Math.abs(r - original[i]) < 8 &&
      Math.abs(g - original[i + 1]) < 8 &&
      Math.abs(b - original[i + 2]) < 8;
    if (!same || Math.max(r, g, b) < 26) continue;
    composed[i] = 8;
    composed[i + 1] = 6;
    composed[i + 2] = 4;
    ghosts++;
  }
}
console.log('ghosts', ghosts);

for (let k = 0; k < W * H; k++) {
  if (!outside[k]) continue;
  composed[k * 4 + 3] = 0;
}

await sharp(composed, { raw: { width: W, height: H, channels: 4 } }).png().toFile(outPath);
console.log('wrote', outPath);
