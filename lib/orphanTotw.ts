import totwFile from '@/assets/data/totw.json';
import type { FcPlayer } from '@/lib/fcPlayers';

type TotwRow = {
  id?: string;
  baseId?: string;
  en?: string;
  name?: string;
  nation?: string;
  league?: string;
  club?: string;
  position: string;
  rating: number;
  face?: FcPlayer['face'];
  positions?: string[];
  playstyles?: FcPlayer['playstyles'];
};

const rows = totwFile as TotwRow[];

/** TOTW variants whose base player is absent from the regular/icon/hero catalogue. */
export const TOTW_PROMO_PLAYERS: FcPlayer[] = rows
  .filter((row) => Boolean(row.baseId))
  .map((row) => ({
    id: `${row.baseId}--totw`,
    baseId: row.baseId!,
    name: row.name || row.en || row.baseId!,
    en: row.en,
    rating: row.rating,
    position: row.position,
    nation: row.nation || '',
    league: row.league || 'TOTW',
    club: row.club || 'TOTW',
    edition: 'totw',
    ...(row.face ? { face: row.face } : {}),
    ...(row.positions?.length ? { positions: row.positions } : {}),
    ...(row.playstyles?.length ? { playstyles: row.playstyles } : {}),
  }));
