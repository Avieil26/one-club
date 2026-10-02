import { Text, View } from 'react-native';
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
  const progress = xpProgress(communityXp(id, app));

  return (
    <Screen scene="grounds">
      <Stack.Screen options={{ title: name }} />
      {!profile ? (
        <Muted>הפרופיל לא נמצא</Muted>
      ) : (
        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', direction: 'ltr', alignItems: 'center', gap: 14 }}>
            {mine ? <LevelChip progress={progress} /> : null}
            <View style={{ flex: 1, gap: 4 }}>
              <Title>{name}</Title>
              <Muted>{profile.reputation} מוניטין · {profile.approvedCount} אישורים</Muted>
              <Muted>{followers} עוקבים · {following} עוקב</Muted>
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

          {profile.squad ? (
            <ProfileSquadBoard squad={profile.squad} />
          ) : (
            <Muted>{mine ? 'בנו את הסגל מהפרופיל — שחקנים על המגרש, ומחליפים אם בא לכם.' : 'השחקן עדיין לא בנה סגל.'}</Muted>
          )}

          {mine ? <Button label={profile.squad ? 'עריכת הקבוצה' : 'בניית הקבוצה'} onPress={() => router.push('/squad')} /> : null}
          {!mine && app.user ? (
            <Button label="הודעה" onPress={() => router.push(`/grounds/chat/${id}`)} />
          ) : null}
        </View>
      )}
    </Screen>
  );
}
