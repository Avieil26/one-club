import { readFile, writeFile, stat, unlink } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const BASE_URL = 'https://www.fut.gg';
const HEADERS = { 'user-agent': 'Mozilla/5.0', accept: 'application/json', referer: BASE_URL };
const TOTW_ART_START = '  // BEGIN GENERATED TOTW 5 ART';
const TOTW_ART_END = '  // END GENERATED TOTW 5 ART';

const ATTRS = [
  'Acceleration', 'SprintSpeed', 'Positioning', 'Finishing', 'ShotPower', 'LongShots', 'Volleys', 'Penalties',
  'Vision', 'Crossing', 'FkAccuracy', 'ShortPassing', 'LongPassing', 'Curve', 'Agility', 'Balance', 'Reactions',
  'BallControl', 'Dribbling', 'Composure', 'Interceptions', 'HeadingAccuracy', 'DefensiveAwareness',
  'StandingTackle', 'SlidingTackle', 'Jumping', 'Stamina', 'Strength', 'Aggression',
  'GkDiving', 'GkHandling', 'GkKicking', 'GkReflexes', 'GkPositioning',
];

// Confirmed TOTW 5, released 14 Oct 2026. Expected OVR guards prevent importing an older item by mistake.
const TOTW5 = [
  { query: 'Patri Guijarro', rating: 89 },
  { query: 'Alessia Russo', rating: 89 },
  { query: 'Elliot Anderson', rating: 85 },
  { query: 'Isco', rating: 84 },
  { query: 'Florian Thauvin', rating: 84 },
  { query: 'Ollie Watkins', rating: 84 },
  { query: 'Cristian Romero', rating: 84 },
  { query: 'Lineth Beerensteyn', rating: 84 },
  { query: 'Christopher Nkunku', rating: 82 },
  { query: 'Tijjani Noslin', rating: 82 },
  { query: 'Melissa Kössler', rating: 81 },
  { query: 'André Henrique', rating: 80 },
  { query: 'Jordan Henderson', rating: 80 },
  { query: 'Frank Acheampong', rating: 80 },
  { query: 'Adriel Ba Loua', rating: 80 },
  { query: 'Jaminton Campaz', rating: 80 },
  { query: 'Carlo Holse', rating: 80 },
  { query: 'Bryan Reynolds', rating: 80 },
  { query: 'Marco Rente', rating: 80 },
  { query: 'Nicolò Cambiaghi', rating: 80 },
  { query: 'Pierce Charles', rating: 80 },
  { query: 'Samuel Dahl', rating: 80 },
  { query: 'Sidiki Chérif', rating: 80 },
];

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function getJson(url, headers = HEADERS) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`HTTP ${response.status} while fetching ${url}`);
  return response.json();
}

async function search(name) {
  const url = `${BASE_URL}/api/fut/players/v2/search/?name=${encodeURIComponent(name)}&game=27`;
  const json = await getJson(url);
  return json.data ?? [];
}

function isTotw27(card) {
  return /team of the week|\btotw\b/i.test(card.rarityName ?? '') && String(card.game) === '27';
}

function cardMatchesName(card, spec) {
  const wanted = normalize(spec.query);
  const lastName = wanted.split(' ').at(-1);
  const labels = [card.commonName, card.cardName, card.name, card.playerName].map(normalize).filter(Boolean);
  return labels.some((label) =>
    label === wanted || label === lastName || wanted.endsWith(` ${label}`) || label.endsWith(` ${lastName}`),
  );
}

async function findTotwCard(spec) {
  const withoutDiacritics = spec.query.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const lastName = spec.query.trim().split(/\s+/).at(-1);
  const queries = [...new Set([spec.query, withoutDiacritics, lastName].filter(Boolean))];
  for (const query of queries) {
    const rows = await search(query);
    const matches = rows.filter((card) => isTotw27(card) && Number(card.overall) === spec.rating);
    const hit = matches.find((card) => cardMatchesName(card, spec));
    if (hit) return hit;
  }
  return null;
}

