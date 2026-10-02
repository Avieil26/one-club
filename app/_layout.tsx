import { useEffect, useRef, useState } from 'react';
import { useFonts } from 'expo-font';
import { ActivityIndicator, DevSettings, I18nManager, Platform, StyleSheet, View } from 'react-native';
import { DarkTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';

import { Arrival } from '@/components/Arrival';
import { CookieNotice } from '@/components/CookieNotice';
import { GoogleAuthSheet } from '@/components/GoogleAuthSheet';
import { NoticeHost } from '@/components/NoticeHost';
import { TermsConsentModal } from '@/components/TermsConsentModal';
import { colors } from '@/components/ui';
import '@/lib/installWebAlert';
import { AppProvider, useApp } from '@/lib/store';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

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
  useFonts({
    Heebo: require('../assets/fonts/Heebo.ttf'),
    GreatVibes: require('../assets/fonts/GreatVibes-Regular.ttf'),
  });

  useEffect(() => {
    if (__DEV__ || Platform.OS === 'web' || !Updates.isEnabled) return;
    let cancelled = false;
    void (async () => {
      try {
        const check = await Updates.checkForUpdateAsync();
        if (!check.isAvailable || cancelled) return;
        await Updates.fetchUpdateAsync();
        if (!cancelled) await Updates.reloadAsync();
      } catch {
        // Keep the installed copy if the update server is unreachable.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    SplashScreen.hideAsync();
    if (Platform.OS === 'web') {
      document.documentElement.lang = 'he';
      document.documentElement.dir = 'rtl';
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
    if (!I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
      if (__DEV__) DevSettings.reload();
    }
  }, []);

  return (
    <AppProvider>
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
                <Stack.Screen name="register" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </Gate>
            {Platform.OS !== 'web' ? <GoogleAuthSheet /> : null}
          </View>
          <NoticeHost />
        </View>
      </ThemeProvider>
    </AppProvider>
  );
}

function Gate({ children }: { children: React.ReactNode }) {
  const { ready, user } = useApp();
  const segments = useSegments();
  const router = useRouter();
  const fromLogin = useRef(segments[0] === 'login' || segments[0] === 'register');
  const [arriving, setArriving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const onAuth = segments[0] === 'login' || segments[0] === 'register';
    const onLegal = segments[0] === 'legal';
    if (!user && !onAuth && !onLegal) router.replace('/register');
    if (user && onAuth) router.replace('/(tabs)');
  }, [ready, user, segments, router]);

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

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.green} />
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1 }}>{children}</View>
      {arriving && user ? <Arrival name={user.displayName} onDone={() => setArriving(false)} /> : null}
      <CookieNotice />
      <TermsConsentModal />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
});
