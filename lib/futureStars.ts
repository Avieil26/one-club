import futureStarsFile from '@/assets/data/futureStars.json';
import type { FcPlayer } from '@/lib/fcPlayers';

export type FutureStarFace = {
  ovr: number;
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
};

export type FutureStarData = {
  id: string;
  baseId: string;
  itemId: number;
  en: string;
  name: string;
  rating: number;
  position: string;
  nation: string;
  league: string;
  club: string;
  photoUrl: string;
  face: FutureStarFace;
  positions?: string[];
  foot: 'L' | 'R';
  skillMoves: number;
  weakFoot: number;
  accelerate: string;
  heightCm?: number;
  weightKg?: number;
  age?: number;
  attributes: Record<string, number>;
};

const futureStarsRows = futureStarsFile as unknown as FutureStarData[];
const FUTURE_STARS: Record<string, FutureStarData> = Object.fromEntries(
  futureStarsRows.map((row) => [row.baseId, row]),
);

export function futureStarsFor(baseId: string): FutureStarData | null {
  return FUTURE_STARS[baseId] ?? null;
}

export const FUTURE_STARS_PLAYERS: FcPlayer[] = futureStarsRows.map((row) => ({
  id: `${row.baseId}--future-stars`,
  baseId: row.baseId,
  itemId: row.itemId,
  en: row.en,
  name: row.name,
  rating: row.rating,
  position: row.position,
  nation: row.nation,
  league: row.league,
  club: row.club,
  edition: 'future-stars',
  face: row.face,
  ...(row.positions?.length ? { positions: row.positions } : {}),
  foot: row.foot,
  skillMoves: row.skillMoves,
  weakFoot: row.weakFoot,
  accelerate: row.accelerate,
  heightCm: row.heightCm,
  weightKg: row.weightKg,
  age: row.age,
}));

export const FUTURE_STARS_TEAM_1_COUNT = futureStarsRows.length;
