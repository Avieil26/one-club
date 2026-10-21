import type { FcPlayer } from '@/lib/fcPlayers';

export function eligiblePointsPlayer(player: FcPlayer, requirements: string[]): boolean {
  if (player.edition || player.icon) return false;
  return requirements.every((text) => {
    let match = /^Rating: Max\. (\d+)$/.exec(text);
    if (match) return player.rating <= Number(match[1]);
    match = /^Rating: Min\. (\d+)$/.exec(text);
    if (match) return player.rating >= Number(match[1]);
    match = /^Rating: (\d+) to (\d+)$/.exec(text);
    if (match) return player.rating >= Number(match[1]) && player.rating <= Number(match[2]);
    if (text === 'League: Premier League') return player.league === 'פרמייר ליג' || player.league === 'Premier League';
    return false; // Unknown eligibility must never produce a verified plan.
  });
}

export function pointsEligibilityLabel(requirements: string[], language: 'he' | 'en'): string {
  if (language === 'en') return requirements.join(' · ');
  return requirements.map((text) => text
    .replace(/^Rating: Max\. (\d+)$/, 'דירוג עד $1')
    .replace(/^Rating: Min\. (\d+)$/, 'דירוג $1 ומעלה')
    .replace(/^Rating: (\d+) to (\d+)$/, 'דירוג $1–$2')
    .replace('League: Premier League', 'שחקני הפרמייר ליג')).join(' · ');
}
