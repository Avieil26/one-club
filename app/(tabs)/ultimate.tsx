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
import { useLocale } from '@/lib/i18n';

export default function UltimateScreen() {
  const app = useApp();
  const router = useRouter();
  const { t, isRTL } = useLocale();
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
      Alert.alert(t('common.errorTitle'), errorMessage(error));
    }
  }

  return (
    <Screen refreshing={app.busy} onRefresh={app.refresh} scene="ultimate">
      <Title>{t('ultimate.title')}</Title>
      <Muted>{t('ultimate.description')}</Muted>
      {params.posted === '1' ? (
        <Card>
          <Text style={{ color: '#D9FFE9', fontWeight: '900', fontSize: 18, textAlign: isRTL ? 'right' : 'left' }}>{t('ultimate.postPublished')}</Text>
          <Muted>{kind === 'pack' ? t('ultimate.packShown') : t('ultimate.squadShown')}</Muted>
        </Card>
      ) : null}
      <Button label={kind === 'squad' ? t('ultimate.uploadSquad') : t('ultimate.packOpened')} onPress={() => router.push(`/ultimate/new?kind=${kind}`)} />
      <ChoiceGroup
        options={[
          { id: 'squad', label: t('ultimate.squads') },
          { id: 'pack', label: t('ultimate.packs') },
        ]}
        value={kind}
        onChange={setKind}
      />
      {posts.length === 0 ? <Muted>{t('ultimate.noPosts')}</Muted> : null}
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
                <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
                  <PlatformMark id={post.platform} size={42} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700', textAlign: 'right' }}>
                      {displayName(app.profiles, post.userId)}
                    </Text>
                    <Muted>
                      {platformLabel(post.platform)}
                      {post.formation ? ` · ${post.formation}` : ''}
                      {post.playerName ? ` · ${post.playerName}` : ''}
                      {post.packRarity ? ` · ${rarityLabel(post.packRarity)}` : ''}
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
