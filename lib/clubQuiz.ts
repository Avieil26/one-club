import { C, PLAYERS, type FcPlayer } from '@/lib/fcPlayers';
import { playerMedia } from '@/lib/playerMedia';

export type ClubQuestion = {
  playerId: string;
  photo: string;
  club: string;
  choices: string[];
};

const MIN_RATING = 84;
const KNOWN_CLUBS = new Set<string>(Object.values(C));

let cached: FcPlayer[] | null = null;

function pool(): FcPlayer[] {
  if (cached) return cached;
  cached = PLAYERS.filter((player) => {
    if (player.edition || player.icon) return false;
    if (player.rating < MIN_RATING) return false;
    if (!player.club || !KNOWN_CLUBS.has(player.club)) return false;
    return Boolean(playerMedia(player.id).photo);
  });
  return cached;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap];
    copy[swap] = current;
  }
  return copy;
}

export function nextClubQuestion(used: readonly string[]): ClubQuestion | null {
  const players = pool().filter((player) => !used.includes(player.id));
  if (!players.length) return null;
  const player = players[Math.floor(Math.random() * players.length)];
  const clubs = [...new Set(pool().map((item) => item.club).filter((club) => club !== player.club))];
  const decoys = shuffle(clubs).slice(0, 3);
  if (decoys.length < 3) return null;
  const photo = playerMedia(player.id).photo ?? '';
  if (!photo) return null;
  return {
    playerId: player.id,
    photo,
    club: player.club,
    choices: shuffle([player.club, ...decoys]),
  };
}

export function portraitByEnglish(name: string): string | null {
  const player = PLAYERS.find((item) => !item.edition && playerMedia(item.id).en === name);
  return player ? playerMedia(player.id).photo ?? null : null;
}
