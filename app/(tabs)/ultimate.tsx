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

export default function UltimateScreen() {
  const app = useApp();
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
      Alert.alert('רגע', errorMessage(error));
    }
  }

  return (
    <Screen refreshing={app.busy} onRefresh={app.refresh} scene="ultimate">
      <Title>אולטימייט</Title>
      <Muted>דירוג קבוצות בשלושה צירים, בלי דיסלייק. חבילות הן שיתוף.</Muted>
      {params.posted === '1' ? (
        <Card>
          <Text style={{ color: '#D9FFE9', fontWeight: '900', fontSize: 18, textAlign: 'right' }}>הפוסט פורסם</Text>
          <Muted>{kind === 'pack' ? 'החבילה מופיעה ברשימה הזו.' : 'הקבוצה מופיעה ברשימה הזו.'}</Muted>
        </Card>
      ) : null}
      <Button label={kind === 'squad' ? 'העלאת קבוצה' : 'יצא לי בחבילה'} onPress={() => router.push(`/ultimate/new?kind=${kind}`)} />
      <ChoiceGroup
        options={[
          { id: 'squad', label: 'קבוצות' },
          { id: 'pack', label: 'חבילות' },
        ]}
        value={kind}
        onChange={setKind}
      />
      {posts.length === 0 ? <Muted>עדיין אין פוסטים כאן.</Muted> : null}
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
