import { useMemo, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { Button, Field, Muted, Screen, Title, colors } from '@/components/ui';
import { displayName } from '@/lib/labels';
import { errorMessage, formatDate } from '@/lib/format';
import { useApp } from '@/lib/store';

export default function GroundsChatScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const app = useApp();
  const router = useRouter();
  const [body, setBody] = useState('');
  const peerId = String(userId || '');
  const peerName = displayName(app.profiles, peerId);

  const thread = useMemo(() => {
    if (!app.user) return [];
    return app.messages
      .filter(
        (m) =>
          (m.fromUserId === app.user!.id && m.toUserId === peerId) ||
          (m.fromUserId === peerId && m.toUserId === app.user!.id),
      )
      .slice()
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [app.messages, app.user, peerId]);

  async function send() {
    if (!app.user) {
      Alert.alert('רגע', 'צריך להתחבר');
      return;
    }
    try {
      await app.sendMessage(peerId, body);
      setBody('');
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  if (!peerId) {
    return (
      <Screen scene="grounds">
        <Muted>שחקן לא נמצא</Muted>
        <Button label="חזרה" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen scene="grounds">
      <Stack.Screen options={{ title: peerName }} />
      <Title>צ׳אט עם {peerName}</Title>
      <Muted>הודעות בתוך האפליקציה — בלי וואטסאפ.</Muted>

      <FlatList
        data={thread}
        keyExtractor={(item) => item.id}
        style={{ maxHeight: 360, marginVertical: 12 }}
        ListEmptyComponent={<Muted>עדיין אין הודעות. כתבו את הראשונה.</Muted>}
        renderItem={({ item }) => {
          const mine = item.fromUserId === app.user?.id;
          return (
            <View
              style={{
                alignSelf: mine ? 'flex-start' : 'flex-end',
                backgroundColor: mine ? 'rgba(61,220,151,0.18)' : colors.cardAlt,
                borderRadius: 14,
                padding: 10,
                marginVertical: 4,
                maxWidth: '85%',
              }}
            >
              <Text style={{ color: colors.text, textAlign: mine ? 'left' : 'right' }}>{item.body}</Text>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>{formatDate(item.createdAt)}</Text>
            </View>
          );
        }}
      />

      <Field label="הודעה" value={body} onChangeText={setBody} placeholder="כתבו כאן…" multiline />
      <Button label="שליחה" onPress={send} />
    </Screen>
  );
}
