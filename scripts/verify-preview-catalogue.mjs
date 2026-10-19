import fs from 'node:fs';
import path from 'node:path';

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(process.cwd(), file), 'utf8'));
const players = readJson('assets/data/players.json');
const heroes = readJson('assets/data/heroes.json');
const totw = readJson('assets/data/totw.json');
const starPerformers = readJson('assets/data/starPerformers.json');
const futureStars = readJson('assets/data/futureStars.json');
const destined = readJson('assets/data/destinedEditions.json');

const iconSource = fs.readFileSync('lib/iconPlayers.ts', 'utf8');
const iconIds = [...iconSource.matchAll(/\bid:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
if (!iconIds.length) throw new Error('Could not read ICON_PLAYERS IDs.');
const iconSet = new Set(iconIds);
const regularIds = new Set(players.map((p) => p.id));
const heroIds = new Set(heroes.map((p) => p.id));
const standaloneTotw = totw.filter((p) => !p.baseId && p.id);
const specialSource = fs.readFileSync('lib/specialCards.ts', 'utf8');
const otwBlock = specialSource.match(/const OTW_CARDS:[\s\S]*?= \{([\s\S]*?)\n\};/);
if (!otwBlock) throw new Error('Could not read OTW_CARDS map.');
const otwIds = [...otwBlock[1].matchAll(/^\s*'([^']+)':\s*\{/gm)].map((m) => m[1]);

const databaseIds = [
  ...players.filter((p) => !iconSet.has(p.id)).map((p) => p.id),
  ...iconIds,
  ...heroes.map((p) => p.id),
  ...standaloneTotw.map((p) => p.id),
  ...starPerformers.filter((p) => !regularIds.has(p.baseId) && !iconSet.has(p.baseId) && !heroIds.has(p.baseId)).map((p) => `${p.baseId}--star-performer`),
];

// Promo data with no matching base card must still be represented as a real catalogue row.
const knownBaseIds = new Set(databaseIds);
const orphanFutureStars = futureStars.filter((p) => !knownBaseIds.has(p.baseId));
const orphanTotw = totw.filter((p) => p.baseId && !knownBaseIds.has(p.baseId));
databaseIds.push(
  ...orphanFutureStars.map((p) => `${p.baseId}--future-stars`),
  ...orphanTotw.map((p) => `${p.baseId}--totw`),
);

const keys = {
  destined: new Set(Object.keys(destined)),
  totw: new Set(totw.filter((p) => p.baseId).map((p) => p.baseId)),
  futureStars: new Set(futureStars.map((p) => p.baseId)),
  starPerformers: new Set(starPerformers.map((p) => p.baseId)),
  otw: new Set(otwIds),
};
let promoRows = 0;
for (const id of databaseIds) {
  for (const set of Object.values(keys)) if (set.has(id)) promoRows += 1;
}
const total = databaseIds.length + promoRows;
console.log(JSON.stringify({
  expected: 20118,
  calculated: total,
  databaseRows: databaseIds.length,
  promoRows,
  orphanFutureStars: orphanFutureStars.length,
  orphanTotw: orphanTotw.length,
  rosterRows: players.length,
  totwRows: totw.length,
  futureStarsRows: futureStars.length,
  starPerformersRows: starPerformers.length,
}, null, 2));
if (starPerformers.length !== 6) throw new Error(`Expected 6 Star Performers, found ${starPerformers.length}`);
if (futureStars.length !== 15) throw new Error(`Expected 15 Future Stars, found ${futureStars.length}`);
if (totw.length !== 69) throw new Error(`Expected 69 TOTW rows, found ${totw.length}`);
if (total !== 20118) throw new Error(`Catalogue count mismatch: expected 20118, got ${total}. Refusing to validate this Preview candidate.`);
