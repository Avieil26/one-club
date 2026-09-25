import { Image, View } from 'react-native';

import { nationFlagUri } from '@/lib/nationFlag';

export function NationFlag({ nation, size = 18 }: { nation: string; size?: number }) {
  const uri = nationFlagUri(nation, size >= 28 ? 80 : 40);
  if (!uri) {
    return (
      <View
        style={{
          width: size * 1.35,
          height: size,
          borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.35)',
        }}
      />
    );
  }
  return (
    <Image
      source={{ uri }}
      accessibilityLabel={nation}
      style={{
        width: size * 1.35,
        height: size,
        borderRadius: 2,
        backgroundColor: 'rgba(0,0,0,0.15)',
      }}
      resizeMode="cover"
    />
  );
}
