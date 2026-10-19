import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Stack } from 'expo-router';

import { Badge, Button, Card, ImageRow, Muted, Screen, Title } from '@/components/ui';
import { errorMessage } from '@/lib/format';
import { displayName, divisionLabel } from '@/lib/labels';
import { useApp } from '@/lib/store';
import { getSupabase } from '@/lib/supabase';

type ChampionsPending = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  formation: string | null;
  platform: string;
  image_uris: string[];
};

export default function QueueScreen() {
  const app = useApp();
  const [champions, setChampions] = useState<ChampionsPending[]>([]);
  const submissions = app.submissions.filter((item) => item.status === 'pending');

  async function loadChampions() {
    if (!app.user?.isAdmin) return;
    const { data, error } = await getSupabase()
      .from('champions_content')
      .select('id,user_id,title,body,formation,platform,image_uris')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (!error) setChampions((data ?? []) as ChampionsPending[]);
  }

  useEffect(() => {
    void loadChampions();
  }, [app.user?.id, app.user?.isAdmin]);
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

  async function moderateChampion(id: string, status: 'approved' | 'rejected') {
    try {
      const { error } = await getSupabase()
        .from('champions_content')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      await loadChampions();
      await app.refresh();
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  return (
    <Screen scene="home" refreshing={app.busy} onRefresh={app.refresh}>
      <Stack.Screen options={{ title: 'תור אישור' }} />
      <Title>תור אישור</Title>
      {submissions.length + levels.length + comments.length + champions.length === 0 ? <Muted>אין כרגע פריטים לאישור.</Muted> : null}

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

      {champions.map((post) => (
        <Card key={post.id}>
          <Badge text="FUT Champions" tone="amber" />
          <Muted>{displayName(app.profiles, post.user_id)} · {post.formation || 'ללא מערך'} · {post.platform}</Muted>
          <Title>{post.title}</Title>
          <Muted>{post.body}</Muted>
          <ImageRow uris={post.image_uris ?? []} />
          <Button label="אישור" onPress={() => run(() => moderateChampion(post.id, 'approved'))} disabled={app.busy} />
          <Button label="דחייה" variant="danger" onPress={() => run(() => moderateChampion(post.id, 'rejected'))} disabled={app.busy} />
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

