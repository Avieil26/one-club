import { useState } from 'react';
import { Image, Modal, Pressable, Text, View } from 'react-native';

export function SolutionGallery({ uris }: { uris: string[] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!uris.length) return null;
  return (
    <View style={{ gap: 10 }}>
      {uris.map((uri) => (
        <Pressable key={uri} accessibilityRole="button" onPress={() => setOpen(uri)}>
          <Image
            source={{ uri }}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
            style={{ width: '100%', height: 420, borderRadius: 16, backgroundColor: '#07140F' }}
          />
          <Text style={{ color: '#E3B341', textAlign: 'center', marginTop: 6, fontWeight: '700' }}>לחצו לתמונה במסך מלא</Text>
        </Pressable>
      ))}
      <Modal visible={open !== null} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setOpen(null)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.94)', justifyContent: 'center', padding: 12 }}
        >
          {open ? (
            <Image source={{ uri: open }} resizeMode="contain" accessibilityIgnoresInvertColors style={{ width: '100%', height: '84%' }} />
          ) : null}
          <Text style={{ color: '#F7F8FA', textAlign: 'center', marginTop: 14, fontWeight: '800' }}>סגירה</Text>
        </Pressable>
      </Modal>
    </View>
  );
}
