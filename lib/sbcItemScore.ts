import table from '@/assets/data/item-scores-base-20261021.json';
import { PLAYERS, type FcPlayer } from '@/lib/fcPlayers';
import { eligiblePointsPlayer } from '@/lib/sbcEligibility';
import type { PointsSegment } from '@/lib/sbcVerified';

export function itemScore(player: FcPlayer): number | null {
  if (player.edition || player.icon || !Number.isInteger(player.rating)) return null;
  const rating = player.rating;
  if (rating >= table.bronze.min && rating <= table.bronze.max) return table.bronze.score;
  if (rating >= table.silver.min && rating <= table.silver.max) return table.silver.score;
  return (table.gold as Record<string, number>)[String(rating)] ?? null;
}
export type SelectedItem = { player: FcPlayer; count: number; scoreEach: number };
export type ItemBasket = Record<string, number>;
export function selectedItems(segment: PointsSegment, basket: ItemBasket): SelectedItem[] {
  return Object.entries(basket).flatMap(([id, count]) => {
    const player = playersById.get(id);
    const score = player ? itemScore(player) : null;
    return player && score !== null && eligiblePointsPlayer(player, segment.requirements) && Number.isSafeInteger(count) && count > 0 && count <= 10000 ? [{ player, count, scoreEach: score }] : [];
  });
}
export function selectedScore(items: SelectedItem[]): number {
  return items.reduce((sum, item) => sum + item.scoreEach * item.count, 0);
}
const playersById = new Map(PLAYERS.map((p) => [p.id, p]));
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const searchIndex = PLAYERS.filter((p) => itemScore(p) !== null).map((player) => ({ player, text: normalize(`${player.name} ${player.en ?? ''} ${player.club} ${player.rating}`) }));
/** Bounded results, complete base-item catalogue; eligibility follows the selected SBC segment. */
export function searchPointPlayers(segment: PointsSegment, query: string, limit = 18): FcPlayer[] {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  const found: FcPlayer[] = [];
  for (const entry of searchIndex) {
    if ((/^\d{2}$/.test(query.trim()) ? entry.player.rating !== Number(query.trim()) : !tokens.every((t) => entry.text.includes(t))) || !eligiblePointsPlayer(entry.player, segment.requirements)) continue;
    found.push(entry.player);
    if (found.length >= Math.min(100, Math.max(1, limit))) break;
  }
  return found;
}

export function availablePointPlayers(segment: PointsSegment): FcPlayer[] {
  return searchIndex.filter((entry) => eligiblePointsPlayer(entry.player, segment.requirements)).map((entry) => entry.player);
}
