import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';

export function ProfileFace({ name, uri, size = 44 }: { name: string; uri?: string | null; size?: number }) {
  const letter = name.trim().charAt(0) || 'ש';
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [uri]);
  const showImage = Boolean(uri) && !failed;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        backgroundColor: '#243044',
        borderWidth: 1,
        borderColor: 'rgba(213, 226, 242, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {showImage ? (
        <Image source={{ uri: uri! }} style={{ width: size, height: size }} onError={() => setFailed(true)} />
      ) : (
        <Text style={{ color: '#F4F7F2', fontSize: Math.round(size * 0.42), fontWeight: '600' }}>{letter}</Text>
      )}
    </View>
  );
}
