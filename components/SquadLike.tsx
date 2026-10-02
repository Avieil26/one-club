import { Pressable, Text } from 'react-native';

import { colors } from '@/components/ui';

export function SquadLike({
  count,
  liked,
  disabled,
  onPress,
}: {
  count: number;
  liked: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={liked ? 'הסרת לייק' : 'לייק לקבוצה'}
      disabled={disabled}
      onPress={onPress}
      style={{
        alignSelf: 'flex-end',
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 8,
        minHeight: 42,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: liked ? 'rgba(232, 112, 138, 0.85)' : 'rgba(255,255,255,0.18)',
        backgroundColor: liked ? 'rgba(232, 112, 138, 0.16)' : 'rgba(255,255,255,0.04)',
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <Text style={{ color: liked ? '#F3B4C3' : colors.text, fontSize: 18 }}>{liked ? '♥' : '♡'}</Text>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{count > 0 ? count : 'לייק'}</Text>
    </Pressable>
  );
}
