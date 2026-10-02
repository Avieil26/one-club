import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

import { colors } from '@/components/ui';

export function Arrival({ name, onDone }: { name: string; onDone?: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 7, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 20,
        backgroundColor: '#0C1914',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}>
      <Pressable
        onPress={onDone}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ alignItems: 'center', gap: 8, transform: [{ scale }] }}>
        <View style={{ width: 140, height: 140, borderRadius: 70, borderWidth: 1, borderColor: 'rgba(227,179,65,0.45)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800' }}>FC27</Text>
        </View>
        <Text style={{ color: colors.gold, fontSize: 16, fontWeight: '700', marginTop: 12 }}>נכנסים למגרש</Text>
        <Text style={{ color: colors.muted, fontSize: 15 }}>{name}</Text>
      </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
