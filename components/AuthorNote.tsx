import { Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { ProfileFace } from '@/components/ProfileFace';
import { colors } from '@/components/ui';

export function AuthorNote({ name, body, avatarUrl, userId }: { name: string; body: string; avatarUrl?: string | null; userId?: string }) {
  const router = useRouter();
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
      <Pressable
        disabled={!userId}
        onPress={() => userId && router.push(`/player/${userId}`)}
        style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}
      >
        <ProfileFace name={name} uri={avatarUrl} size={40} />
        <Text style={{ color: '#F4F7F2', fontSize: 15, fontWeight: '600', textAlign: 'right', writingDirection: 'rtl' }}>
          {name} כתב
        </Text>
      </Pressable>
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
