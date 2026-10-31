import roster from '@/assets/data/players.json';
import octoberSbcs from '@/assets/data/sbc20261030Pending.json';
import team2 from '@/assets/data/ultimateScream2Cards20261030.json';
import type { FcPlayer } from '@/lib/fcPlayers';
import type { RecentCard } from '@/lib/recentCards';

/** FC27 Team 2. This app-preview adapter intentionally never fabricates 34 attributes or prices. */
export function scream2Cards(basePlayers: readonly FcPlayer[]): RecentCard[] {
  const byEnglish = new Map<string,FcPlayer>();
  const rosterIds = new Map((roster as {id:string;en:string}[]).map(row => [row.en.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim(), row.id]));
  for (const player of basePlayers) {
    const key = (player.en || player.name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    if (!byEnglish.has(key)) byEnglish.set(key,player);
  }
  const result: RecentCard[]=[];
  for (const card of team2) {
    const key=card.en.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
    const base=byEnglish.get(key) || basePlayers.find(row => row.id === rosterIds.get(key));
    const normal = {
      ...(base || {}),
      id:card.id,
      baseId:base?.id,
      baseItemId: Number(card.itemSourceUrl.split('/players/')[1]?.split('-')[0]) || 0,
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
    } as RecentCard;
    result.push(normal);
    result.push({
      ...normal,
      id:card.id+'-pristine',
      itemId:card.itemId+16777216,
      holographicType:'pristine',
      family:'Ultimate Scream Team 2 Pristine Holographic',
    });
  }
  const reijnders=octoberSbcs.find(row=>row.id==='sbc-reijnders-scream-20261030');
  if(reijnders?.rewardFace && reijnders.rewardItemId){
    const baseId=rosterIds.get('tijjani reijnders');
    const base=basePlayers.find(p=>p.id===baseId);
    result.push({
      ...(base || {}),
      id:'scream2-reijnders-sbc-20261030',
      baseId:baseId,
      itemId:reijnders.rewardItemId,
      baseItemId:240638,
      en:'Tijjani Reijnders',name:base?.name || 'Tijjani Reijnders',
      rating:85,position:'CDM',nation:'הולנד',league:'ליגת העל הסעודית',club:'אל-קאדסיה',
      face:reijnders.rewardFace,
      edition:'recent',family:'Ultimate Scream SBC',backgroundId:151,holographicType:null,
      releasedAt:'2026-10-30T18:00:00Z',attributes:{},
      price:{kind:'sbc',console:null,pc:null,checkedAt:'2026-10-30T18:00:00Z'}
    } as RecentCard);
  }
  return result;
}
