import { Stack } from 'expo-router';

import { ChampionsLeaderboard } from '@/components/ChampionsLeaderboard';
import { Screen, Title, Muted } from '@/components/ui';

export default function ChampionsLeaderboardScreen() {
  return (
    <Screen scene="home" maxWidth={720}>
      <Stack.Screen options={{ title: 'טבלת Champions' }} />
      <Title>טבלת Champions</Title>
      <Muted>הטבלה החודשית של 1 Club — מדורגת לפי CQP ואז לפי ניצחונות.</Muted>
      <ChampionsLeaderboard />
    </Screen>
  );
}
