import rosterJson from '@/assets/data/players.json';
import { C, N, type FcPlayer } from '@/lib/fcPlayers';
import { ICON_PLAYERS } from '@/lib/iconPlayers';
import { playerCardMeta } from '@/lib/playerMeta';
import { playerMedia } from '@/lib/playerMedia';
import type { RosterEntry } from '@/lib/playerDb';

export type GamePlayer = {
  id: string;
  name: string;
  en: string;
  club: string;
  nation: string;
  league: string;
  position: string;
  rating: number;
  photo: string;
  foot: 'L' | 'R' | null;
  icon?: boolean;
};

export type GridPuzzle = {
  clubs: string[];
  nations: string[];
};

export type MarkFace = GamePlayer & { hit: boolean };

export type MarkRound = {
  prompt: string;
  players: MarkFace[];
};

const roster = rosterJson as RosterEntry[];
const knownClubs = new Set<string>(Object.values(C));
/** A few men are tagged with the wrong gender in the import. */
const maleFix = new Set(['vinicius', 'son']);

const ATTACK = new Set(['ST', 'CF']);
const WIDE = new Set(['LW', 'RW', 'LM', 'RM']);
const MID = new Set(['CM', 'CAM', 'CDM']);
const DEF = new Set(['CB', 'LB', 'RB', 'LWB', 'RWB']);

const UCL_YES = [
  'haaland', 'foden', 'rodri', 'debruyne', 'dias', 'bernardo', 'grealish', 'bellingham', 'vinicius',
  'valverde', 'rodrygo', 'courtois', 'trent', 'salah', 'vandijk', 'alisson', 'robertson', 'dembele',
  'vitinha', 'hakimi', 'marquinhos', 'kvara', 'donnarumma', 'messi', 'suarez', 'lewandowski', 'neuer',
  'kimmich', 'casemiro',
];

const UCL_NO = [
  'saka', 'rice', 'odegaard', 'saliba', 'martinelli', 'gabriel', 'raya', 'eze', 'kane', 'yamal', 'pedri',
  'gavi', 'cubarsi', 'balde', 'raphinha', 'palmer', 'mbappe', 'griezmann', 'isak', 'szoboszlai', 'konate',
  'macallister', 'diaz', 'musiala', 'wirtz', 'olmo', 'williams', 'oyarzabal', 'merino', 'enzo', 'depaul',
  'cucurella', 'son',
];

const EURO_YES = ['yamal', 'pedri', 'rodri', 'williams', 'olmo', 'cucurella', 'oyarzabal', 'merino', 'ruiz', 'raya'];

const WORLD_YES = ['messi', 'di-maria', 'alvarez', 'enzo', 'depaul', 'macallister', 'martinez', 'molina', 'martinez-lisandro'];

const MESSI_YES = ['mbappe', 'suarez', 'pedri', 'griezmann', 'dembele', 'dejong', 'di-maria'];
const MESSI_NO = [
  'haaland', 'saka', 'kane', 'yamal', 'bellingham', 'rice', 'foden', 'palmer', 'vinicius', 'rodrygo',
  'saliba', 'odegaard', 'kvara', 'lewandowski',
];
const RONALDO_YES = ['casemiro', 'valverde', 'di-maria', 'kovacic'];
const RONALDO_NO = [
  'haaland', 'saka', 'kane', 'yamal', 'pedri', 'bellingham', 'mbappe', 'rice', 'foden', 'palmer',
  'vinicius', 'rodrygo', 'courtois', 'trent', 'saliba',
];

let starsCache: GamePlayer[] | null = null;
let iconsCache: GamePlayer[] | null = null;
const resolved = new Map<string, GamePlayer | null>();

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap]!;
    copy[swap] = current!;
  }
  return copy;
}

function isMan(entry: RosterEntry): boolean {
  return entry.gender === "Men's Football" || maleFix.has(entry.id);
}

