import type { CareerChallenge, FutPost, FutRating, GroundsPost, Profile, SbcChallenge, SbcSolution } from '@/lib/types';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function isOpen(challenge: { endsAt: string | null }, at = Date.now()): boolean {
  return !challenge.endsAt || new Date(challenge.endsAt).getTime() > at;
}

export function openChallenges(list: CareerChallenge[], at = Date.now()): CareerChallenge[] {
  return list
    .filter((challenge) => isOpen(challenge, at))
    .sort((a, b) => (a.endsAt ?? '9999').localeCompare(b.endsAt ?? '9999'));
}

/** Active SBCs only — expired timed challenges are removed from the site automatically. */
export function openSbcChallenges(list: SbcChallenge[], at = Date.now()): SbcChallenge[] {
  return list
    .filter((challenge) => isOpen(challenge, at))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || (b.endsAt ?? '9999').localeCompare(a.endsAt ?? '9999'));
}

export type RatingSummary = {
  fit: number;
  fun: number;
  creativity: number;
  overall: number;
  count: number;
};

function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function averageRating(postId: string, ratings: FutRating[]): RatingSummary {
  const mine = ratings.filter((rating) => rating.postId === postId);
  const fit = mean(mine.map((rating) => rating.fit));
  const fun = mean(mine.map((rating) => rating.fun));
  const creativity = mean(mine.map((rating) => rating.creativity));
  return {
    fit,
    fun,
    creativity,
    overall: mine.length ? (fit + fun + creativity) / 3 : 0,
    count: mine.length,
  };
}

export function featuredSquads(posts: FutPost[], ratings: FutRating[], at = Date.now()) {
  return posts
    .filter((post) => post.kind === 'squad' && post.status === 'approved' && new Date(post.createdAt).getTime() >= at - WEEK_MS)
    .map((post) => ({ post, rating: averageRating(post.id, ratings) }))
    .filter((item) => item.rating.count > 0)
    .sort((a, b) => b.rating.overall - a.rating.overall);
}

export function needPlayers(posts: GroundsPost[]): GroundsPost[] {
  return posts.filter((post) => post.intent === 'need_player');
}

export function badgesFor(user: Profile, grounds: GroundsPost[]): string[] {
  const badges: string[] = [];
  if (user.approvedCount >= 5) badges.push('מאומת');
  if (user.approvedCount >= 3) badges.push('מלך האתגרים');
  if (grounds.filter((post) => post.userId === user.id).length >= 2) badges.push('סקאוט');
  return badges;
}

export function pendingCount(input: {
  user: Profile | null;
  submissions: { status: string }[];
  grounds: GroundsPost[];
  comments: { status: string }[];
}): number {
  if (!input.user?.isAdmin) return 0;
  return (
    input.submissions.filter((item) => item.status === 'pending').length +
    input.grounds.filter((item) => item.levelStatus === 'pending').length +
    input.comments.filter((item) => item.status === 'hidden_pending').length
  );
}

export function solutionsFor(solutions: SbcSolution[], challengeId: string): SbcSolution[] {
  return solutions
    .filter((solution) => solution.challengeId === challengeId && solution.status === 'approved')
    .sort((a, b) => {
      const score = (item: SbcSolution) => item.workedUserIds.length - (item.failedUserIds?.length ?? 0);
      return score(b) - score(a) || b.createdAt.localeCompare(a.createdAt);
    });
}
