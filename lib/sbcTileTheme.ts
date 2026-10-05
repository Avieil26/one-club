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
  'sbc-dfg-akliouche': { colors: ['#0A1B18', '#174D49', '#C9A227'], accent: '#FFE8A1', pack: 'gold', packLabel: '', badgeText: '85', badgeTone: 'gold' },
  'sbc-dfg-tarciane': { colors: ['#0A1B18', '#0F5A49', '#2AAE8A'], accent: '#9FF8D8', pack: 'otw', packLabel: '', badgeText: '84', badgeTone: 'teal' },
  'sbc-potm-raphinha': { colors: ['#1A0D0F', '#5A1F26', '#D3B23B'], accent: '#FFE7A8', pack: 'gold', packLabel: '', badgeText: '89', badgeTone: 'gold' },
  'sbc-potm-gross': { colors: ['#1A0D0F', '#4A1F27', '#C9A227'], accent: '#FFE8A1', pack: 'gold', packLabel: '', badgeText: '84', badgeTone: 'gold' },
  'sbc-potm-olise': { colors: ['#0B1B1A', '#174D49', '#C9A227'], accent: '#FFE8A1', pack: 'gold', packLabel: '', badgeText: '91', badgeTone: 'gold' },
  'sbc-potm-malen': { colors: ['#1A0D0F', '#4A2026', '#D3B23B'], accent: '#FFE7A8', pack: 'gold', packLabel: '', badgeText: '85', badgeTone: 'gold' },
  'sbc-dfg-frattesi': { colors: ['#071A18', '#0E574A', '#D3B23B'], accent: '#A7FFE8', pack: 'otw', packLabel: '', badgeText: '84', badgeTone: 'teal' },
  'sbc-mm-italy': {
    colors: ['#10140C', '#1A140C', '#6A3A22'],
    accent: '#E7B89A',
    pack: 'mixed',
    packLabel: '',
    badgeText: null,
    badgeTone: 'bronze',
  },
  'sbc-mm-norway': {
    colors: ['#14120C', '#2A2414', '#C9A227'],
    accent: '#F0E2B0',
    pack: 'electrum',
    packLabel: '',
    badgeText: null,
    badgeTone: 'gold',
  },
  'sbc-mm-netherlands': {
    colors: ['#121418', '#1C2228', '#9AA3B0'],
    accent: '#E8EEF4',
    pack: 'silver-x2',
    packLabel: '',
    badgeText: null,
    badgeTone: 'silver',
  },
  'sbc-mm-england': {
    colors: ['#1A1408', '#3A2C10', '#E3B341'],
    accent: '#FFE7A8',
    pack: 'gold',
    packLabel: '',
    badgeText: null,
    badgeTone: 'gold',
  },
  'sbc-veiga': {
    colors: ['#1A1408', '#3A2C10', '#E3B341'],
    accent: '#FFE7A8',
    pack: 'gold',
    packLabel: '',
    badgeText: null,
    badgeTone: 'gold',
  },
  'sbc-nusa': {
    colors: ['#1A1408', '#3A2C10', '#C9A227'],
    accent: '#FFE7A8',
    pack: 'gold-jumbo',
    packLabel: '',
    badgeText: null,
    badgeTone: 'gold',
  },
  'sbc-dfg-1': {
    colors: ['#1A1408', '#3A2C10', '#C9A227'],
    accent: '#FFE7A8',
    pack: 'gold-small',
    packLabel: '',
    badgeText: null,
    badgeTone: 'gold',
  },
  'sbc-totw-upgrade': {
    colors: ['#0C1210', '#10201C', '#14B8A6'],
    accent: '#D5FFF6',
    pack: 'otw',
    packLabel: 'TOTW',
    badgeText: null,
    badgeTone: 'teal',
  },
  'sbc-intro-espinoza': {
    colors: ['#14180C', '#243018', '#C9A227'],
    accent: '#FFE7A8',
    pack: 'gold-small',
    packLabel: '',
    badgeText: null,
    badgeTone: 'gold',
  },
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
    pack: 'otw',
    packLabel: 'OTW',
    badgeText: '83+',
    badgeTone: 'teal',
  },
  'sbc-otw-bouaddi': {
    colors: ['#042018', '#0E5A48', '#164A3A'],
    accent: '#7EF0D0',
    pack: 'otw',
    packLabel: 'OTW',
    badgeText: '83+',
    badgeTone: 'teal',
  },
  'sbc-upgrade-83': {
    colors: ['#04241F', '#0A5A4A', '#1A8A78'],
    accent: '#A8FFE8',
    pack: 'otw',
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
    pack: 'gold-small',
    packLabel: '',
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
    pack: 'gold',
    packLabel: '',
    badgeText: null,
    badgeTone: 'gold',
  },
  'sbc-silver-upgrade': {
    colors: ['#12161C', '#3A4558', '#9AA3B2'],
    accent: '#E8ECF2',
    pack: 'silver-x2',
    packLabel: 'SILVER',
    badgeText: null,
    badgeTone: 'silver',
  },
  'sbc-bronze-upgrade': {
    colors: ['#1A1008', '#5A3A1C', '#B07840'],
    accent: '#E8C090',
    pack: 'mixed',
    packLabel: '',
    badgeText: null,
    badgeTone: 'bronze',
  },
  'sbc-league-nation-advanced': {
    colors: ['#0C1020', '#2A1A4A', '#5B3FA8'],
    accent: '#D0C0FF',
    pack: 'gold-jumbo',
    packLabel: '',
    badgeText: null,
    badgeTone: 'blue',
  },
  'sbc-nations-10': {
    colors: ['#0A1814', '#1A4A3A', '#3DDC97'],
    accent: '#A8F0C8',
    pack: 'practice',
    packLabel: '',
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

const FACE: Record<string, { en: string; category: string; edge: string; rank: number }> = {
  'sbc-potm-olise': { en: 'Michael Olise', category: 'BUNDESLIGA POTM', edge: '#C9A227', rank: 0 },
  'sbc-dfg-tarciane': { en: 'Tarciane', category: 'DESTINED FOR GLORY', edge: '#14B8A6', rank: 1 },
  'sbc-dfg-akliouche': { en: 'Maghnes Akliouche', category: 'DESTINED FOR GLORY', edge: '#C9A227', rank: 2 },
  'sbc-potm-gross': { en: 'Pascal Groß', category: 'PREMIER LEAGUE POTM', edge: '#CF081F', rank: 3 },
  'sbc-potm-raphinha': { en: 'Raphinha', category: 'LALIGA POTM', edge: '#CF081F', rank: 4 },
  'sbc-potm-malen': { en: 'Donyell Malen', category: 'SERIE A POTM', edge: '#CF081F', rank: 5 },
  'sbc-dfg-frattesi': { en: 'Davide Frattesi', category: 'DESTINED FOR GLORY', edge: '#14B8A6', rank: 6 },
  'sbc-mm-italy': { en: 'Italy vs Belgium', category: 'MARQUEE MATCHUPS', edge: '#009246', rank: 0 },
  'sbc-mm-norway': { en: 'Norway vs Portugal', category: 'MARQUEE MATCHUPS', edge: '#BA0C2F', rank: 0 },
  'sbc-mm-netherlands': { en: 'Netherlands vs Germany', category: 'MARQUEE MATCHUPS', edge: '#FF6A00', rank: 0 },
  'sbc-mm-england': { en: 'England vs Spain', category: 'MARQUEE MATCHUPS', edge: '#CF081F', rank: 0 },
  'sbc-veiga': { en: 'Renato Veiga', category: 'DESTINED', edge: '#C9A227', rank: 1 },
  'sbc-nusa': { en: 'Antonio Nusa', category: 'DESTINED', edge: '#C9A227', rank: 1 },
  'sbc-dfg-1': { en: 'Destined Challenge 1', category: 'DESTINED', edge: '#C9A227', rank: 1 },
  'sbc-intro-espinoza': { en: 'Cristian Espinoza', category: 'FOUNDATIONS', edge: '#3DDC97', rank: 1 },
  'sbc-otw-duo-1': { en: 'Ones to Watch Duo Pick', category: 'PLAYERS', edge: '#14B8A6', rank: 1 },
  'sbc-otw-bouaddi': { en: 'Ayyoub Bouaddi', category: 'PLAYERS', edge: '#14B8A6', rank: 1 },
  'sbc-upgrade-83': { en: '83+ Upgrade', category: 'UPGRADES', edge: '#14B8A6', rank: 2 },
  'sbc-upgrade-79x2': { en: '2x 79+ Upgrade', category: 'UPGRADES', edge: '#3B82F6', rank: 2 },
  'sbc-totw-upgrade': { en: 'TOTW Upgrade', category: 'UPGRADES', edge: '#14B8A6', rank: 2 },
  'sbc-getting-started': { en: 'Intro to Streamlined SBCs', category: 'UPGRADES', edge: '#2BB8A0', rank: 2 },
  'sbc-gold-reroll': { en: 'Gold Re-Roll', category: 'UPGRADES', edge: '#E3B341', rank: 2 },
  'sbc-bronze-silver-reroll': { en: 'Bronze and Silver Re-roll', category: 'UPGRADES', edge: '#8A7A60', rank: 2 },
  'sbc-gold-upgrade': { en: 'Gold Upgrade', category: 'UPGRADES', edge: '#E3B341', rank: 2 },
  'sbc-silver-upgrade': { en: 'Silver Upgrade', category: 'UPGRADES', edge: '#C5CED6', rank: 2 },
  'sbc-bronze-upgrade': { en: 'Bronze Upgrade', category: 'UPGRADES', edge: '#C4845C', rank: 2 },
  'sbc-league-nation-advanced': { en: 'League and Nation Advanced', category: 'UPGRADES', edge: '#5B3FA8', rank: 2 },
  'sbc-nations-10': { en: '10 Nations', category: 'PRACTICE', edge: '#3DDC97', rank: 3 },
};

export function sbcFace(challenge: SbcChallenge) {
  const face = FACE[challenge.id];
  const hebrew = challenge.title.includes(' · ') ? challenge.title.split(' · ').slice(1).join(' · ') : challenge.title;
  return {
    en: face?.en ?? hebrew,
    he: hebrew,
    category: face?.category ?? (challenge.kind === 'streamlined' ? 'UPGRADES' : 'SBC'),
    edge: face?.edge ?? '#C9A227',
    rank: face?.rank ?? 4,
  };
}

export function sbcTileTheme(challenge: SbcChallenge): SbcTileTheme {
  const known = BY_ID[challenge.id];
  if (known) return known;
  return challenge.kind === 'streamlined' ? FALLBACK_STREAM : FALLBACK_CLASSIC;
}
