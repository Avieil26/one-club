import { Stack } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { SiteNav } from '@/components/SiteNav';
import { colors } from '@/components/ui';
import { useLanguage, type AppLanguage } from '@/lib/language';

export default function SettingsScreen() {
  const { language, chooseLanguage, t } = useLanguage();
  const rtl = language === 'he';

  const option = (value: AppLanguage, flag: string, title: string, subtitle: string) => {
    const selected = language === value;
    return (
      <Pressable
        key={value}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => void chooseLanguage(value)}
        style={{
          width: '100%',
          flexDirection: 'row',
          direction: rtl ? 'rtl' : 'ltr',
          alignItems: 'center',
          gap: 14,
          padding: 18,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: selected ? colors.gold : 'rgba(255,255,255,0.12)',
          backgroundColor: selected ? 'rgba(227,179,65,0.12)' : 'rgba(255,255,255,0.025)',
        }}
      >
        <Text style={{ fontSize: 28 }}>{flag}</Text>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '900', textAlign: rtl ? 'right' : 'left' }}>{title}</Text>
          <Text style={{ color: colors.muted, fontSize: 13, textAlign: rtl ? 'right' : 'left' }}>{subtitle}</Text>
        </View>
        <Text style={{ color: selected ? colors.gold : colors.muted, fontWeight: '900' }}>{selected ? '✓' : ''}</Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ headerShown: false, title: t('הגדרות', 'Settings') }} />
      <SiteNav />
      <ScrollView contentContainerStyle={{ width: '100%', maxWidth: 920, alignSelf: 'center', padding: 20, paddingBottom: 64, gap: 18 }}>
        <Text style={{ color: colors.text, fontSize: 32, fontWeight: '900', textAlign: rtl ? 'right' : 'left' }}>{t('הגדרות', 'Settings')}</Text>
        <Text style={{ color: colors.muted, fontSize: 15, lineHeight: 24, textAlign: rtl ? 'right' : 'left' }}>
          {t('כאן אפשר לשנות את שפת האתר בכל עת. הבחירה נשמרת גם לביקורים הבאים.', 'Change the site language at any time. Your choice is saved for future visits.')}
        </Text>
        <View style={{ gap: 10 }}>
          {option('en', '🇬🇧', 'English', 'Use the site in English, left to right.')}
          {option('he', '🇮🇱', 'עברית', t('שימוש באתר בעברית, מימין לשמאל.', 'Use the site in Hebrew, right to left.'))}
        </View>
      </ScrollView>
    </View>
  );
}
