import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';

import { sessionFromUrl } from '@/lib/authGoogle';
import { getSupabase } from '@/lib/supabase';
import { useApp } from '@/lib/store';

export default function AuthCallbackScreen() {
  const app = useApp();
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    void (async () => {
      try {
        if (Platform.OS === 'web') {
          await sessionFromUrl(window.location.href);
        } else {
          const { data, error: sessionError } = await getSupabase().auth.getSession();
          if (sessionError) throw sessionError;
          if (!data.session) throw new Error('לא התקבלה סשן מההתחברות');
        }

        await app.refresh();
        router.replace('/(tabs)');
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : String(caught);
        setError(message || 'ההתחברות נכשלה');
      }
    })();
  }, [app, router]);

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A100E', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <View
          style={{
            width: '100%',
            maxWidth: 520,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: 'rgba(227,179,65,0.45)',
            backgroundColor: '#111A15',
            padding: 22,
            gap: 14,
          }}
        >
          <Text style={{ color: '#F4F7F2', fontSize: 24, fontWeight: '900', textAlign: 'right' }}>
            ההתחברות לא הושלמה
          </Text>
          <Text style={{ color: '#C5D5C8', fontSize: 14, lineHeight: 22, textAlign: 'right' }}>
            {error}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/register')}
            style={{ minHeight: 46, borderRadius: 10, backgroundColor: '#E3B341', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#2A2208', fontWeight: '900', fontSize: 15 }}>חזרה לכניסה</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A100E', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <ActivityIndicator color="#E3B341" size="large" />
      <Text style={{ color: '#F4F7F2', marginTop: 14, fontSize: 16, fontWeight: '800' }}>
        מסיימים את ההתחברות...
      </Text>
    </View>
  );
}
