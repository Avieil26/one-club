import { C, L, N, PLAYERS, type FcPlayer } from '@/lib/fcPlayers';
import { isOpen } from '@/lib/selectors';
import type { SbcChallenge } from '@/lib/types';

export const RETIRED_SBC_IDS = new Set(['sbc-upgrade', 'sbc-puzzle']);

/** Weekly MM set from 17 Sep 2026 — expires 24 Sep 18:00 UTC per EA / FUTBIN. */
const MM_ENDS = '2026-09-24T18:00:00.000Z';
const BOUADDI_ENDS = '2026-09-24T18:00:00.000Z';
const MADRID_DREAMS_ENDS = '2026-09-26T18:00:00.000Z';
const UPGRADE_83_ENDS = '2026-09-29T18:00:00.000Z';
const UPGRADE_79_ENDS = '2026-09-28T18:00:00.000Z';

export const NATION_DRILL_SQUAD: Record<string, string> = {
  gk: 'alisson',
  lb: 'robertson',
  lcb: 'vandijk',
  rcb: 'saliba',
  rb: 'porro',
  lcm: 'odegaard',
  cm: 'macallister',
  rcm: 'szoboszlai',
  lw: 'diaz',
  st: 'isak',
  rw: 'son',
};

export const MADRID_DREAMS_SQUAD: Record<string, string> = {
  gk: 'courtois',
  lb: 'robertson',
  lcb: 'militao',
  rcb: 'vandijk',
  rb: 'hakimi',
  lcm: 'valverde',
  cm: 'vitinha',
  rcm: 'neves',
  lw: 'galeno',
  st: 'alisson',
  rw: 'costa',
};

