export const DEFAULT_ITEM_SCORES: Record<number, number> = {
  74: 35,
  75: 90,
  83: 410,
  85: 2900,
  88: 8300,
  93: 25000,
  99: 100000,
};

export type ScoreLine = {
  ovr: number;
  count: number;
  scoreEach: number;
  total: number;
};

export type SbcStrategy = {
  id: string;
  title: string;
  lines: ScoreLine[];
  totalScore: number;
  cardCount: number;
};

function line(ovr: number, count: number, scoreEach: number): ScoreLine {
  return { ovr, count, scoreEach, total: count * scoreEach };
}

function allOf(id: string, title: string, ovr: number, target: number, scores: Record<number, number>): SbcStrategy {
  const scoreEach = scores[ovr] ?? 0;
  const count = Math.ceil(target / scoreEach);
  const row = line(ovr, count, scoreEach);
  return { id, title, lines: [row], totalScore: row.total, cardCount: count };
}

export function buildStrategies(
  target: number,
  minOvr: number,
  scores: Record<number, number>,
): SbcStrategy[] {
  if (!Number.isFinite(target) || target <= 0) return [];
  const ratings = Object.keys(scores)
    .map(Number)
    .filter((ovr) => ovr >= minOvr && (scores[ovr] ?? 0) > 0)
    .sort((a, b) => a - b);
  if (ratings.length === 0) return [];

  const low = ratings[0];
  const high = ratings[ratings.length - 1];
  const mid = ratings[Math.floor(ratings.length / 2)];
  const strategies: SbcStrategy[] = [
    allOf('low', `הכל מדירוג ${low}`, low, target, scores),
    allOf('mid', `הכל מדירוג ${mid}`, mid, target, scores),
    allOf('high', `מעט כרטיסים מדירוג ${high}`, high, target, scores),
  ];

  if (low !== mid) {
    const midEach = scores[mid] ?? 1;
    const lowEach = scores[low] ?? 1;
    const midCount = Math.max(1, Math.floor((target * 0.6) / midEach));
    const remain = Math.max(0, target - midCount * midEach);
    const lowCount = remain === 0 ? 0 : Math.ceil(remain / lowEach);
    const lines = [line(mid, midCount, midEach)];
    if (lowCount > 0) lines.push(line(low, lowCount, lowEach));
    strategies.splice(1, 0, {
      id: 'mix',
      title: 'שילוב',
      lines,
      totalScore: lines.reduce((sum, row) => sum + row.total, 0),
      cardCount: midCount + lowCount,
    });
  }

  const seen = new Set<string>();
  return strategies.filter((strategy) => {
    const key = strategy.lines.map((row) => `${row.ovr}x${row.count}`).join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
