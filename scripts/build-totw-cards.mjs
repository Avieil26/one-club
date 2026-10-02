import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire('file:///C:/Users/aviel/AppData/Local/Temp/sharpbox/package.json');
const sharp = require('sharp');

const previewPath = 'C:/Users/aviel/.cursor/projects/c-Users-aviel-Desktop/assets/preview-totw-card.png';
const outDir = path.resolve('assets/images/cards');
const cacheDir = path.join(process.env.TEMP, 'totw-cache');
const W = 864;
const H = 1152;
const extra = process.argv[2] === 'extra';
const only = extra ? '' : (process.argv[2] || '');

let PLAYERS = [
  { id: 'olise', q: 'Michael Olise', eaId: 247827, rating: 91, position: 'RM', face: [84, 84, 90, 92, 48, 71] },
  { id: 'wilson', q: 'Sophia Wilson', eaId: 264012, rating: 89, position: 'ST', face: [92, 88, 81, 89, 46, 80] },
  { id: 'marquinhos', q: 'Marquinhos', eaId: 207865, rating: 88, position: 'CB', face: [76, 57, 76, 75, 90, 80] },
  { id: 'salah', q: 'Mohamed Salah', eaId: 209331, rating: 88, position: 'RM', face: [86, 84, 84, 88, 46, 74] },
  { id: 'semenyo', q: 'Antoine Semenyo', eaId: 241236, rating: 86, position: 'LM', face: [84, 86, 81, 85, 47, 82] },
  { id: 'ea-219683-corentin-tolisso', q: 'Corentin Tolisso', eaId: 219683, rating: 84, position: 'CM', face: [74, 81, 82, 80, 81, 84] },
  { id: 'ea-264388-moleiro', q: 'Moleiro', eaId: 264388, rating: 84, position: 'CAM', face: [88, 80, 80, 86, 53, 72] },
  { id: 'ea-223710-vedat-muriqi', q: 'Vedat Muriqi', eaId: 223710, rating: 83, position: 'ST', face: [75, 85, 70, 75, 35, 85] },
  { id: 'ea-243630-jonathan-david', q: 'Jonathan David', eaId: 243630, rating: 82, position: 'ST', face: [82, 83, 74, 81, 40, 75] },
  { id: 'ea-261865-miguel-gutierrez', q: 'Miguel Gutierrez', eaId: 261865, rating: 82, position: 'LB', face: [83, 74, 82, 80, 80, 74] },
  { id: 'ea-190765-pascal-gro', q: 'Pascal Gross', eaId: 190765, rating: 81, position: 'CDM', face: [70, 76, 86, 81, 73, 75] },
  { id: 'ea-273177-olivia-holdt', q: 'Olivia Holdt', eaId: 273177, rating: 81, position: 'LM', face: [78, 76, 77, 81, 59, 77] },
  { id: 'ea-70726-anis-hadj-moussa', q: 'Anis Hadj Moussa', eaId: 70726, rating: 80, position: 'RW', face: [82, 78, 74, 88, 34, 65] },
  { id: 'ea-80230-bella-andersson', q: 'Bella Andersson', eaId: 80230, rating: 80, position: 'CB', face: [72, 30, 62, 66, 80, 84] },
  { id: 'ea-188350-marco-reus', q: 'Marco Reus', eaId: 188350, rating: 80, position: 'CAM', face: [72, 83, 83, 82, 55, 65] },
  { id: 'ea-235134-pablo-rosario', q: 'Pablo Rosario', eaId: 235134, rating: 80, position: 'CDM', face: [73, 66, 72, 77, 80, 84] },
  { id: 'ea-237440-hannes-delcroix', q: 'Hannes Delcroix', eaId: 237440, rating: 80, position: 'CB', face: [77, 46, 72, 71, 80, 82] },
  { id: 'ea-238071-dujon-sterling', q: 'Dujon Sterling', eaId: 238071, rating: 80, position: 'RB', face: [80, 58, 74, 77, 79, 83] },
  { id: 'ea-261861-jack-moylan', q: 'Jack Moylan', eaId: 261861, rating: 80, position: 'CAM', face: [84, 80, 79, 81, 57, 75] },
  { id: 'ea-273567-chiara-hahn', q: 'Chiara Hahn', eaId: 273567, rating: 80, position: 'CDM', face: [82, 75, 76, 81, 75, 71] },
  { id: 'ea-276725-lorenzo-palmisani', q: 'Lorenzo Palmisani', eaId: 276725, rating: 82, position: 'GK', face: [82, 81, 80, 84, 40, 83] },
  { id: 'totw-salomon-rodriguez', q: 'Salomon Rodriguez', eaId: null, rating: 80, position: 'ST', face: [78, 82, 70, 75, 43, 80] },
];

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

