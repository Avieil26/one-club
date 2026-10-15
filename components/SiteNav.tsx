import { usePathname, useRouter } from 'expo-router';
import { Image, Platform, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LevelChip } from '@/components/OwnerLevelPlate';
import { communityXp, xpProgress } from '@/lib/communityBoard';
import { useApp } from '@/lib/store';
import { useLocale, type TranslationKey } from '@/lib/i18n';

const TEXT = '#F4F7F2';
const QUIET = 'rgba(244,247,242,0.62)';

const LINKS: { href: '/' | '/career' | '/ultimate' | '/champions' | '/grounds' | '/sbc' | '/games' | '/board' | '/market'; labelKey: TranslationKey }[] = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/career', labelKey: 'nav.career' },
  { href: '/ultimate', labelKey: 'nav.ultimate' },
  { href: '/champions', labelKey: 'nav.champions' },
  { href: '/grounds', labelKey: 'nav.grounds' },
  { href: '/sbc', labelKey: 'nav.sbc' },
  { href: '/games', labelKey: 'nav.games' },
  { href: '/board', labelKey: 'nav.board' },
  { href: '/market', labelKey: 'nav.players' },
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
  const { locale, isRTL, setLocale, t } = useLocale();
  const progress = user ? xpProgress(communityXp(user.id, app)) : null;
  const insets = useSafeAreaInsets();
  const mobile = Platform.OS !== 'web';
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const logoNode = (
    <Pressable
      onPress={() => router.push('/')}
      style={{ flexDirection: 'row', direction: isRTL ? 'rtl' : 'ltr', alignItems: 'center', gap: 10 }}
    >
      <Image
        source={require('@/assets/images/brand-1club.png')}
        style={{
          width: isMobile ? 36 : 40,
          height: isMobile ? 36 : 40,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.28)',
        }}
      />
      <Text
        style={{
          color: '#F7F4EA',
          fontSize: isMobile ? 15 : 17,
          fontWeight: '900',
          letterSpacing: 0.6,
          textShadowColor: 'rgba(0,0,0,0.55)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 4,
        }}
      >
        1 CLUB
      </Text>
    </Pressable>
  );

  const profileNode = (
    <Pressable
      onPress={() => router.push(user?.email ? '/profile' : '/register')}
      style={{
        minHeight: 32,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        backgroundColor: 'rgba(22, 30, 24, 0.7)',
        borderWidth: 1,
        borderColor: 'rgba(227, 179, 65, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#FFE08A', fontWeight: '700', fontSize: 13 }}>
        {user ? t('nav.profile') : t('nav.login')}
      </Text>
    </Pressable>
  );

  const accountNode = (
    <View style={{ flexDirection: 'row', direction: 'ltr', alignItems: 'center', gap: 8 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('language.label')}
        onPress={() => { void setLocale(locale === 'he' ? 'en' : 'he'); }}
        style={{
          minHeight: 32,
          minWidth: 40,
          paddingHorizontal: 9,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(227, 179, 65, 0.48)',
          backgroundColor: 'rgba(227, 179, 65, 0.12)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#FFE08A', fontWeight: '900', fontSize: 12 }}>
          {locale === 'he' ? 'EN' : 'עב'}
        </Text>
      </Pressable>
      {progress ? <LevelChip progress={progress} /> : null}
      {profileNode}
    </View>
  );

  const renderLinks = () =>
    LINKS.map((item) => {
      const on = isActive(pathname, item.href);
      return (
        <Pressable
          key={item.href}
          onPress={() => router.push(item.href)}
          style={{
            minHeight: 32,
            paddingHorizontal: isMobile ? 12 : 10,
            paddingVertical: 5,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: isMobile ? 16 : 8,
            backgroundColor: isMobile && on ? 'rgba(227, 179, 65, 0.16)' : 'transparent',
            borderWidth: isMobile ? 1 : 0,
            borderColor: isMobile && on ? 'rgba(227, 179, 65, 0.45)' : 'transparent',
          }}
        >
          <Text
            style={{
              color: on ? TEXT : QUIET,
              fontWeight: on ? '800' : '600',
              fontSize: isMobile ? 13.5 : 15,
              textAlign: 'center',
            }}
          >
            {t(item.labelKey)}
          </Text>
          {!isMobile ? (
            <View style={{ marginTop: 3, height: 2, width: on ? 18 : 0, borderRadius: 1, backgroundColor: TEXT }} />
          ) : null}
        </Pressable>
      );
    });

  if (isMobile) {
    return (
      <View
        style={{
          zIndex: 100,
          elevation: 24,
          backgroundColor: 'rgba(5, 8, 10, 0.95)',
          paddingTop: mobile ? insets.top + 6 : 8,
          paddingBottom: 6,
          paddingHorizontal: 12,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(227, 179, 65, 0.18)',
          gap: 6,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            direction: isRTL ? 'rtl' : 'ltr',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {logoNode}
          {accountNode}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: 'row',
            direction: 'rtl',
            alignItems: 'center',
            gap: 4,
            paddingVertical: 2,
          }}
        >
          {renderLinks()}
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      style={{
        zIndex: 100,
        elevation: 24,
        backgroundColor: 'transparent',
        paddingTop: mobile ? insets.top + 8 : 10,
        paddingBottom: 8,
        paddingHorizontal: 14,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          direction: 'rtl',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <View style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'center', flexWrap: 'wrap', gap: 8, flexShrink: 1 }}>
          {logoNode}
          {renderLinks()}
        </View>
        {accountNode}
      </View>
    </View>
  );
}
