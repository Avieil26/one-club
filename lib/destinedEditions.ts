import editionsFile from '@/assets/data/destinedEditions.json';

import { META_ATTRS, type CardMeta, type MetaAttr } from '@/lib/playerMeta';
import type { FaceStats } from '@/lib/playerMedia';

export type DestinedEdition = {
  rating: number;
  position: string;
  club: string;
  league: string;
  foot: 'L' | 'R';
  sm: number;
  wf: number;
  face: FaceStats;
  attrs: number[];
};

const editions = editionsFile as Record<string, DestinedEdition>;

export function destinedEdition(id: string): DestinedEdition | null {
  return editions[id] ?? null;
}

export function destinedCardMeta(id: string): CardMeta | null {
  const row = editions[id];
  if (!row || (row.foot !== 'L' && row.foot !== 'R') || !row.sm || !row.wf) return null;
  const stats: Partial<Record<MetaAttr, number>> = {};
  META_ATTRS.forEach((key, index) => {
    const value = row.attrs[index];
    if (typeof value === 'number' && value > 0) stats[key] = value;
  });
  return { foot: row.foot, skillMoves: row.sm, weakFoot: row.wf, stats };
}
