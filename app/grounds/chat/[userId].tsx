import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SiteNav } from '@/components/SiteNav';
import { colors } from '@/components/ui';
import { errorMessage } from '@/lib/format';
import { displayName } from '@/lib/labels';
import { useApp } from '@/lib/store';
import type { DirectMessage } from '@/lib/types';

type Row =
  | { kind: 'day'; id: string; label: string }
  | { kind: 'msg'; id: string; message: DirectMessage };

function clock(iso: string) {
  const date = new Date(iso);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function dayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'היום';
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'אתמול';
  return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
}

function ChatWallpaper() {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
      <LinearGradient
        colors={['#1A140C', '#10161C', '#0C1412', '#16120E']}
        locations={[0, 0.35, 0.7, 1]}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      {Array.from({ length: 8 }, (_, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: 90,
            borderWidth: 1,
            borderColor: index % 2 === 0 ? 'rgba(227,179,65,0.07)' : 'rgba(80,160,140,0.08)',
            top: index * 90 - 40,
            left: (index % 3) * 120 - 30,
          }}
        />
      ))}
    </View>
  );
}

export default function GroundsChatScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const app = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const list = useRef<FlatList<Row>>(null);
  const [body, setBody] = useState('');
  const peerId = String(userId || '');
  const preview = peerId === 'preview';
  const peerName = preview ? 'נועם' : displayName(app.profiles, peerId);
  const peer = app.profiles.find((profile) => profile.id === peerId);

  const thread = useMemo(() => {
    if (preview) {
      const day = new Date().toISOString();
      return [
        { id: 'p1', fromUserId: 'preview-peer', toUserId: 'me', body: 'יש לך חלון הערב לפרנדלי?', createdAt: day },
        { id: 'p2', fromUserId: 'me', toUserId: 'preview-peer', body: 'כן, אחרי תשע. פלייסטיישן.', createdAt: day },
        { id: 'p3', fromUserId: 'preview-peer', toUserId: 'me', body: 'סבבה. אני על 4-3-3, רמה 18.', createdAt: day },
        { id: 'p4', fromUserId: 'me', toUserId: 'preview-peer', body: 'יאללה, תשלח הזמנה.', createdAt: day },
      ] satisfies DirectMessage[];
    }
    if (!app.user) return [];
    return app.messages
      .filter(
        (message) =>
          (message.fromUserId === app.user!.id && message.toUserId === peerId) ||
          (message.fromUserId === peerId && message.toUserId === app.user!.id),
      )
      .slice()
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [app.messages, app.user, peerId, preview]);

  const rows = useMemo(() => {
    const next: Row[] = [];
    let lastDay = '';
    for (const message of thread) {
      const label = dayLabel(message.createdAt);
      if (label !== lastDay) {
        lastDay = label;
        next.push({ kind: 'day', id: `day-${message.id}`, label });
      }
      next.push({ kind: 'msg', id: message.id, message });
    }
    return next;
  }, [thread]);

  async function send() {
    if (preview) return;
    if (!app.user) {
      Alert.alert('רגע', 'צריך להתחבר');
      return;
    }
    const text = body.trim();
    if (!text) return;
    try {
      await app.sendMessage(peerId, text);
      setBody('');
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  if (!peerId) {
    return (
      <View style={{ flex: 1, backgroundColor: '#10161C', padding: 24 }}>
        <Text style={{ color: colors.muted, textAlign: 'right' }}>שחקן לא נמצא</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#10161C' }}>
      <ChatWallpaper />
      <Stack.Screen options={{ title: peerName, headerShown: false }} />
      <SiteNav />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(227,179,65,0.22)',
          backgroundColor: 'rgba(12,16,18,0.72)',
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={{ color: colors.gold, fontWeight: '800', fontSize: 16 }}>חזרה</Text>
        </Pressable>
        <Pressable onPress={() => { if (!preview) router.push(`/player/${peerId}`); }} style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 18, textAlign: 'right' }}>{peerName}</Text>
          <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'right' }}>
            {preview ? 'תצוגה לדוגמה' : peer?.squad ? 'יש סגל בפרופיל' : 'לפרופיל'}
          </Text>
        </Pressable>
        <LinearGradient
          colors={['#F0D78A', '#C4A35A', '#6A5420']}
          style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: '#1A1208', fontWeight: '900', fontSize: 18 }}>{peerName.slice(0, 1)}</Text>
        </LinearGradient>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        <FlatList
          ref={list}
          data={rows}
          keyExtractor={(item) => item.id}
          style={{ flex: 1, direction: 'ltr' }}
          contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 14, paddingBottom: 12, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => list.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
              <LinearGradient
                colors={['rgba(227,179,65,0.16)', 'rgba(20,28,26,0.8)']}
                style={{ borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(227,179,65,0.28)' }}
              >
                <Text style={{ color: colors.text, textAlign: 'center', fontWeight: '700' }}>אין הודעות עדיין</Text>
                <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 4 }}>שלחו את הראשונה למטה</Text>
              </LinearGradient>
            </View>
          }
          renderItem={({ item }) => {
            if (item.kind === 'day') {
              return (
                <View style={{ alignItems: 'center', marginVertical: 10 }}>
                  <View
                    style={{
                      backgroundColor: 'rgba(8,12,14,0.72)',
                      borderRadius: 12,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <Text style={{ color: colors.muted, fontSize: 12 }}>{item.label}</Text>
                  </View>
                </View>
              );
            }
            const mine = preview ? item.message.fromUserId === 'me' : item.message.fromUserId === app.user?.id;
            return (
              <View style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '78%', marginVertical: 3 }}>
                <LinearGradient
                  colors={mine ? ['#E86A12', '#C2410C'] : ['#243038', '#161C22']}
                  style={{
                    borderRadius: 18,
                    borderBottomRightRadius: mine ? 5 : 18,
                    borderBottomLeftRadius: mine ? 18 : 5,
                    paddingHorizontal: 12,
                    paddingTop: 8,
                    paddingBottom: 6,
                    borderWidth: 1,
                    borderColor: mine ? 'rgba(255,186,120,0.45)' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <Text style={{ color: '#F7F4EA', fontSize: 16, lineHeight: 22, textAlign: 'right' }}>{item.message.body}</Text>
                  <Text style={{ color: mine ? 'rgba(232,255,244,0.72)' : colors.muted, fontSize: 11, textAlign: 'left', marginTop: 4 }}>
                    {clock(item.message.createdAt)}
                  </Text>
                </LinearGradient>
              </View>
            );
          }}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 8,
            paddingHorizontal: 10,
            paddingTop: 8,
            paddingBottom: Math.max(10, insets.bottom + 8),
            backgroundColor: 'rgba(8,12,14,0.92)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(227,179,65,0.2)',
          }}
        >
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="הודעה"
            placeholderTextColor="rgba(197,213,200,0.55)"
            multiline
            textAlign="right"
            style={{
              flex: 1,
              maxHeight: 120,
              minHeight: 44,
              color: colors.text,
              backgroundColor: '#1A2428',
              borderRadius: 22,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: 'rgba(120,160,150,0.28)',
              fontSize: 16,
            }}
          />
          <Pressable onPress={send} disabled={app.busy || !body.trim()}>
            <LinearGradient
              colors={body.trim() ? ['#F0D78A', '#C4922A'] : ['#3A4044', '#2A3034']}
              style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: body.trim() ? '#1A1208' : '#8A9290', fontWeight: '900', fontSize: 18 }}>↑</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