function toPlayer(entry: RosterEntry): GamePlayer | null {
  const media = playerMedia(entry.id);
  if (!media.photo) return null;
  return {
    id: entry.id,
    name: entry.name,
    en: media.en || entry.en,
    club: entry.club,
    nation: entry.nation,
    league: entry.league,
    position: entry.position,
    rating: entry.rating,
    photo: media.photo,
    foot: playerCardMeta(entry.id)?.foot ?? null,
    icon: false,
  };
}

function iconToPlayer(entry: FcPlayer): GamePlayer | null {
  const media = playerMedia(entry.id);
  if (!media.photo) return null;
  return {
    id: entry.id,
    name: entry.name,
    en: media.en || entry.en || entry.name,
    club: entry.club,
    nation: entry.nation,
    league: entry.league,
    position: entry.position,
    rating: entry.rating,
    photo: media.photo,
    foot: playerCardMeta(entry.id)?.foot ?? null,
    icon: true,
  };
}

/** Men on known clubs, rated 80+, with a photo. The searchable pool for both games. */
export function starMen(): GamePlayer[] {
  if (starsCache) return starsCache;
  starsCache = roster
    .filter((entry) => isMan(entry) && entry.rating >= 80 && knownClubs.has(entry.club))
    .map(toPlayer)
    .filter((player): player is GamePlayer => Boolean(player));
  return starsCache;
}

function iconStars(): GamePlayer[] {
  if (iconsCache) return iconsCache;
  iconsCache = ICON_PLAYERS
    .filter((player) => player.rating >= 80)
    .map(iconToPlayer)
    .filter((player): player is GamePlayer => Boolean(player));
  return iconsCache;
}

function playerById(id: string): GamePlayer | null {
  if (resolved.has(id)) return resolved.get(id) ?? null;
  const entry = roster.find((item) => item.id === id);
  const player = entry && isMan(entry) ? toPlayer(entry) : iconStars().find((item) => item.id === id) ?? null;
  resolved.set(id, player);
  return player;
}

function facesFrom(yesIds: readonly string[], noIds: readonly string[], takeYes = 3): MarkFace[] | null {
  const yes = yesIds.map(playerById).filter((player): player is GamePlayer => Boolean(player));
  const no = noIds.map(playerById).filter((player): player is GamePlayer => Boolean(player));
  if (yes.length < 3 || no.length < 5) return null;
  const hits = shuffle(yes).slice(0, takeYes);
  const used = new Set(hits.map((player) => player.id));
  const misses = shuffle(no.filter((player) => !used.has(player.id))).slice(0, 9 - hits.length);
  if (hits.length + misses.length < 9) return null;
  return shuffle([
    ...hits.map((player) => ({ ...player, hit: true })),
    ...misses.map((player) => ({ ...player, hit: false })),
  ]);
}

function outsiders(nation: string, blocked: ReadonlySet<string>): string[] {
  return starMen()
    .filter((player) => player.nation !== nation && player.rating >= 84 && !blocked.has(player.id))
    .map((player) => player.id);
}

function careerRound(except?: string): MarkRound | null {
  const options: { prompt: string; players: MarkFace[] | null }[] = [
    {
      prompt: 'סמנו מי שזכה בליגת האלופות',
      players: facesFrom(UCL_YES, UCL_NO, 4),
    },
    {
      prompt: 'סמנו מי ששיחק עם מסי',
      players: facesFrom(MESSI_YES, MESSI_NO, 3),
    },
    {
      prompt: 'סמנו מי ששיחק עם רונאלדו',
      players: facesFrom(RONALDO_YES, RONALDO_NO, 3),
    },
    {
      prompt: 'סמנו מי שזכה ביורו 2024',
      players: facesFrom(EURO_YES, outsiders('ספרד', new Set(EURO_YES)), 4),
    },
    {
      prompt: 'סמנו מי שזכה במונדיאל 2022',
      players: facesFrom(WORLD_YES, outsiders('ארגנטינה', new Set(WORLD_YES)), 4),
    },
  ];
  const ready = shuffle(options.filter((option) => option.players && option.prompt !== except));
  const pick = ready[0];
  if (!pick?.players) return null;
  return { prompt: pick.prompt, players: pick.players };
}

