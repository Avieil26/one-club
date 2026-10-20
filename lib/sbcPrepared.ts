import routes from '@/assets/data/sbc-prepared-20261020.json';
export type PreparedRoute = { sourceUrl: string; checkedAt: string; lines: { count: number; rating: number; rarity: string }[] };
export function preparedRoute(id: string): PreparedRoute | undefined { return (routes as Record<string, PreparedRoute>)[id]; }
