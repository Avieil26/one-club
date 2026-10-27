import { useLanguage } from '@/lib/language';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { GalleryCommunity } from '@/components/GalleryCommunity';
import { SbcModerationActions } from '@/components/SbcModerationActions';
import { SolutionGallery } from '@/components/SolutionGallery';
import { catalogChallenge } from '@/lib/sbcCatalog';
import { localizedSbcTitle } from '@/lib/sbcTileTheme';

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

function pendingChampions() {
  return getSupabase().from('champions_content').select('id,user_id,title,body,formation,platform,image_uris').eq('status', 'pending').order('created_at', { ascending: false });
}

export default function QueueScreen() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const app = useApp();
  const [galleryPending, setGalleryPending] = useState<number | null>(null);
  const [champions, setChampions] = useState<ChampionsPending[]>([]);
  const submissions = app.submissions.filter((item) => item.status === 'pending');
  const solutions = app.solutions.filter((item) => item.status === 'pending');

  async function loadChampions() {
    if (!app.user?.isAdmin) return;
    const { data, error } = await pendingChampions();
    if (!error) setChampions((data ?? []) as ChampionsPending[]);
  }

  const adminId = app.user?.isAdmin ? app.user.id : null;
  useEffect(() => {
    if (!adminId) return;
    let active = true;
    void pendingChampions().then(({ data, error }) => {
      if (active && !error) setChampions((data ?? []) as ChampionsPending[]);
    });
    return () => { active = false; };
  }, [adminId]);
  const levels = app.grounds.filter((item) => item.levelStatus === 'pending');
  const comments = app.comments.filter((item) => item.status === 'hidden_pending');

  if (!app.user?.isAdmin) {
    return (
      <Screen scene="home">
        <Stack.Screen options={{ title: t("תור אישור", "Approval queue") }} />
        <Title>{t("התור פתוח למנהלים", "This queue is for administrators")}</Title>
      </Screen>
    );
  }

  async function run(work: () => Promise<void>) {
    try {
      await work();
    } catch (error) {
      Alert.alert(t("רגע", "Something went wrong"), errorMessage(error, locale));
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
      Alert.alert(t("רגע", "Something went wrong"), errorMessage(error, locale));
    }
  }

  return (
    <Screen scene="home" refreshing={app.busy} onRefresh={app.refresh}>
      <Stack.Screen options={{ title: t("תור אישור", "Approval queue") }} />
      <Title>{t("תור אישור", "Approval queue")}</Title>
      {submissions.length + levels.length + comments.length + champions.length + solutions.length === 0 && galleryPending === 0 ? <Muted>{t("אין כרגע פריטים לאישור.", "There are no items awaiting approval.")}</Muted> : null}

      <GalleryCommunity pendingOnly onCount={setGalleryPending} />

      {solutions.map((solution) => {
        const challenge = catalogChallenge(solution.challengeId) ?? app.sbcChallenges.find((c) => c.id === solution.challengeId);
        return <Card key={solution.id}>
          <Badge text={t('פתרון SBC · ממתין לאישור', 'SBC solution · Awaiting review')} tone="amber" />
          <Title>{challenge ? (localizedSbcTitle(challenge, locale)) : 'SBC'}</Title>
          <Muted>{displayName(app.profiles, solution.userId)}</Muted>
          <Muted>{solution.explanation}</Muted>
          <SolutionGallery uris={solution.imageUris} />
          <Button label={t('צפייה בפתרון המלא', 'Review full solution')} variant="ghost" onPress={() => router.push(`/sbc/solution/${solution.id}`)} />
          <SbcModerationActions solution={solution} />
        </Card>;
      })}

      {submissions.map((submission) => (
        <Card key={submission.id}>
          <Badge text={t("קריירה", "Career")} tone="amber" />
          <Muted>
            {displayName(app.profiles, submission.userId)} · {submission.playerOrClubName}
          </Muted>
          <Muted>{submission.note}</Muted>
          <ImageRow uris={submission.imageUris} />
          <Button label={t("אישור", "Approve")} onPress={() => run(() => app.moderateCareer(submission.id, 'approved'))} disabled={app.busy} />
          <Button label={t("דחייה", "Reject")} variant="danger" onPress={() => run(() => app.moderateCareer(submission.id, 'rejected'))} disabled={app.busy} />
        </Card>
      ))}

      {levels.map((post) => (
        <Card key={post.id}>
          <Badge text={t("אימות רמה", "Level verification")} tone="amber" />
          <Muted>
            {displayName(app.profiles, post.userId)} · {post.position} · {divisionLabel(post.division)}
          </Muted>
          <ImageRow uris={post.levelImageUri ? [post.levelImageUri] : []} />
          <Button label={t("הרמה מאומתת", "Level verified")} onPress={() => run(() => app.moderateGroundsLevel(post.id, true))} disabled={app.busy} />
          <Button label={t("לא לאשר", "Reject verification")} variant="danger" onPress={() => run(() => app.moderateGroundsLevel(post.id, false))} disabled={app.busy} />
        </Card>
      ))}

      {champions.map((post) => (
        <Card key={post.id}>
          <Badge text="FUT Champions" tone="amber" />
          <Muted>{displayName(app.profiles, post.user_id)} · {post.formation || t("ללא מערך", "No formation")} · {post.platform}</Muted>
          <Title>{post.title}</Title>
          <Muted>{post.body}</Muted>
          <ImageRow uris={post.image_uris ?? []} />
          <Button label={t("אישור", "Approve")} onPress={() => run(() => moderateChampion(post.id, 'approved'))} disabled={app.busy} />
          <Button label={t("דחייה", "Reject")} variant="danger" onPress={() => run(() => moderateChampion(post.id, 'rejected'))} disabled={app.busy} />
        </Card>
      ))}

      {comments.map((comment) => (
        <Card key={comment.id}>
          <Badge text={t("תגובה", "Comment")} tone="amber" />
          <Muted>{displayName(app.profiles, comment.userId)}</Muted>
          <Muted>{comment.body || t("תגובה בלי טקסט", "Comment without text")}</Muted>
          <Button label={t("להחזיר לפיד", "Restore to feed")} onPress={() => run(() => app.moderateComment(comment.id, 'visible'))} disabled={app.busy} />
          <Button label={t("מחיקה", "Delete")} variant="danger" onPress={() => run(() => app.moderateComment(comment.id, 'remove'))} disabled={app.busy} />
        </Card>
      ))}
    </Screen>
  );
}

