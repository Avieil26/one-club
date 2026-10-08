import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { Badge, Button, Card, ImageRow, Muted, Screen, Title } from '@/components/ui';
import { ProfileFace } from '@/components/ProfileFace';
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
  const router = useRouter();
  const [rejectTarget, setRejectTarget] = useState<{ id: string; userId: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
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


  function openReject(submission: { id: string; userId: string }) {
    const profile = app.profiles.find((item) => item.id === submission.userId);
    setRejectReason('');
    setRejectTarget({ id: submission.id, userId: submission.userId, name: profile?.displayName ?? 'שחקן' });
  }

  async function confirmReject(withMessage: boolean) {
    if (!rejectTarget) return;
    const target = rejectTarget;
    const reason = rejectReason.trim();
    try {
      await app.moderateCareer(target.id, 'rejected');
      if (withMessage && reason) {
        await app.sendMessage(target.userId, 'היי ' + target.name + ', ההגשה שלך לקריירה לא אושרה. הסיבה: ' + reason);
      }
      setRejectTarget(null);
      setRejectReason('');
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
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/player/' + submission.userId)}
            style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingVertical: 6 }}
          >
            <ProfileFace
              name={app.profiles.find((profile) => profile.id === submission.userId)?.displayName ?? 'שחקן'}
              uri={app.profiles.find((profile) => profile.id === submission.userId)?.avatarUrl}
              size={48}
            />
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={{ color: '#F4F7F2', fontSize: 15, fontWeight: '900', textAlign: 'right' }}>
                {displayName(app.profiles, submission.userId)}
              </Text>
              <Text style={{ color: '#8A97A0', fontSize: 11, fontWeight: '700', textAlign: 'right' }}>
                {submission.playerOrClubName}
              </Text>
            </View>
            <Text style={{ color: '#E8C46A', fontSize: 12, fontWeight: '900' }}>פרופיל ←</Text>
          </Pressable>
          <Muted>{submission.note}</Muted>
          <ImageRow uris={submission.imageUris} />
          <Button label="אישור" onPress={() => run(() => app.moderateCareer(submission.id, 'approved'))} disabled={app.busy} />
          <Button label="דחייה + סיבה" variant="danger" onPress={() => openReject(submission)} disabled={app.busy} />
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

      <Modal visible={Boolean(rejectTarget)} transparent animationType="fade" onRequestClose={() => setRejectTarget(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
          <View style={{ width: '100%', maxWidth: 520, borderRadius: 20, padding: 18, backgroundColor: '#0A1015', borderWidth: 1, borderColor: 'rgba(227,179,65,0.35)', gap: 12 }}>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
              {rejectTarget ? <ProfileFace name={rejectTarget.name} uri={app.profiles.find((profile) => profile.id === rejectTarget.userId)?.avatarUrl} size={46} /> : null}
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={{ color: '#F7F4EA', fontSize: 18, fontWeight: '900', textAlign: 'right' }}>דחיית הגשה</Text>
                <Text style={{ color: '#7B8790', fontSize: 11, fontWeight: '700', textAlign: 'right' }}>{rejectTarget?.name}</Text>
              </View>
            </View>
            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              placeholder="כתוב לשחקן בקצרה למה ההגשה לא אושרה..."
              placeholderTextColor="#65727C"
              style={{ minHeight: 110, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F4F7F2', padding: 12, textAlign: 'right', textAlignVertical: 'top' }}
            />
            <Button label="דחה ושלח לשחקן את הסיבה" variant="danger" onPress={() => void confirmReject(true)} disabled={app.busy || !rejectReason.trim()} />
            <Button label="דחה בלי לשלוח הודעה" variant="ghost" onPress={() => void confirmReject(false)} disabled={app.busy} />
            <Button label="ביטול" variant="ghost" onPress={() => setRejectTarget(null)} disabled={app.busy} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

