import rosterJson from '@/assets/data/players.json';
import { C, N } from '@/lib/fcPlayers';
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

function playerById(id: string): GamePlayer | null {
  if (resolved.has(id)) return resolved.get(id) ?? null;
  const entry = roster.find((item) => item.id === id);
  const player = entry && isMan(entry) ? toPlayer(entry) : null;
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

function attributeRound(except?: string): MarkRound | null {
  const stars = starMen().filter((player) => player.rating >= 84);
  const rules: { prompt: string; test: (player: GamePlayer) => boolean }[] = [];

  for (const club of new Set(stars.map((player) => player.club))) {
    rules.push({ prompt: `סמנו מי שמשחק ב${club}`, test: (player) => player.club === club });
  }
  for (const nation of new Set(stars.map((player) => player.nation))) {
    rules.push({ prompt: `סמנו מי שבנבחרת ${nation}`, test: (player) => player.nation === nation });
  }
  for (const league of new Set(stars.map((player) => player.league))) {
    rules.push({ prompt: `סמנו מי שמשחק ב${league}`, test: (player) => player.league === league });
  }
  rules.push(
    { prompt: 'סמנו את החלוצים', test: (player) => ATTACK.has(player.position) },
    { prompt: 'סמנו את הקיצוניים', test: (player) => WIDE.has(player.position) },
    { prompt: 'סמנו את הקשרים', test: (player) => MID.has(player.position) },
    { prompt: 'סמנו את שחקני ההגנה', test: (player) => DEF.has(player.position) },
    { prompt: 'סמנו מי שרגלו החזקה שמאל', test: (player) => player.foot === 'L' },
    { prompt: 'סמנו מי שמדורג 88 ומעלה', test: (player) => player.rating >= 88 },
  );

  for (const rule of shuffle(rules)) {
    if (rule.prompt === except) continue;
    const yes = stars.filter(rule.test);
    const no = stars.filter((player) => !rule.test(player));
    if (yes.length < 3 || no.length < 5) continue;
    const take = yes.length >= 4 && Math.random() < 0.5 ? 4 : 3;
    const hits = shuffle(yes).slice(0, take);
    const misses = shuffle(no).slice(0, 9 - hits.length);
    return {
      prompt: rule.prompt,
      players: shuffle([
        ...hits.map((player) => ({ ...player, hit: true })),
        ...misses.map((player) => ({ ...player, hit: false })),
      ]),
    };
  }
  return null;
}

export function makeMarkRound(except?: string): MarkRound {
  const career = Math.random() < 0.45 ? careerRound(except) : null;
  const made = career ?? attributeRound(except) ?? careerRound() ?? attributeRound();
  if (made && made.players.length === 9) return made;
  const stars = shuffle(starMen().filter((player) => player.rating >= 84));
  const hits = stars.filter((player) => player.rating >= 88).slice(0, 3);
  const misses = stars.filter((player) => player.rating < 88).slice(0, 6);
  return {
    prompt: 'סמנו מי שמדורג 88 ומעלה',
    players: shuffle([
      ...hits.map((player) => ({ ...player, hit: true })),
      ...misses.map((player) => ({ ...player, hit: false })),
    ]),
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
