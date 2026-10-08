import metaFile from '@/assets/data/playerMeta.json';
import iconCards from '@/assets/data/iconCardMeta.json';
import heroCards from '@/assets/data/heroCardMeta.json';
import totwCards from '@/assets/data/totwCardMeta.json';

export const META_ATTRS = [
  'acceleration',
  'sprintSpeed',
  'positioning',
  'finishing',
  'shotPower',
  'longShots',
  'volleys',
  'penalties',
  'vision',
  'crossing',
  'freeKickAccuracy',
  'shortPassing',
  'longPassing',
  'curve',
  'agility',
  'balance',
  'reactions',
  'ballControl',
  'dribbling',
  'composure',
  'interceptions',
  'headingAccuracy',
  'defensiveAwareness',
  'standingTackle',
  'slidingTackle',
  'jumping',
  'stamina',
  'strength',
  'aggression',
  'gkDiving',
  'gkHandling',
  'gkKicking',
  'gkReflexes',
  'gkPositioning',
] as const;

export type MetaAttr = (typeof META_ATTRS)[number];

type MetaRow = { foot: 'L' | 'R'; sm: number; wf: number; attrs: number[] };

export type CardMeta = {
  foot: 'L' | 'R';
  skillMoves: number;
  weakFoot: number;
  stats: Partial<Record<MetaAttr, number>>;
};

const rows = metaFile.players as Record<string, MetaRow>;
const iconRows = iconCards as Record<string, MetaRow>;
const heroRows = heroCards as Record<string, MetaRow>;
const totwRows = totwCards as unknown as Record<string, MetaRow>;
const keys = (metaFile.attrs?.length ? metaFile.attrs : META_ATTRS) as readonly string[];

/** In-game FC 26 base Icon sheet. Face totals already match ICON_FACE. */
const CARD_OVERRIDES: Record<string, MetaRow> = {
  'icon-diego-armando-maradona': {
    foot: 'L',
    sm: 5,
    wf: 3,
    attrs: [92, 88, 92, 94, 86, 91, 87, 93, 95, 88, 93, 90, 89, 95, 90, 95, 93, 96, 97, 95, 45, 67, 28, 41, 38, 82, 78, 75, 77],
  },
};

function toCardMeta(row: MetaRow | undefined): CardMeta | null {
  if (!row?.sm || !row.wf || (row.foot !== 'L' && row.foot !== 'R')) return null;
  const stats: Partial<Record<MetaAttr, number>> = {};
  keys.forEach((key, index) => {
    const value = row.attrs?.[index];
    if (typeof value === 'number' && value > 0) stats[key as MetaAttr] = value;
  });
  return { foot: row.foot, skillMoves: row.sm, weakFoot: row.wf, stats };
}

const SQUAD_FOUNDATIONS_META: Record<string, MetaRow> = {
  'patati--foundations': {
    foot: 'L',
    sm: 4,
    wf: 3,
    attrs: [
      90, 90,
      85, 82, 85, 80, 82, 80,
      79, 75, 55, 81, 70, 82,
      88, 86, 80, 85, 83, 75,
      35, 55, 40, 40, 39,
      81, 83, 75, 61,
    ],
  },
};

const OTW_META: Record<string, MetaRow> = {
  'ea-264947-nicole-anyomi': {
    foot: 'R',
    sm: 4,
    wf: 4,
    attrs: [90,90,81,85,84,80,75,60,71,72,72,82,64,64,84,84,78,86,84,79,45,85,45,59,64,95,85,88,64],
  },
};

export function otwCardMeta(id: string): CardMeta | null {
  return toCardMeta(OTW_META[id]);
}

export function playerCardMeta(id: string): CardMeta | null {
  return toCardMeta(SQUAD_FOUNDATIONS_META[id] ?? heroRows[id] ?? iconRows[id] ?? CARD_OVERRIDES[id] ?? rows[id]);
}

export function totwCardMeta(id: string): CardMeta | null {
  return toCardMeta(totwRows[id]);
}

export type StatRow = { key: MetaAttr; label: string };
export type StatGroup = { label: string; total?: number; rows: StatRow[] };

