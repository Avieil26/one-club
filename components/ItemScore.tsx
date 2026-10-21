import { Image, Text, View } from 'react-native';
import { colors } from '@/components/ui';

export function ItemScore({ value, size = 20 }: { value: number; size?: number }) {
  return <View style={{ flexDirection: 'row', direction: 'ltr', alignItems: 'center', gap: 6 }}>
    <Image source={require('@/assets/images/item-score.png')} accessibilityLabel="Item Score" style={{ width: size, height: size }} resizeMode="contain" />
    <Text style={{ color: colors.green, fontSize: size, fontWeight: '900', fontVariant: ['tabular-nums'] }}>{value.toLocaleString('en-US')}</Text>
  </View>;
}
