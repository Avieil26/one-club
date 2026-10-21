import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/components/ui';
import { useLanguage } from '@/lib/language';

export function SbcSurface({ children }: { children: ReactNode }) {
  return <LinearGradient testID="sbc-surface" colors={['#1B2333', '#101621', '#201C25']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: '100%', borderRadius: 12, padding: 18, gap: 16, borderWidth: 1, borderColor: '#485166', overflow: 'hidden' }}>{children}</LinearGradient>;
}
export function SbcChoices({ label, options, value, onChange }: { label: string; options: { id: string; label: string }[]; value: string; onChange: (value: string) => void }) {
  const { language } = useLanguage();
  return <View style={{ gap: 8 }}>
    <Text style={{ color: colors.muted, fontWeight: '700', textAlign: language === 'he' ? 'right' : 'left' }}>{label}</Text>
    <View style={{ flexDirection: language === 'he' ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((option) => <Pressable key={option.id} accessibilityRole="button" accessibilityState={{ selected: value === option.id }} onPress={() => onChange(option.id)} style={{ minHeight: 44, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: value === option.id ? '#353342' : '#111925', borderWidth: 1, borderColor: value === option.id ? '#D8B96E' : '#455064', borderRadius: 6 }}><Text style={{ color: value === option.id ? '#FFE5A2' : '#C6CDDA', fontWeight: '800' }}>{option.label}</Text></Pressable>)}
    </View>
  </View>;
}
