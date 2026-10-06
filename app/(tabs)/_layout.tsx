import { Tabs } from 'expo-router';
import { Platform, Pressable, Text, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/components/ui';


function ScreenErrorBoundary({ error, retry }: import('expo-router').ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, backgroundColor: '#07090D', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ color: '#F3F5F7', fontSize: 20, fontWeight: '900', textAlign: 'center' }}>המסך לא נטען</Text>
      <Text style={{ color: '#AAB4BE', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 8, maxWidth: 720 }}>{error.message || 'שגיאה לא מזוהה'}</Text>
      <Pressable onPress={retry} style={{ marginTop: 14, backgroundColor: '#D82F3C', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 }}>
        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>נסה שוב</Text>
      </Pressable>
    </View>
  );
}

export const unstable_settings = {
  screenErrorBoundary: ScreenErrorBoundary,
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const native = Platform.OS !== 'web';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: native
          ? {
              backgroundColor: '#0C1410',
              borderTopColor: 'rgba(227, 179, 65, 0.4)',
              borderTopWidth: 1,
              height: 62 + Math.max(insets.bottom, 10),
              paddingTop: 8,
              paddingBottom: Math.max(insets.bottom, 10),
            }
          : { display: 'none' },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: '#8A9890',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '800' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'בית', tabBarIcon: ({ color, focused }) => <TabGlyph glyph="⌂" color={color} focused={focused} /> }} />
      <Tabs.Screen name="career" options={{ title: 'קריירה', tabBarActiveTintColor: colors.career, tabBarIcon: ({ color, focused }) => <TabGlyph glyph="★" color={color} focused={focused} /> }} />
      <Tabs.Screen name="ultimate" options={{ title: 'אולטימייט', tabBarActiveTintColor: colors.gold, tabBarIcon: ({ color, focused }) => <TabGlyph glyph="●" color={color} focused={focused} /> }} />
      <Tabs.Screen name="champions" options={{ title: 'FUT Champions', tabBarActiveTintColor: '#F04A52', tabBarIcon: ({ color, focused }) => <TabGlyph glyph="🏆" color={color} focused={focused} /> }} />
      <Tabs.Screen name="grounds" options={{ title: 'גראונדס', tabBarActiveTintColor: colors.green, tabBarIcon: ({ color, focused }) => <TabGlyph glyph="☰" color={color} focused={focused} /> }} />
      <Tabs.Screen name="sbc" options={{ title: 'SBC', tabBarActiveTintColor: colors.copper, tabBarIcon: ({ color, focused }) => <TabGlyph glyph="▦" color={color} focused={focused} /> }} />
      <Tabs.Screen name="games" options={{ title: 'משחקונים', tabBarActiveTintColor: '#E23B57', tabBarIcon: ({ color, focused }) => <TabGlyph glyph="✦" color={color} focused={focused} /> }} />
      <Tabs.Screen name="board" options={{ title: 'לוח', tabBarActiveTintColor: '#F4F6F8', tabBarIcon: ({ color, focused }) => <TabGlyph glyph="⬡" color={color} focused={focused} /> }} />
      <Tabs.Screen name="market" options={{ title: 'שחקנים', tabBarActiveTintColor: colors.gold, tabBarIcon: ({ color, focused }) => <TabGlyph glyph="▨" color={color} focused={focused} /> }} />
    </Tabs>
  );
}

function TabGlyph({ glyph, color, focused }: { glyph: string; color: ColorValue; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', minWidth: 28, minHeight: 24 }}>
      <Text style={{ color, fontSize: focused ? 20 : 17, fontWeight: '800' }}>{glyph}</Text>
    </View>
  );
}
