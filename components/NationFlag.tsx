import { Image, View } from 'react-native';

import { nationFlagUri } from '@/lib/nationFlag';

const LOCAL_FLAGS: Record<string, any> = {
  ישראל: require('@/assets/images/flags/israel.png'),
  Israel: require('@/assets/images/flags/israel.png'),
  צרפת: require('@/assets/images/flags/france.png'),
  France: require('@/assets/images/flags/france.png'),
  ברזיל: require('@/assets/images/flags/brazil.png'),
  Brazil: require('@/assets/images/flags/brazil.png'),
  אנגליה: require('@/assets/images/flags/england.png'),
  England: require('@/assets/images/flags/england.png'),
  ספרד: require('@/assets/images/flags/spain.png'),
  Spain: require('@/assets/images/flags/spain.png'),
  ארגנטינה: require('@/assets/images/flags/argentina.png'),
  Argentina: require('@/assets/images/flags/argentina.png'),
  הולנד: require('@/assets/images/flags/netherlands.png'),
  Netherlands: require('@/assets/images/flags/netherlands.png'),
  נורווגיה: require('@/assets/images/flags/norway.png'),
  Norway: require('@/assets/images/flags/norway.png'),
  טורקיה: require('@/assets/images/flags/turkey.png'),
  Turkey: require('@/assets/images/flags/turkey.png'),
};

export function NationFlag({ nation, size = 18 }: { nation: string; size?: number }) {
  const local = LOCAL_FLAGS[nation] ?? LOCAL_FLAGS[nation?.trim()];
  if (local) {
    return (
      <Image
        source={local}
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
