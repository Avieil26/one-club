import team2 from '@/assets/data/ultimateScream2Cards20261030.json';
import type { FcPlayer } from '@/lib/fcPlayers';
import type { RecentCard } from '@/lib/recentCards';

/** FC27 Team 2. This app-preview adapter intentionally never fabricates 34 attributes or prices. */
export function scream2Cards(basePlayers: readonly FcPlayer[]): RecentCard[] {
  const byEnglish = new Map<string,FcPlayer>();
  for (const player of basePlayers) {
    const key = (player.en || player.name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    if (!byEnglish.has(key)) byEnglish.set(key,player);
  }
  const result: RecentCard[]=[];
  for (const card of team2) {
    const key=card.en.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
    const base=byEnglish.get(key);
    result.push({
      ...(base || {}),
      id:card.id,
      baseId:base?.id,
      baseItemId: 0,
      itemId:card.itemId,
      name:base?.name || card.en,
      en:card.en,
      rating:card.rating,
      position:card.position,
      nation:card.nation,
      league:card.league,
      club:card.club,
      edition:'recent',
      family:'Ultimate Scream Team 2',
      backgroundId:151,
      holographicType:null,
      releasedAt:card.releasedAt,
      face:card.face,
      attributes:{},
      price:{kind:'unavailable',console:null,pc:null,checkedAt:card.releasedAt},
      pairRating:base?.rating,
      regularPosition:base?.position,
      regularClub:base?.club,
      regularLeague:base?.league,
    } as RecentCard);
  }
  return result;
}
