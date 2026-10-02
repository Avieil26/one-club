import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from 'react-native';

import { CareerCreamButton, CareerDetailBlock, CareerFact } from '@/components/CareerChallengeCard';
import { Comments } from '@/components/Comments';
import { Badge, Button, Card, colors, ImageRow, Muted, Screen, Title } from '@/components/ui';
import { careerThemeFor } from '@/lib/careerCardTheme';
import { displayName } from '@/lib/labels';
import { isOpen } from '@/lib/selectors';
import { useApp } from '@/lib/store';

const STATUS = { pending: 'ממתין לאישור', approved: 'אושר', rejected: 'נדחה' } as const;

export default function ChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const router = useRouter();
  const challenge = app.challenges.find((item) => item.id === id);
  if (!challenge) {
    return (
      <Screen scene="career">
        <Title>האתגר לא נמצא</Title>
      </Screen>
    );
  }
  const submissions = app.submissions.filter((item) => item.challengeId === challenge.id);

  return (
    <Screen scene="career">
      <Stack.Screen options={{ title: 'אתגר' }} />
      <CareerDetailBlock challenge={challenge}>
        <CareerFact challenge={challenge} label="חוקים" text={challenge.rules} />
        <CareerFact challenge={challenge} label="מה חייב להופיע בצילום" text={challenge.proofRequirements} />
        {challenge.shareCode ? (
          <CareerFact challenge={challenge} label="קוד שיתוף במשחק" text={challenge.shareCode} />
        ) : null}
        {isOpen(challenge) ? (
          <CareerCreamButton
            theme={careerThemeFor(challenge)}
            label="הגשת הוכחה"
            onPress={() => router.push(`/career/submit/${challenge.id}`)}
          />
        ) : null}
      </CareerDetailBlock>
      {submissions.length === 0 ? <Muted>עדיין אין הגשות מאושרות.</Muted> : null}
      {submissions.map((submission) => (
        <Card key={submission.id}>
          <Badge
            text={STATUS[submission.status]}
            tone={submission.status === 'approved' ? 'blue' : submission.status === 'pending' ? 'amber' : 'muted'}
          />
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700', textAlign: 'right' }}>{submission.playerOrClubName}</Text>
          <Muted>
            {displayName(app.profiles, submission.userId)} · {submission.note}
          </Muted>
          <ImageRow uris={submission.imageUris} />
          {submission.status === 'approved' ? <Comments targetType="career_submission" targetId={submission.id} /> : null}
          {app.user?.isAdmin && submission.status === 'pending' ? (
            <>
              <Button label="אישור" onPress={() => app.moderateCareer(submission.id, 'approved')} disabled={app.busy} />
              <Button label="דחייה" variant="danger" onPress={() => app.moderateCareer(submission.id, 'rejected')} disabled={app.busy} />
            </>
          ) : null}
        </Card>
      ))}
    </Screen>
  );
}

