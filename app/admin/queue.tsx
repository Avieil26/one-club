import { Alert } from 'react-native';
import { Stack } from 'expo-router';

import { Badge, Button, Card, ImageRow, Muted, Screen, Title } from '@/components/ui';
import { errorMessage } from '@/lib/format';
import { displayName, divisionLabel } from '@/lib/labels';
import { useApp } from '@/lib/store';

export default function QueueScreen() {
  const app = useApp();
  const submissions = app.submissions.filter((item) => item.status === 'pending');
  const levels = app.grounds.filter((item) => item.levelStatus === 'pending');
  const comments = app.comments.filter((item) => item.status === 'hidden_pending');

  if (!app.user?.isAdmin) {
    return (
      <Screen scene="home">
        <Stack.Screen options={{ title: 'תור אישור' }} />
        <Title>התור פתוח למנהלים</Title>
      </Screen>
    );
  }

  async function run(work: () => Promise<void>) {
    try {
      await work();
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  return (
    <Screen scene="home" refreshing={app.busy} onRefresh={app.refresh}>
      <Stack.Screen options={{ title: 'תור אישור' }} />
      <Title>תור אישור</Title>
      {submissions.length + levels.length + comments.length === 0 ? <Muted>אין כרגע פריטים לאישור.</Muted> : null}

      {submissions.map((submission) => (
        <Card key={submission.id}>
          <Badge text="קריירה" tone="amber" />
          <Muted>
            {displayName(app.profiles, submission.userId)} · {submission.playerOrClubName}
          </Muted>
          <Muted>{submission.note}</Muted>
          <ImageRow uris={submission.imageUris} />
          <Button label="אישור" onPress={() => run(() => app.moderateCareer(submission.id, 'approved'))} disabled={app.busy} />
          <Button label="דחייה" variant="danger" onPress={() => run(() => app.moderateCareer(submission.id, 'rejected'))} disabled={app.busy} />
        </Card>
      ))}

      {levels.map((post) => (
        <Card key={post.id}>
          <Badge text="אימות רמה" tone="amber" />
          <Muted>
            {displayName(app.profiles, post.userId)} · {post.position} · {divisionLabel(post.division)}
          </Muted>
          <ImageRow uris={post.levelImageUri ? [post.levelImageUri] : []} />
          <Button label="הרמה מאומתת" onPress={() => run(() => app.moderateGroundsLevel(post.id, true))} disabled={app.busy} />
          <Button label="לא לאשר" variant="danger" onPress={() => run(() => app.moderateGroundsLevel(post.id, false))} disabled={app.busy} />
        </Card>
      ))}

      {comments.map((comment) => (
        <Card key={comment.id}>
          <Badge text="תגובה" tone="amber" />
          <Muted>{displayName(app.profiles, comment.userId)}</Muted>
          <Muted>{comment.body || 'תגובה בלי טקסט'}</Muted>
          <Button label="להחזיר לפיד" onPress={() => run(() => app.moderateComment(comment.id, 'visible'))} disabled={app.busy} />
          <Button label="מחיקה" variant="danger" onPress={() => run(() => app.moderateComment(comment.id, 'remove'))} disabled={app.busy} />
        </Card>
      ))}
    </Screen>
  );
}

