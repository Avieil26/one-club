import { evaluateSquad, formationById } from '../lib/chemistry';
import { PLAYERS } from '../lib/fcPlayers';
import { officialChallenges, placedPreview } from '../lib/sbcCatalog';

const ids = new Set<string>();
for (const player of PLAYERS) {
  if (ids.has(player.id)) throw new Error(`duplicate player ${player.id}`);
  ids.add(player.id);
  if (!player.name || player.rating < 45 || player.rating > 99) throw new Error(`bad player ${player.id}`);
}

for (const challenge of officialChallenges) {
  if (!challenge.previewSquad) continue;
  const placed = placedPreview(challenge.previewSquad);
  const missing = Object.entries(challenge.previewSquad).filter(([, id]) => !PLAYERS.some((player) => player.id === id));
  if (missing.length) throw new Error(`${challenge.id} missing ${missing.map(([, id]) => id).join(', ')}`);
  const report = evaluateSquad(formationById(challenge.previewFormation === '442' ? '442' : '433'), placed, challenge.rules);
  if (!report.ready) {
    throw new Error(`${challenge.id} failed: ${report.checks.filter((check) => !check.ok).map((check) => check.label).join(', ')}`);
  }
  console.log(`${challenge.id} chem ${report.chemistry} rating ${report.rating} nations ${report.nations}`);
}
