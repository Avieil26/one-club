import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire('file:///C:/Users/aviel/AppData/Local/Temp/sharpbox/package.json');
const sharp = require('sharp');

const previewPath = 'C:/Users/aviel/.cursor/projects/c-Users-aviel-Desktop/assets/preview-hero-card.png';
const outDir = path.resolve('assets/images/cards');
const cacheDir = path.join(process.env.TEMP, 'hero-img');
const W = 864;
const H = 1152;
const only = process.argv[2] || '';

const details = JSON.parse(await readFile('assets/data/heroDetails.json', 'utf8'));

function isFrame(r, g, b) {
  return b > 90 && r > 70 && b > g + 15 && r + b > g + 80;
}
function isBolt(r, g, b) {
  return b > 105 && b > g + 20 && r > 45 && b + 15 > r;
}
function isDark(r, g, b) {
  return r < 85 && g < 70 && b < 120 && Math.max(r, g, b) - Math.min(r, g, b) < 90;
}
function inContent(x, y) {
  if (x >= 150 && x <= 370 && y >= 165 && y <= 570) return true;
  if (x >= 250 && x <= 730 && y >= 150 && y <= 720) return true;
  if (x >= 150 && x <= 760 && y >= 690 && y <= 990) return true;
  return false;
}
function isHeroWord(x, y, r, g, b) {
  return x > 600 && x < 760 && y > 145 && y < 250 && r > 170 && g > 150 && b > 130;
}

function maskFrom(px) {
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
  const rim = new Uint8Array(W * H);
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
    if (d >= 30) continue;
    const x = k % W;
    const y = (k - x) / W;
    const next = [x > 0 ? k - 1 : -1, x + 1 < W ? k + 1 : -1, y > 0 ? k - W : -1, y + 1 < H ? k + W : -1];
    for (const n of next) {
      if (n < 0 || dist[n] <= d + 1) continue;
      dist[n] = d + 1;
      q.push(n);
    }
  }
  for (let k = 0; k < W * H; k++) if (dist[k] > 0 && dist[k] <= 28) rim[k] = 1;
  return { outside, rim, dist };
}

function cardSvg(spec) {
  const labels = spec.position === 'GK' ? ['DIV', 'HAN', 'KIC', 'REF', 'SPD', 'POS'] : ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'];
  const nums = [spec.face.pac, spec.face.sho, spec.face.pas, spec.face.dri, spec.face.def, spec.face.phy];
  const xs = [198, 292, 386, 480, 574, 668];
  const raw = (spec.cardName || '').normalize('NFD').replace(/\p{M}/gu, '');
  const parts = raw.split(' ').filter(Boolean);
  const particles = new Set(['di', 'de', 'da', 'al', 'van', 'el']);
  const name = (spec.id === 'hero-parkjisung'
    ? 'PARK'
    : parts.length >= 2 && particles.has(parts[parts.length - 2].toLowerCase())
      ? parts.slice(-2).join(' ')
      : parts[parts.length - 1] || raw
  ).toUpperCase();
  const nameSize = name.length > 12 ? 42 : name.length > 9 ? 52 : 64;
  const stats = nums.map((n, i) => `<text x="${xs[i]}" y="928" font-size="54" text-anchor="middle">${n}</text>`).join('');
  const heads = labels.map((label, i) => `<text x="${xs[i]}" y="868" font-size="22" text-anchor="middle" fill="#d9c9a4">${label}</text>`).join('');
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <style>
      text { font-family: 'Arial Narrow', Arial, sans-serif; font-weight: 700; fill: #f6efe0; }
    </style>
    <text x="246" y="268" font-size="118" text-anchor="middle">${spec.rating}</text>
    <text x="246" y="328" font-size="40" text-anchor="middle">${spec.position}</text>
    <text x="432" y="792" font-size="${nameSize}" text-anchor="middle" letter-spacing="2">${name}</text>
    ${heads}
    ${stats}
  </svg>`);
}

function assetUrl(imagePath, width) {
  return `https://game-assets.fut.gg/cdn-cgi/image/quality=95,format=png,width=${width}/${imagePath}`;
}

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(file, buf);
  return buf;
}

async function cutout(buf) {
  const base = sharp(buf).ensureAlpha();
  const meta = await base.metadata();
  const raw = await base.raw().toBuffer();
  const w = meta.width;
  const corner = raw[3];
  if (corner > 200 && raw[1] > raw[0] + 25 && raw[1] > raw[2] + 25) {
    for (let i = 0; i < raw.length; i += 4) {
      if (raw[i + 1] > raw[i] + 25 && raw[i + 1] > raw[i + 2] + 25) raw[i + 3] = 0;
    }
    return sharp(raw, { raw: { width: w, height: meta.height, channels: 4 } }).trim({ threshold: 8 }).png().toBuffer();
  }
  return sharp(buf).ensureAlpha().trim({ threshold: 12 }).png().toBuffer();
}

