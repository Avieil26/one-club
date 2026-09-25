import { usePathname, useRouter } from 'expo-router';
import { Image, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/lib/store';

const GOLD = '#E3B341';
const TEXT = '#F4F7F2';

/** Order: בית first (right in RTL), שחקנים last (left). Do NOT use row-reverse — html already has dir=rtl. */
const LINKS = [
  { href: '/' as const, label: 'בית' },
  { href: '/career' as const, label: 'קריירה' },
  { href: '/ultimate' as const, label: 'אולטימייט' },
  { href: '/grounds' as const, label: 'גראונדס' },
  { href: '/sbc' as const, label: 'SBC' },
  { href: '/market' as const, label: 'שחקנים' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/' || pathname === '/index';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useApp();
  const insets = useSafeAreaInsets();
  const mobile = Platform.OS !== 'web';

  return (
    <View
      style={{
        zIndex: 100,
        elevation: 24,
        backgroundColor: 'transparent',
        paddingTop: mobile ? insets.top + 10 : 14,
        paddingBottom: 12,
        paddingHorizontal: 14,
        gap: 12,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          direction: 'rtl',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pressable
          onPress={() => router.push('/')}
          style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'center', gap: 10 }}
        >
          <Image
            source={require('@/assets/images/futz-beta-logo.png')}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: 'rgba(227,179,65,0.4)',
            }}
          />
          <View>
            <Text
              style={{
                color: '#FFE08A',
                fontSize: 17,
                fontWeight: '900',
                letterSpacing: 0.4,
                textShadowColor: 'rgba(0,0,0,0.55)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 4,
              }}
            >
              Futz
            </Text>
            <Text
              style={{
                color: 'rgba(126,208,200,0.95)',
                fontSize: 10,
                fontWeight: '800',
                letterSpacing: 1.4,
              }}
            >
              BETA
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => router.push(user?.email ? '/profile' : '/register')}
          style={{
            minHeight: 40,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 10,
            backgroundColor: GOLD,
            borderWidth: 1,
            borderColor: '#F5D56A',
            shadowColor: '#000',
            shadowOpacity: 0.35,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 4,
          }}
        >
          <Text style={{ color: '#1A1408', fontWeight: '800', fontSize: 14 }}>
            {user ? 'פרופיל' : 'התחברות'}
          </Text>
        </Pressable>
      </View>

      <View
        style={{
          flexDirection: 'row',
          direction: 'rtl',
          flexWrap: 'wrap',
          gap: 8,
          justifyContent: 'flex-start',
        }}
      >
        {LINKS.map((item) => {
          const on = isActive(pathname, item.href);
          return (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href)}
              style={{
                minWidth: 92,
                minHeight: 44,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: on ? GOLD : 'rgba(8, 14, 12, 0.72)',
                borderWidth: 1.5,
                borderColor: on ? '#F5D56A' : 'rgba(227, 179, 65, 0.45)',
                shadowColor: '#000',
                shadowOpacity: on ? 0.4 : 0.28,
                shadowRadius: on ? 8 : 5,
                shadowOffset: { width: 0, height: 2 },
                elevation: on ? 6 : 3,
              }}
            >
              <Text
                style={{
                  color: on ? '#1A1408' : TEXT,
                  fontWeight: '800',
                  fontSize: 14,
                  letterSpacing: 0.3,
                  textAlign: 'center',
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
