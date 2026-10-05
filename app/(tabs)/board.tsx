import { useMemo } from 'react';

import { CommunityBoards } from '@/components/CommunityBoards';
import { Screen } from '@/components/ui';
import { communityBoards } from '@/lib/communityBoard';
import { useApp } from '@/lib/store';

export default function BoardScreen() {
  const app = useApp();
  const boards = useMemo(
    () =>
      communityBoards({
        user: app.user,
        profiles: app.profiles,
        submissions: app.submissions,
        solutions: app.solutions,
        futPosts: app.futPosts,
        ratings: app.ratings,
        grounds: app.grounds,
        comments: app.comments,
      }),
    [app.user, app.profiles, app.submissions, app.solutions, app.futPosts, app.ratings, app.grounds],
  );

  return (
    <Screen scene="board" maxWidth={1180}>
      <CommunityBoards boards={boards} />
    </Screen>
  );
}
