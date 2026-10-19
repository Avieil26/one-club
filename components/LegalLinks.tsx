import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/components/ui';
import { useLanguage } from '@/lib/language';
import { LEGAL_LINKS } from '@/lib/legal';

const EN_LABELS: Record<string, string> = {
  '/legal/terms': 'Terms of Use',
  '/legal/privacy': 'Privacy Policy',
  '/legal/cookies': 'Cookies',
  '/legal/accessibility': 'Accessibility',
};

export function LegalLinks() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const english = language === 'en';
  return (
    <View style={{ alignItems: 'center', gap: 8, paddingVertical: 10 }}>
      <View style={{ flexDirection: 'row', direction: english ? 'ltr' : 'rtl', flexWrap: 'wrap', gap: 4, justifyContent: 'center', alignItems: 'center' }}>
        {LEGAL_LINKS.map((item, index) => (
          <View key={item.href} style={{ flexDirection: 'row', direction: english ? 'ltr' : 'rtl', alignItems: 'center' }}>
            {index > 0 ? <Text style={{ color: 'rgba(197,213,200,0.45)', fontSize: 12 }}> · </Text> : null}
            <Pressable accessibilityRole="link" onPress={() => router.push(item.href)} style={{ minHeight: 32, justifyContent: 'center', paddingHorizontal: 2 }}>
              <Text style={{ color: colors.gold, fontSize: 12, fontWeight: '800', textAlign: english ? 'left' : 'right' }}>
                {language === 'en' ? (EN_LABELS[item.href] ?? item.label) : item.label}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
      <Text style={{ color: colors.muted, fontSize: 11, textAlign: 'center' }}>
        {t('מסמכי האתר המשפטיים מעודכנים ל-1 באוקטובר 2026.', 'Site legal documents last updated October 1, 2026.')}
      </Text>
    </View>
  );
}
