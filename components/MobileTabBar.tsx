import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppModal } from '@/components/AppModal';
import { useLanguage } from '@/lib/language';

const PRIMARY = ['index', 'grounds', 'market', 'games'];
const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home-outline', grounds: 'people-outline', market: 'albums-outline', games: 'game-controller-outline',
  gallery: 'library-outline', career: 'star-outline', ultimate: 'football-outline', champions: 'trophy-outline', sbc: 'grid-outline', board: 'chatbubbles-outline',
};

export function MobileTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { t, language, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [more, setMore] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  const active = state.routes[state.index].name;
  const secondary = state.routes.filter((route) => !PRIMARY.includes(route.name));
  const direction = isRTL ? 'rtl' : 'ltr';

  function select(name: string) {
    const route = state.routes.find((item) => item.name === name);
    if (!route) return;
    setMore(false);
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (name !== active && !event.defaultPrevented) navigation.navigate(route.name, route.params);
  }

  if (keyboardOpen && !more) return null;
  return (
    <>
      <View style={{ flexDirection: 'row', direction, backgroundColor: '#0C1410', borderTopWidth: 1, borderTopColor: 'rgba(227,179,65,0.3)', paddingTop: 6, paddingBottom: Math.max(insets.bottom, 10), paddingHorizontal: 4 }}>
        {PRIMARY.map((name) => {
          const route = state.routes.find((item) => item.name === name);
          if (!route) return null;
          const options = descriptors[route.key].options;
          const focused = active === name;
          const label = name === 'games' ? t('משחקונים', 'Games') : options.title ?? name;
          return (
            <Pressable key={name} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={options.title} onPress={() => select(name)} style={{ flex: 1, minWidth: 0, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <Ionicons name={ICONS[name]} size={22} color={focused ? '#E3B341' : '#8A9890'} />
              <Text numberOfLines={1} maxFontSizeMultiplier={1.25} style={{ color: focused ? '#E3B341' : '#8A9890', fontSize: 11, fontWeight: '700' }}>{label}</Text>
            </Pressable>
          );
        })}
        <Pressable accessibilityRole="button" accessibilityLabel={t('כל העמודים', 'All pages')} accessibilityState={{ expanded: more }} onPress={() => setMore(true)} style={{ flex: 1, minWidth: 0, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Ionicons name="menu-outline" size={24} color={!PRIMARY.includes(active) ? '#E3B341' : '#8A9890'} />
          <Text maxFontSizeMultiplier={1.25} style={{ color: !PRIMARY.includes(active) ? '#E3B341' : '#8A9890', fontSize: 11, fontWeight: '700' }}>{t('עוד', 'More')}</Text>
        </Pressable>
      </View>
      {more ? (
        <AppModal onClose={() => setMore(false)}>
          <View style={{ width: '100%', maxWidth: 440, maxHeight: '100%', backgroundColor: '#101D17', borderRadius: 20, padding: 16, gap: 12, direction }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#F4F7F2', fontSize: 22, fontWeight: '800' }}>{t('כל העמודים', 'All pages')}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={t('סגור', 'Close')} onPress={() => setMore(false)} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="close" size={24} color="#F4F7F2" /></Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 6 }}>
              {secondary.map((route) => (
                <Pressable key={route.key} accessibilityRole="button" accessibilityState={{ selected: active === route.name }} onPress={() => select(route.name)} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', minHeight: 52, paddingHorizontal: 12, borderRadius: 10, backgroundColor: active === route.name ? '#2F321B' : '#18281F' }}>
                  <Ionicons name={ICONS[route.name] ?? 'ellipse-outline'} size={22} color="#E3B341" />
                  <Text style={{ flex: 1, color: '#F4F7F2', fontSize: 16 }}>{descriptors[route.key].options.title}</Text>
                </Pressable>
              ))}
              {[{ href: '/profile' as const, label: t('הפרופיל שלי', 'My profile') }, { href: '/settings' as const, label: t('הגדרות', 'Settings') }].map((item) => (
                <Pressable key={item.href} accessibilityRole="button" onPress={() => { setMore(false); router.push(item.href); }} style={{ minHeight: 52, padding: 12, justifyContent: 'center' }}><Text style={{ color: '#F4F7F2', fontSize: 16, textAlign: isRTL ? 'right' : 'left' }}>{item.label}</Text></Pressable>
              ))}
            </ScrollView>
          </View>
        </AppModal>
      ) : null}
    </>
  );
}
