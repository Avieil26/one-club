import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { sessionFromUrl } from '@/lib/authGoogle';
import { useApp } from '@/lib/store';

function hasOAuthReturnParams(): boolean {
  if (typeof window === 'undefined') return false;
  const href = window.location.href;
  return /[?&#](?:code|access_token|refresh_token|error|error_description)=/.test(href);
}

export default function Index() {
  const app = useApp();
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const oauthReturn = hasOAuthReturnParams();

  useEffect(() => {
    if (!oauthReturn || started.current) return;
    started.current = true;

    void (async () => {
      try {
        await sessionFromUrl(window.location.href);
        await app.refresh();
        router.replace('/(tabs)');
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : String(caught);
        setError(message || 'ההתחברות עם Google נכשלה');
      }
    })();
  }, [app, oauthReturn, router]);

  if (!oauthReturn) {
    return <></>;
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A100E', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <View style={{ width: '100%', maxWidth: 520, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(227,179,65,0.45)', backgroundColor: '#111A15', padding: 22, gap: 14 }}>
          <Text style={{ color: '#F4F7F2', fontSize: 24, fontWeight: '900', textAlign: 'right' }}>ההתחברות לא הושלמה</Text>
          <Text style={{ color: '#C5D5C8', fontSize: 14, lineHeight: 22, textAlign: 'right' }}>{error}</Text>
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
    <View style={{ flex: 1, backgroundColor: '#0A100E', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#E3B341" size="large" />
      <Text style={{ color: '#F4F7F2', marginTop: 14, fontSize: 16, fontWeight: '800' }}>
        מסיימים את ההתחברות...
      </Text>
    </View>
  );
}
