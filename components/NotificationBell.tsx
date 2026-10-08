import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Animated, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';

import { ProfileFace } from '@/components/ProfileFace';
import { useApp } from '@/lib/store';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

type NotificationRow = {
  id: string;
  user_id: string;
  actor_user_id: string | null;
  kind: string;
  title: string;
  body: string;
  href: string | null;
  created_at: string;
  read_at: string | null;
};

function timeLabel(value: string) {
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'עכשיו';
  if (minutes < 60) return 'לפני ' + minutes + ' דק׳';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return 'לפני ' + hours + ' שעות';
  const days = Math.floor(hours / 24);
  return 'לפני ' + days + ' ימים';
}

export function NotificationBell() {
  const app = useApp();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const unread = items.filter((item) => !item.read_at).length;
  const panelWidth = Math.min(360, Math.max(280, width - 28));

  async function load() {
    if (!app.user?.id || !isSupabaseConfigured()) {
      setItems([]);
      return;
    }
    setLoading(true);
    const { data, error } = await getSupabase()
      .from('notifications')
      .select('id,user_id,actor_user_id,kind,title,body,href,created_at,read_at')
      .eq('user_id', app.user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (!error) setItems((data ?? []) as NotificationRow[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [app.user?.id]);

  useEffect(() => {
    if (!app.user?.id || !isSupabaseConfigured()) return;
    const supabase = getSupabase();
    // Use a unique Realtime topic per mounted subscription. React can mount/cleanup
    // effects back-to-back, and Supabase now rejects adding postgres_changes
    // listeners to a channel that is already joining/subscribed.
    const channel = supabase
      .channel('notifications-' + app.user.id + '-' + Math.random().toString(36).slice(2))
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: 'user_id=eq.' + app.user.id },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [app.user?.id]);

  useEffect(() => {
    Animated.timing(progress, { toValue: open ? 1 : 0, duration: 190, useNativeDriver: false }).start();
  }, [open, progress]);

  async function markRead(item: NotificationRow) {
    if (!item.read_at && app.user?.id) {
      const now = new Date().toISOString();
      await getSupabase().from('notifications').update({ read_at: now }).eq('id', item.id).eq('user_id', app.user.id);
      setItems((current) => current.map((row) => row.id === item.id ? { ...row, read_at: now } : row));
    }
    if (item.href) {
      setOpen(false);
      router.push(item.href as never);
    }
  }

  async function markAllRead() {
    if (!app.user?.id || !unread) return;
    const now = new Date().toISOString();
    await getSupabase().from('notifications').update({ read_at: now }).eq('user_id', app.user.id).is('read_at', null);
    setItems((current) => current.map((item) => item.read_at ? item : { ...item, read_at: now }));
  }

  return (
    <View style={{ position: 'relative', zIndex: 120 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={unread ? 'התראות, ' + unread + ' חדשות' : 'התראות'}
        onPress={() => setOpen((value) => !value)}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: open ? 'rgba(227,179,65,0.14)' : 'rgba(255,255,255,0.045)',
          borderWidth: 1,
          borderColor: open ? 'rgba(227,179,65,0.45)' : 'rgba(255,255,255,0.10)',
        }}
      >
        <Ionicons name={unread ? 'notifications' : 'notifications-outline'} size={19} color={unread ? '#FFE08A' : '#E9EDF0'} />
        {unread ? (
          <View style={{ position: 'absolute', top: -2, right: -2, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#E33E4E', borderWidth: 1, borderColor: '#10151A', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
            <Text style={{ color: '#fff', fontSize: 8, fontWeight: '900' }}>{unread > 9 ? '9+' : unread}</Text>
          </View>
        ) : null}
      </Pressable>

      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={{
          position: 'absolute',
          top: 43,
          right: 0,
          width: panelWidth,
          maxHeight: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 500] }),
          opacity: progress,
          overflow: 'hidden',
          borderRadius: 18,
          backgroundColor: '#0A1015',
          borderWidth: 1,
          borderColor: 'rgba(227,179,65,0.28)',
          shadowColor: '#000',
          shadowOpacity: 0.35,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 20,
        }}
      >
        <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#F5F7F9', fontSize: 18, fontWeight: '900', textAlign: 'right' }}>התראות</Text>
            <Text style={{ color: '#71808B', fontSize: 10, fontWeight: '700', textAlign: 'right', marginTop: 2 }}>{unread ? unread + ' חדשות שלא נקראו' : 'הכול מעודכן'}</Text>
          </View>
          <Pressable disabled={!unread} onPress={() => void markAllRead()} style={{ paddingHorizontal: 9, paddingVertical: 7, borderRadius: 10, backgroundColor: unread ? 'rgba(227,179,65,0.10)' : 'rgba(255,255,255,0.035)', borderWidth: 1, borderColor: unread ? 'rgba(227,179,65,0.22)' : 'rgba(255,255,255,0.06)' }}>
            <Text style={{ color: unread ? '#E8C46A' : '#59656F', fontSize: 9, fontWeight: '900' }}>סמן הכול כנקרא</Text>
          </Pressable>
        </View>

        <ScrollView nestedScrollEnabled style={{ maxHeight: 405 }} contentContainerStyle={{ padding: 8, gap: 6 }}>
          {loading ? (
            <View style={{ paddingVertical: 22, alignItems: 'center' }}><Ionicons name="sync-outline" size={18} color="#7C8994" /></View>
          ) : items.length ? items.map((item) => {
            const actor = item.actor_user_id ? app.profiles.find((profile) => profile.id === item.actor_user_id) : null;
            return (
              <Pressable key={item.id} onPress={() => void markRead(item)} style={{ minHeight: 62, borderRadius: 13, padding: 10, flexDirection: 'row-reverse', gap: 9, alignItems: 'center', backgroundColor: item.read_at ? 'rgba(255,255,255,0.025)' : 'rgba(227,179,65,0.075)', borderWidth: 1, borderColor: item.read_at ? 'rgba(255,255,255,0.05)' : 'rgba(227,179,65,0.17)' }}>
                <ProfileFace name={actor?.displayName ?? 'התראה'} uri={actor?.avatarUrl} size={34} />
                <View style={{ flex: 1, minWidth: 0, alignItems: 'flex-end' }}>
                  <View style={{ width: '100%', flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
                    {!item.read_at ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#E8C46A' }} /> : null}
                    <Text numberOfLines={1} style={{ flex: 1, color: '#EEF2F4', fontSize: 12, fontWeight: '900', textAlign: 'right' }}>{item.title}</Text>
                  </View>
                  <Text numberOfLines={2} style={{ color: '#7E8A94', fontSize: 10, lineHeight: 15, textAlign: 'right', marginTop: 2 }}>{item.body}</Text>
                  <Text style={{ color: '#53616C', fontSize: 8, fontWeight: '800', marginTop: 2 }}>{timeLabel(item.created_at)}</Text>
                </View>
              </Pressable>
            );
          }) : (
            <View style={{ paddingVertical: 28, alignItems: 'center', gap: 6 }}>
              <Ionicons name="notifications-off-outline" size={25} color="#53606B" />
              <Text style={{ color: '#6E7B86', fontSize: 12, fontWeight: '800' }}>אין התראות חדשות</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}
