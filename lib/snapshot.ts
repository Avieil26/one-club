import type { Database, Snapshot } from '@/lib/types';

function publicProfile(profile: Database['profiles'][number]) {
  const { passwordHash: _hidden, ...safe } = profile;
  return safe;
}

export function toSnapshot(db: Database, mode: Snapshot['mode']): Snapshot {
  const user = db.profiles.find((profile) => profile.id === db.sessionUserId) ?? null;
  const seeAll = Boolean(user?.isAdmin);
  return {
    mode,
    user: user ? publicProfile(user) : null,
    profiles: db.profiles.map(publicProfile),
    challenges: db.careerChallenges,
    submissions: db.careerSubmissions.filter(
      (item) => seeAll || item.status === 'approved' || item.userId === user?.id,
    ),
    futPosts: db.futPosts.filter((item) => item.status === 'approved' || seeAll || item.userId === user?.id),
    ratings: db.futRatings,
    likes: db.futLikes ?? [],
    comments: db.comments.filter((item) => item.status === 'visible' || seeAll || item.userId === user?.id),
    grounds: db.groundsPosts,
    sbcChallenges: db.sbcChallenges,
    solutions: db.sbcSolutions.filter((item) => seeAll || item.status === 'approved' || item.userId === user?.id),
    follows: db.follows ?? [],
    messages: db.messages ?? [],
  };
}
