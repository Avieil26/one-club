import type { FcPlayer } from '@/lib/fcPlayers';
import { playerMedia } from '@/lib/playerMedia';

export function playerDisplayName(player: Pick<FcPlayer, 'id' | 'baseId' | 'name' | 'en'>, language: 'he' | 'en'): string {
  if (language === 'he') return player.name;
  return player.en || playerMedia(player.baseId ?? player.id).en || player.name;
}