function faceOf(hit) {
  const face = hit.faceStatsV2 ?? {};
  const goalkeeper = hit.position === 'GK';
  const result = {
    ovr: Number(hit.overall),
    pac: Number(goalkeeper ? face.gkFaceDiving : face.facePace),
    sho: Number(goalkeeper ? face.gkFaceHandling : face.faceShooting),
    pas: Number(goalkeeper ? face.gkFaceKicking : face.facePassing),
    dri: Number(goalkeeper ? face.gkFaceReflexes : face.faceDribbling),
    def: Number(goalkeeper ? face.gkFaceSpeed : face.faceDefending),
    phy: Number(goalkeeper ? face.gkFacePositioning : face.facePhysicality),
  };
  if (Object.values(result).some((value) => !Number.isFinite(value))) {
    throw new Error(`FUT.GG did not return a complete face-stat row for ${hit.cardName ?? hit.commonName}`);
  }
  return result;
}

function parseAttrs(html) {
  const start = html.indexOf('attributeAcceleration:');
  if (start < 0) return null;
  const slice = html.slice(start, start + 2400);
  const raw = {};
  for (const match of slice.matchAll(/attribute([A-Za-z]+):(\d+)/g)) {
    if (raw[match[1]] == null) raw[match[1]] = Number(match[2]);
  }
  const present = ATTRS.filter((name) => raw[name] != null).length;
  if (present !== ATTRS.length) return null;
  return ATTRS.map((name) => raw[name]);
}

function parsePlaystyles(html, plusCount) {
  const start = html.indexOf('flex flex-row gap-2 justify-center flex-wrap max-w-full');
  if (start < 0) return [];
  const block = html.slice(start, start + 120000);
  const names = [...block.matchAll(/<div title="([^"]+)">/g)]
    .map((match) => match[1])
    .filter((title) => title.length < 28);
  return names.slice(0, plusCount + 12).map((name, index) => ({ name, plus: index < plusCount }));
}

async function fetchFullCard(spec, rosterByEaId) {
  const hit = await findTotwCard(spec);
  if (!hit) throw new Error(`TOTW 5 card missing or OVR mismatch: ${spec.query} ${spec.rating}`);
  const base = rosterByEaId.get(Number(hit.basePlayerEaId));
  if (!base) {
    throw new Error(`No matching regular-card entry for ${spec.query} (base EA ID ${hit.basePlayerEaId}). No data will be written.`);
  }
  const page = await fetch(`${BASE_URL}${hit.url}`, {
    headers: { 'user-agent': 'Mozilla/5.0', accept: 'text/html' },
  });
  if (!page.ok) throw new Error(`Could not load the full TOTW card page for ${spec.query}: HTTP ${page.status}`);
  const html = await page.text();
  // FUT.GG marks the current week's item with its release timestamp. Reject an older TOTW
  // for the same player even if its rating happens to match this week's item.
  if (!/Oct(?:ober)?\s+14,\s+2026/i.test(html)) {
    throw new Error(`Selected card for ${spec.query} is not verified as added on 14 Oct 2026 (current TOTW 5). No data will be written.`);
  }
  const attrs = parseAttrs(html);
  if (!attrs) throw new Error(`Full detailed attributes were not available for ${spec.query}; refusing to fall back to the regular card stats.`);

  const face = faceOf(hit);
  const positions = [hit.position, ...(hit.alternativePositions ?? [])]
    .filter((position, index, all) => position && all.indexOf(position) === index);
  const playstyles = parsePlaystyles(html, (hit.playStylePlusEaIds ?? []).length);
  const created = {
    baseId: base.id,
    position: hit.position,
    rating: Number(hit.overall),
    face,
    ...(positions.length ? { positions } : {}),
    ...(playstyles.length ? { playstyles } : {}),
  };
  const foot = hit.foot === 'Left' ? 'L' : hit.foot === 'Right' ? 'R' : null;
  const meta = {
    foot,
    sm: Number(hit.skillMoves),
    wf: Number(hit.weakFoot),
    attrs,
  };
  if (!meta.foot || !Number.isInteger(meta.sm) || meta.sm < 1 || meta.sm > 5 || !Number.isInteger(meta.wf) || meta.wf < 1 || meta.wf > 5) {
    throw new Error(`Incomplete foot / skill-move / weak-foot data for ${spec.query}; refusing a partial import.`);
  }
  return {
    id: base.id,
    row: created,
    meta,
    rating: Number(hit.overall),
    position: hit.position,
    query: spec.query,
    baseEaId: Number(hit.basePlayerEaId),
    cardEaId: Number(hit.eaId),
    q: base.en || base.name || spec.query,
  };
}

