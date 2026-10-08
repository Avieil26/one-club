import { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, Text, View } from 'react-native';

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
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800' }}>1 CLUB</Text>
        </View>
        <Text style={{ color: colors.gold, fontSize: 16, fontWeight: '700', marginTop: 12 }}>נכנסים למגרש</Text>
        <Text style={{ color: colors.muted, fontSize: 15 }}>{name}</Text>
        <View style={{ marginTop: 18, width: '100%', maxWidth: 430, maxHeight: 250, borderRadius: 18, padding: 14, backgroundColor: 'rgba(6,12,10,0.82)', borderWidth: 1, borderColor: 'rgba(227,179,65,0.25)' }}>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '900', textAlign: 'right', marginBottom: 8 }}>מה חדש ב־1 Club</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ gap: 8 }}>
              {[
                ['👤', 'פרופילים ציבוריים', 'פותחים שחקן אחר ורואים תמונה, Level, XP, מוניטין והקבוצה שלו.'],
                ['🎮', 'טבלת החודש', 'כל משחקון שומר שיא חודשי אחד — והחודש מתחלף אוטומטית.'],
                ['🔔', 'התראות', 'פעמון חדש מציג הודעות, לייקים, תגובות ואישורי תוכן בתוך האתר.'],
                ['❓', 'שאלות ותשובות', 'מרכז עזרה חדש עם תשובות שנפתחות באנימציה.'],
                ['🧩', 'SBC חדש', 'Max 86 Base Hero Pack נוסף ל־SBC.'],
              ].map(([icon, title, body]) => (
                <View key={title} style={{ paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.035)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: '900', textAlign: 'right' }}>{icon} {title}</Text>
                  <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: 'right', marginTop: 2 }}>{body}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