const OUTFIELD: { label: string; face: 'pac' | 'sho' | 'pas' | 'dri' | 'def' | 'phy'; rows: StatRow[] }[] = [
  {
    label: 'Pace',
    face: 'pac',
    rows: [
      { key: 'acceleration', label: 'Acceleration' },
      { key: 'sprintSpeed', label: 'Sprint Speed' },
    ],
  },
  {
    label: 'Shooting',
    face: 'sho',
    rows: [
      { key: 'positioning', label: 'Att. Position' },
      { key: 'finishing', label: 'Finishing' },
      { key: 'shotPower', label: 'Shot Power' },
      { key: 'longShots', label: 'Long Shots' },
      { key: 'volleys', label: 'Volleys' },
      { key: 'penalties', label: 'Penalties' },
    ],
  },
  {
    label: 'Passing',
    face: 'pas',
    rows: [
      { key: 'vision', label: 'Vision' },
      { key: 'crossing', label: 'Crossing' },
      { key: 'freeKickAccuracy', label: 'FK Acc.' },
      { key: 'shortPassing', label: 'Short Pass' },
      { key: 'longPassing', label: 'Long Pass' },
      { key: 'curve', label: 'Curve' },
    ],
  },
  {
    label: 'Dribbling',
    face: 'dri',
    rows: [
      { key: 'agility', label: 'Agility' },
      { key: 'balance', label: 'Balance' },
      { key: 'reactions', label: 'Reactions' },
      { key: 'ballControl', label: 'Ball Control' },
      { key: 'dribbling', label: 'Dribbling' },
      { key: 'composure', label: 'Composure' },
    ],
  },
  {
    label: 'Defending',
    face: 'def',
    rows: [
      { key: 'interceptions', label: 'Interceptions' },
      { key: 'headingAccuracy', label: 'Heading Acc.' },
      { key: 'defensiveAwareness', label: 'Def. Aware' },
      { key: 'standingTackle', label: 'Stand Tackle' },
      { key: 'slidingTackle', label: 'Slide Tackle' },
    ],
  },
  {
    label: 'Physical',
    face: 'phy',
    rows: [
      { key: 'jumping', label: 'Jumping' },
      { key: 'stamina', label: 'Stamina' },
      { key: 'strength', label: 'Strength' },
      { key: 'aggression', label: 'Aggression' },
    ],
  },
];

const GK: { label: string; face: 'pac' | 'sho' | 'pas' | 'dri' | 'def' | 'phy'; rows: StatRow[] }[] = [
  { label: 'Diving', face: 'pac', rows: [{ key: 'gkDiving', label: 'Diving' }] },
  { label: 'Handling', face: 'sho', rows: [{ key: 'gkHandling', label: 'Handling' }] },
  { label: 'Kicking', face: 'pas', rows: [{ key: 'gkKicking', label: 'Kicking' }] },
  { label: 'Reflexes', face: 'dri', rows: [{ key: 'gkReflexes', label: 'Reflexes' }] },
  {
    label: 'Speed',
    face: 'def',
    rows: [
      { key: 'acceleration', label: 'Acceleration' },
      { key: 'sprintSpeed', label: 'Sprint Speed' },
    ],
  },
  { label: 'Positioning', face: 'phy', rows: [{ key: 'gkPositioning', label: 'Positioning' }] },
];

export function statGroups(
  position: string,
  face: { pac: number; sho: number; pas: number; dri: number; def: number; phy: number } | undefined,
  stats: Partial<Record<MetaAttr, number>> | undefined,
): StatGroup[] {
  if (position === 'GK') {
    return GK.map((group) => ({
      label: group.label,
      total: face?.[group.face],
      rows: stats ? group.rows.filter((row) => stats[row.key]) : [],
    })).filter((group) => group.total);
  }
  return OUTFIELD.map((group) => ({
    label: group.label,
    total: face?.[group.face],
    rows: stats ? group.rows.filter((row) => stats[row.key]) : [],
  })).filter((group) => group.total);
}

export function statTone(value: number): string {
  if (value >= 75) return '#3DDC97';
  if (value >= 50) return '#E3B341';
  return '#E15B64';
}
