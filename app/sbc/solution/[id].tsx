import { useMemo } from 'react';
import { Alert, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { Comments } from '@/components/Comments';
import { SolutionGallery } from '@/components/SolutionGallery';
import { SquadPitch } from '@/components/SquadPitch';
import { Button, Card, colors, Muted, Screen, Title } from '@/components/ui';
import { evaluateSquad, formationById } from '@/lib/chemistry';
import { errorMessage } from '@/lib/format';
import { displayName } from '@/lib/labels';
import { catalogChallenge, placedPreview } from '@/lib/sbcCatalog';
import { useApp } from '@/lib/store';

export default function SbcSolutionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const router = useRouter();
  const solution = app.solutions.find((item) => item.id === id);
  const stored = app.sbcChallenges.find((item) => item.id === solution?.challengeId);
  const challenge = solution
    ? { ...catalogChallenge(solution.challengeId), ...stored, ...catalogChallenge(solution.challengeId) }
    : null;
  const formation = formationById(solution?.formation);
  const placed = useMemo(() => placedPreview(solution?.squad), [solution?.squad]);
  const report = useMemo(
    () => (solution?.squad ? evaluateSquad(formation, placed, challenge?.rules ?? null) : null),
    [challenge?.rules, formation, placed, solution?.squad],
  );

  if (!solution || !challenge) {
    return (
      <Screen scene="sbc">
        <Title>הפתרון לא נמצא</Title>
        <Button label="חזרה ל-SBC" onPress={() => router.replace('/sbc')} />
      </Screen>
    );
  }

  const ups = solution.workedUserIds.length;
  const downs = solution.failedUserIds?.length ?? 0;
  const mine = solution.userId === app.user?.id;
  const votedUp = app.user ? solution.workedUserIds.includes(app.user.id) : false;
  const votedDown = app.user ? (solution.failedUserIds ?? []).includes(app.user.id) : false;
  const solutionId = solution.id;

  async function vote(next: 'up' | 'down') {
    const choice = (next === 'up' && votedUp) || (next === 'down' && votedDown) ? 'clear' : next;
    try {
      await app.voteSolution(solutionId, choice);
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  return (
    <Screen scene="sbc">
      <Stack.Screen options={{ title: 'פתרון SBC' }} />
      <Button label="חזרה לאתגר" variant="ghost" onPress={() => router.replace(`/sbc/${challenge.id}`)} />
      <Title>{displayName(app.profiles, solution.userId)}</Title>
      <Muted>{solution.explanation}</Muted>
      {solution.squad ? (
        <View style={{ gap: 10 }}>
          <Text style={{ color: colors.text, fontWeight: '800', textAlign: 'right' }}>
            {report ? `כימיה ${report.chemistry}/33` : 'הסגל שנבנה'}
            {report?.rating == null ? '' : ` · דירוג קבוצה ${report.rating}`}
          </Text>
          <SquadPitch formation={formation} placed={placed} playerChem={report?.playerChem ?? {}} showChemHud={false} />
        </View>
      ) : null}
      <SolutionGallery uris={solution.imageUris} />
      <Card>
        <Text style={{ color: colors.text, fontWeight: '800', textAlign: 'right' }}>האם הפתרון עבד?</Text>
        <Muted>לייק ודיסלייק עוזרים לאחרים לדעת אם שווה לנסות את הסגל הזה.</Muted>
        <View style={{ flexDirection: 'row-reverse', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button
              label={votedUp ? `סימנתם שעבד · ${ups}` : `עבד לי · ${ups}`}
              variant={votedUp ? 'copper' : 'ghost'}
              onPress={() => vote('up')}
              disabled={app.busy || mine || !app.user}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label={`לא עבד · ${downs}`}
              variant={votedDown ? 'danger' : 'ghost'}
              onPress={() => vote('down')}
              disabled={app.busy || mine || !app.user}
            />
          </View>
        </View>
        {mine ? <Muted>אי אפשר לדרג פתרון של עצמך.</Muted> : null}
        {!app.user ? <Muted>צריך להתחבר כדי לסמן אם הפתרון עבד.</Muted> : null}
      </Card>
      <Comments targetType="sbc_solution" targetId={solution.id} />
    </Screen>
  );
}
