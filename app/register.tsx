import { Stack } from 'expo-router';
import { Platform, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { AccountForm } from '@/components/AccountForm';
import { useLanguage } from '@/lib/language';
import { colors } from '@/components/ui';

export default function RegisterScreen() {
  const { width } = useWindowDimensions();
  const { language, t } = useLanguage();
  const rtl = language === 'he';
  const wide = Platform.OS === 'web' && width >= 768;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, flexDirection: wide ? (rtl ? 'row-reverse' : 'row') : 'column' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={{
          flex: wide ? 1 : undefined,
          backgroundColor: '#0C1914',
          justifyContent: 'flex-end',
          padding: wide ? 32 : 20,
          minHeight: wide ? 160 : 100,
        }}
      >
        <Text style={{ color: colors.gold, fontSize: 13, fontWeight: '700', textAlign: rtl ? 'right' : 'left' }}>{t("FC27 ישראל", "FC27 COMMUNITY")}</Text>
        <Text style={{ color: colors.text, fontSize: wide ? 48 : 28, fontWeight: '800', textAlign: rtl ? 'right' : 'left' }}>{t("חשבון משתמש", "Your account")}</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: wide ? 24 : 16, alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <AccountForm />
      </ScrollView>
    </View>
  );
}
