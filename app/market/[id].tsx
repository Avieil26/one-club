import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { IconMuseumBackdrop, MaradonaBackdrop } from '@/components/IconMuseumScene';
import { PlayerDossier } from '@/components/PlayerDossier';
import { SiteNav } from '@/components/SiteNav';
import { colors } from '@/components/ui';
import { PLAYERS } from '@/lib/fcPlayers';

export default function PlayerPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const player = PLAYERS.find((item) => item.id === id);
  const iconPage = !!player?.icon;
  const maradona = player?.id === 'icon-diego-armando-maradona';

  return (
    <View
      style={{
        flex: 1,
        minHeight: 0,
        backgroundColor: iconPage ? '#070604' : '#050A08',
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      {maradona ? <MaradonaBackdrop /> : player && player.icon ? <IconMuseumBackdrop playerId={player.id} /> : (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Image
            source={require('@/assets/images/stadium-night-bright.png')}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.35)']}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}
      <SiteNav />
      <ScrollView
        style={{ flex: 1, minHeight: 0, backgroundColor: 'transparent' }}
        contentContainerStyle={{
          padding: wide ? 28 : 14,
          paddingBottom: 140,
          gap: 16,
        }}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {/* TOP BACK BAR */}
        <View
          style={{
            width: '100%',
            maxWidth: 1120,
            alignSelf: 'center',
            flexDirection: 'row',
            direction: 'rtl',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginBottom: 2,
          }}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/market')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderWidth: 1,
              borderColor: 'rgba(227, 179, 65, 0.35)',
            }}
          >
            <Text style={{ color: colors.gold, fontWeight: '800', fontSize: 13 }}>
              ‹ חזרה לרשימת השחקנים
            </Text>
          </Pressable>
        </View>

        {player && player.icon ? (
          <View style={{ width: '100%', direction: 'ltr', alignItems: 'flex-start', gap: 12 }}>
            {wide ? null : <View style={{ height: 230, width: '100%' }} />}
            <View style={{ width: wide ? '68%' : '100%', maxWidth: 1080, gap: 12 }}>
              <PlayerDossier player={player} />
            </View>
          </View>
        ) : player ? (
          <PlayerDossier player={player} />
        ) : (
          <Text style={{ color: colors.text, textAlign: 'right' }}>השחקן לא נמצא</Text>
        )}

        {/* BOTTOM RETURN BUTTON */}
        {player ? (
          <View
            style={{
              width: '100%',
              maxWidth: 1120,
              alignSelf: 'center',
              marginTop: 16,
              alignItems: 'center',
            }}
          >
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/market')}
              style={{
                paddingHorizontal: 22,
                paddingVertical: 12,
                borderRadius: 14,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderWidth: 1,
                borderColor: 'rgba(227, 179, 65, 0.35)',
              }}
            >
              <Text style={{ color: colors.gold, fontWeight: '800', fontSize: 14 }}>
                ‹ חזרה לכל השחקנים
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
