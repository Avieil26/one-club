import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from 'react-native';

import { CareerCreamButton, CareerDetailBlock, CareerFact } from '@/components/CareerChallengeCard';
import { Comments } from '@/components/Comments';
import { Badge, Button, Card, colors, ImageRow, Muted, Screen, Title } from '@/components/ui';
import { useLanguage } from '@/lib/language';
import { careerChallengeCopy } from '@/lib/careerLocalization';
import { careerThemeFor } from '@/lib/careerCardTheme';
import { displayName } from '@/lib/labels';
import { isOpen } from '@/lib/selectors';
import { useApp } from '@/lib/store';

const STATUS = { pending: 'ממתין לאישור', approved: 'אושר', rejected: 'נדחה' } as const;

export default function ChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const { language, locale, t } = useLanguage();
  const router = useRouter();
  const challenge = app.challenges.find((item) => item.id === id);
  if (!challenge) {
    return (
      <Screen scene="career">
        <Title>{t('האתגר לא נמצא', 'Challenge not found')}</Title>
      </Screen>
    );
  }
  const copy = careerChallengeCopy(challenge, locale);
  const submissions = app.submissions.filter((item) => item.challengeId === challenge.id);

  return (
    <Screen scene="career">
      <Stack.Screen options={{ title: t('אתגר', 'Challenge') }} />
      <CareerDetailBlock challenge={challenge}>
        <CareerFact challenge={challenge} label={t('חוקים', 'Rules')} text={copy.rules} />
        <CareerFact challenge={challenge} label={t('מה חייב להופיע בצילום', 'Required proof')} text={copy.proofRequirements} />
        {challenge.shareCode ? (
          <CareerFact challenge={challenge} label={t('קוד שיתוף במשחק', 'In-game share code')} text={challenge.shareCode} />
        ) : null}
        {isOpen(challenge) ? (
          <CareerCreamButton
            theme={careerThemeFor(challenge)}
            label={t('הגשת הוכחה', 'Submit proof')}
            onPress={() => router.push(`/career/submit/${challenge.id}`)}
          />
        ) : null}
      </CareerDetailBlock>
      {submissions.length === 0 ? <Muted>{t('עדיין אין הגשות מאושרות.', 'No approved submissions yet.')}</Muted> : null}
      {submissions.map((submission) => (
        <Card key={submission.id}>
          <Badge
            text={language === 'he' ? STATUS[submission.status] : ({ pending: 'Pending approval', approved: 'Approved', rejected: 'Rejected' } as const)[submission.status]}
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
              <Button label={t('אישור', 'Approve')} onPress={() => app.moderateCareer(submission.id, 'approved')} disabled={app.busy} />
              <Button label={t('דחייה', 'Reject')} variant="danger" onPress={() => app.moderateCareer(submission.id, 'rejected')} disabled={app.busy} />
            </>
          ) : null}
        </Card>
      ))}
    </Screen>
  );
}

