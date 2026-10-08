import { Alert, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { LevelChip } from '@/components/OwnerLevelPlate';
import { ProfileFace } from '@/components/ProfileFace';
import { ProfileSquadBoard } from '@/components/ProfileSquadBoard';
import { Button, colors, Muted, Screen, Title } from '@/components/ui';
import { communityXp, xpProgress } from '@/lib/communityBoard';
import { displayName, divisionLabel, platformLabel } from '@/lib/labels';
import { useApp } from '@/lib/store';

export default function PlayerProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const app = useApp();
  const router = useRouter();
  const id = String(userId || '');
  const profile = app.profiles.find((item) => item.id === id) ?? null;
  const post = app.grounds
    .filter((item) => item.userId === id)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const mine = app.user?.id === id;
  const followers = app.follows.filter((item) => item.followingId === id).length;
  const following = app.follows.filter((item) => item.followerId === id).length;
  const name = profile?.displayName || displayName(app.profiles, id);
  const xp = communityXp(id, app);
  const progress = xpProgress(xp);
  const approvedSubmissions = app.submissions.filter((item) => item.userId === id && item.status === 'approved').length;
  const futPosts = app.futPosts.filter((item) => item.userId === id).length;
  const sbcSolutions = app.solutions.filter((item) => item.userId === id && item.status === 'approved').length;
  const iFollow = Boolean(app.user && app.follows.some((item) => item.followerId === app.user?.id && item.followingId === id));

  async function toggleFollow() {
    if (!app.user || mine) return;
    try {
      await app.toggleFollow(id);
    } catch (error) {
      Alert.alert('רגע', error instanceof Error ? error.message : 'הפעולה נכשלה.');
    }
  }

  return (
    <Screen scene="grounds">
      <Stack.Screen options={{ title: name }} />
      {!profile ? (
        <Muted>הפרופיל לא נמצא</Muted>
      ) : (
        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', direction: 'ltr', alignItems: 'center', gap: 14 }}>
            <LevelChip progress={progress} />
            <View style={{ flex: 1, gap: 4 }}>
              <Title>{name}</Title>
              <Muted>{progress.xp.toLocaleString('en-US')} XP · רמה {progress.level} · {profile.reputation} מוניטין</Muted>
              <Muted>{profile.approvedCount} אישורים · {followers} עוקבים · {following} עוקב</Muted>
            </View>
            <ProfileFace name={name} uri={profile.avatarUrl} size={76} />
          </View>

          {post ? (
            <View
              style={{
                borderRadius: 18,
                padding: 14,
                gap: 6,
                borderWidth: 1,
                borderColor: 'rgba(180,200,220,0.28)',
                backgroundColor: 'rgba(16,22,28,0.9)',
              }}
            >
              <Text style={{ color: colors.text, fontWeight: '700', textAlign: 'right' }}>
                {divisionLabel(post.division)} · {platformLabel(post.platform)} · {post.position}
              </Text>
              <Text style={{ color: colors.muted, textAlign: 'right' }}>
                {post.archetype}
                {post.gamertag ? ` · ${post.gamertag}` : ''}
              </Text>
              {post.eaId ? <Text style={{ color: colors.muted, textAlign: 'right' }}>EA ID: {post.eaId}</Text> : null}
            </View>
          ) : (
            <Muted>עדיין אין מודעה בגראונדס.</Muted>
          )}

          <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 }}>
            {[
              ['XP', xp],
              ['אישורים', approvedSubmissions],
              ['פוסטים', futPosts],
              ['פתרונות SBC', sbcSolutions],
            ].map(([label, value]) => (
              <View key={String(label)} style={{ flex: 1, minWidth: 120, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 10, backgroundColor: 'rgba(16,22,28,0.9)', borderWidth: 1, borderColor: 'rgba(180,200,220,0.18)', alignItems: 'center' }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: '900' }}>{Number(value).toLocaleString('en-US')}</Text>
                <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '700' }}>{label}</Text>
              </View>
            ))}
          </View>

          {!mine && app.user ? (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label={iFollow ? 'עוקב' : 'עקוב'} variant={iFollow ? 'ghost' : 'default'} onPress={toggleFollow} disabled={app.busy} />
              <Button label="הודעה" onPress={() => router.push(`/grounds/chat/${id}`)} disabled={app.busy} />
            </View>
          ) : null}

          {profile.squad ? (
            <ProfileSquadBoard squad={profile.squad} />
          ) : (
            <Muted>{mine ? 'בנו את הסגל מהפרופיל — שחקנים על המגרש, ומחליפים אם בא לכם.' : 'השחקן עדיין לא בנה סגל.'}</Muted>
          )}

          {mine ? <Button label={profile.squad ? 'עריכת הקבוצה' : 'בניית הקבוצה'} onPress={() => router.push('/squad')} /> : null}
                  </View>
      )}
    </Screen>
  );
}
