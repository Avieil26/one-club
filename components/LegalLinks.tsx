import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { inlineLatin } from '@/lib/legalBidi';
import { colors } from '@/components/ui';
import { LEGAL_LINKS } from '@/lib/legal';

export function LegalLinks() {
  const router = useRouter();
  return (
    <View style={{ alignItems: 'center', gap: 8, paddingVertical: 10 }}>
      <View style={{ flexDirection: 'row', direction: 'rtl', flexWrap: 'wrap', gap: 4, justifyContent: 'center', alignItems: 'center' }}>
        {LEGAL_LINKS.map((item, index) => (
          <View key={item.href} style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'center' }}>
            {index > 0 ? <Text style={{ color: 'rgba(197,213,200,0.45)', fontSize: 12 }}> · </Text> : null}
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push(item.href)}
              style={{ minHeight: 32, justifyContent: 'center', paddingHorizontal: 2 }}
            >
              <Text style={{ color: colors.muted, fontWeight: '600', fontSize: 12 }}>{item.label}</Text>
            </Pressable>
          </View>
        ))}
      </View>
      <Text
        style={{
          color: 'rgba(197, 213, 200, 0.45)',
          fontSize: 11,
          textAlign: 'right',
          writingDirection: 'rtl',
          width: '100%',
          lineHeight: 16,
          maxWidth: 620,
          paddingHorizontal: 12,
        }}
      >
        {inlineLatin(
          '1 CLUB הינו אתר מעריצים עצמאי ללא קשר ל-Electronic Arts Inc. כל שמות המשחקים, המותגים ותמונות השחקנים שייכים לבעליהם החוקיים ומשמשים בשימוש הוגן (Fair Use) בלבד.',
        )}
      </Text>
    </View>
  );
}

