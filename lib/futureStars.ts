/** Live EA FC 27 Future Stars Team 1 card data, linked to the existing roster IDs. */
export type FutureStarData = {
  rating: number;
  position: string;
  face: { ovr: number; pac: number; sho: number; pas: number; dri: number; def: number; phy: number };
  positions?: string[];
};

const FUTURE_STARS: Record<string, FutureStarData> = {
  'ea-271446-vicky-lopez': { rating: 90, position: 'RW', face: { ovr: 90, pac: 90, sho: 86, pas: 87, dri: 91, def: 54, phy: 66 }, positions: ['RW', 'LW', 'CAM'] },
  'ea-80376-rio-ngumoha': { rating: 89, position: 'LM', face: { ovr: 89, pac: 93, sho: 85, pas: 82, dri: 88, def: 52, phy: 63 }, positions: ['LM', 'LW', 'RM'] },
  'ea-278773-myles-lewisskelly': { rating: 88, position: 'CDM', face: { ovr: 88, pac: 80, sho: 70, pas: 84, dri: 86, def: 85, phy: 88 }, positions: ['CDM', 'LB', 'CM'] },
  'ea-258378-mika-godts': { rating: 88, position: 'LW', face: { ovr: 88, pac: 88, sho: 84, pas: 83, dri: 89, def: 52, phy: 75 }, positions: ['LW', 'LM', 'RW'] },
  'ea-70966-jacobo-ramon': { rating: 87, position: 'CB', face: { ovr: 87, pac: 80, sho: 52, pas: 65, dri: 70, def: 89, phy: 85 }, positions: ['CB'] },
  'ea-79399-gilberto-mora': { rating: 87, position: 'CAM', face: { ovr: 87, pac: 86, sho: 82, pas: 87, dri: 89, def: 56, phy: 62 }, positions: ['CAM', 'CM', 'CF'] },
  'ea-259565-yoan-bonny': { rating: 87, position: 'ST', face: { ovr: 87, pac: 90, sho: 85, pas: 83, dri: 87, def: 42, phy: 84 }, positions: ['ST', 'CF'] },
  'ea-263765-tom-bischof': { rating: 86, position: 'CM', face: { ovr: 86, pac: 78, sho: 84, pas: 89, dri: 89, def: 80, phy: 80 }, positions: ['CM', 'CDM', 'CAM'] },
  'ea-266127-lewis-hall': { rating: 86, position: 'LB', face: { ovr: 86, pac: 83, sho: 67, pas: 84, dri: 86, def: 86, phy: 79 }, positions: ['LB', 'LWB'] },
  'ea-277951-lily-yohannes': { rating: 86, position: 'CM', face: { ovr: 86, pac: 83, sho: 83, pas: 86, dri: 88, def: 79, phy: 77 }, positions: ['CM', 'CAM', 'CDM'] },
  'ea-265317-laura-blindkilde-brown': { rating: 85, position: 'CDM', face: { ovr: 85, pac: 83, sho: 72, pas: 82, dri: 85, def: 87, phy: 65 }, positions: ['CDM', 'CM'] },
  'ea-271918-robin-risser': { rating: 85, position: 'GK', face: { ovr: 85, pac: 86, sho: 80, pas: 88, dri: 88, def: 43, phy: 82 }, positions: ['GK'] },
  'ea-70786-josh-king': { rating: 85, position: 'CAM', face: { ovr: 85, pac: 84, sho: 82, pas: 86, dri: 89, def: 72, phy: 63 }, positions: ['CAM', 'CM'] },
  'ea-278174-julian-hall': { rating: 85, position: 'ST', face: { ovr: 85, pac: 89, sho: 83, pas: 70, dri: 84, def: 45, phy: 86 }, positions: ['ST', 'LM', 'LW'] },
  'ea-277225-jon-martin': { rating: 85, position: 'CB', face: { ovr: 85, pac: 78, sho: 40, pas: 65, dri: 75, def: 87, phy: 87 }, positions: ['CB'] },
};

export function futureStarsFor(baseId: string): FutureStarData | null {
  return FUTURE_STARS[baseId] ?? null;
}

export const FUTURE_STARS_TEAM_1_COUNT = Object.keys(FUTURE_STARS).length;
