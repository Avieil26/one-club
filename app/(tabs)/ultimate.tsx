import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';

import { AuthorNote } from '@/components/AuthorNote';
import { PlatformMark } from '@/components/PlatformPicker';
import { SquadLike } from '@/components/SquadLike';
import { SquadPhoto } from '@/components/SquadPhoto';
import { Badge, Button, Card, ChoiceGroup, colors, Muted, Screen, Title } from '@/components/ui';
import { TileGrid } from '@/components/TileGrid';
import { errorMessage } from '@/lib/format';
import { displayName, futKindLabel, platformLabel, rarityLabel } from '@/lib/labels';
import { useApp } from '@/lib/store';
import type { FutKind } from '@/lib/types';
import { useLanguage } from '@/lib/language';

export default function UltimateScreen() {
  const app = useApp();
  const { language, locale, t } = useLanguage();
  const rtl = language === 'he';
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string; posted?: string }>();
  const [kind, setKind] = useState<FutKind>(params.tab === 'pack' ? 'pack' : 'squad');
  const posts = app.futPosts.filter((post) => post.kind === kind);

  useEffect(() => {
    if (params.tab === 'pack' || params.tab === 'squad') setKind(params.tab);
  }, [params.tab]);

  async function like(postId: string) {
    try {
      await app.toggleFutLike(postId);
    } catch (error) {
      Alert.alert(t('רגע', 'One moment'), errorMessage(error, locale));
    }
  }

  return (
    <Screen refreshing={app.busy} onRefresh={app.refresh} scene="ultimate">
      <Title>{t('אולטימייט', 'Ultimate Team')}</Title>
      <Muted>{t('דירוג קבוצות בשלושה צירים, בלי דיסלייק. חבילות הן שיתוף.', 'Rate squads across three categories. Packs are for sharing.')}</Muted>
      {params.posted === '1' ? (
        <Card>
          <Text style={{ color: '#D9FFE9', fontWeight: '900', fontSize: 18, textAlign: rtl ? 'right' : 'left' }}>{t('הפוסט פורסם', 'Post published')}</Text>
          <Muted>{kind === 'pack' ? t('החבילה מופיעה ברשימה הזו.', 'The pack appears in this list.') : t('הקבוצה מופיעה ברשימה הזו.', 'The squad appears in this list.')}</Muted>
        </Card>
      ) : null}
      <Button label={kind === 'squad' ? t('העלאת קבוצה', 'Share a squad') : t('יצא לי בחבילה', 'Share a pack pull')} onPress={() => router.push(`/ultimate/new?kind=${kind}`)} />
      <ChoiceGroup
        options={[
          { id: 'squad', label: t('קבוצות', 'Squads') },
          { id: 'pack', label: t('חבילות', 'Packs') },
        ]}
        value={kind}
        onChange={setKind}
      />
      {posts.length === 0 ? <Muted>{t('עדיין אין פוסטים כאן.', 'No posts here yet.')}</Muted> : null}
      <TileGrid
        items={posts}
        wide={3}
        narrow={1}
        render={(post) => {
          const likes = app.likes.filter((like) => like.postId === post.id);
          const liked = likes.some((like) => like.userId === app.user?.id);
          return (
            <Card>
              <Pressable accessibilityRole="button" onPress={() => router.push(`/ultimate/${post.id}`)} style={{ gap: 10 }}>
                <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 10 }}>
                  <PlatformMark id={post.platform} size={42} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700', textAlign: rtl ? 'right' : 'left' }}>
                      {displayName(app.profiles, post.userId)}
                    </Text>
                    <Muted>
                      {platformLabel(post.platform, language)}
                      {post.formation ? ` · ${post.formation}` : ''}
                      {post.playerName ? ` · ${post.playerName}` : ''}
                      {post.packRarity ? ` · ${rarityLabel(post.packRarity, language)}` : ''}
                    </Muted>
                  </View>
                </View>
                <SquadPhoto uris={post.imageUris} expandable={false} />
              </Pressable>
              <AuthorNote
                name={displayName(app.profiles, post.userId)}
                body={post.body}
                avatarUrl={app.profiles.find((profile) => profile.id === post.userId)?.avatarUrl}
              />
              {post.kind === 'squad' ? (
                <SquadLike count={likes.length} liked={liked} disabled={app.busy} onPress={() => like(post.id)} />
              ) : null}
              <Badge text={futKindLabel(post.kind)} tone={post.kind === 'pack' ? 'copper' : 'gold'} />
            </Card>
          );
        }}
      />
    </Screen>
  );
}
