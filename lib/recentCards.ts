import cards from '@/assets/data/recentCards20261024.json';
import type { FcPlayer } from '@/lib/fcPlayers';
import type { CardMeta } from '@/lib/playerMeta';
export type RecentCard = FcPlayer & {
  itemId: number; baseItemId: number; attributes: Record<string, number>; backgroundId: number;
  family: string; holographicType: 'holographic' | 'pristine' | null; releasedAt: string;
  price: { kind: 'market' | 'sbc' | 'unavailable'; console: number | null; pc: number | null; checkedAt: string };
};
export const RECENT_CARDS = cards as unknown as RecentCard[];
const byId = new Map(RECENT_CARDS.map(card => [card.id, card]));
export function recentCardFor(id: string): RecentCard | undefined { return byId.get(id); }
export function recentCardMeta(card: RecentCard): CardMeta {
  return { foot: card.foot!, weakFoot: card.weakFoot!, skillMoves: card.skillMoves!, stats: card.attributes };
}