async function fetchPrices(cardEaIds) {
  const headers = { 'user-agent': 'Mozilla/5.0', accept: 'application/json', referer: BASE_URL };
  const manifest = await getJson('https://r2.fut.gg/27/manifest.json', headers);
  const version = manifest._version;
  const url = (name) => `https://r2.fut.gg/27/${name}.v${version}.${manifest[name]}.json`;
  const [index, ps, pc] = await Promise.all([
    getJson(url('player-prices-index'), headers),
    getJson(url('player-prices-ps5'), headers),
    getJson(url('player-prices-pc'), headers),
  ]);
  const wanted = new Set(cardEaIds.map(Number));
  const prices = new Map();
  let current = Number(index.id0);
  if (wanted.has(current) && ps.s[0] === 0) prices.set(current, [ps.p[0] || 0, pc.p[0] || 0]);
  for (let indexPosition = 0; indexPosition < index.d.length; indexPosition++) {
    current += Number(index.d[indexPosition]);
    const rowIndex = indexPosition + 1;
    if (!wanted.has(current) || ps.s[rowIndex] !== 0) continue;
    prices.set(current, [ps.p[rowIndex] || 0, pc.p[rowIndex] || 0]);
  }
  return prices;
}

async function main() {
  const players = await readJson('assets/data/players.json');
  const existingTotw = await readJson('assets/data/totw.json');
  const meta = await readJson('assets/data/totwCardMeta.json');
  const priceTable = await readJson('assets/data/marketPrices.json');
  const priceEaIds = await readJson('assets/data/priceEaIds.json');
  const shine = await readJson('assets/data/totwShine.json');
  const portraitPath = 'components/PortraitCard.tsx';
  const portraitSource = await readFile(portraitPath, 'utf8');
  if (!portraitSource.includes(TOTW_ART_START) || !portraitSource.includes(TOTW_ART_END)) {
    throw new Error('TOTW 5 art markers are missing from PortraitCard.tsx. No files were changed.');
  }

  const rosterByEaId = new Map(players.filter((player) => player.eaId != null).map((player) => [Number(player.eaId), player]));
  const found = new Array(TOTW5.length);
  const errors = [];
  let cursor = 0;
  async function worker() {
    while (cursor < TOTW5.length) {
      const index = cursor++;
      try {
        found[index] = await fetchFullCard(TOTW5[index], rosterByEaId);
        const row = found[index];
        console.log(`Verified ${index + 1}/${TOTW5.length}: ${row.query} — ${row.rating} ${row.position}; 34-stat metadata ready`);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }
  }
  await Promise.all([worker(), worker(), worker()]);
  if (errors.length || found.some((row) => !row)) {
    console.error('\nTOTW 5 import stopped before changing the catalogue:');
    for (const error of errors) console.error(` - ${error}`);
    throw new Error(`Could not verify all ${TOTW5.length} cards. Fix the missing data before trying again.`);
  }
  if (found.length !== 23 || new Set(found.map((row) => row.id)).size !== 23 || new Set(found.map((row) => row.cardEaId)).size !== 23) {
    throw new Error('TOTW 5 returned duplicate or incomplete player identifiers. No catalogue files were changed.');
  }

  const specs = found.map((row) => ({
    id: row.id,
    q: row.q,
    eaId: row.baseEaId,
    cardEaId: row.cardEaId,
    rating: row.rating,
    position: row.position,
    face: [row.row.face.pac, row.row.face.sho, row.row.face.pas, row.row.face.dri, row.row.face.def, row.row.face.phy],
  }));
  const specsPath = 'assets/data/totw5-specs.json';
  await writeFile(specsPath, JSON.stringify(specs));
  const build = spawnSync(process.execPath, ['scripts/build-totw-cards.mjs', 'extra', 'totw5-specs.json'], {
    stdio: 'inherit',
    windowsHide: true,
  });
  if (build.error) throw build.error;
  if (build.status !== 0) throw new Error('TOTW 5 card-art build failed. The live catalogue and PortraitCard mapping have not been updated.');
  const cardDir = 'assets/images/cards';
  for (const row of found) {
    const output = path.join(cardDir, `${row.id}-totw.png`);
    const info = await stat(output).catch(() => null);
    if (!info?.size) throw new Error(`Missing generated art for ${row.query}: ${output}. Catalogue files have not been updated.`);
  }

  let livePrices = new Map();
  try {
    livePrices = await fetchPrices(found.map((row) => row.cardEaId));
  } catch (error) {
    console.warn('Price refresh skipped; player ratings and full stats will still be imported:', error instanceof Error ? error.message : String(error));
  }

  const newIds = new Set(found.map((row) => row.id));
  const mergedTotw = existingTotw.filter((row) => !row.baseId || !newIds.has(row.baseId));
  mergedTotw.push(...found.map((row) => row.row));
  for (const row of found) {
    meta[row.id] = row.meta;
    const key = `${row.id}--totw`;
    priceEaIds[key] = row.cardEaId;
    const quote = livePrices.get(row.cardEaId);
    if (quote && (quote[0] > 0 || quote[1] > 0)) priceTable[key] = quote;
    shine[row.id] = row.rating >= 88 ? 'pristine' : 'holographic';
  }
  const artLines = found.map((row) => `  '${row.id}': require('@/assets/images/cards/${row.id}-totw.png'),`).join('\n');
  const artBlock = `${TOTW_ART_START}\n${artLines}\n${TOTW_ART_END}`;
  const nextPortrait = portraitSource.replace(
    /  \/\/ BEGIN GENERATED TOTW 5 ART[\s\S]*?  \/\/ END GENERATED TOTW 5 ART/,
    artBlock,
  );
  if (nextPortrait === portraitSource) throw new Error('Could not replace the generated-art map. No JSON catalogue files were written.');

  await writeFile('assets/data/totw.json', JSON.stringify(mergedTotw));
  await writeFile('assets/data/totwCardMeta.json', JSON.stringify(meta));
  await writeFile('assets/data/marketPrices.json', JSON.stringify(priceTable));
  await writeFile('assets/data/priceEaIds.json', JSON.stringify(priceEaIds));
  await writeFile('assets/data/totwShine.json', JSON.stringify(shine));
  await writeFile(portraitPath, nextPortrait);
  await unlink(specsPath).catch(() => undefined);

  console.log('\nDONE: TOTW 5 imported without replacing the regular player rows.');
  console.log(`Players added/updated: ${found.length}; full detailed attribute sets: ${found.length} × 34; TOTW art PNGs: ${found.length}.`);
  console.log('Updated: assets/data/totw.json, assets/data/totwCardMeta.json, assets/data/marketPrices.json, assets/data/priceEaIds.json, assets/data/totwShine.json, components/PortraitCard.tsx, assets/images/cards/*-totw.png');
  console.log('Next: run npm run typecheck and npm run lint, then inspect the Preview before merging.');
}

main().catch((error) => {
  console.error('\nTOTW 5 import failed:', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
