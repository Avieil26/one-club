import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { Redirect, Stack, useRouter } from 'expo-router';
import { useLinkingURL } from 'expo-linking';
import { completeNativeAuthReturn } from '@/lib/authGoogle';
import { isNativeAuthReturn } from '@/lib/nativeAuthReturn';
import { useApp } from '@/lib/store';
import { useLanguage } from '@/lib/language';
import { getSupabase } from '@/lib/supabase';
import { Button, colors } from '@/components/ui';

export default function AuthCallback() {
  const url = useLinkingURL();
  const app = useApp();
  const router = useRouter();
  const { t } = useLanguage();
  const [failure, setFailure] = useState(false);
  const [completedUser, setCompletedUser] = useState<string | null>(null);
  const refresh = app.refreshCommunity;

  useEffect(() => {
    if (Platform.OS === 'web' || !url || !isNativeAuthReturn(url)) return;
    let active = true;
    void completeNativeAuthReturn(url).then(async () => {
      const { data, error } = await getSupabase().auth.getSession();
      if (error || !data.session) throw new Error('No app session');
      if (!active) return;
      setCompletedUser(data.session.user.id);
      refresh();
    }).catch(() => { if (active) setFailure(true); });
    return () => { active = false; };
  }, [url, refresh]);

  useEffect(() => {
    if (completedUser && app.user?.id === completedUser) router.replace('/(tabs)');
  }, [completedUser, app.user?.id, router]);

  if (Platform.OS === 'web') return <Redirect href="/" />;
  return <View style={{ flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: 'center', gap: 18 }}>
    <Stack.Screen options={{ headerShown: false }} />
    {failure ? <>
      <Text style={{ color: colors.text, textAlign: 'center', fontSize: 18 }}>{t('לא הצלחנו להשלים את ההתחברות. נסה שוב.', 'Could not finish signing in. Please try again.')}</Text>
      <Button label={t('חזרה להתחברות', 'Back to sign in')} onPress={() => router.replace('/register')} />
    </> : <>
      <ActivityIndicator color={colors.gold} />
      <Text style={{ color: colors.text, textAlign: 'center' }}>{t('משלים התחברות לאפליקציה…', 'Finishing app sign-in…')}</Text>
    </>}
  </View>;
}
