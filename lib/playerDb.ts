import rosterJson from '@/assets/data/players.json';
import { ICON_PLAYERS } from '@/lib/iconPlayers';
import { HERO_PLAYERS, SOLO_TOTW } from '@/lib/specialCards';
import type { FcPlayer, PlayStyle } from '@/lib/fcPlayers';

export type RosterFace = {
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
  ovr?: number;
};

export type RosterEntry = {
  id: string;
  eaId?: number;
  name: string;
  en: string;
  rating: number;
  position: string;
  nation: string;
  league: string;
  club: string;
  photo?: string;
  face?: RosterFace;
  positions?: string[];
  playstyles?: PlayStyle[];
  gender?: string;
  icon?: boolean;
  legacy?: boolean;
  matched?: boolean;
  matchScore?: number;
};

const roster = rosterJson as RosterEntry[];

function toFcPlayer(entry: RosterEntry): FcPlayer {
  return {
    id: entry.id,
    name: entry.name,
    rating: entry.rating,
    position: entry.position,
    nation: entry.nation,
    league: entry.league,
    club: entry.club,
    ...(entry.icon ? { icon: true } : {}),
    ...(entry.positions?.length ? { positions: entry.positions } : {}),
    ...(entry.playstyles?.length ? { playstyles: entry.playstyles } : {}),
  };
}

const regularPlayers: FcPlayer[] = roster.map(toFcPlayer);
const iconIds = new Set(ICON_PLAYERS.map((player) => player.id));

/** Full market roster: EA gold/high-silver import + icons (icons win on id clash). */
export const DB_PLAYERS: FcPlayer[] = [
  ...regularPlayers.filter((player) => !iconIds.has(player.id)),
  ...ICON_PLAYERS,
  ...HERO_PLAYERS,
  ...SOLO_TOTW,
].sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name, 'he'));

const mediaById = new Map<string, { en: string; photo?: string; face?: RosterFace }>();
for (const entry of roster) {
  mediaById.set(entry.id, {
    en: entry.en,
    ...(entry.photo ? { photo: entry.photo } : {}),
    ...(entry.face ? { face: entry.face } : {}),
  });
}

export function rosterMedia(id: string): { en: string; photo?: string; face?: RosterFace } | undefined {
  return mediaById.get(id);
}

export function rosterStats() {
  return {
    regular: regularPlayers.length,
    icons: ICON_PLAYERS.length,
    total: DB_PLAYERS.length,
  };
}
