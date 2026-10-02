import { useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { GroundsPlayerCard } from '@/components/GroundsPlayerCard';
import { Button, ChoiceGroup, Muted, Screen, Title, colors } from '@/components/ui';
import { TileGrid } from '@/components/TileGrid';
import { errorMessage } from '@/lib/format';
import { intentLabel, platformLabel } from '@/lib/labels';
import { useApp } from '@/lib/store';
import type { GroundsIntent, PlatformId } from '@/lib/types';

type FilterIntent = GroundsIntent | 'all';
type FilterPlatform = PlatformId | 'all';

export default function GroundsScreen() {
  const app = useApp();
  const router = useRouter();
  const [intent, setIntent] = useState<FilterIntent>('all');
  const [platform, setPlatform] = useState<FilterPlatform>('all');

  const filtered = useMemo(() => {
    return app.grounds.filter((post) => {
      if (intent !== 'all' && post.intent !== intent) return false;
      if (platform !== 'all' && post.platform !== platform) return false;
      return true;
    });
  }, [app.grounds, intent, platform]);

  async function onFollow(userId: string) {
    if (!app.user) {
      Alert.alert('רגע', 'צריך להתחבר כדי לעקוב');
      return;
    }
    try {
      await app.toggleFollow(userId);
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  function onMessage(userId: string) {
    if (!app.user) {
      Alert.alert('רגע', 'צריך להתחבר כדי לשלוח הודעה');
      return;
    }
    router.push(`/grounds/chat/${userId}`);
  }

  return (
    <Screen refreshing={app.busy} onRefresh={app.refresh} scene="grounds">
      <Title>הגראונדס</Title>
      <Muted>פרטי שחקן, רמה בצבעי Clubs, הודעות באפליקציה ועוקבים — בלי וואטסאפ.</Muted>
      <Button label="מודעה חדשה" onPress={() => router.push('/grounds/new')} />

      <ChoiceGroup
        label="סוג"
        options={[
          { id: 'all', label: 'הכל' },
          { id: 'need_player', label: intentLabel('need_player') },
          { id: 'looking_for_club', label: intentLabel('looking_for_club') },
        ]}
        value={intent}
        onChange={setIntent}
      />
      <ChoiceGroup
        label="פלטפורמה"
        options={[
          { id: 'all', label: 'הכל' },
          { id: 'ps5', label: platformLabel('ps5') },
          { id: 'xbox', label: platformLabel('xbox') },
          { id: 'pc', label: platformLabel('pc') },
          { id: 'switch2', label: platformLabel('switch2') },
        ]}
        value={platform}
        onChange={setPlatform}
      />

      {!filtered.length ? (
        <View style={{ paddingVertical: 28, alignItems: 'center', gap: 8 }}>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>אין מודעות כרגע</Text>
          <Muted>פרסמו מודעה ראשונה או שנו פילטר.</Muted>
        </View>
      ) : (
        <TileGrid
          items={filtered}
          wide={3}
          narrow={1}
          render={(post) => (
            <GroundsPlayerCard
              post={post}
              profiles={app.profiles}
              follows={app.follows}
              meId={app.user?.id ?? null}
              onFollow={onFollow}
              onMessage={onMessage}
              onOpenProfile={(id) => router.push(`/player/${id}`)}
              onNeedAuth={() => Alert.alert('רגע', 'צריך להתחבר כדי לעקוב או לשלוח הודעה')}
            />
          )}
        />
      )}
    </Screen>
  );
}
