import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { AuthorNote } from '@/components/AuthorNote';
import { Comments } from '@/components/Comments';
import { PlatformMark } from '@/components/PlatformPicker';
import { SquadLike } from '@/components/SquadLike';
import { SquadPhoto } from '@/components/SquadPhoto';
import { Button, Muted, ScorePicker, Screen, Title } from '@/components/ui';
import { errorMessage, formatScore } from '@/lib/format';
import { displayName, platformLabel, rarityLabel } from '@/lib/labels';
import { averageRating } from '@/lib/selectors';
import { useApp } from '@/lib/store';

export default function FutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const post = app.futPosts.find((item) => item.id === id);
  const mine = app.ratings.find((rating) => rating.postId === id && rating.userId === app.user?.id);
  const [fit, setFit] = useState(mine?.fit ?? 0);
  const [fun, setFun] = useState(mine?.fun ?? 0);
  const [creativity, setCreativity] = useState(mine?.creativity ?? 0);

  if (!post) {
    return (
      <Screen scene="ultimate">
        <Title>הפוסט לא נמצא</Title>
      </Screen>
    );
  }

  const postId = post.id;
  const summary = averageRating(postId, app.ratings);
  const own = post.userId === app.user?.id;
  const likes = app.likes.filter((like) => like.postId === postId);
  const liked = likes.some((like) => like.userId === app.user?.id);

  async function rate() {
    try {
      await app.rateFut(postId, fit, fun, creativity);
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  async function like() {
    try {
      await app.toggleFutLike(postId);
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  return (
    <Screen scene="ultimate">
      <Stack.Screen options={{ title: post.kind === 'squad' ? 'קבוצה' : 'חבילה' }} />
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12 }}>
        <PlatformMark id={post.platform} size={52} />
        <View style={{ flex: 1, gap: 4 }}>
          <Title>{displayName(app.profiles, post.userId)}</Title>
          <Muted>
            {platformLabel(post.platform)}
            {post.kind === 'squad' && post.formation ? ` · ${post.formation}` : ''}
            {post.playerName ? ` · ${post.playerName}` : ''}
            {post.packRarity ? ` · ${rarityLabel(post.packRarity)}` : ''}
          </Muted>
        </View>
      </View>
      <SquadPhoto uris={post.imageUris} tall />
      <AuthorNote
        name={displayName(app.profiles, post.userId)}
        body={post.body}
        avatarUrl={app.profiles.find((profile) => profile.id === post.userId)?.avatarUrl}
      />
      {post.kind === 'squad' ? (
        <View style={{ gap: 12 }}>
          <SquadLike count={likes.length} liked={liked} disabled={app.busy} onPress={like} />
          {summary.count ? (
            <Muted>
              דירוג {formatScore(summary.overall)} · התאמה {formatScore(summary.fit)} · כיף {formatScore(summary.fun)} · יצירתיות{' '}
              {formatScore(summary.creativity)}
            </Muted>
          ) : null}
          {own ? (
            <Muted>אפשר לדרג קבוצות של אחרים.</Muted>
          ) : (
            <View style={{ gap: 14 }}>
              <ScorePicker label="התאמה" value={fit} onChange={setFit} />
              <ScorePicker label="כיף" value={fun} onChange={setFun} />
              <ScorePicker label="יצירתיות" value={creativity} onChange={setCreativity} />
              <Button label="שמירת דירוג" onPress={rate} disabled={app.busy || fit < 1 || fun < 1 || creativity < 1} />
            </View>
          )}
        </View>
      ) : null}
      <Comments targetType="fut_post" targetId={post.id} />
    </Screen>
  );
}
