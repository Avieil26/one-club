import { useState } from 'react';
import { Alert } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { Comments } from '@/components/Comments';
import { Badge, Button, ImageRow, Muted, ScorePicker, Screen, Title } from '@/components/ui';
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
        <Title>׳”׳₪׳•׳¡׳˜ ׳׳ ׳ ׳׳¦׳</Title>
      </Screen>
    );
  }

  const postId = post.id;
  const summary = averageRating(postId, app.ratings);
  const own = post.userId === app.user?.id;

  async function rate() {
    try {
      await app.rateFut(postId, fit, fun, creativity);
    } catch (error) {
      Alert.alert('׳¨׳’׳¢', errorMessage(error));
    }
  }

  return (
    <Screen scene="ultimate">
      <Stack.Screen options={{ title: post.kind === 'squad' ? '׳§׳‘׳•׳¦׳”' : '׳—׳‘׳™׳׳”' }} />
      <Title>{post.kind === 'squad' ? post.formation ?? '׳§׳‘׳•׳¦׳”' : post.playerName ?? '׳—׳‘׳™׳׳”'}</Title>
      <Muted>
        {displayName(app.profiles, post.userId)} ֲ· {platformLabel(post.platform)}
        {post.packRarity ? ` ֲ· ${rarityLabel(post.packRarity)}` : ''}
      </Muted>
      <ImageRow uris={post.imageUris} />
      <Muted>{post.body}</Muted>
      {post.kind === 'squad' ? (
        <>
          <Badge text={summary.count ? `׳׳׳•׳¦׳¢ ${formatScore(summary.overall)} ֲ· ${summary.count} ׳“׳™׳¨׳•׳’׳™׳` : '׳¢׳“׳™׳™׳ ׳‘׳׳™ ׳“׳™׳¨׳•׳’'} tone="gold" />
          {summary.count ? (
            <Muted>
              ׳”׳×׳׳׳” {formatScore(summary.fit)} ֲ· ׳›׳™׳£ {formatScore(summary.fun)} ֲ· ׳™׳¦׳™׳¨׳×׳™׳•׳× {formatScore(summary.creativity)}
            </Muted>
          ) : null}
          {own ? (
            <Muted>׳׳₪׳©׳¨ ׳׳“׳¨׳’ ׳§׳‘׳•׳¦׳•׳× ׳©׳ ׳׳—׳¨׳™׳.</Muted>
          ) : (
            <>
              <ScorePicker label="׳”׳×׳׳׳”" value={fit} onChange={setFit} />
              <ScorePicker label="׳›׳™׳£" value={fun} onChange={setFun} />
              <ScorePicker label="׳™׳¦׳™׳¨׳×׳™׳•׳×" value={creativity} onChange={setCreativity} />
              <Button label="׳©׳׳™׳¨׳× ׳“׳™׳¨׳•׳’" onPress={rate} disabled={app.busy || fit < 1 || fun < 1 || creativity < 1} />
            </>
          )}
        </>
      ) : null}
      <Comments targetType="fut_post" targetId={post.id} />
    </Screen>
  );
}

