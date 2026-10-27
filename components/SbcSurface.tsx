import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import { useLanguage } from '@/lib/language';

/** Explicit text direction inside the SBC workspace, including mixed Latin names. */
export function SbcText({ children, tone = 'body', center = false, testID }: { children: ReactNode; tone?: 'title' | 'heading' | 'body' | 'label' | 'caption'; center?: boolean; testID?: string }) {
  const { language, isRTL: rtl } = useLanguage();
  
  return <Text testID={testID} style={{ width: '100%', textAlign: center ? 'center' : rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr', color: tone === 'caption' ? '#C2CBDA' : '#F3F5FA', fontSize: tone === 'title' ? 26 : tone === 'heading' ? 20 : tone === 'caption' ? 13 : 15, lineHeight: tone === 'title' ? 34 : tone === 'heading' ? 28 : 23, fontWeight: tone === 'title' || tone === 'heading' ? '800' : tone === 'label' ? '700' : '500' }}>{children}</Text>;
}
export function SbcSurface({ children }: { children: ReactNode }) {
  return <LinearGradient testID="sbc-surface" colors={['#202838', '#111824', '#24212B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: '100%', direction: 'ltr', borderRadius: 14, padding: 16, gap: 20, borderWidth: 1, borderColor: '#485166', overflow: 'hidden' }}>{children}</LinearGradient>;
}
export function SbcChoices({ label, options, value, onChange }: { label: string; options: { id: string; label: string }[]; value: string; onChange: (value: string) => void }) {
  const { language, isRTL: rtl } = useLanguage();
  
  return <View style={{ gap: 10, direction: 'ltr' }}>
    <SbcText tone="label">{label}</SbcText>
    <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((option) => <Pressable key={option.id} accessibilityRole="button" accessibilityState={{ selected: value === option.id }} onPress={() => onChange(option.id)} style={{ minHeight: 46, maxWidth: '100%', paddingHorizontal: 16, paddingVertical: 11, backgroundColor: value === option.id ? '#333746' : '#131C29', borderWidth: 1, borderColor: value === option.id ? '#D0B77E' : '#536078', borderRadius: 8 }}><Text style={{ textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr', color: value === option.id ? '#F5E2B7' : '#E2E7F0', fontSize: 15, lineHeight: 22, fontWeight: '700' }}>{option.label}</Text></Pressable>)}
    </View>
  </View>;
}
