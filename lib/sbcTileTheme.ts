import type { BadgeTone, PackVisual } from '@/components/SbcRewardPack';
import type { SbcChallenge } from '@/lib/types';

export type SbcTileTheme = {
  colors: [string, string, string];
  accent: string;
  pack: PackVisual;
  packLabel: string;
  badgeText: string | null;
  badgeTone: BadgeTone;
};

const BY_ID: Record<string, SbcTileTheme> = {
  'sbc-madrid-dreams': {
    colors: ['#0B1A3A', '#1E3A8A', '#C9A227'],
    accent: '#FFE08A',
    pack: 'gold-giant',
    packLabel: 'GIANT',
    badgeText: 'MD',
    badgeTone: 'gold',
  },
  'sbc-mm-celtic': {
    colors: ['#0A3A22', '#1B6B3A', '#0F1A3A'],
    accent: '#A8F0C8',
    pack: 'gold-small',
    packLabel: 'GOLD',
    badgeText: null,
    badgeTone: 'green',
  },
  'sbc-mm-porto': {
    colors: ['#0C1A36', '#1E4A8A', '#C9A227'],
    accent: '#C5DEFF',
    pack: 'electrum-small',
    packLabel: 'ELCT',
    badgeText: null,
    badgeTone: 'blue',
  },
  'sbc-mm-psg': {
    colors: ['#0A1028', '#1A2A6A', '#C4161C'],
    accent: '#FFB0B4',
    pack: 'gold',
    packLabel: 'GOLD',
    badgeText: null,
    badgeTone: 'blue',
  },
  'sbc-mm-madrid': {
    colors: ['#0C1420', '#1A3050', '#C9A227'],
    accent: '#FFE08A',
    pack: 'electrum',
    packLabel: 'ELCT',
    badgeText: null,
    badgeTone: 'gold',
  },
  'sbc-otw-duo-1': {
    colors: ['#04241F', '#0A5A4A', '#1E3A8A'],
    accent: '#7EF0D0',
    pack: 'pick',
    packLabel: '83+',
    badgeText: '83+',
    badgeTone: 'teal',
  },
  'sbc-otw-bouaddi': {
    colors: ['#042018', '#0E5A48', '#164A3A'],
    accent: '#7EF0D0',
    pack: 'otw',
    packLabel: '83+',
    badgeText: '83+',
    badgeTone: 'teal',
  },
  'sbc-upgrade-83': {
    colors: ['#04241F', '#0A5A4A', '#1A8A78'],
    accent: '#A8FFE8',
    pack: 'rare-75',
    packLabel: '83+',
    badgeText: '83+',
    badgeTone: 'teal',
  },
  'sbc-upgrade-79x2': {
    colors: ['#0C1830', '#1E4A7A', '#3B82F6'],
    accent: '#9EC5FF',
    pack: 'pick',
    packLabel: '79+',
    badgeText: '79+',
    badgeTone: 'blue',
  },
  'sbc-getting-started': {
    colors: ['#0A1C28', '#1A4A5A', '#2BB8A0'],
    accent: '#A8FFE8',
    pack: 'mixed',
    packLabel: 'START',
    badgeText: null,
    badgeTone: 'green',
  },
  'sbc-gold-reroll': {
    colors: ['#2A1C08', '#6A4A12', '#E3B341'],
    accent: '#FFE08A',
    pack: 'gold',
    packLabel: '78+',
    badgeText: '78+',
    badgeTone: 'gold',
  },
  'sbc-bronze-silver-reroll': {
    colors: ['#1A1410', '#4A3A28', '#8A7A60'],
    accent: '#D8C8A8',
    pack: 'rare-75',
    packLabel: '75+',
    badgeText: '75+',
    badgeTone: 'silver',
  },
  'sbc-gold-upgrade': {
    colors: ['#241808', '#7A5A14', '#F0C14A'],
    accent: '#FFF0B0',
    pack: 'gold-small',
    packLabel: 'GOLD',
    badgeText: null,
    badgeTone: 'gold',
  },
  'sbc-silver-upgrade': {
    colors: ['#12161C', '#3A4558', '#9AA3B2'],
    accent: '#E8ECF2',
    pack: 'silver-x2',
    packLabel: '75+',
    badgeText: null,
    badgeTone: 'silver',
  },
  'sbc-bronze-upgrade': {
    colors: ['#1A1008', '#5A3A1C', '#B07840'],
    accent: '#E8C090',
    pack: 'silver-x2',
    packLabel: '×2',
    badgeText: null,
    badgeTone: 'bronze',
  },
  'sbc-league-nation-advanced': {
    colors: ['#0C1020', '#2A1A4A', '#5B3FA8'],
    accent: '#D0C0FF',
    pack: 'gold-jumbo',
    packLabel: 'JUMBO',
    badgeText: null,
    badgeTone: 'blue',
  },
  'sbc-nations-10': {
    colors: ['#0A1814', '#1A4A3A', '#3DDC97'],
    accent: '#A8F0C8',
    pack: 'practice',
    packLabel: 'DRILL',
    badgeText: '10',
    badgeTone: 'green',
  },
};

const FALLBACK_CLASSIC: SbcTileTheme = {
  colors: ['#0C1814', '#1A3A2C', '#C9A227'],
  accent: '#FFE08A',
  pack: 'gold',
  packLabel: 'PACK',
  badgeText: null,
  badgeTone: 'green',
};

const FALLBACK_STREAM: SbcTileTheme = {
  colors: ['#0A1C28', '#0E4A5A', '#2BB8A0'],
  accent: '#7EF0D0',
  pack: 'otw',
  packLabel: 'SBC',
  badgeText: null,
  badgeTone: 'teal',
};

export function sbcTileTheme(challenge: SbcChallenge): SbcTileTheme {
  const known = BY_ID[challenge.id];
  if (known) return known;
  return challenge.kind === 'streamlined' ? FALLBACK_STREAM : FALLBACK_CLASSIC;
}
