import type { SbcChallenge } from '@/lib/types';
import artwork from '@/assets/data/sbc-reward-art-20261020.json';
import { sbcFace } from '@/lib/sbcTileTheme';

export type SbcFilter = 'all' | 'players' | 'packs' | 'upgrades' | 'ending';
export function rewardKind(challenge: SbcChallenge): 'players' | 'packs' | 'upgrades' {
  const art = (artwork as Record<string, { kind: string }>)[challenge.id];
  if (art?.kind === 'player' || art?.kind === 'pick') return 'players';
  if (/upgrade|reroll/i.test(challenge.id)) return 'upgrades';
  return 'packs';
}
export function endsSoon(challenge: SbcChallenge, now: number): boolean {
  const deadline = challenge.endsAt ? Date.parse(challenge.endsAt) : NaN;
  return deadline > now && deadline <= now + 86400_000;
}
export function newlyReleased(challenge: SbcChallenge, now: number): boolean {
  const released = Date.parse(challenge.createdAt);
  return released <= now && released > now - 48 * 3600_000;
}
export function filterSbcs(challenges: SbcChallenge[], query: string, filter: SbcFilter, now: number) {
  const text = query.trim().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  return challenges.filter(challenge => {
    if (filter === 'ending' ? !endsSoon(challenge, now) : filter !== 'all' && rewardKind(challenge) !== filter) return false;
    const face = sbcFace(challenge);
    const haystack = [face.he, face.en, challenge.title, challenge.reward ?? '', face.category].join(' ').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
    return !text || haystack.includes(text);
  });
}