type MarkRule = {
  prompt: string;
  pool: GamePlayer[];
  test: (player: GamePlayer) => boolean;
  minYes?: number;
  maxYes?: number;
};

function ruleRound(rule: MarkRule): MarkRound | null {
  const yes = rule.pool.filter(rule.test);
  const no = rule.pool.filter((player) => !rule.test(player));
  const minYes = rule.minYes ?? 3;
  const maxYes = rule.maxYes ?? 4;
  if (yes.length < minYes || no.length < 9 - Math.min(maxYes, yes.length)) return null;

  const takeYes =
    yes.length <= maxYes
      ? yes.length
      : Math.min(maxYes, Math.max(minYes, Math.random() < 0.45 ? 4 : 3));
  const hits = shuffle(yes).slice(0, takeYes);
  const misses = shuffle(no).slice(0, 9 - hits.length);
  if (hits.length < minYes || misses.length < 5) return null;
  return {
    prompt: rule.prompt,
    players: shuffle([
      ...hits.map((player) => ({ ...player, hit: true })),
      ...misses.map((player) => ({ ...player, hit: false })),
    ]),
  };
}

function regularRules(difficulty: number): MarkRule[] {
  const stars = starMen().filter((player) => player.rating >= 84);
  const rules: MarkRule[] = [];
  const clubs = [...new Set(stars.map((player) => player.club))];
  const nations = [...new Set(stars.map((player) => player.nation))];
  const leagues = [...new Set(stars.map((player) => player.league))];
  const positions = [...new Set(stars.map((player) => player.position))];
  const groups: [string, (player: GamePlayer) => boolean][] = [
    ['החלוצים', (player) => ATTACK.has(player.position)],
    ['הקיצוניים', (player) => WIDE.has(player.position)],
    ['הקשרים', (player) => MID.has(player.position)],
    ['שחקני ההגנה', (player) => DEF.has(player.position)],
  ];

  if (difficulty === 0) {
    for (const club of clubs) rules.push({ prompt: `סמנו מי שמשחק ב${club}`, pool: stars, test: (player) => player.club === club });
    for (const nation of nations) rules.push({ prompt: `סמנו מי שבנבחרת ${nation}`, pool: stars, test: (player) => player.nation === nation });
    for (const league of leagues) rules.push({ prompt: `סמנו מי שמשחק ב${league}`, pool: stars, test: (player) => player.league === league });
    for (const [label, test] of groups) rules.push({ prompt: `סמנו את ${label}`, pool: stars, test });
    for (const position of positions) rules.push({ prompt: `סמנו את שחקני ה-${position}`, pool: stars, test: (player) => player.position === position });
    rules.push(
      { prompt: 'סמנו מי שרגלו החזקה שמאל', pool: stars, test: (player) => player.foot === 'L' },
      { prompt: 'סמנו מי שמדורג 88 ומעלה', pool: stars, test: (player) => player.rating >= 88 },
    );
  }

  if (difficulty >= 1) {
    for (const rating of [86, 88, 90, 92]) {
      rules.push({ prompt: `סמנו מי שמדורג ${rating} ומעלה`, pool: stars, test: (player) => player.rating >= rating });
    }
    for (const club of clubs) {
      rules.push(
        { prompt: `סמנו מי שמשחק ב${club} ומדורג 88+`, pool: stars, test: (player) => player.club === club && player.rating >= 88 },
        { prompt: `סמנו מי שמשחק ב${club} ומדורג 90+`, pool: stars, test: (player) => player.club === club && player.rating >= 90 },
      );
    }
    for (const nation of nations) {
      rules.push(
        { prompt: `סמנו מי שבנבחרת ${nation} ומדורג 88+`, pool: stars, test: (player) => player.nation === nation && player.rating >= 88 },
        { prompt: `סמנו מי שבנבחרת ${nation} ומדורג 90+`, pool: stars, test: (player) => player.nation === nation && player.rating >= 90 },
      );
    }
    for (const league of leagues) {
      rules.push(
        { prompt: `סמנו מי שמשחק ב${league} ומדורג 88+`, pool: stars, test: (player) => player.league === league && player.rating >= 88 },
        { prompt: `סמנו מי שמשחק ב${league} ומדורג 90+`, pool: stars, test: (player) => player.league === league && player.rating >= 90 },
      );
    }
  }

  if (difficulty >= 2) {
    for (const club of clubs) {
      for (const [label, test] of groups) {
        rules.push({
          prompt: `סמנו מי שמשחק ב${club} והוא ${label}`,
          pool: stars,
          test: (player) => player.club === club && test(player),
        });
      }
      rules.push({
        prompt: `סמנו מי שמשחק ב${club} ורגלו החזקה שמאל`,
        pool: stars,
        test: (player) => player.club === club && player.foot === 'L',
      });
    }

    for (const nation of nations) {
      for (const [label, test] of groups) {
        rules.push({
          prompt: `סמנו מי שבנבחרת ${nation} והוא ${label}`,
          pool: stars,
          test: (player) => player.nation === nation && test(player),
        });
      }
    }

    for (const league of leagues) {
      for (const [label, test] of groups) {
        rules.push({
          prompt: `סמנו מי שמשחק ב${league} והוא ${label}`,
          pool: stars,
          test: (player) => player.league === league && test(player),
        });
      }
    }

    for (const rating of [86, 88, 90]) {
      for (const [label, test] of groups) {
        rules.push({
          prompt: `סמנו את ${label} שמדורגים ${rating}+`,
          pool: stars,
          test: (player) => player.rating >= rating && test(player),
        });
      }
    }
  }

  return rules;
}