function maskFrom(px) {
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
    if (d >= 28) continue;
    const x = k % W;
    const y = (k - x) / W;
    const next = [x > 0 ? k - 1 : -1, x + 1 < W ? k + 1 : -1, y > 0 ? k - W : -1, y + 1 < H ? k + W : -1];
    for (const n of next) {
      if (n < 0 || dist[n] <= d + 1) continue;
      dist[n] = d + 1;
      q.push(n);
    }
  }
  for (let k = 0; k < W * H; k++) if (dist[k] > 0 && dist[k] <= 26) rim[k] = 1;
  return { outside, rim, dist };
}

function textBox(x, y) {
  if (x >= 175 && x <= 330 && y >= 185 && y <= 380) return true;
  if (x >= 185 && x <= 340 && y >= 370 && y <= 620) return true;
  if (x >= 175 && x <= 720 && y >= 700 && y <= 960) return true;
  return false;
}

function assetUrl(imagePath, width) {
  return `https://game-assets.fut.gg/cdn-cgi/image/quality=95,format=png,width=${width}/${imagePath}`;
}

async function search(q) {
  const url = `https://www.fut.gg/api/fut/players/v2/search/?name=${encodeURIComponent(q)}&game=27`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const json = await res.json();
  return json.data || [];
}

function pick(rows, spec) {
  const totw = rows.filter((p) => p.rarityName === 'Team of the week' && String(p.game) === '27');
  return (
    totw.find((p) => p.overall === spec.rating && (spec.eaId == null || p.basePlayerEaId === spec.eaId)) ||
    totw.find((p) => spec.eaId == null || p.basePlayerEaId === spec.eaId) ||
    totw[0] ||
    null
  );
}

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(file, buf);
  return buf;
}

