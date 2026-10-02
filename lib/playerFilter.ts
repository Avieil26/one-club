import type { FcPlayer } from '@/lib/fcPlayers';

export type CardKind = 'all' | 'gold' | 'silver' | 'icon' | 'promo' | 'hero' | 'totw';

export type PlayerFilters = {
  kind: CardKind;
  nation: string | null;
  league: string | null;
  club: string | null;
  position: string | null;
  minRating: number | null;
  maxRating: number | null;
};

export const EMPTY_FILTERS: PlayerFilters = {
  kind: 'all',
  nation: null,
  league: null,
  club: null,
  position: null,
  minRating: null,
  maxRating: null,
};

const POSITION_ORDER = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'];

export function filtersActive(filters: PlayerFilters) {
  return (
    filters.kind !== 'all' ||
    Boolean(filters.nation || filters.league || filters.club || filters.position) ||
    filters.minRating != null ||
    filters.maxRating != null
  );
}

export function playerMatches(player: FcPlayer, filters: PlayerFilters) {
  const special = Boolean(player.icon) || player.edition === 'destined' || player.edition === 'hero' || player.edition === 'totw';
  if (filters.kind === 'gold' && (special || player.rating < 75)) return false;
  if (filters.kind === 'silver' && (special || player.rating < 65 || player.rating > 74)) return false;
  if (filters.kind === 'icon' && !player.icon) return false;
  if (filters.kind === 'promo' && player.edition !== 'destined') return false;
  if (filters.kind === 'hero' && player.edition !== 'hero') return false;
  if (filters.kind === 'totw' && player.edition !== 'totw') return false;
  if (filters.nation && player.nation !== filters.nation) return false;
  if (filters.league && player.league !== filters.league) return false;
  if (filters.club && player.club !== filters.club) return false;
  if (filters.position && player.position !== filters.position) return false;
  if (filters.minRating != null && player.rating < filters.minRating) return false;
  if (filters.maxRating != null && player.rating > filters.maxRating) return false;
  return true;
}

function counted(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'he')).map(([name]) => name);
}

export function filterChoices(players: FcPlayer[]) {
  const clubsByLeague = new Map<string, string[]>();
  for (const league of counted(players.map((player) => player.league))) {
    clubsByLeague.set(
      league,
      counted(players.filter((player) => player.league === league).map((player) => player.club)),
    );
  }
  const present = new Set(players.map((player) => player.position));
  const ratings = players.map((player) => player.rating);
  return {
    nations: counted(players.map((player) => player.nation)),
    leagues: [...clubsByLeague.keys()],
    clubsByLeague,
    positions: [
      ...POSITION_ORDER.filter((position) => present.has(position)),
      ...[...present].filter((position) => !POSITION_ORDER.includes(position)).sort(),
    ],
    ratingMin: Math.min(...ratings),
    ratingMax: Math.max(...ratings),
  };
}