function iconRules(difficulty: number): MarkRule[] {
  const icons = iconStars();
  const rules: MarkRule[] = [];
  const nations = [...new Set(icons.map((player) => player.nation))];
  const positions = [...new Set(icons.map((player) => player.position))];

  if (difficulty >= 2) {
    rules.push({
      prompt: 'סמנו את האייקונים',
      pool: [...starMen().filter((player) => player.rating >= 84), ...icons],
      test: (player) => Boolean(player.icon),
    });
    for (const nation of nations) {
      rules.push({ prompt: `סמנו את האייקונים מ${nation}`, pool: icons, test: (player) => player.nation === nation });
    }
    for (const position of positions) {
      rules.push({ prompt: `סמנו את האייקונים בעמדת ${position}`, pool: icons, test: (player) => player.position === position });
    }
    for (const rating of [86, 88, 90, 92]) {
      rules.push({ prompt: `סמנו אייקונים בדירוג ${rating}+`, pool: icons, test: (player) => player.rating >= rating });
    }
  }

  if (difficulty >= 3) {
    for (const nation of nations) {
      for (const rating of [88, 90, 92]) {
        rules.push({
          prompt: `סמנו אייקונים מ${nation} בדירוג ${rating}+`,
          pool: icons,
          test: (player) => player.nation === nation && player.rating >= rating,
        });
      }
    }
    for (const position of positions) {
      for (const rating of [88, 90]) {
        rules.push({
          prompt: `סמנו אייקונים בעמדת ${position} בדירוג ${rating}+`,
          pool: icons,
          test: (player) => player.position === position && player.rating >= rating,
        });
      }
    }
  }

  if (difficulty >= 4) {
    for (const nation of nations) {
      for (const position of positions) {
        rules.push({
          prompt: `סמנו אייקונים מ${nation} בעמדת ${position}`,
          pool: icons,
          test: (player) => player.nation === nation && player.position === position,
        });
      }
    }
  }

  return rules;
}

function quizMen(): GamePlayer[] {
  return roster
    .filter((entry) => isMan(entry) && entry.rating >= 80)
    .map(toPlayer)
    .filter((player): player is GamePlayer => Boolean(player));
}

function mergedWhoPool(): GamePlayer[] {
  const seen = new Set<string>();
  const result: GamePlayer[] = [];
  for (const player of [...quizMen(), ...iconStars()]) {
    if (seen.has(player.id)) continue;
    seen.add(player.id);
    result.push(player);
  }
  return result;
}

