import { Stack } from 'expo-router';
import { Platform, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { AccountForm } from '@/components/AccountForm';
import { colors } from '@/components/ui';
import { useLocale } from '@/lib/i18n';

export default function RegisterScreen() {
  const { t, isRTL, locale, setLocale } = useLocale();
  const { width } = useWindowDimensions();
  const wide = Platform.OS === 'web' && width >= 768;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, flexDirection: wide ? (isRTL ? 'row-reverse' : 'row') : 'column' }}>
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('language.label')}
          onPress={() => { void setLocale(locale === 'he' ? 'en' : 'he'); }}
          style={{
            alignSelf: isRTL ? 'flex-start' : 'flex-end',
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: 'rgba(227, 179, 65, 0.48)',
            backgroundColor: 'rgba(227, 179, 65, 0.12)',
            marginBottom: 14,
          }}
        >
          <Text style={{ color: colors.gold, fontWeight: '900', fontSize: 12 }}>{locale === 'he' ? 'EN' : 'עברית'}</Text>
        </Pressable>
        <Text style={{ color: colors.gold, fontSize: 13, fontWeight: '700', textAlign: isRTL ? 'right' : 'left' }}>{t('auth.brand')}</Text>
        <Text style={{ color: colors.text, fontSize: wide ? 48 : 28, fontWeight: '800', textAlign: isRTL ? 'right' : 'left' }}>{t('auth.account')}</Text>
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
