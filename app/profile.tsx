import { Alert, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { Badge, Button, colors, Muted, Screen, Title } from '@/components/ui';
import { errorMessage } from '@/lib/format';
import { badgesFor, pendingCount } from '@/lib/selectors';
import { useApp } from '@/lib/store';

export default function ProfileScreen() {
  const app = useApp();
  const router = useRouter();
  const badges = app.user ? badgesFor(app.user, app.grounds) : [];

  async function run(work: () => Promise<void>) {
    try {
      await work();
    } catch (error) {
      Alert.alert('׳¨׳’׳¢', errorMessage(error));
    }
  }

  return (
    <Screen scene="home">
      <Stack.Screen options={{ title: '׳₪׳¨׳•׳₪׳™׳' }} />
      <Title>{app.user?.displayName ?? '׳₪׳¨׳•׳₪׳™׳'}</Title>
      <Muted>{app.mode === 'local' ? '׳׳¦׳‘ ׳”׳“׳’׳׳” ׳¢׳ ׳”׳׳›׳©׳™׳¨' : '׳׳—׳•׳‘׳¨׳™׳ ׳׳©׳¨׳×'}</Muted>
      <Text style={{ color: colors.gold, fontSize: 32, fontWeight: '700', textAlign: 'right' }}>{app.user?.reputation ?? 0}</Text>
      <Muted>׳ ׳§׳•׳“׳•׳× ׳׳•׳ ׳™׳˜׳™׳. ׳–׳” ׳׳ ׳׳˜׳‘׳¢ ׳•׳׳ ׳₪׳¨׳¡ ׳©׳׳₪׳©׳¨ ׳׳׳©׳•׳.</Muted>
      <Muted>׳”׳’׳©׳•׳× ׳©׳׳•׳©׳¨׳•: {app.user?.approvedCount ?? 0}</Muted>
      {badges.length ? (
        <>
          {badges.map((badge) => (
            <Badge key={badge} text={badge} tone="gold" />
          ))}
        </>
      ) : (
        <Muted>׳×׳’׳™׳ ׳׳’׳™׳¢׳™׳ ׳׳׳™׳©׳•׳¨׳™ ׳§׳¨׳™׳™׳¨׳” ׳•׳׳׳•׳“׳¢׳•׳× ׳‘׳’׳¨׳׳•׳ ׳“׳¡.</Muted>
      )}
      {app.user?.isAdmin ? (
        <Button label={`׳×׳•׳¨ ׳׳™׳©׳•׳¨ ֲ· ${pendingCount(app)}`} onPress={() => router.push('/admin/queue')} />
      ) : null}
      {app.mode === 'local' ? <Button label="׳׳™׳₪׳•׳¡ ׳ ׳×׳•׳ ׳™ ׳”׳“׳’׳׳”" variant="ghost" onPress={() => run(app.resetDemo)} /> : null}
      <Button label="׳™׳¦׳™׳׳”" variant="danger" onPress={() => run(app.signOut)} />
    </Screen>
  );
}

