import { Alert, Text, View } from 'react-native';
import { groundsLabel } from '@/lib/groundsLocalization';
import { useLanguage } from '@/lib/language';
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
  const { t, language, locale } = useLanguage();
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
  const followsThisPlayer = app.follows.some((item) => item.followerId === app.user?.id && item.followingId === id);
  const name = profile?.displayName || displayName(app.profiles, id);
  const progress = xpProgress(communityXp(id, app));

  async function toggleFollow() {
    if (!app.user) {
      router.push('/register');
      return;
    }
    try {
      await app.toggleFollow(id);
    } catch (error) {
      Alert.alert(t("רגע", "Something went wrong"), error instanceof Error ? error.message : t("לא הצלחנו לעדכן את המעקב. נסו שוב.", "Could not update your follow status. Try again."));
    }
  }

  return (
    <Screen scene="grounds">
      <Stack.Screen options={{ title: name }} />
      {!profile ? (
        <Muted>{t('הפרופיל לא נמצא', 'Profile not found')}</Muted>
      ) : (
        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', direction: 'ltr', alignItems: 'center', gap: 14 }}>
            {mine ? <LevelChip progress={progress} /> : null}
            <View style={{ flex: 1, gap: 4 }}>
              <Title>{name}</Title>
              <Muted>{profile.reputation} {t('מוניטין', 'reputation')} · {profile.approvedCount} {t('אישורים', 'approvals')}</Muted>
              <Muted>{followers} {t('עוקבים', 'followers')} · {following} {t('עוקב', 'following')}</Muted>
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
                {divisionLabel(post.division)} · {platformLabel(post.platform, language)} · {groundsLabel(post.position, locale)}
              </Text>
              <Text style={{ color: colors.muted, textAlign: 'right' }}>
                {post.archetype}
                {post.gamertag ? ` · ${post.gamertag}` : ''}
              </Text>
              {post.eaId ? <Text style={{ color: colors.muted, textAlign: 'right' }}>EA ID: {post.eaId}</Text> : null}
            </View>
          ) : (
            <Muted>{t('עדיין אין מודעה בגראונדס.', 'No Grounds post yet.')}</Muted>
          )}

          {profile.squad ? (
            <ProfileSquadBoard squad={profile.squad} />
          ) : (
            <Muted>{mine ? t('בנו את הסגל מהפרופיל — שחקנים על המגרש, ומחליפים אם בא לכם.', 'Build your squad from your profile — players on the pitch, with optional substitutes.') : t('השחקן עדיין לא בנה סגל.', 'This player has not built a squad yet.')}</Muted>
          )}

          {mine ? <Button label={profile.squad ? t('עריכת הקבוצה', 'Edit squad') : t('בניית הקבוצה', 'Build squad')} onPress={() => router.push('/squad')} /> : null}
          {!mine ? <Button label={followsThisPlayer ? t('הפסק מעקב', 'Unfollow') : t('עקוב אחרי השחקן', 'Follow player')} variant={followsThisPlayer ? 'ghost' : 'gold'} onPress={() => void toggleFollow()} /> : null}
          {!mine && app.user ? (
            <Button label={t('הודעה', 'Message')} onPress={() => router.push(`/grounds/chat/${id}`)} />
          ) : null}
        </View>
      )}
    </Screen>
  );
}
