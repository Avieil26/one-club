import { Text, View } from 'react-native';

import { ProfileFace } from '@/components/ProfileFace';
import { colors } from '@/components/ui';

export function AuthorNote({ name, body, avatarUrl }: { name: string; body: string; avatarUrl?: string | null }) {
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
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
        <ProfileFace name={name} uri={avatarUrl} size={40} />
        <Text style={{ color: '#F4F7F2', fontSize: 15, fontWeight: '600', textAlign: 'right', writingDirection: 'rtl' }}>
          {name} כתב
        </Text>
      </View>
      <Text
        style={{
          color: colors.text,
          fontSize: 18,
          lineHeight: 28,
          fontWeight: '500',
          textAlign: 'right',
          writingDirection: 'rtl',
        }}
      >
        {words}
      </Text>
    </View>
  );
}
