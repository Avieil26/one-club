import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Badge, Button, Card, ChoiceGroup, colors, Muted, Screen, Title } from '@/components/ui';
import { TileGrid } from '@/components/TileGrid';
import { formatScore } from '@/lib/format';
import { displayName, futKindLabel, platformLabel, rarityLabel } from '@/lib/labels';
import { averageRating } from '@/lib/selectors';
import { useApp } from '@/lib/store';
import type { FutKind } from '@/lib/types';

export default function UltimateScreen() {
  const app = useApp();
  const router = useRouter();
  const [kind, setKind] = useState<FutKind>('squad');
  const posts = app.futPosts.filter((post) => post.kind === kind);

  return (
    <Screen refreshing={app.busy} onRefresh={app.refresh} scene="ultimate">
      <Title>אולטימייט</Title>
      <Muted>דירוג קבוצות בשלושה צירים, בלי דיסלייק. חבילות הן שיתוף.</Muted>
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
        render={(post) => {
          const rating = averageRating(post.id, app.ratings);
          return (
            <Card onPress={() => router.push(`/ultimate/${post.id}`)}>
              <Badge text={futKindLabel(post.kind)} tone={post.kind === 'pack' ? 'copper' : 'gold'} />
              <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800', textAlign: 'right' }}>
                {displayName(app.profiles, post.userId)}
                {post.formation ? ` · ${post.formation}` : ''}
                {post.playerName ? ` · ${post.playerName}` : ''}
              </Text>
              <Muted>
                {platformLabel(post.platform)}
                {post.packRarity ? ` · ${rarityLabel(post.packRarity)}` : ''}
                {post.kind === 'squad' && rating.count ? ` · ${formatScore(rating.overall)} (${rating.count})` : ''}
              </Muted>
              <View style={{ height: 4, borderRadius: 4, backgroundColor: post.kind === 'pack' ? colors.copper : colors.gold }} />
            </Card>
          );
        }}
      />
    </Screen>
  );
}
