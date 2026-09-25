import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, DevSettings, I18nManager, Platform, StyleSheet, View } from 'react-native';
import { DarkTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { Arrival } from '@/components/Arrival';
import { colors } from '@/components/ui';
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
  useEffect(() => {
    SplashScreen.hideAsync();
    if (Platform.OS === 'web') {
      document.documentElement.lang = 'he';
      document.documentElement.dir = 'rtl';
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
          </View>
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
    const onAccount = segments[0] === 'login' || segments[0] === 'register';
    if (!user && !onAccount) router.replace('/register');
    if (user && onAccount) router.replace('/(tabs)');
  }, [ready, user, segments, router]);

  useEffect(() => {
    if (segments[0] === 'login' || segments[0] === 'register') fromLogin.current = true;
  }, [segments]);

  useEffect(() => {
    if (!user || !fromLogin.current) return;
    fromLogin.current = false;
    setArriving(true);
    const timer = setTimeout(() => setArriving(false), 1100);
    return () => clearTimeout(timer);
  }, [user]);

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
      {arriving && user ? <Arrival name={user.displayName} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
});
