export type GroundsPlayStyleTier = 'base' | 'plus';

export type GroundsPlayStyleSelection = {
  id: string;
  tier: GroundsPlayStyleTier;
};

export type GroundsPlayStyleOption = {
  id: string;
  name: string;
  category: string;
  icon: number;
};

export const GROUNDS_PLAYSTYLE_CATEGORIES = [
  { id: 'Scoring', label: 'סיומת' },
  { id: 'Passing', label: 'מסירות' },
  { id: 'Ball Control', label: 'שליטה בכדור' },
  { id: 'Defending', label: 'הגנה' },
  { id: 'Physical', label: 'פיזיות' },
  { id: 'Goalkeeping', label: 'שוערות' },
] as const;

export const GROUNDS_PLAYSTYLES: GroundsPlayStyleOption[] = [
  { id: 'acrobatic', name: 'Acrobatic', category: 'Scoring', icon: require('@/assets/playstyles/acrobatic.png') },
  { id: 'chip-shot', name: 'Chip Shot', category: 'Scoring', icon: require('@/assets/playstyles/chip-shot.png') },
  { id: 'dead-ball', name: 'Dead Ball', category: 'Scoring', icon: require('@/assets/playstyles/dead-ball.png') },
  { id: 'finesse-shot', name: 'Finesse Shot', category: 'Scoring', icon: require('@/assets/playstyles/finesse-shot.png') },
  { id: 'gamechanger', name: 'Gamechanger', category: 'Scoring', icon: require('@/assets/playstyles/gamechanger.png') },
  { id: 'low-driven-shot', name: 'Low Driven Shot', category: 'Scoring', icon: require('@/assets/playstyles/low-driven-shot.png') },
  { id: 'power-shot', name: 'Power Shot', category: 'Scoring', icon: require('@/assets/playstyles/power-shot.png') },
  { id: 'precision-header', name: 'Precision Header', category: 'Scoring', icon: require('@/assets/playstyles/precision-header.png') },
  { id: 'incisive-pass', name: 'Incisive Pass', category: 'Passing', icon: require('@/assets/playstyles/incisive-pass.png') },
  { id: 'inventive', name: 'Inventive', category: 'Passing', icon: require('@/assets/playstyles/inventive.png') },
  { id: 'long-ball-pass', name: 'Long Ball Pass', category: 'Passing', icon: require('@/assets/playstyles/long-ball-pass.png') },
  { id: 'pinged-pass', name: 'Pinged Pass', category: 'Passing', icon: require('@/assets/playstyles/pinged-pass.png') },
  { id: 'tiki-taka', name: 'Tiki Taka', category: 'Passing', icon: require('@/assets/playstyles/tiki-taka.png') },
  { id: 'whipped-pass', name: 'Whipped Pass', category: 'Passing', icon: require('@/assets/playstyles/whipped-pass.png') },
  { id: 'first-touch', name: 'First Touch', category: 'Ball Control', icon: require('@/assets/playstyles/first-touch.png') },
  { id: 'press-proven', name: 'Press Proven', category: 'Ball Control', icon: require('@/assets/playstyles/press-proven.png') },
  { id: 'rapid', name: 'Rapid', category: 'Ball Control', icon: require('@/assets/playstyles/rapid.png') },
  { id: 'technical', name: 'Technical', category: 'Ball Control', icon: require('@/assets/playstyles/technical.png') },
  { id: 'trickster', name: 'Trickster', category: 'Ball Control', icon: require('@/assets/playstyles/trickster.png') },
  { id: 'aerial-fortress', name: 'Aerial Fortress', category: 'Defending', icon: require('@/assets/playstyles/aerial-fortress.png') },
  { id: 'anticipate', name: 'Anticipate', category: 'Defending', icon: require('@/assets/playstyles/anticipate.png') },
  { id: 'block', name: 'Block', category: 'Defending', icon: require('@/assets/playstyles/block.png') },
  { id: 'intercept', name: 'Intercept', category: 'Defending', icon: require('@/assets/playstyles/intercept.png') },
  { id: 'jockey', name: 'Jockey', category: 'Defending', icon: require('@/assets/playstyles/jockey.png') },
  { id: 'slide-tackle', name: 'Slide Tackle', category: 'Defending', icon: require('@/assets/playstyles/slide-tackle.png') },
  { id: 'bruiser', name: 'Bruiser', category: 'Physical', icon: require('@/assets/playstyles/bruiser.png') },
  { id: 'enforcer', name: 'Enforcer', category: 'Physical', icon: require('@/assets/playstyles/enforcer.png') },
  { id: 'long-throw', name: 'Long Throw', category: 'Physical', icon: require('@/assets/playstyles/long-throw.png') },
  { id: 'quick-step', name: 'Quick Step', category: 'Physical', icon: require('@/assets/playstyles/quick-step.png') },
  { id: 'relentless', name: 'Relentless', category: 'Physical', icon: require('@/assets/playstyles/relentless.png') },
  { id: '1v1-close-down', name: '1v1 Close Down', category: 'Goalkeeping', icon: require('@/assets/playstyles/1v1-close-down.png') },
  { id: 'cross-claimer', name: 'Cross Claimer', category: 'Goalkeeping', icon: require('@/assets/playstyles/cross-claimer.png') },
  { id: 'deflector', name: 'Deflector', category: 'Goalkeeping', icon: require('@/assets/playstyles/deflector.png') },
  { id: 'far-reach', name: 'Far Reach', category: 'Goalkeeping', icon: require('@/assets/playstyles/far-reach.png') },
  { id: 'far-throw', name: 'Far Throw', category: 'Goalkeeping', icon: require('@/assets/playstyles/far-throw.png') },
  { id: 'footwork', name: 'Footwork', category: 'Goalkeeping', icon: require('@/assets/playstyles/footwork.png') },
];

export function selectionForPlayStyle(
  selections: GroundsPlayStyleSelection[],
  id: string,
): GroundsPlayStyleTier | null {
  return selections.find((item) => item.id === id)?.tier ?? null;
}

export function sanitizeGroundsPlayStyles(value: unknown): GroundsPlayStyleSelection[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set(GROUNDS_PLAYSTYLES.map((item) => item.id));
  const result = new Map<string, GroundsPlayStyleTier>();
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const candidate = item as { id?: unknown; tier?: unknown };
    if (typeof candidate.id !== 'string' || !allowed.has(candidate.id)) continue;
    if (candidate.tier !== 'base' && candidate.tier !== 'plus') continue;
    result.set(candidate.id, candidate.tier);
  }
  return Array.from(result, ([id, tier]) => ({ id, tier }));
}
