import { useState } from 'react';
import { Image, Modal, Pressable, Text, useWindowDimensions, View } from 'react-native';

import { colors } from '@/components/ui';

export function SquadPhoto({ uris, tall = false, expandable = true }: { uris: string[]; tall?: boolean; expandable?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const { width, height } = useWindowDimensions();
  const shots = uris.filter((uri) => uri && uri !== 'placeholder');
  if (!shots.length) return null;
  const frame = Math.min(width - 32, 860);

  return (
    <View style={{ gap: 8 }}>
      <Pressable
        accessibilityRole={expandable ? 'button' : undefined}
        accessibilityLabel={expandable ? 'פתיחת התמונה המלאה' : undefined}
        disabled={!expandable}
        onPress={() => setOpen(shots[0])}
      >
        <Image
          source={{ uri: shots[0] }}
          resizeMode="contain"
          style={{
            width: '100%',
            aspectRatio: tall ? 16 / 10 : 16 / 9,
            maxHeight: tall ? 460 : 320,
            borderRadius: 16,
            backgroundColor: '#0B1218',
          }}
        />
      </Pressable>
      {shots.length > 1 ? (
        <View style={{ flexDirection: 'row-reverse', gap: 8 }}>
          {shots.slice(1).map((uri) => (
            <Pressable key={uri} onPress={() => setOpen(uri)}>
              <Image
                source={{ uri }}
                resizeMode="cover"
                style={{ width: 84, height: 84, borderRadius: 12, backgroundColor: '#0B1218' }}
              />
            </Pressable>
          ))}
        </View>
      ) : null}
      <Modal visible={open != null} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="סגירת התמונה"
          onPress={() => setOpen(null)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.94)', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          {open ? (
            <Image source={{ uri: open }} resizeMode="contain" style={{ width: width - 24, height: height * 0.86 }} />
          ) : null}
          <Text style={{ color: colors.text, marginTop: 12, fontSize: 15 }}>סגירה</Text>
        </Pressable>
      </Modal>
    </View>
  );
}
