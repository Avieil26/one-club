import type { CareerSubmission, FutPost, FutRating, GroundsPost, Profile, SbcSolution, Snapshot } from '@/lib/types';

/** Cumulative XP required to stand on this level. Level 1 is 0. Level 50 is about 2,110. */
export function xpToReach(level: number): number {
  if (level <= 1) return 0;
  return Math.round(25 * (level - 1) ** 1.14);
}

export function levelForXp(xp: number): number {
  let level = 1;
  for (let next = 2; next <= 50; next += 1) {
    if (xp < xpToReach(next)) break;
    level = next;
  }
  return level;
}

export type XpProgress = {
  level: number;
  xp: number;
  into: number;
  span: number;
  maxed: boolean;
};

/** Same curve as the board. `into` / `span` is the step toward the next level. */
export function xpProgress(xp: number): XpProgress {
  const safe = Math.max(0, Math.floor(xp));
  const level = levelForXp(safe);
  const floor = xpToReach(level);
  const maxed = level >= 50;
  const next = maxed ? floor : xpToReach(level + 1);
  return { level, xp: safe, into: safe - floor, span: Math.max(1, next - floor), maxed };
}

export function communityXp(
  userId: string,
  snap: Pick<Snapshot, 'submissions' | 'solutions' | 'futPosts' | 'ratings'>,
): number {
  return xpOf(userId, snap.submissions, snap.solutions, snap.futPosts, snap.ratings);
}

const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

export function joinedLine(iso: string, now = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'בקהילה';
  if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) return 'בקהילה החודש';
  return `בקהילה מ${MONTHS[date.getMonth()]}`;
}

export type BoardRow = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  joined: string;
  level: number;
  value: number;
  you: boolean;
};

export type CommunityBoards = {
  xp: BoardRow[];
  solvers: BoardRow[];
  supporters: BoardRow[];
};

function weekKey(iso: string): string {
  const date = new Date(iso);
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-${week}`;
}

function approvedChallenges(submissions: CareerSubmission[], userId: string): number {
  const ids = new Set<string>();
  for (const item of submissions) {
    if (item.userId === userId && item.status === 'approved') ids.add(item.challengeId);
  }
  return ids.size;
}

function confirmedSolutions(solutions: SbcSolution[], userId: string): SbcSolution[] {
  return solutions.filter((item) => item.userId === userId && item.workedUserIds.length > 0);
}

function squadXp(posts: FutPost[], ratings: FutRating[], userId: string): number {
  const earned: string[] = [];
  for (const post of posts) {
    if (post.userId !== userId || post.kind !== 'squad') continue;
    const marks = ratings
      .filter((rating) => rating.postId === post.id && rating.userId !== userId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (marks.length >= 3) earned.push(marks[2].createdAt);
  }
  const used = new Map<string, number>();
  let xp = 0;
  for (const at of earned.sort()) {
    const key = weekKey(at);
    const count = used.get(key) ?? 0;
    if (count >= 2) continue;
    used.set(key, count + 1);
    xp += 10;
  }
  return xp;
}

function xpOf(userId: string, submissions: CareerSubmission[], solutions: SbcSolution[], posts: FutPost[], ratings: FutRating[]): number {
  const proofs = approvedChallenges(submissions, userId) * 25;
  const solved = solutions.filter((item) => item.userId === userId && item.workedUserIds.length >= 3).length * 15;
  return proofs + solved + squadXp(posts, ratings, userId);
}

function solvedOf(userId: string, submissions: CareerSubmission[], solutions: SbcSolution[]): number {
  return approvedChallenges(submissions, userId) + confirmedSolutions(solutions, userId).length;
}

function supportOf(userId: string, solutions: SbcSolution[], posts: FutPost[], ratings: FutRating[]): number {
  const worked = solutions.filter((item) => item.userId !== userId && item.workedUserIds.includes(userId)).length;
  const rated = ratings.filter((rating) => {
    if (rating.userId !== userId) return false;
    const post = posts.find((item) => item.id === rating.postId);
    return Boolean(post && post.kind === 'squad' && post.userId !== userId);
  }).length;
  return worked + rated;
}

function faceOf(profile: Profile, grounds: GroundsPost[]): string | null {
  if (profile.avatarUrl) return profile.avatarUrl;
  const post = grounds.find((item) => item.userId === profile.id && item.avatarUri);
  return post?.avatarUri ?? null;
}

function rows(
  profiles: Profile[],
  grounds: GroundsPost[],
  score: (profile: Profile) => number,
  xp: (profile: Profile) => number,
  youId: string | null,
): BoardRow[] {
  return profiles
    .map((profile) => {
      const value = score(profile);
      const points = xp(profile);
      return {
        userId: profile.id,
        name: profile.displayName,
        avatarUrl: faceOf(profile, grounds),
        joined: joinedLine(profile.createdAt),
        level: levelForXp(points),
        value,
        you: profile.id === youId,
      };
    })
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, 'he'))
    .slice(0, 20);
}

export function communityBoards(
  snap: Pick<Snapshot, 'user' | 'profiles' | 'submissions' | 'solutions' | 'futPosts' | 'ratings' | 'grounds'>,
): CommunityBoards {
  const { profiles, submissions, solutions, futPosts, ratings, grounds, user } = snap;
  const youId = user?.id ?? null;
  const points = (profile: Profile) => xpOf(profile.id, submissions, solutions, futPosts, ratings);
  return {
    xp: rows(profiles, grounds, points, points, youId),
    solvers: rows(profiles, grounds, (profile) => solvedOf(profile.id, submissions, solutions), points, youId),
    supporters: rows(profiles, grounds, (profile) => supportOf(profile.id, solutions, futPosts, ratings), points, youId),
  };
}