const preview = await sharp(previewPath).ensureAlpha().raw().toBuffer();
const { outside, rim, dist } = maskFrom(preview);
const outsideCount = outside.reduce((a, b) => a + b, 0);
if (outsideCount < W * H * 0.15 || outsideCount > W * H * 0.75) {
  throw new Error(`mask looks wrong: ${outsideCount}`);
}
const shell = Buffer.from(preview);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const k = y * W + x;
    const i = k * 4;
    if (outside[k]) {
      shell[i + 3] = 0;
      continue;
    }
    const r = shell[i];
    const g = shell[i + 1];
    const b = shell[i + 2];
    if (rim[k] || isBolt(r, g, b) || isHeroWord(x, y, r, g, b)) continue;
    if (isDark(r, g, b) && !inContent(x, y)) continue;
    shell[i] = 18;
    shell[i + 1] = 10;
    shell[i + 2] = 36;
    shell[i + 3] = 255;
  }
}
await mkdir(cacheDir, { recursive: true });
await sharp(shell, { raw: { width: W, height: H, channels: 4 } }).png().toFile(path.join(cacheDir, 'hero-shell.png'));
console.log('shell ready', outsideCount);

const jobs = details.filter((row) => row.imagePath && row.face && (!only || row.id === only));
const built = [];
for (const spec of jobs) {
  const renderBuf = await download(assetUrl(spec.imagePath, 800), path.join(cacheDir, `${spec.id}.png`));
  const trimmed = await cutout(renderBuf);
  const tmeta = await sharp(trimmed).metadata();
  const scale = Math.min(560 / tmeta.height, 430 / tmeta.width);
  const targetW = Math.max(1, Math.round(tmeta.width * scale));
  const targetH = Math.max(1, Math.round(tmeta.height * scale));
  const playerRaw = await sharp(trimmed).resize(targetW, targetH).ensureAlpha().raw().toBuffer();
  const left = Math.max(330, Math.round(545 - targetW / 2));
  const top = Math.max(155, 690 - targetH);
  for (let py = 0; py < targetH; py++) {
    for (let px = 0; px < targetW; px++) {
      const x = left + px;
      const y = top + py;
      const pi = (py * targetW + px) * 4;
      if (x < 0 || y < 0 || x >= W || y >= H || dist[y * W + x] < 30 || y > 720) playerRaw[pi + 3] = 0;
      else if (y > 640) playerRaw[pi + 3] = Math.round(playerRaw[pi + 3] * (1 - (y - 640) / 80));
    }
  }
  const player = await sharp(playerRaw, { raw: { width: targetW, height: targetH, channels: 4 } }).png().toBuffer();
  const layers = [{ input: player, left, top }];
  if (spec.nationImage) {
    const flag = await sharp(await download(assetUrl(spec.nationImage, 160), path.join(cacheDir, `${spec.id}-flag.png`)))
      .resize(92, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    layers.push({ input: flag, left: 200, top: 352 });
  }
  if (spec.leagueImage) {
    const crest = await sharp(await download(assetUrl(spec.leagueImage, 200), path.join(cacheDir, `${spec.id}-league.png`)))
      .resize(108, 108, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    layers.push({ input: crest, left: 192, top: 430 });
  }
  layers.push({ input: cardSvg(spec), left: 0, top: 0 });
  const composed = await sharp(shell, { raw: { width: W, height: H, channels: 4 } })
    .composite(layers)
    .ensureAlpha()
    .raw()
    .toBuffer();
  for (let k = 0; k < W * H; k++) {
    const i = k * 4;
    if (outside[k]) {
      composed[i + 3] = 0;
      continue;
    }
    const x = k % W;
    const y = (k - x) / W;
    const frame = rim[k] && isFrame(shell[i], shell[i + 1], shell[i + 2]);
    const word = isHeroWord(x, y, shell[i], shell[i + 1], shell[i + 2]);
    const covered = composed[i + 3] > 200 && Math.max(composed[i], composed[i + 1], composed[i + 2]) > 40;
    if (word && covered) continue;
    if (!frame && !word) continue;
    composed[i] = shell[i];
    composed[i + 1] = shell[i + 1];
    composed[i + 2] = shell[i + 2];
    composed[i + 3] = shell[i + 3];
  }
  const file = path.join(outDir, `${spec.id}.png`);
  await sharp(composed, { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 9 }).toFile(file);
  built.push(spec.id);
  console.log('wrote', spec.id, tmeta.width, tmeta.height);
}

if (!only) {
  const lines = built.map((id) => `  '${id}': require('@/assets/images/cards/${id}.png'),`).join('\n');
  await writeFile(
    path.resolve('lib/heroArt.ts'),
    `/** Baked hero cards. Generated by scripts/build-hero-cards.mjs */\nexport const HERO_ART: Record<string, number> = {\n${lines}\n};\n`,
  );
  console.log('art map', built.length);
}
