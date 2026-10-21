import quotes from '@/assets/data/marketPrices.json';
import { availablePointPlayers, itemScore, type ItemBasket } from '@/lib/sbcItemScore';
import { pointsPlanValid, type PointsPlan, type PointsSegment } from '@/lib/sbcVerified';

/** A distinct-item alternative; quote ordering is a hint, never a current-price guarantee. */
export function uniquePointsPlan(segment: PointsSegment, platform: 'ps5' | 'pc', submitted: number, basket: ItemBasket): PointsPlan | null {
  const target = segment.target - submitted;
  if (!Number.isSafeInteger(target) || target <= 0) return null;
  const prices = quotes as unknown as Record<string, number[]>;
  const candidates = availablePointPlayers(segment).filter((p) => !basket[p.id]).map((player) => ({ player, score: itemScore(player)! }));
  const ratio = (id: string, score: number) => { const price = prices[id]?.[platform === 'pc' ? 1 : 0]; return price > 0 ? price / Math.min(score, target) : Infinity; };
  candidates.sort((a, b) => ratio(a.player.id, a.score) - ratio(b.player.id, b.score) || b.score - a.score || a.player.id.localeCompare(b.player.id));
  const lines: PointsPlan['lines'] = [];
  let total = 0;
  for (const candidate of candidates) {
    lines.push({ player: candidate.player, alternatives: [candidate.player], count: 1, scoreEach: candidate.score, priceEach: 0 });
    total += candidate.score;
    if (total >= target) break;
  }
  const plan: PointsPlan = { key: 'unique', lines, total, count: lines.length, cost: 0, priceKnown: false };
  return pointsPlanValid({ ...segment, target }, plan, platform) ? plan : null;
}
