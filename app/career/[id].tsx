import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from 'react-native';

import { Comments } from '@/components/Comments';
import { Badge, Button, Card, colors, ImageRow, Muted, Screen, Title } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { displayName, modeLabel } from '@/lib/labels';
import { isOpen } from '@/lib/selectors';
import { useApp } from '@/lib/store';

const STATUS = { pending: '׳׳׳×׳™׳ ׳׳׳™׳©׳•׳¨', approved: '׳׳•׳©׳¨', rejected: '׳ ׳“׳—׳”' } as const;

export default function ChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const router = useRouter();
  const challenge = app.challenges.find((item) => item.id === id);
  if (!challenge) {
    return (
      <Screen scene="career">
        <Title>׳”׳׳×׳’׳¨ ׳׳ ׳ ׳׳¦׳</Title>
      </Screen>
    );
  }
  const submissions = app.submissions.filter((item) => item.challengeId === challenge.id);

  return (
    <Screen scene="career">
      <Stack.Screen options={{ title: '׳׳×׳’׳¨' }} />
      <Badge text={modeLabel(challenge.mode)} tone="blue" />
      <Title>{challenge.title}</Title>
      <Muted>{isOpen(challenge) ? `׳₪׳×׳•׳— ׳¢׳“ ${formatDate(challenge.endsAt)}` : '׳”׳׳×׳’׳¨ ׳ ׳¡׳’׳¨'}</Muted>
      <Card>
        <Text style={{ color: colors.text, fontWeight: '700', textAlign: 'right' }}>׳—׳•׳§׳™׳</Text>
        <Muted>{challenge.rules}</Muted>
        <Text style={{ color: colors.text, fontWeight: '700', textAlign: 'right' }}>׳׳” ׳—׳™׳™׳‘ ׳׳”׳•׳₪׳™׳¢ ׳‘׳¦׳™׳׳•׳</Text>
        <Muted>{challenge.proofRequirements}</Muted>
        {challenge.shareCode ? <Muted>׳§׳•׳“ ׳©׳™׳×׳•׳£ ׳‘׳׳©׳—׳§: {challenge.shareCode}</Muted> : null}
      </Card>
      {isOpen(challenge) ? <Button label="׳”׳’׳©׳× ׳”׳•׳›׳—׳”" onPress={() => router.push(`/career/submit/${challenge.id}`)} /> : null}
      {submissions.length === 0 ? <Muted>׳¢׳“׳™׳™׳ ׳׳™׳ ׳”׳’׳©׳•׳× ׳׳׳•׳©׳¨׳•׳×.</Muted> : null}
      {submissions.map((submission) => (
        <Card key={submission.id}>
          <Badge
            text={STATUS[submission.status]}
            tone={submission.status === 'approved' ? 'blue' : submission.status === 'pending' ? 'amber' : 'muted'}
          />
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700', textAlign: 'right' }}>{submission.playerOrClubName}</Text>
          <Muted>
            {displayName(app.profiles, submission.userId)} ֲ· {submission.note}
          </Muted>
          <ImageRow uris={submission.imageUris} />
          {submission.status === 'approved' ? <Comments targetType="career_submission" targetId={submission.id} /> : null}
          {app.user?.isAdmin && submission.status === 'pending' ? (
            <>
              <Button label="׳׳™׳©׳•׳¨" onPress={() => app.moderateCareer(submission.id, 'approved')} disabled={app.busy} />
              <Button label="׳“׳—׳™׳™׳”" variant="danger" onPress={() => app.moderateCareer(submission.id, 'rejected')} disabled={app.busy} />
            </>
          ) : null}
        </Card>
      ))}
    </Screen>
  );
}