function cardSvg(spec, cardName) {
  const labels = spec.position === 'GK' ? ['DIV', 'HAN', 'KIC', 'REF', 'SPD', 'POS'] : ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'];
  const xs = [198, 292, 386, 480, 574, 668];
  const name = (cardName || spec.q.split(' ').slice(-1)[0]).toUpperCase();
  const nameSize = name.length > 12 ? 42 : name.length > 9 ? 52 : 64;
  const stats = spec.face.map((n, i) => `<text x="${xs[i]}" y="928" font-size="54" text-anchor="middle">${n}</text>`).join('');
  const heads = labels.map((label, i) => `<text x="${xs[i]}" y="868" font-size="22" text-anchor="middle" fill="#d4b56a">${label}</text>`).join('');
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <style>
      text { font-family: 'Arial Narrow', Arial, sans-serif; font-weight: 700; fill: #f4d78a; }
    </style>
    <text x="246" y="268" font-size="118" text-anchor="middle">${spec.rating}</text>
    <text x="246" y="328" font-size="40" text-anchor="middle">${spec.position}</text>
    <text x="432" y="792" font-size="${nameSize}" text-anchor="middle" letter-spacing="2">${name}</text>
    ${heads}
    ${stats}
  </svg>`);
}

const preview = extra
  ? null
  : await sharp(previewPath).ensureAlpha().raw().toBuffer();
const shellFile = path.join(outDir, 'totw-shell.png');
const shellSource = extra
  ? await sharp(shellFile).ensureAlpha().resize(W, H, { fit: 'fill' }).raw().toBuffer()
  : preview;
const { outside, rim, dist } = maskFrom(shellSource);
let shell;
if (extra) {
  shell = Buffer.from(shellSource);
  PLAYERS = JSON.parse(await readFile('assets/data/totw3-specs.json', 'utf8'));
  console.log('extra cards', PLAYERS.length);
} else {
  shell = Buffer.from(preview);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const k = y * W + x;
      const i = k * 4;
      if (outside[k]) {
        shell[i + 3] = 0;
        continue;
      }
      if (rim[k]) continue;
      const r = shell[i];
      const g = shell[i + 1];
      const b = shell[i + 2];
      const keepArt = isLine(r, g, b) && ((y < 400 && x > 680) || (x > 610 && x < 730 && y > 185 && y < 240 && r > 185));
      if (keepArt) continue;
      shell[i] = 8;
      shell[i + 1] = 6;
      shell[i + 2] = 4;
      shell[i + 3] = 255;
    }
  }
  await sharp(shell, { raw: { width: W, height: H, channels: 4 } }).png().toFile(shellFile);
  console.log('shell ready');
}
await mkdir(cacheDir, { recursive: true });

const jobs = PLAYERS.filter((p) => !only || p.id === only);
for (const spec of jobs) {
  const rows = await search(spec.q);
  const hit = pick(rows, spec);
  if (!hit) {
    console.log('MISSING', spec.id);
    continue;
  }
  console.log(spec.id, hit.overall, hit.position, hit.cardName, hit.eaId);
  const renderUrl = assetUrl(hit.imagePath, 900);
  const nationUrl = hit.nation?.imagePath ? assetUrl(hit.nation.imagePath, 160) : null;
  const clubUrl = hit.club?.imagePath ? assetUrl(hit.club.imagePath, 200) : null;
  const renderBuf = await download(renderUrl, path.join(cacheDir, `${spec.id}-render.png`));
  const trimmed = await sharp(renderBuf).ensureAlpha().trim({ threshold: 12 }).png().toBuffer();
  const tmeta = await sharp(trimmed).metadata();
  const scale = Math.min(580 / tmeta.height, 500 / tmeta.width);
  const targetW = Math.max(1, Math.round(tmeta.width * scale));
  const targetH = Math.max(1, Math.round(tmeta.height * scale));
  const playerRaw = await sharp(trimmed).resize(targetW, targetH).ensureAlpha().raw().toBuffer();
  const left = Math.round(490 - targetW * 0.46);
  const top = Math.max(160, 750 - targetH);
  for (let py = 0; py < targetH; py++) {
    for (let px = 0; px < targetW; px++) {
      const x = left + px;
      const y = top + py;
      const pi = (py * targetW + px) * 4;
      if (x < 0 || y < 0 || x >= W || y >= H || dist[y * W + x] < 32 || y > 755) {
        playerRaw[pi + 3] = 0;
      }
    }
  }
  const player = await sharp(playerRaw, { raw: { width: targetW, height: targetH, channels: 4 } }).png().toBuffer();

  const layers = [{ input: player, left, top }];
  if (nationUrl) {
    const flag = await sharp(await download(nationUrl, path.join(cacheDir, `${spec.id}-flag.png`)))
      .resize(92, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    layers.push({ input: flag, left: 200, top: 352 });
  }
  if (clubUrl) {
    const crest = await sharp(await download(clubUrl, path.join(cacheDir, `${spec.id}-crest.png`)))
      .resize(112, 112, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    layers.push({ input: crest, left: 190, top: 440 });
  }
  layers.push({ input: cardSvg(spec, hit.cardName), left: 0, top: 0 });

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
    const frame = rim[k] && isGold(shell[i], shell[i + 1], shell[i + 2]);
    const totwWord = x >= 560 && x <= 730 && y >= 155 && y <= 255 && isLine(shell[i], shell[i + 1], shell[i + 2]);
    const covered = composed[i + 3] > 200 && Math.max(composed[i], composed[i + 1], composed[i + 2]) > 36;
    if (totwWord && covered) continue;
    if (!frame && !totwWord) continue;
    composed[i] = shell[i];
    composed[i + 1] = shell[i + 1];
    composed[i + 2] = shell[i + 2];
    composed[i + 3] = shell[i + 3];
  }

  const file = path.join(outDir, `${spec.id}-totw.png`);
  await sharp(composed, { raw: { width: W, height: H, channels: 4 } }).png().toFile(file);
  console.log('wrote', file);
}

const raphinhaPath = path.join(outDir, 'raphinha-totw-built.png');
const raphinha = await sharp(raphinhaPath).ensureAlpha().raw().toBuffer();
for (let k = 0; k < W * H; k++) {
  if (dist[k] > 18) continue;
  const i = k * 4;
  if (isGold(raphinha[i], raphinha[i + 1], raphinha[i + 2])) continue;
  raphinha[i + 3] = 0;
}
await sharp(raphinha, { raw: { width: W, height: H, channels: 4 } }).png().toFile(raphinhaPath);
console.log('clipped raphinha');
