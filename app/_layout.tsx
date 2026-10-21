import { useEffect, useRef, useState } from 'react';
import { useFonts } from 'expo-font';
import { ActivityIndicator, I18nManager, Platform, StyleSheet, View } from 'react-native';
import { DarkTheme, Stack, ThemeProvider, useRouter, useSegments, usePathname, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { isPublicPath } from '@/lib/siteAccess';
import { useDailyActivity } from '@/lib/dailyActivity';
import { rememberCommunityReturn, readCommunityReturn, clearCommunityReturn } from '@/lib/communityReturn';
import { validCommunityReturn } from '@/lib/communityActivityLogic';

import { Arrival } from '@/components/Arrival';
import { CookieNotice } from '@/components/CookieNotice';
import { NoticeHost } from '@/components/NoticeHost';
import { TermsConsentModal } from '@/components/TermsConsentModal';
import { FutureStarsAnnouncement } from '@/components/FutureStarsAnnouncement';
import { Button, colors, Muted, Title } from '@/components/ui';
import '@/lib/installWebAlert';
import { AppProvider, useApp } from '@/lib/store';
import { LanguageProvider, useLanguage } from '@/lib/language';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

// Screen layouts already select direction explicitly. OS-wide RTL would also
// mirror football pitches and keep English mirrored until a process restart.
if (Platform.OS !== 'web') {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
}

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.line,
    primary: colors.blue,
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Heebo: require('../assets/fonts/Heebo.ttf'),
    GreatVibes: require('../assets/fonts/GreatVibes-Regular.ttf'),
  });

  // expo-updates already downloads compatible updates in the background.
  // Use them on the next launch, rather than downloading/checking twice and
  // reloading the whole app while the user is opening it.

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const styleId = 'fc27-scroll';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
*::-webkit-scrollbar { width: 10px; height: 10px; }
*::-webkit-scrollbar-track { background: #14120e; }
*::-webkit-scrollbar-thumb { background: #8a7340; border-radius: 8px; border: 2px solid #14120e; }
*::-webkit-scrollbar-button,
*::-webkit-scrollbar-button:single-button,
*::-webkit-scrollbar-button:vertical:decrement,
*::-webkit-scrollbar-button:vertical:increment,
*::-webkit-scrollbar-button:horizontal:decrement,
*::-webkit-scrollbar-button:horizontal:increment,
*::-webkit-scrollbar-button:start:decrement,
*::-webkit-scrollbar-button:end:increment,
*::-webkit-scrollbar-button:vertical:start:decrement,
*::-webkit-scrollbar-button:vertical:end:increment {
  display: none; width: 0; height: 0; background: transparent;
}`;
        document.head.appendChild(style);
      }
      return;
    }
  }, []);

  return (
    <AppProvider>
      <LanguageProvider>
      <ThemeProvider value={theme}>
        <View style={styles.fill}>
          <View style={styles.fill}>
            <StatusBar style="light" />
            <Gate>
              <Stack
                screenOptions={{
                  headerStyle: { backgroundColor: colors.bg },
                  headerTintColor: colors.text,
                  headerTitleStyle: { fontWeight: '700' },
                  headerShadowVisible: false,
                  contentStyle: { backgroundColor: colors.bg },
                }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="language" options={{ headerShown: false }} />
                <Stack.Screen name="settings" options={{ headerShown: false }} />
                <Stack.Screen name="register" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </Gate>
          </View>
          <NoticeHost />
        </View>
      </ThemeProvider>
      </LanguageProvider>
    </AppProvider>
  );
}

function Gate({ children }: { children: React.ReactNode }) {
  const { ready, user, startupError, retryStartup } = useApp();
  const { ready: languageReady, hasSelection, t } = useLanguage();
  const segments = useSegments();
  const pathname = usePathname();
  useDailyActivity(user?.id, Boolean(user?.isAdmin), pathname);
  const returnWrite = useRef<Promise<void>>(Promise.resolve());
  const router = useRouter();
  const fromLogin = useRef(segments[0] === 'login' || segments[0] === 'register');
  const [arriving, setArriving] = useState(false);

  useEffect(() => {
    if (!ready || !languageReady) return;
    const onAuth = segments[0] === 'login' || segments[0] === 'register';
    const onLanguage = segments[0] === 'language';
    const onLegal = segments[0] === 'legal';
    const onNativeCallback = Platform.OS !== 'web' && segments.join('/') === 'auth/callback';
    if (!user && !onAuth && !onLanguage && !onLegal && !onNativeCallback && !isPublicPath(pathname)) {
      if (validCommunityReturn(pathname)) returnWrite.current = rememberCommunityReturn(pathname);
      router.replace(hasSelection ? '/register' : '/language');
    }
    if (!user && !hasSelection && !onLanguage && !onLegal && !onNativeCallback) router.replace('/language');
    let active = true;
    if (user && validCommunityReturn(pathname)) void returnWrite.current.then(clearCommunityReturn);
    if (user && (onAuth || onLanguage || pathname === '/')) {
      void returnWrite.current.then(readCommunityReturn).then((destination) => {
        if (active && destination) router.replace(destination as Href);
        else if (active && (onAuth || onLanguage)) router.replace('/(tabs)');
      });
    }
    return () => { active = false; };
  }, [ready, languageReady, hasSelection, user, segments, pathname, router]);

  useEffect(() => {
    if (segments[0] === 'login' || segments[0] === 'register') fromLogin.current = true;
  }, [segments]);

  useEffect(() => {
    if (!user?.id || !fromLogin.current) return;
    fromLogin.current = false;
    setArriving(true);
  }, [user?.id]);

  useEffect(() => {
    if (!arriving) return;
    const timer = setTimeout(() => setArriving(false), 900);
    return () => clearTimeout(timer);
  }, [arriving]);

  if (startupError) {
    return <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 24, gap: 16 }}>
      <Title>{t('לא הצלחנו להתחבר', 'Could not connect')}</Title>
      <Muted>{t('בדוק את החיבור לאינטרנט ונסה שוב.', 'Check your internet connection and try again.')}</Muted>
      <Button label={t('נסה שוב', 'Try again')} onPress={retryStartup} />
    </View>;
  }
  if (!ready || !languageReady) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.green} />
      </View>
    );
  }
  const publicOrAuth = isPublicPath(pathname) || ['login','register','language','legal','auth'].includes(String(segments[0]));
  if (!user && !publicOrAuth) return <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.green} /></View>;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1 }}>{children}</View>
      {arriving && user ? <Arrival name={user.displayName} onDone={() => setArriving(false)} /> : null}
      <CookieNotice />
      <TermsConsentModal />
      <FutureStarsAnnouncement />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg, direction: 'ltr' },
});
