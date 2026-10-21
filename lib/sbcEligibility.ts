import type { FcPlayer } from '@/lib/fcPlayers';

export function eligiblePointsPlayer(player: FcPlayer, requirements: string[]): boolean {
  if (player.edition || player.icon) return false;
  return requirements.every((text) => {
    let match = /^Rating: Min\. (\d+)$/.exec(text);
    if (match) return player.rating >= Number(match[1]);
    match = /^Rating: (\d+) to (\d+)$/.exec(text);
    if (match) return player.rating >= Number(match[1]) && player.rating <= Number(match[2]);
    if (text === 'League: Premier League') return player.league === 'פרמייר ליג' || player.league === 'Premier League';
    return false; // Unknown eligibility must never produce a verified plan.
  });
}
