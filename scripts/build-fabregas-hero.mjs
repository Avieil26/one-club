import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire('file:///C:/Users/aviel/AppData/Local/Temp/sharpbox/package.json');
const sharp = require('sharp');

const src = 'C:/Users/aviel/.cursor/projects/c-Users-aviel-Desktop/assets/preview-hero-card.png';
const out = path.resolve('assets/images/cards/fabregas-hero.png');

const meta = await sharp(src).metadata();
const W = meta.width;
const H = meta.height;
const px = await sharp(src).ensureAlpha().raw().toBuffer();
console.log({ W, H });

function isFrame(r, g, b) {
  return b > 90 && r > 70 && b > g + 15 && r + b > g + 80;
}

const frame = new Uint8Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    if (isFrame(px[i], px[i + 1], px[i + 2])) frame[y * W + x] = 1;
  }
}
const wall = new Uint8Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (!frame[y * W + x]) continue;
    for (let dy = -5; dy <= 5; dy++) {
      for (let dx = -5; dx <= 5; dx++) {
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
const outsideCount = outside.reduce((a, b) => a + b, 0);
if (outsideCount < W * H * 0.15 || outsideCount > W * H * 0.75) {
  throw new Error(`mask looks wrong: ${outsideCount} of ${W * H}`);
}
for (let k = 0; k < W * H; k++) {
  if (outside[k]) px[k * 4 + 3] = 0;
}
await sharp(px, { raw: { width: W, height: H, channels: 4 } }).png().toFile(out);
console.log('wrote', out, 'outside', outsideCount);
