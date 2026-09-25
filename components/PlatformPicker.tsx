import { useState } from 'react';
import { Image, Pressable, Text, View, type ImageSourcePropType } from 'react-native';

import { colors } from '@/components/ui';
import { PLATFORMS } from '@/lib/labels';
import type { PlatformId } from '@/lib/types';

const ICONS: Record<PlatformId, ImageSourcePropType> = {
  ps5: require('@/assets/images/platform-ps5.png'),
  xbox: require('@/assets/images/platform-xbox.png'),
  pc: require('@/assets/images/platform-pc.png'),
  switch2: require('@/assets/images/platform-switch2.png'),
};

export function PlatformPicker({
  value,
  onChange,
  label = 'פלטפורמה',
}: {
  value: PlatformId;
  onChange: (value: PlatformId) => void;
  label?: string;
}) {
  const [hovered, setHovered] = useState<PlatformId | null>(null);

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: colors.muted, fontSize: 13, textAlign: 'right', writingDirection: 'rtl' }}>{label}</Text>
      <View
        style={{
          flexDirection: 'row-reverse',
          flexWrap: 'wrap',
          gap: 14,
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        {PLATFORMS.map((platform) => {
          const selected = platform.id === value;
          const active = hovered === platform.id || selected;
          const scale = active ? 1.16 : 1;
          return (
            <Pressable
              key={platform.id}
              accessibilityRole="button"
              accessibilityLabel={platform.label}
              accessibilityState={{ selected }}
              onPress={() => onChange(platform.id)}
              onHoverIn={() => setHovered(platform.id)}
              onHoverOut={() => setHovered((current) => (current === platform.id ? null : current))}
              style={{
                width: 96,
                height: 88,
                borderRadius: 16,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: selected ? colors.blue : 'rgba(255,255,255,0.14)',
                backgroundColor: selected ? 'rgba(59,130,246,0.22)' : 'rgba(8,12,18,0.55)',
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale }],
                shadowColor: selected ? colors.blue : '#000',
                shadowOpacity: active ? 0.35 : 0.15,
                shadowRadius: active ? 12 : 6,
                shadowOffset: { width: 0, height: 4 },
                elevation: active ? 8 : 3,
              }}
            >
              <Image source={ICONS[platform.id]} style={{ width: 78, height: 62 }} resizeMode="contain" />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
