import { useState } from 'react';
import { Image, Text, View } from 'react-native';

import { clubLook } from '@/lib/clubLook';

export function ClubBadge({ club, size = 46 }: { club: string; size?: number }) {
  const look = clubLook(club);
  const [failed, setFailed] = useState(false);

  if (look.crest) {
    return <Image source={look.crest} accessibilityLabel={club} style={{ width: size, height: size }} resizeMode="contain" />;
  }

  if (look.crestUri && !failed) {
    return (
      <Image
        source={{ uri: look.crestUri }}
        accessibilityLabel={club}
        onError={() => setFailed(true)}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: look.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: look.fg, fontSize: Math.max(9, size * 0.28), fontWeight: '800' }}>{look.letters}</Text>
    </View>
  );
}