function resolveIds(candidates: readonly string[]): GamePlayer[] {
  const seen = new Set<string>();
  const result: GamePlayer[] = [];
  for (const id of candidates) {
    const player = playerById(id);
    if (!player || seen.has(player.id)) continue;
    seen.add(player.id);
    result.push(player);
  }
  return result;
}

function factRule(
  prompt: string,
  candidates: readonly string[],
  minYes = 1,
  maxYes = 4,
): MarkRule {
  const answers = resolveIds(candidates);
  const answerIds = new Set(answers.map((player) => player.id));
  return {
    prompt,
    pool: mergedWhoPool(),
    test: (player) => answerIds.has(player.id),
    minYes,
    maxYes,
  };
}

function factRules(difficulty: number): MarkRule[] {
  const rules: MarkRule[] = [];

  if (difficulty >= 1) {
    rules.push(
      factRule('מי זכה בפרס UEFA Men's Player of the Year שלוש פעמים?', [
        'cristiano-ronaldo', 'cristiano', 'cr7', 'cristiano-ronaldo-7',
      ], 1, 1),
      factRule('מי נבחר לנבחרת השנה של FIFPRO תשע שנים ברציפות?', ['iniesta'], 1, 1),
      factRule('מי זכה בליגת האלופות עם יותר ממועדון אחד?', [
        'cristiano-ronaldo', 'cristiano', 'cr7', 'clarence-seedorf',
      ], 1, 3),
      factRule('מי זכה ב-6 תארי ליגת האלופות?', ['carvajal', 'luka-modric', 'modric'], 1, 2),
    );
  }

  if (difficulty >= 2) {
    rules.push(
      factRule('מי מלך ההופעות בכל הזמנים בליגת האלופות?', ['cristiano-ronaldo', 'cristiano', 'cr7'], 1, 1),
      factRule('מי מלך השערים בכל הזמנים בליגת האלופות?', ['cristiano-ronaldo', 'cristiano', 'cr7'], 1, 1),
      factRule('מי השחקן היחיד שכבש בשלושה גמרי ליגת האלופות?', ['cristiano-ronaldo', 'cristiano', 'cr7'], 1, 1),
      factRule('מי נבחר ל-FIFPRO World 11 גם ב-2024 וגם ב-2025?', [
        'bellingham', 'mbappe', 'vandijk', 'carvajal',
      ], 1, 3),
      factRule('מי נבחר ל-FIFPRO World 11 ב-2025?', [
        'donnarumma', 'vandijk', 'hakimi', 'nuno', 'bellingham', 'palmer',
        'pedri', 'vitinha', 'dembele', 'mbappe', 'yamal',
      ], 1, 4),
    );
  }

  if (difficulty >= 3) {
    rules.push(
      factRule('מי מחזיק בשיא ההופעות במונדיאל?', ['messi'], 1, 1),
      factRule('מי כבש בשש מהדורות שונות של גביע העולם?', [
        'cristiano-ronaldo', 'cristiano', 'cr7',
      ], 1, 1),
      factRule('מי כבש ב-9 הופעות רצופות בגביע העולם?', ['messi'], 1, 1),
      factRule('מי נבחר ל-FIFPRO World 11 תשע פעמים ברצף?', ['iniesta'], 1, 1),
      factRule('מי זכה בליגת האלופות 5 פעמים?', [
        'cristiano-ronaldo', 'cristiano', 'cr7', 'benzema', 'kroos',
      ], 1, 3),
      factRule('מי שיחק ב-5 טורנירי מונדיאל?', [
        'messi', 'cristiano-ronaldo', 'cristiano', 'cr7', 'modric', 'neuer',
      ], 1, 4),
    );
  }

  if (difficulty >= 4) {
    rules.push(
      factRule('מי זכה גם במונדיאל וגם בליגת האלופות?', [
        'messi', 'modric', 'kroos', 'iniesta', 'varane', 'ronaldinho',
      ], 1, 4),
      factRule('מי נבחר ל-FIFPRO World 11 ב-2024?', [
        'ederson', 'carvajal', 'vandijk', 'rudiger', 'bellingham', 'debruyne',
        'kroos', 'rodri', 'haaland', 'mbappe', 'vinicius',
      ], 1, 4),
      factRule('מי הגיע לשישה גמרי ליגת האלופות?', [
        'cristiano-ronaldo', 'cristiano', 'cr7', 'carvajal', 'kroos', 'modric',
      ], 1, 4),
    );
  }

  return rules;
}

