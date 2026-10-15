import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/components/ui';
import { useLanguage, type AppLanguage } from '@/lib/language';

export default function LanguageScreen() {
  const router = useRouter();
  const { chooseLanguage } = useLanguage();

  async function select(language: AppLanguage) {
    await chooseLanguage(language);
    router.replace('/register');
  }

  return (
    <View style={{ flex: 1, minHeight: '100%', backgroundColor: '#08120E', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <View style={{ width: '100%', maxWidth: 520, borderWidth: 1, borderColor: 'rgba(218,176,75,0.42)', borderRadius: 24, padding: 28, backgroundColor: '#101C16', gap: 18 }}>
        <Text style={{ color: colors.gold, fontSize: 12, fontWeight: '900', letterSpacing: 4, textAlign: 'center' }}>ONE CLUB · FC27</Text>
        <Text style={{ color: colors.text, fontSize: 32, fontWeight: '900', textAlign: 'center' }}>Choose your language</Text>
        <Text style={{ color: colors.muted, fontSize: 15, textAlign: 'center', lineHeight: 23 }}>בחרו שפה כדי להמשיך לאתר</Text>
        <Pressable accessibilityRole="button" onPress={() => void select('en')} style={{ borderRadius: 14, borderWidth: 1, borderColor: colors.gold, paddingVertical: 18, paddingHorizontal: 20, backgroundColor: 'rgba(218,176,75,0.10)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 24 }}>🇬🇧</Text>
          <View style={{ flex: 1, marginLeft: 16, gap: 3 }}>
            <Text style={{ color: colors.text, fontSize: 19, fontWeight: '800', textAlign: 'left' }}>English</Text>
            <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'left' }}>Continue in English</Text>
          </View>
          <Text style={{ color: colors.gold, fontSize: 22 }}>→</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => void select('he')} style={{ borderRadius: 14, borderWidth: 1, borderColor: 'rgba(160,180,164,0.25)', paddingVertical: 18, paddingHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.025)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 24 }}>🇮🇱</Text>
          <View style={{ flex: 1, marginRight: 16, gap: 3 }}>
            <Text style={{ color: colors.text, fontSize: 19, fontWeight: '800', textAlign: 'right' }}>עברית</Text>
            <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'right' }}>המשך בעברית</Text>
          </View>
          <Text style={{ color: colors.gold, fontSize: 22 }}>←</Text>
        </Pressable>
        <Text style={{ color: '#748078', fontSize: 11, textAlign: 'center' }}>You can change your language later.</Text>
      </View>
    </View>
  );
}
