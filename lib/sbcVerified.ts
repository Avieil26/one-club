import current from '@/assets/data/sbc-refresh-20261028.json';
import bellerin from '@/assets/data/sbc-bellerin-20261028.json';
import latest from '@/assets/data/sbc-refresh-20261026.json';
import refresh from '@/assets/data/sbc-refresh-20261025.json';
import { eligiblePointsPlayer } from '@/lib/sbcEligibility';
import { itemScore } from '@/lib/sbcItemScore';
import snapshot from '@/assets/data/sbc-verified-20261021.json';
import { PLAYERS, type FcPlayer } from '@/lib/fcPlayers';

export { eligiblePointsPlayer } from '@/lib/sbcEligibility';

export type ItemRate = { overall: number; rarity: number; score: number; price: number; players: string[]; eaIds: number[] };
export type PointsSegment = { eaId: number; name: string; target: number; requirements: string[]; reportedRequirements?: string[]; sourceUrl?: string; checkedAt?: string; platforms: Record<'ps5' | 'pc', { pricedAt: string; rates: ItemRate[]; routes?: { key: string; groups: { overall: number; rarity: number; count: number; unitScore: number }[] }[] }> };
export type PointsLine = { player: FcPlayer; alternatives: FcPlayer[]; count: number; scoreEach: number; priceEach: number };
export type PointsPlan = { key: string; lines: PointsLine[]; total: number; cost: number; count: number; priceKnown?: boolean };
const byId = new Map(PLAYERS.map((p) => [p.id, p]));
export const SBC_SOLUTION_CHECKED_AT = snapshot.checkedAt;
export function pointsSegments(id: string): PointsSegment[] {
  return ({ ...snapshot.challenges, ...refresh.points, ...latest.points, ...bellerin.points, ...current.points } as unknown as Record<string, { segments: PointsSegment[] }>)[id]?.segments ?? [];
}
export function pointsPlanValid(segment: PointsSegment, plan: PointsPlan, platform: 'ps5' | 'pc'): boolean {
  if (!Number.isSafeInteger(segment.target) || segment.target <= 0 || !plan.lines.length) return false;
  for (const line of plan.lines) {
    const rate = segment.platforms[platform].rates.find((r) => r.rarity === 0 && r.overall === line.player.rating && r.players.includes(line.player.id));
    if (itemScore(line.player) !== line.scoreEach || !eligiblePointsPlayer(line.player, segment.requirements) || !Number.isSafeInteger(line.count) || line.count <= 0) return false;
    if (plan.priceKnown === false ? line.priceEach !== 0 : !rate || rate.score !== line.scoreEach || rate.price !== line.priceEach) return false;
  }
  return plan.total === plan.lines.reduce((sum, l) => sum + l.count * l.scoreEach, 0)
    && plan.count === plan.lines.reduce((sum, l) => sum + l.count, 0)
    && plan.cost === plan.lines.reduce((sum, l) => sum + l.count * l.priceEach, 0)
    && plan.total >= segment.target;
}
/** Optimize only source-checked base items; never infer scores from a player's OVR. */
export function pointsPlans(segment: PointsSegment, platform: 'ps5' | 'pc', submitted = 0): PointsPlan[] {
  if (!Number.isSafeInteger(segment.target) || segment.target <= 0) return [];
  if (!Number.isSafeInteger(submitted) || submitted < 0 || submitted >= segment.target) return [];
  const target = segment.target - submitted;
  const rates = segment.platforms[platform].rates.flatMap((rate) => {
    const players = rate.players.map((id) => byId.get(id)).filter((p): p is FcPlayer => !!p && p.rating === rate.overall && eligiblePointsPlayer(p, segment.requirements));
    return rate.rarity === 0 && Number.isSafeInteger(rate.score) && rate.score > 0 && rate.price > 0 && players.length ? [{ ...rate, candidates: players }] : [];
  });
  if (!rates.length || target > 2_000_000) return [];
  const limit = target + Math.max(...rates.map((r) => r.score));
  const costs = new Float64Array(limit + 1); costs.fill(Infinity); costs[0] = 0;
  const previous = new Int16Array(limit + 1); previous.fill(-1);
  for (let score = 1; score <= limit; score++) {
    for (let i = 0; i < rates.length; i++) {
      const rate = rates[i];
      if (score >= rate.score && costs[score - rate.score] + rate.price < costs[score]) {
        costs[score] = costs[score - rate.score] + rate.price; previous[score] = i;
      }
    }
  }
  let best = target;
  for (let score = target + 1; score <= limit; score++) if (costs[score] < costs[best]) best = score;
  function make(key: string, counts: Map<number, number>): PointsPlan {
    const lines = [...counts].flatMap(([i, count]) => {
      const candidates = rates[i].candidates;
      return candidates.slice(0, Math.min(count, candidates.length)).map((player, n) => ({
        player, alternatives: candidates, count: Math.floor(count / candidates.length) + (n < count % candidates.length ? 1 : 0), scoreEach: rates[i].score, priceEach: rates[i].price,
      }));
    });
    return { key, lines, total: lines.reduce((n, l) => n + l.count * l.scoreEach, 0), cost: lines.reduce((n, l) => n + l.count * l.priceEach, 0), count: lines.reduce((n, l) => n + l.count, 0) };
  }
  const counts = new Map<number, number>();
  let remaining = best;
  while (remaining > 0 && previous[remaining] >= 0) { const i = previous[remaining]; counts.set(i, (counts.get(i) ?? 0) + 1); remaining -= rates[i].score; }
  if (remaining) return [];
  const result = [make('value', counts)];
  if (submitted === 0) {
    for (const route of segment.platforms[platform].routes ?? []) {
      if (route.key.startsWith('verified-')) continue;
      const grouped = new Map<number, number>();
      let valid = true;
      for (const group of route.groups) {
        const i = rates.findIndex((r) => r.overall === group.overall && r.rarity === group.rarity && r.score === group.unitScore);
        if (i < 0) { valid = false; break; }
        grouped.set(i, (grouped.get(i) ?? 0) + group.count);
      }
      const balanced = make('balanced', grouped);
      if (valid && balanced.count < result[0].count && balanced.cost <= result[0].cost * 1.25 && pointsPlanValid(segment, balanced, platform)) { result.push(balanced); break; }
    }
  }
  if (submitted === 0) for (const route of segment.platforms[platform].routes ?? []) {
    if (!route.key.startsWith('verified-')) continue;
    const grouped = new Map<number, number>();
    let valid = true;
    for (const group of route.groups) {
      const i = rates.findIndex((r) => r.overall === group.overall && r.rarity === group.rarity && r.score === group.unitScore);
      if (i < 0 || !Number.isSafeInteger(group.count) || group.count <= 0) { valid = false; break; }
      grouped.set(i, (grouped.get(i) ?? 0) + group.count);
    }
    if (!valid) continue;
    const option = make(route.key, grouped);
    if (pointsPlanValid(segment, option, platform)) result.push(option);
  }
  const high = rates.reduce((best, r, i) => r.score > rates[best].score ? i : best, 0);
  const fewer = make('fewer', new Map([[high, Math.ceil(target / rates[high].score)]]));
  if (fewer.count < Math.min(...result.map((p) => p.count))) result.push(fewer);
  return result.filter((plan) => pointsPlanValid({ ...segment, target }, plan, platform));
}
