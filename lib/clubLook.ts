import type { ImageSourcePropType } from 'react-native';

import { C } from '@/lib/fcPlayers';

export type ClubLook = {
  letters: string;
  bg: string;
  fg: string;
  accent: string;
  crest: ImageSourcePropType | null;
  crestUri: string | null;
};

const CRESTS: Record<string, ImageSourcePropType> = {
  [C.celtic]: require('../assets/crests/celtic.png'),
  [C.rangers]: require('../assets/crests/rangers.png'),
  [C.porto]: require('../assets/crests/porto.png'),
  [C.benfica]: require('../assets/crests/benfica.png'),
  [C.psg]: require('../assets/crests/psg.png'),
  [C.om]: require('../assets/crests/om.png'),
  [C.real]: require('../assets/crests/real.png'),
  [C.atletico]: require('../assets/crests/atletico.png'),
  [C.liverpool]: require('../assets/crests/liverpool.png'),
  [C.arsenal]: require('../assets/crests/arsenal.png'),
  [C.spurs]: require('../assets/crests/spurs.png'),
  [C.newcastle]: require('../assets/crests/newcastle.png'),
};

/** football-data.org team ids (PNG: https://crests.football-data.org/{id}.png). */
const TEAM_ID: Record<string, number> = {
  [C.real]: 86,
  [C.barca]: 81,
  [C.atletico]: 78,
  [C.city]: 65,
  [C.liverpool]: 64,
  [C.arsenal]: 57,
  [C.chelsea]: 61,
  [C.united]: 66,
  [C.spurs]: 73,
  [C.newcastle]: 67,
  [C.brighton]: 397,
  [C.villa]: 58,
  [C.bayern]: 5,
  [C.dortmund]: 4,
  [C.leverkusen]: 3,
  [C.psg]: 524,
  [C.om]: 516,
  [C.inter]: 108,
  [C.milan]: 98,
  [C.juve]: 109,
  [C.napoli]: 113,
  [C.roma]: 100,
  [C.ajax]: 678,
  [C.psv]: 674,
  [C.porto]: 503,
  [C.benfica]: 1903,
  [C.sporting]: 498,
  [C.celtic]: 732,
  [C.galatasaray]: 645,
  [C.brugge]: 851,
  // English EA leftovers
  'Manchester City': 65,
  'Manchester United': 66,
  Chelsea: 61,
  Arsenal: 57,
  Liverpool: 64,
  Tottenham: 73,
  'Tottenham Hotspur': 73,
  Newcastle: 67,
  'Newcastle United': 67,
  Brighton: 397,
  'Aston Villa': 58,
  'Real Madrid': 86,
  Barcelona: 81,
  'FC Barcelona': 81,
  'Atlético Madrid': 78,
  'Atletico Madrid': 78,
  'Bayern Munich': 5,
  'Bayern München': 5,
  'VfL Wolfsburg': 11,
  Leverkusen: 3,
  'Bayer Leverkusen': 3,
  'Borussia Dortmund': 4,
  Juventus: 109,
  Inter: 108,
  'Inter Milan': 108,
  Milan: 98,
  'AC Milan': 98,
  Napoli: 113,
  Roma: 100,
  'AS Roma': 100,
  Ajax: 678,
  PSV: 674,
  'Paris Saint Germain': 524,
  'Paris Saint-Germain': 524,
  PSG: 524,
  'Olympique Marseille': 516,
  'Athletic Club': 77,
  'Athletic Bilbao': 77,
  Sevilla: 559,
  Valencia: 95,
  Villarreal: 94,
  'RB Leipzig': 721,
  Stuttgart: 10,
  Freiburg: 17,
  'Eintracht Frankfurt': 19,
  Monaco: 548,
  Lille: 521,
  Lyon: 523,
  Nice: 522,
  Rennes: 529,
  Lens: 546,
  'Sporting CP': 498,
  Benfica: 1903,
  Porto: 503,
  Celtic: 732,
};

/** Crests football-data.org does not carry. */
const CREST_URI: Record<string, string> = {
  'טרבזונספור': 'https://r2.thesportsdb.com/images/media/team/badge/96s34o1776827629.png',
  'לוס אנג׳לס': 'https://r2.thesportsdb.com/images/media/team/badge/7nbj2a1602103638.png',
};

