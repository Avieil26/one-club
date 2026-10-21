import { Tabs } from 'expo-router';
import { Platform, Text, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/components/ui';
import { useLanguage } from '@/lib/language';
import { MobileTabBar } from '@/components/MobileTabBar';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const native = Platform.OS !== 'web';

  return (
    <Tabs
      tabBar={native ? (props) => <MobileTabBar {...props} /> : undefined}
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
      <Tabs.Screen name="index" options={{ title: t('בית', 'Home'), tabBarIcon: ({ color, focused }) => <TabGlyph glyph="⌂" color={color} focused={focused} /> }} />
      <Tabs.Screen name="career" options={{ title: t('קריירה', 'Career'), tabBarActiveTintColor: colors.career, tabBarIcon: ({ color, focused }) => <TabGlyph glyph="★" color={color} focused={focused} /> }} />
      <Tabs.Screen name="ultimate" options={{ title: t('אולטימייט', 'Ultimate Team'), tabBarActiveTintColor: colors.gold, tabBarIcon: ({ color, focused }) => <TabGlyph glyph="●" color={color} focused={focused} /> }} />
      <Tabs.Screen name="champions" options={{ title: 'FUT Champions', tabBarActiveTintColor: '#F04A52', tabBarIcon: ({ color, focused }) => <TabGlyph glyph="🏆" color={color} focused={focused} /> }} />
      <Tabs.Screen name="grounds" options={{ title: t('גראונדס', 'Grounds'), tabBarActiveTintColor: colors.green, tabBarIcon: ({ color, focused }) => <TabGlyph glyph="☰" color={color} focused={focused} /> }} />
      <Tabs.Screen name="sbc" options={{ title: 'SBC', tabBarActiveTintColor: colors.copper, tabBarIcon: ({ color, focused }) => <TabGlyph glyph="▦" color={color} focused={focused} /> }} />
      <Tabs.Screen name="gallery" options={{ title: t('גלריה', 'Gallery'), tabBarActiveTintColor: colors.copper, tabBarIcon: ({ color, focused }) => <TabGlyph glyph="▧" color={color} focused={focused} /> }} />
      <Tabs.Screen name="games" options={{ title: t('משחקונים', 'Mini-games'), tabBarActiveTintColor: '#E23B57', tabBarIcon: ({ color, focused }) => <TabGlyph glyph="✦" color={color} focused={focused} /> }} />
      <Tabs.Screen name="board" options={{ title: t('לוח', 'Community Board'), tabBarActiveTintColor: '#F4F6F8', tabBarIcon: ({ color, focused }) => <TabGlyph glyph="⬡" color={color} focused={focused} /> }} />
      <Tabs.Screen name="market" options={{ title: t('שחקנים', 'Players'), tabBarActiveTintColor: colors.gold, tabBarIcon: ({ color, focused }) => <TabGlyph glyph="▨" color={color} focused={focused} /> }} />
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
