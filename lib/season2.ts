import cards from '@/assets/data/season2.json';
import type { FcPlayer } from '@/lib/fcPlayers';
import type { CardMeta } from '@/lib/playerMeta';

export type SeasonTask = { name: string; he: string; en: string };
export type SeasonAcquisition = {
  kind: 'standard-pass' | 'premium-pass' | 'objective' | 'unverified';
  startsAt: string;
  endsAt: string;
  level?: number;
  seasonPoints?: number;
  premium?: boolean;
  objectiveName?: string;
  objectiveId?: number;
  summaryHe?: string;
  summaryEn?: string;
  tasks?: SeasonTask[];
  dependencies?: { name: string; tasks: SeasonTask[] }[];
};
export type Season2Card = FcPlayer & {
  itemId: number;
  attributes: Record<string, number>;
  backgroundId: number;
  acquisition: SeasonAcquisition;
  sourceUrl: string;
};

export const SEASON2_CARDS = cards as unknown as Season2Card[];
const byId = new Map(SEASON2_CARDS.map((card) => [card.id, card]));
export function season2For(id: string): Season2Card | undefined {
  return byId.get(id);
}

export function season2CardMeta(card: Season2Card): CardMeta {
  return {
    foot: card.foot!,
    skillMoves: card.skillMoves!,
    weakFoot: card.weakFoot!,
    stats: card.attributes,
  };
}