const COLORS: Record<string, Pick<ClubLook, 'letters' | 'bg' | 'fg' | 'accent'>> = {
  [C.celtic]: { letters: 'CFC', bg: '#018749', fg: '#FFFFFF', accent: '#F4F7F2' },
  [C.rangers]: { letters: 'RFC', bg: '#1B458F', fg: '#FFFFFF', accent: '#E10600' },
  [C.porto]: { letters: 'FCP', bg: '#0033A0', fg: '#FFFFFF', accent: '#FFFFFF' },
  [C.benfica]: { letters: 'SLB', bg: '#E10600', fg: '#FFFFFF', accent: '#FFFFFF' },
  [C.psg]: { letters: 'PSG', bg: '#0A1D4E', fg: '#FFFFFF', accent: '#DA291C' },
  [C.om]: { letters: 'OM', bg: '#78B7E5', fg: '#0033A0', accent: '#FFFFFF' },
  [C.real]: { letters: 'RM', bg: '#F7F8FA', fg: '#C9A227', accent: '#C9A227' },
  [C.atletico]: { letters: 'ATM', bg: '#CB3524', fg: '#FFFFFF', accent: '#FFFFFF' },
  [C.barca]: { letters: 'FCB', bg: '#A50044', fg: '#FFFFFF', accent: '#004D98' },
  [C.liverpool]: { letters: 'LFC', bg: '#C8102E', fg: '#FFFFFF', accent: '#F6EB61' },
  [C.arsenal]: { letters: 'AFC', bg: '#EF0107', fg: '#FFFFFF', accent: '#FFFFFF' },
  [C.spurs]: { letters: 'THFC', bg: '#132257', fg: '#FFFFFF', accent: '#FFFFFF' },
  [C.newcastle]: { letters: 'NUFC', bg: '#241F20', fg: '#FFFFFF', accent: '#FFFFFF' },
  [C.city]: { letters: 'MCI', bg: '#6CABDD', fg: '#1C2C5B', accent: '#FFFFFF' },
  [C.chelsea]: { letters: 'CFC', bg: '#034694', fg: '#FFFFFF', accent: '#FFFFFF' },
  [C.united]: { letters: 'MUFC', bg: '#DA291C', fg: '#FFFFFF', accent: '#FBE122' },
  [C.bayern]: { letters: 'FCB', bg: '#DC052D', fg: '#FFFFFF', accent: '#FFFFFF' },
  [C.dortmund]: { letters: 'BVB', bg: '#FDE100', fg: '#000000', accent: '#000000' },
  [C.leverkusen]: { letters: 'B04', bg: '#E32221', fg: '#FFFFFF', accent: '#FFFFFF' },
  [C.inter]: { letters: 'INT', bg: '#010E80', fg: '#FFFFFF', accent: '#A8A9AD' },
  [C.milan]: { letters: 'ACM', bg: '#FB090B', fg: '#FFFFFF', accent: '#000000' },
  [C.juve]: { letters: 'JUV', bg: '#000000', fg: '#FFFFFF', accent: '#FFFFFF' },
  [C.napoli]: { letters: 'NAP', bg: '#12A0D7', fg: '#FFFFFF', accent: '#FFFFFF' },
  'טרבזונספור': { letters: 'TS', bg: '#6C1D45', fg: '#7EC8E3', accent: '#7EC8E3' },
  'לוס אנג׳לס': { letters: 'LA', bg: '#111111', fg: '#C4A35A', accent: '#C4A35A' },
};

function crestUriFor(club: string): string | null {
  if (CREST_URI[club]) return CREST_URI[club];
  const id = TEAM_ID[club];
  if (!id) return null;
  return `https://crests.football-data.org/${id}.png`;
}

export function clubLook(club: string): ClubLook {
  const colors = COLORS[club] ?? {
    letters: club.slice(0, 3),
    bg: '#353E54',
    fg: '#F7F8FA',
    accent: '#51607A',
  };
  const local = CRESTS[club] ?? null;
  return {
    ...colors,
    crest: local,
    crestUri: local ? null : crestUriFor(club),
  };
}
