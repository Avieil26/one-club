import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/components/ui';
import { LEGAL_LINKS } from '@/lib/legal';
import { useLanguage } from '@/lib/language';

export function LegalLinks() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const rtl = language === 'he';
  return (
    <View style={{ alignItems: 'center', gap: 8, paddingVertical: 10 }}>
      <View style={{ flexDirection: 'row', direction: rtl ? 'rtl' : 'ltr', flexWrap: 'wrap', gap: 4, justifyContent: 'center', alignItems: 'center' }}>
        {LEGAL_LINKS.map((item, index) => (
          <View key={item.href} style={{ flexDirection: 'row', direction: rtl ? 'rtl' : 'ltr', alignItems: 'center' }}>
            {index > 0 ? <Text style={{ color: 'rgba(197,213,200,0.45)', fontSize: 12 }}> · </Text> : null}
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push(item.href)}
              style={{ minHeight: 32, justifyContent: 'center', paddingHorizontal: 2 }}
            >
              <Text style={{ color: colors.muted, fontWeight: '600', fontSize: 12 }}>{t(item.label, item.href === '/legal/terms' ? 'Terms of Use' : item.href === '/legal/privacy' ? 'Privacy Policy' : item.href === '/legal/cookies' ? 'Cookie details' : item.label)}</Text>
            </Pressable>
          </View>
        ))}
      </View>
      <Text
        style={{
          color: 'rgba(197, 213, 200, 0.45)',
          fontSize: 11,
          textAlign: rtl ? 'right' : 'left',
          writingDirection: rtl ? 'rtl' : 'ltr',
          width: '100%',
          lineHeight: 16,
          maxWidth: 620,
          paddingHorizontal: 12,
        }}
      >
        {t('1 CLUB הינו אתר מעריצים עצמאי ללא קשר ל-Electronic Arts Inc. כל שמות המשחקים, המותגים ותמונות השחקנים שייכים לבעליהם החוקיים ומשמשים בשימוש הוגן (Fair Use) בלבד.', '1 CLUB is an independent fan site and is not affiliated with Electronic Arts Inc. All game titles, brands, and player images belong to their owners and are used under fair use only.')}
      </Text>
    </View>
  );
}

