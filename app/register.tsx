import { Stack } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountForm } from '@/components/AccountForm';
import { useLanguage } from '@/lib/language';
import { colors } from '@/components/ui';

export default function RegisterScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { language, t } = useLanguage();
  const rtl = language === 'he';
  const wide = Platform.OS === 'web' && width >= 768;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.bg, flexDirection: wide ? (rtl ? 'row-reverse' : 'row') : 'column' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={{
          flex: wide ? 1 : undefined,
          backgroundColor: '#0C1914',
          justifyContent: 'flex-end',
          padding: wide ? 32 : 20,
          paddingTop: (wide ? 32 : 20) + insets.top,
          minHeight: wide ? 160 : 100,
        }}
      >
        <Text style={{ color: colors.gold, fontSize: 13, fontWeight: '700', textAlign: rtl ? 'right' : 'left' }}>{t("FC27 ישראל", "FC27 COMMUNITY")}</Text>
        <Text style={{ color: colors.text, fontSize: wide ? 48 : 28, fontWeight: '800', textAlign: rtl ? 'right' : 'left' }}>{t("חשבון משתמש", "Your account")}</Text>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: wide ? 24 : 16, paddingBottom: insets.bottom + 24, alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <AccountForm />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