export const officialChallenges: SbcChallenge[] = [
  {
    id: 'sbc-madrid-dreams',
    title: 'חלומות מדריד · יאן דיומנדה',
    kind: 'classic',
    requirements:
      'חוגגים את מעברו של יאן דיומנדה לריאל מדריד. עד 4 מאותה ליגה, לפחות 3 מאותו מועדון, עד 4 מועדונים, לפחות 2 מדינות, כל הכרטיסים זהב, וכימיה 12.',
    endsAt: MADRID_DREAMS_ENDS,
    createdBy: 'admin',
    targetScore: null,
    rules: {
      chemistry: 12,
      maxSameLeague: 4,
      minSameClub: 3,
      maxClubs: 4,
      minNations: 2,
      minQuality: 'gold',
    },
    reward: 'חבילת זהב ענקית',
    clubs: [C.real],
    previewFormation: '433',
    previewSquad: MADRID_DREAMS_SQUAD,
    createdAt: '2026-09-24T10:00:00.000Z',
  },
  {
    id: 'sbc-mm-celtic',
    title: 'מרקי מאצ׳אפס · סלטיק נגד ריינג׳רס',
    kind: 'classic',
    requirements:
      'אתגר מסורתי מהסבב של 17 בספטמבר 2026. לפחות שחקן אחד מסקוטלנד, לפחות שני מועדונים, לפחות כרטיס כסף אחד, וכימיה 14. הפרס שפורסם: חבילת זהב קטנה.',
    endsAt: MM_ENDS,
    createdBy: 'admin',
    targetScore: null,
    rules: {
      chemistry: 14,
      nationAtLeast: [{ nation: N.scotland, count: 1 }],
      minClubs: 2,
      minSilver: 1,
    },
    reward: 'חבילת זהב קטנה',
    clubs: [C.celtic, C.rangers],
    previewFormation: '433',
    previewSquad: {
      gk: 'pandur',
      lb: 'tierney',
      lcb: 'carter',
      rcb: 'souttar',
      rb: 'tavernier',
      lcm: 'mcgregor',
      cm: 'hatate',
      rcm: 'raskin',
      lw: 'maeda',
      st: 'dessers',
      rw: 'cerny',
    },
    createdAt: '2026-09-17T18:00:00.000Z',
  },
  {
    id: 'sbc-mm-porto',
    title: 'מרקי מאצ׳אפס · פורטו נגד בנפיקה',
    kind: 'classic',
    requirements:
      'לפחות 2 מליגה פורטוגל, לפחות 2 מפורטוגל, עד 6 ליגות, לפחות זהב אחד, כל הכרטיסים מכסף ומעלה, וכימיה 18.',
    endsAt: MM_ENDS,
    createdBy: 'admin',
    targetScore: null,
    rules: {
      chemistry: 18,
      leagueAtLeast: [{ league: L.ligaPt, count: 2 }],
      nationAtLeast: [{ nation: N.portugal, count: 2 }],
      maxLeagues: 6,
      minGold: 1,
      minQuality: 'silver',
    },
    reward: 'חבילת שחקני אלקטרום קטנה',
    clubs: [C.porto, C.benfica],
    previewFormation: '433',
    previewSquad: {
      gk: 'costa',
      lb: 'nuno',
      lcb: 'kiwior',
      rcb: 'silva',
      rb: 'bah',
      lcm: 'florentino',
      cm: 'kokcu',
      rcm: 'eustaquio',
      lw: 'galeno',
      st: 'gyokeres',
      rw: 'conceicao',
    },
    createdAt: '2026-09-17T18:00:00.000Z',
  },
  {
    id: 'sbc-mm-psg',
    title: 'מרקי מאצ׳אפס · פ.ס.ז׳ נגד מרסיי',
    kind: 'classic',
    requirements:
      'לפחות שחקן אחד מפריז סן ז׳רמן או אולימפיק מרסיי, לפחות 2 מצרפת, עד 5 מאותה ליגה, לפחות זהב אחד, כל הכרטיסים מכסף ומעלה, וכימיה 22.',
    endsAt: MM_ENDS,
    createdBy: 'admin',
    targetScore: null,
    rules: {
      chemistry: 22,
      clubsAtLeast: { clubs: [C.psg, C.om], count: 1 },
      nationAtLeast: [{ nation: N.france, count: 2 }],
      maxSameLeague: 5,
      minGold: 1,
      minQuality: 'silver',
    },
    reward: 'חבילת זהב',
    clubs: [C.psg, C.om],
    previewFormation: '433',
    previewSquad: {
      gk: 'alisson',
      lb: 'robertson',
      lcb: 'vandijk',
      rcb: 'konate',
      rb: 'porro',
      lcm: 'vitinha',
      cm: 'bellingham',
      rcm: 'valverde',
      lw: 'vinicius',
      st: 'mbappe',
      rw: 'rodrygo',
    },
    createdAt: '2026-09-17T18:00:00.000Z',
  },
  {
    id: 'sbc-mm-madrid',
    title: 'מרקי מאצ׳אפס · ריאל מדריד נגד אתלטיקו',
    kind: 'classic',
    requirements:
      'לפחות 2 מריאל מדריד או אתלטיקו מדריד, לפחות 2 מלה ליגה, לפחות 4 מאותה מדינה, עד 3 מאותו מועדון, דירוג קבוצה 75, וכימיה 26.',
    endsAt: MM_ENDS,
    createdBy: 'admin',
    targetScore: null,
    rules: {
      chemistry: 26,
      clubsAtLeast: { clubs: [C.real, C.atletico], count: 2 },
      leagueAtLeast: [{ league: L.laliga, count: 2 }],
      sameNationAtLeast: 4,
      maxSameClub: 3,
      minRating: 75,
    },
    reward: 'חבילת שחקני אלקטרום',
    clubs: [C.real, C.atletico],
    previewFormation: '433',
    previewSquad: {
      gk: 'courtois',
      lb: 'balde',
      lcb: 'cubarsi',
      rcb: 'militao',
      rb: 'trent',
      lcm: 'pedri',
      cm: 'koke',
      rcm: 'depaul',
      lw: 'williams',
      st: 'griezmann',
      rw: 'kubo',
    },
    createdAt: '2026-09-17T18:00:00.000Z',
  },
  {
    id: 'sbc-otw-duo-1',
    title: 'Ones to Watch Duo Pick · מורה / גונזאלבש',
    kind: 'streamlined',
    requirements:
      'בחירה בין רודריגו מורה לבין פדרו גונזאלבש (Pote). Streamlined ב־20,000 נקודות פריט — בלי כימיה ובלי עמדות. אפשר כפילויות ולהגיש חלק ולחזור.',
    endsAt: null,
    createdBy: 'admin',
    targetScore: 20000,
    rules: null,
    reward: 'בחירת כרטיס 83+ OTW',
    clubs: [],
    createdAt: '2026-09-19T14:00:00.000Z',
  },
  {
    id: 'sbc-otw-bouaddi',
    title: 'Ones to Watch · איוב בואדי',
    kind: 'streamlined',
    requirements:
      'Streamlined: 20,000 נקודות עבור כרטיס 83 של איוב בואדי. בלי כימיה ובלי עמדות. אפשר כפילויות, ואפשר להגיש חלק ולחזור אחר כך.',
    endsAt: BOUADDI_ENDS,
    createdBy: 'admin',
    targetScore: 20000,
    rules: null,
    reward: 'כרטיס 83+ · קשר אחורי',
    clubs: [],
    createdAt: '2026-09-19T12:00:00.000Z',
  },
  {
    id: 'sbc-upgrade-83',
    title: 'שדרוג 83+',
    kind: 'streamlined',
    requirements:
      'Streamlined: מגישים פריטים עד שמגיעים לניקוד היעד ומקבלים חבילה עם שחקן זהב נדיר בדירוג 83 ומעלה.',
    endsAt: UPGRADE_83_ENDS,
    createdBy: 'admin',
    targetScore: 2500,
    rules: null,
    reward: 'שחקן זהב 83+',
    clubs: [],
    createdAt: '2026-09-24T08:00:00.000Z',
  },
  {
    id: 'sbc-upgrade-79x2',
    title: 'שדרוג 2×79+',
    kind: 'streamlined',
    requirements:
      'Streamlined: מגישים פריטים ומקבלים חבילה עם שני שחקני זהב בדירוג 79 ומעלה (Three of the Best Player Pick).',
    endsAt: UPGRADE_79_ENDS,
    createdBy: 'admin',
    targetScore: null,
    rules: null,
    reward: 'בחירת 2× שחקני 79+',
    clubs: [],
    createdAt: '2026-09-24T08:00:00.000Z',
  },
  {
    id: 'sbc-getting-started',
    title: 'מתחילים',
    kind: 'streamlined',
    requirements: 'אתגרי פתיחה קבועים להיכרות עם מערכת ה-SBC והשדרוגים. בלי תאריך סיום.',
    endsAt: null,
    createdBy: 'admin',
    targetScore: 1000,
    rules: null,
    reward: 'חבילות פתיחה',
    clubs: [],
    createdAt: '2026-09-18T10:00:00.000Z',
  },
  {
    id: 'sbc-gold-reroll',
    title: 'גולד רי־רול',
    kind: 'streamlined',
    requirements: 'מחליפים פריטי זהב בחבילת 2× שחקני זהב 78+. חוזר ללא הגבלה.',
    endsAt: null,
    createdBy: 'admin',
    targetScore: 1250,
    rules: null,
    reward: '2× שחקני זהב 78+',
    clubs: [],
    createdAt: '2026-09-18T10:00:00.000Z',
  },
  {
    id: 'sbc-bronze-silver-reroll',
    title: 'ארד וכסף רי־רול',
    kind: 'streamlined',
    requirements: 'מחליפים פריטי ארד/כסף בחבילת שחקן זהב 75+. חוזר ללא הגבלה.',
    endsAt: null,
    createdBy: 'admin',
    targetScore: 500,
    rules: null,
    reward: 'שחקן זהב 75+',
    clubs: [],
    createdAt: '2026-09-18T10:00:00.000Z',
  },
  {
    id: 'sbc-gold-upgrade',
    title: 'שדרוג זהב',
    kind: 'classic',
    requirements: 'מחליפים סגל זהב בחבילת שחקני זהב קטנה. כל הכרטיסים זהב, דירוג קבוצה עד 85, כימיה 10.',
    endsAt: null,
    createdBy: 'admin',
    targetScore: null,
    rules: {
      chemistry: 10,
      minQuality: 'gold',
    },
    reward: 'חבילת שחקני זהב קטנה',
    clubs: [],
    previewFormation: null,
    previewSquad: null,
    createdAt: '2026-09-18T10:00:00.000Z',
  },
  {
    id: 'sbc-silver-upgrade',
    title: 'שדרוג כסף',
    kind: 'classic',
    requirements: 'מחליפים סגל כסף בשחקן נדיר 75+. כל הכרטיסים כסף.',
    endsAt: null,
    createdBy: 'admin',
    targetScore: null,
    rules: {
      chemistry: 0,
      minQuality: 'silver',
    },
    reward: 'שחקן נדיר 75+',
    clubs: [],
    previewFormation: null,
    previewSquad: null,
    createdAt: '2026-09-18T10:00:00.000Z',
  },
  {
    id: 'sbc-bronze-upgrade',
    title: 'שדרוג ארד',
    kind: 'classic',
    requirements: 'מחליפים סגל ארד בחבילת שני שחקני כסף. כל הכרטיסים ארד.',
    endsAt: null,
    createdBy: 'admin',
    targetScore: null,
    rules: {
      chemistry: 0,
      minQuality: 'bronze',
    },
    reward: '×2 חבילת שחקני כסף',
    clubs: [],
    previewFormation: null,
    previewSquad: null,
    createdAt: '2026-09-18T10:00:00.000Z',
  },
  {
    id: 'sbc-league-nation-advanced',
    title: 'ליגה ומדינה מתקדם',
    kind: 'classic',
    requirements: 'סדרת אתגרי פאזל קבועים של ליגה ומדינה. הפרס הסופי: חבילת זהב גדולה + מטבעות.',
    endsAt: null,
    createdBy: 'admin',
    targetScore: null,
    rules: null,
    reward: 'חבילת זהב גדולה',
    clubs: [],
    createdAt: '2026-09-18T11:00:00.000Z',
  },
  {
    id: 'sbc-nations-10',
    title: 'תרגול כימיה · 10 מדינות',
    kind: 'classic',
    requirements:
      'זה לא אתגר רשמי של EA. כך עובדת דרישת מדינות ב-SBC מסורתי: 11 שחקנים, לפחות 10 לאומים שונים, וכימיה 18.',
    endsAt: null,
    createdBy: 'admin',
    targetScore: null,
    rules: {
      chemistry: 18,
      minNations: 10,
    },
    reward: 'תרגול',
    clubs: [C.liverpool, C.arsenal, C.spurs, C.newcastle],
    previewFormation: '433',
    previewSquad: NATION_DRILL_SQUAD,
    createdAt: '2026-09-23T12:00:00.000Z',
  },
];

const byId = new Map(officialChallenges.map((challenge) => [challenge.id, challenge]));

export function catalogChallenge(id: string): SbcChallenge | undefined {
  return byId.get(id);
}

/** Official + custom SBCs; timed challenges drop off automatically after endsAt. */
export function mergeOfficialSbcs(remote: SbcChallenge[], at = Date.now()): SbcChallenge[] {
  const officialIds = new Set(officialChallenges.map((challenge) => challenge.id));
  const custom = remote.filter((challenge) => !officialIds.has(challenge.id) && !RETIRED_SBC_IDS.has(challenge.id));
  return [...officialChallenges, ...custom].filter((challenge) => isOpen(challenge, at));
}

const playersById = new Map(PLAYERS.map((player) => [player.id, player]));

export function placedPreview(squad: Record<string, string> | null | undefined): Record<string, FcPlayer | null> {
  const placed: Record<string, FcPlayer | null> = {};
  for (const [slot, id] of Object.entries(squad ?? {})) placed[slot] = playersById.get(id) ?? null;
  return placed;
}
