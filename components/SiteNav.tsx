import { usePathname, useRouter } from 'expo-router';
import { Image, Platform, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LevelChip } from '@/components/OwnerLevelPlate';
import { communityXp, xpProgress } from '@/lib/communityBoard';
import { useApp } from '@/lib/store';

const TEXT = '#F4F7F2';
const QUIET = 'rgba(244,247,242,0.62)';

const LINKS = [
  { href: '/' as const, label: 'בית' },
  { href: '/career' as const, label: 'קריירה' },
  { href: '/ultimate' as const, label: 'אולטימייט' },
  { href: '/grounds' as const, label: 'גראונדס' },
  { href: '/sbc' as const, label: 'SBC' },
  { href: '/games' as const, label: 'משחקונים' },
  { href: '/updates' as const, label: 'עדכונים' },
  { href: '/champions-leaderboard' as const, label: 'טבלת Champions' },
  { href: '/board' as const, label: 'לוח' },
  { href: '/market' as const, label: 'שחקנים' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/' || pathname === '/index';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const app = useApp();
  const { user } = app;
  const progress = user ? xpProgress(communityXp(user.id, app)) : null;
  const insets = useSafeAreaInsets();
  const mobile = Platform.OS !== 'web';
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const logoNode = (
    <Pressable onPress={() => router.push('/')} style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'center', gap: 10 }}>
      <Image source={require('@/assets/images/brand-1club.png')} style={{ width: isMobile ? 36 : 40, height: isMobile ? 36 : 40, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)' }} />
      <Text style={{ color: '#F7F4EA', fontSize: isMobile ? 15 : 17, fontWeight: '900', letterSpacing: 0.6 }}>1 CLUB</Text>
    </Pressable>
  );

  const profileNode = (
    <Pressable onPress={() => router.push(user?.email ? '/profile' : '/register')} style={{ minHeight: 32, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, backgroundColor: 'rgba(22, 30, 24, 0.7)', borderWidth: 1, borderColor: 'rgba(227, 179, 65, 0.3)', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#FFE08A', fontWeight: '700', fontSize: 13 }}>{user ? 'פרופיל' : 'התחברות'}</Text>
    </Pressable>
  );

  const accountNode = <View style={{ flexDirection: 'row', direction: 'ltr', alignItems: 'center', gap: 8 }}>{progress ? <LevelChip progress={progress} /> : null}{profileNode}</View>;

  const championsButton = (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/champions')}
      style={{
        minHeight: 32,
        paddingHorizontal: isMobile ? 12 : 11,
        paddingVertical: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: isMobile ? 16 : 9,
        backgroundColor: 'rgba(224, 45, 55, 0.18)',
        borderWidth: 1,
        borderColor: 'rgba(240, 74, 82, 0.55)',
      }}
    >
      <Text style={{ color: '#FF6670', fontWeight: '800', fontSize: isMobile ? 13.5 : 15, textAlign: 'center' }}>
        FUT Champions
      </Text>
    </Pressable>
  );

  const renderLinks = () => LINKS.map((item) => {
    const on = isActive(pathname, item.href);
    return (
      <Pressable key={item.href} onPress={() => router.push(item.href)} style={{ minHeight: 32, paddingHorizontal: isMobile ? 12 : 11, paddingVertical: 5, alignItems: 'center', justifyContent: 'center', borderRadius: isMobile ? 16 : 9, backgroundColor: isMobile && on ? 'rgba(227, 179, 65, 0.16)' : 'transparent', borderWidth: isMobile ? 1 : 0, borderColor: isMobile && on ? 'rgba(227, 179, 65, 0.45)' : 'transparent' }}>
        <Text style={{ color: on ? TEXT : QUIET, fontWeight: on ? '800' : '600', fontSize: isMobile ? 13.5 : 15, textAlign: 'center' }}>{item.label}</Text>
        {!isMobile ? <View style={{ marginTop: 3, height: 2, width: on ? 18 : 0, borderRadius: 1, backgroundColor: TEXT }} /> : null}
      </Pressable>
    );
  });

  if (isMobile) {
    return (
      <View style={{ zIndex: 100, elevation: 24, backgroundColor: 'rgba(5, 8, 10, 0.95)', paddingTop: insets.top + 6, paddingBottom: 6, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(227, 179, 65, 0.18)', gap: 6 }}>
        <View style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>{logoNode}{championsButton}{accountNode}</View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', direction: 'rtl', alignItems: 'center', gap: 4, paddingVertical: 2 }}>{renderLinks()}</ScrollView>
      </View>
    );
  }

  return (
    <View style={{ zIndex: 100, elevation: 24, backgroundColor: 'transparent', paddingTop: mobile ? insets.top + 8 : 10, paddingBottom: 8, paddingHorizontal: 14 }}>
      <View style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'center', flexWrap: 'wrap', gap: 8, flexShrink: 1 }}>{logoNode}{championsButton}{renderLinks()}</View>
        {accountNode}
      </View>
    </View>
  );
}