function historyRound(except?: string): MarkRound | null {
  const options: { prompt: string; yes: readonly string[]; no: readonly string[] }[] = [
    { prompt: 'סמנו מי שזכה בליגת האלופות', yes: UCL_YES, no: UCL_NO },
    { prompt: 'סמנו מי ששיחק עם מסי', yes: MESSI_YES, no: MESSI_NO },
    { prompt: 'סמנו מי ששיחק עם רונאלדו', yes: RONALDO_YES, no: RONALDO_NO },
    { prompt: 'סמנו מי שזכה ביורו 2024', yes: EURO_YES, no: outsiders('ספרד', new Set(EURO_YES)) },
    { prompt: 'סמנו מי שזכה במונדיאל 2022', yes: WORLD_YES, no: outsiders('ארגנטינה', new Set(WORLD_YES)) },
  ];
  const ready = shuffle(options.filter((option) => option.prompt !== except));
  const pick = ready[0];
  return pick ? facesFrom(pick.yes, pick.no, 4) : null;
}

function difficultyForCorrect(correctCount: number): number {
  if (correctCount < 3) return 0;
  if (correctCount < 6) return 1;
  if (correctCount < 10) return 2;
  if (correctCount < 15) return 3;
  return 4;
}

export function makeMarkRound(correctCount = 0, usedPrompts: readonly string[] = []): MarkRound {
  const difficulty = difficultyForCorrect(correctCount);
  const used = new Set(usedPrompts);

  for (const rule of shuffle([...factRules(difficulty), ...regularRules(difficulty), ...iconRules(difficulty)])) {
    if (used.has(rule.prompt)) continue;
    const made = ruleRound(rule);
    if (made) return made;
  }

  if (difficulty >= 3) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const made = historyRound();
      if (made && !used.has(made.prompt)) return made;
    }
  }

  for (const rule of shuffle([...factRules(2), ...regularRules(0), ...regularRules(1), ...regularRules(2), ...iconRules(2)])) {
    if (used.has(rule.prompt)) continue;
    const made = ruleRound(rule);
    if (made) return made;
  }

  const last = historyRound();
  if (last) return last;
  return {
    prompt: 'סמנו מי שמדורג 88 ומעלה',
    players: ruleRound({
      prompt: 'fallback',
      pool: starMen().filter((player) => player.rating >= 84),
      test: (player) => player.rating >= 88,
    })?.players ?? [],
  };
}

function solvable(clubs: string[], nations: string[], pool: GamePlayer[]): boolean {
  return nations.every((nation) => clubs.every((club) => pool.some((player) => player.club === club && player.nation === nation)));
}

export function makeGrid(): GridPuzzle {
  const pool = starMen();
  const clubs = [...new Set(pool.map((player) => player.club))];
  const nations = [...new Set(pool.map((player) => player.nation))];
  for (let attempt = 0; attempt < 250; attempt += 1) {
    const pickedClubs = shuffle(clubs).slice(0, 3);
    const pickedNations = shuffle(nations).slice(0, 3);
    if (solvable(pickedClubs, pickedNations, pool)) return { clubs: pickedClubs, nations: pickedNations };
  }
  return { clubs: [C.real, C.barca, C.psg], nations: [N.france, N.spain, N.portugal] };
}

export function searchStars(query: string): GamePlayer[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < 1) return [];
  const folded = needle.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return starMen()
    .filter((player) => {
      const en = player.en.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return player.name.toLowerCase().includes(needle) || en.includes(folded);
    })
    .slice(0, 6);
}

export function missLine(livesLeft: number): string {
  if (livesLeft >= 2) return `טעית. נשאר לך עוד ${livesLeft} טעויות`;
  if (livesLeft === 1) return 'טעית. נשאר לך עוד טעות אחת';
  return 'טעית. נגמרו הטעויות';
}
