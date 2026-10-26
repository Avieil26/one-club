import type { GalleryGrade } from './galleryTypes';
export type PlannerSet = { id: number; name: string; category: string; requiredCards: number; tokens: Record<GalleryGrade, number> };
export type PlannerOption = { id: string; setId: number; grade: GalleryGrade; tokens: number; itemIds: number[] };
export type PlannerData = { checkedAt: string; sets: PlannerSet[]; prices: Record<string, number | null>; options: PlannerOption[] };
export type PlannerInput = { target: number | null; budget: number | null; claimed: Record<number, GalleryGrade | null>; collectedIds: number[] };
export type PlannerStep = { option: PlannerOption; tokens: number; cost: number; newItemIds: number[]; reusedItems: number };
export type PlannerResult = { steps: PlannerStep[]; tokens: number; cost: number; uniqueItems: number; unpricedOptions: number; targetMet: boolean; shortfall: number };
export const plannerStorageKey = (userId?: string) => `fc27-gallery-planner-v1:${userId || 'guest'}`;
export function parsePlannerNumber(raw: string): number | null {
 const text = raw.trim().replace(/[ ,]/g, '');
 if (!/^\d+$/.test(text)) return null;
 const n = Number(text);
 return Number.isSafeInteger(n) && n <= 1_000_000_000 ? n : null;
}
export function claimedTokens(set: PlannerSet, grade: GalleryGrade | null | undefined) { return grade ? set.tokens[grade] ?? 0 : 0; }
/** Suggested routes among verified lineups. No assumption of resale, First Owner bonuses or live prices. */
export function planGallery(data: PlannerData, input: PlannerInput): PlannerResult {
 if (input.target !== null && (!Number.isSafeInteger(input.target) || input.target <= 0)) throw Error('Invalid token target');
 if (input.budget !== null && (!Number.isSafeInteger(input.budget) || input.budget < 0)) throw Error('Invalid coin budget');
 const sets = new Map(data.sets.map(s => [s.id, s]));
 const owned = new Set(input.collectedIds.filter(Number.isSafeInteger));
 let unpricedOptions = 0;
 const choices = data.options.flatMap(option => {
  const set = sets.get(option.setId);
  if (!set || option.itemIds.length !== set.requiredCards || new Set(option.itemIds).size !== option.itemIds.length) return [];
  const tokens = option.tokens - claimedTokens(set, input.claimed[set.id]);
  if (tokens <= 0) return [];
  if (option.itemIds.some(id => !owned.has(id) && !(Number.isFinite(data.prices[id]) && data.prices[id]! > 0))) { unpricedOptions++; return []; }
  return [{ option, tokens }];
 });
 function evaluate(route: typeof choices): PlannerResult {
  const used = new Set(owned), steps: PlannerStep[] = [];
  let tokens = 0, cost = 0;
  for (const choice of route) {
   const newItemIds = choice.option.itemIds.filter(id => !used.has(id));
   const extra = newItemIds.reduce((sum, id) => sum + data.prices[id]!, 0);
   steps.push({ ...choice, cost: extra, newItemIds, reusedItems: choice.option.itemIds.length - newItemIds.length });
   newItemIds.forEach(id => used.add(id)); tokens += choice.tokens; cost += extra;
  }
  return { steps, tokens, cost, uniqueItems: used.size - owned.size, unpricedOptions, targetMet: input.target === null || tokens >= input.target, shortfall: Math.max(0, (input.target ?? 0) - tokens) };
 }
 // Several marginal-cost strategies reduce greedy dead ends. This is not a global optimality claim.
 const routes = [0, 0.5, 1, 1.5, 2].map(power => {
  const used = new Set(owned), selectedSets = new Set<number>(), route: typeof choices = [];
  let spent = 0, earned = 0;
  while (route.length < data.sets.length && (input.target === null || earned < input.target)) {
   let best: { choice: typeof choices[number]; cost: number; rank: number } | null = null;
   for (const choice of choices) {
    if (selectedSets.has(choice.option.setId)) continue;
    const cost = choice.option.itemIds.reduce((sum, id) => sum + (used.has(id) ? 0 : data.prices[id]!), 0);
    if (input.budget !== null && spent + cost > input.budget) continue;
    const gain = Math.min(choice.tokens, input.target === null ? choice.tokens : input.target - earned);
    const rank = cost / Math.pow(gain, power);
    if (!best || rank < best.rank || (rank === best.rank && (choice.tokens > best.choice.tokens || (choice.tokens === best.choice.tokens && choice.option.id < best.choice.option.id)))) best = { choice, cost, rank };
   }
   if (!best) break;
   route.push(best.choice); selectedSets.add(best.choice.option.setId); spent += best.cost; earned += best.choice.tokens;
   best.choice.option.itemIds.forEach(id => used.add(id));
  }
  if (input.target !== null) for (let i = route.length - 1; i >= 0; i--) {
   if (earned - route[i].tokens >= input.target) { earned -= route[i].tokens; route.splice(i, 1); }
  }
  return evaluate(route);
 });
 routes.sort((a, b) => {
  if (input.target !== null && a.targetMet !== b.targetMet) return a.targetMet ? -1 : 1;
  if (input.target === null || !a.targetMet) return b.tokens - a.tokens || a.cost - b.cost || a.steps.length - b.steps.length;
  return a.cost - b.cost || a.steps.length - b.steps.length || a.tokens - b.tokens;
 });
 return routes[0];
}
