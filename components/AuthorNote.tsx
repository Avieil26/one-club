import { Text, View } from 'react-native';

import { ProfileFace } from '@/components/ProfileFace';
import { colors } from '@/components/ui';
import { useLanguage } from '@/lib/language';

export function AuthorNote({ name, body, avatarUrl }: { name: string; body: string; avatarUrl?: string | null }) {
  const { language } = useLanguage();
  const rtl = language === 'he';
  const words = body.trim();
  if (!words) return null;
  return (
    <View
      style={{
        alignSelf: 'stretch',
        backgroundColor: '#172033',
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(186, 206, 230, 0.28)',
      }}
    >
      <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', direction: rtl ? 'rtl' : 'ltr', alignItems: 'center', gap: 10 }}>
        <ProfileFace name={name} uri={avatarUrl} size={40} />
        <Text style={{ color: '#F4F7F2', fontSize: 15, fontWeight: '600', textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }}>
          {language === 'he' ? `${name} כתב` : `${name} wrote`}
        </Text>
      </View>
      <Text
        style={{
          color: colors.text,
          fontSize: 18,
          lineHeight: 28,
          fontWeight: '500',
          textAlign: rtl ? 'right' : 'left',
          writingDirection: rtl ? 'rtl' : 'ltr',
        }}
      >
        {words}
      </Text>
    </View>
  );
}
