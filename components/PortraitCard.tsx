import { useState } from 'react';
import { Image, Platform, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ClubBadge } from '@/components/ClubBadge';
import { CardMetalSheen, iconChrome, tierChrome } from '@/components/cardChrome';
import { NationFlag } from '@/components/NationFlag';
import type { FcPlayer } from '@/lib/fcPlayers';
import { playerMedia, type FaceStats } from '@/lib/playerMedia';

export const PORTRAIT_RATIO = 1.6;

const ROWS: { key: keyof FaceStats; label: string }[] = [
  { key: 'pac', label: 'PAC' },
  { key: 'sho', label: 'SHO' },
  { key: 'pas', label: 'PAS' },
  { key: 'dri', label: 'DRI' },
  { key: 'def', label: 'DEF' },
  { key: 'phy', label: 'PHY' },
];

function photoImageStyle(focus?: 'face' | 'center') {
  if (focus === 'face') {
    if (Platform.OS === 'web') {
      return {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center 8%',
        transform: [{ scale: 1.72 }],
      } as object;
    }
    return {
      width: '100%',
      height: '100%',
      transform: [{ scale: 1.72 }, { translateY: 42 }],
    };
  }
  return [
    { width: '100%', height: '100%' },
    Platform.OS === 'web' ? ({ objectFit: 'cover', objectPosition: 'center 12%' } as object) : null,
  ];
}

function surname(en: string) {
  const parts = en.trim().split(' ');
  return (parts[parts.length - 1] || en).toUpperCase();
}

export function PortraitCard({
  player,
  width = 168,
  variant = 'full',
}: {
  player: FcPlayer;
  width?: number;
  variant?: 'full' | 'pitch';
}) {
  if (player.icon) {
    return <IconPortraitCard player={player} width={width} variant={variant} />;
  }
  return <StandardPortraitCard player={player} width={width} variant={variant} />;
}

/** Rounded metal gold/silver/bronze — original pre-Sharp Cut layout */
function StandardPortraitCard({
  player,
  width,
  variant,
}: {
  player: FcPlayer;
  width: number;
  variant: 'full' | 'pitch';
}) {
  const media = playerMedia(player.id);
  const rating = media.face?.ovr ?? player.rating;
  const tone = tierChrome(rating);
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(media.photo) && !failed;
  const pitch = variant === 'pitch';
  const height = Math.round(width * (pitch ? 1.42 : PORTRAIT_RATIO));
  const pad = Math.max(3, Math.round(width * (pitch ? 0.028 : 0.032)));
  const photoH = Math.round(height * (pitch ? 0.58 : 0.52));
  const radius = width * 0.1;
  const innerRadius = width * 0.075;

  return (
    <View
      style={{
        width,
        height,
        alignSelf: 'center',
        direction: 'ltr',
        borderRadius: radius,
        shadowColor: tone.glow,
        shadowOpacity: pitch ? 0.5 : 0.75,
        shadowRadius: pitch ? 8 : 14,
        shadowOffset: { width: 0, height: pitch ? 3 : 6 },
        elevation: pitch ? 6 : 10,
      }}
    >
      <LinearGradient
        colors={tone.frameColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, borderRadius: radius, padding: pad }}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.4)', 'transparent', 'rgba(0,0,0,0.22)']}
          locations={[0, 0.35, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{
            position: 'absolute',
            top: 1,
            left: 1,
            right: 1,
            bottom: 1,
            borderRadius: radius - 1,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.28)',
          }}
        />
        <LinearGradient
          colors={tone.faceColors}
          locations={[0, 0.45, 1]}
          style={{ flex: 1, borderRadius: innerRadius, overflow: 'hidden' }}
        >
          <CardMetalSheen />

          <View style={{ height: photoH, flexDirection: 'row', zIndex: 2 }}>
            <View
              style={{
                width: width * 0.3,
                paddingTop: width * 0.02,
                paddingLeft: width * 0.02,
                alignItems: 'center',
                gap: Math.max(2, width * 0.008),
                zIndex: 3,
              }}
            >
              <Text
                style={{
                  color: tone.ink,
                  fontSize: width * (pitch ? 0.2 : 0.185),
                  fontWeight: '900',
                  lineHeight: width * (pitch ? 0.2 : 0.185),
                  letterSpacing: -0.6,
                }}
              >
                {rating}
              </Text>
              <Text
                style={{
                  color: tone.ink,
                  fontSize: width * (pitch ? 0.07 : 0.062),
                  fontWeight: '800',
                  marginTop: -2,
                  letterSpacing: 0.5,
                }}
              >
                {player.position}
              </Text>
              <View style={{ width: '50%', height: 1, backgroundColor: 'rgba(0,0,0,0.28)', marginVertical: 1 }} />
              <NationFlag nation={player.nation} size={Math.max(11, width * 0.085)} />
              <ClubBadge club={player.club} size={Math.max(13, width * 0.11)} />
            </View>

            <View style={{ flex: 1, overflow: 'hidden' }}>
              {showPhoto ? (
                <Image
                  source={{ uri: media.photo }}
                  onError={() => setFailed(true)}
                  resizeMode="cover"
                  style={photoImageStyle(media.photoFocus)}
                />
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: tone.ink, fontSize: width * 0.14, fontWeight: '900', opacity: 0.2 }}>{player.position}</Text>
                </View>
              )}
            </View>

            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.2)', tone.deep]}
              locations={[0, 0.5, 1]}
              style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: photoH * 0.4, pointerEvents: 'none' }}
            />
          </View>

          <Text
            numberOfLines={1}
            style={{
              color: '#FFF8E8',
              fontSize: width * (pitch ? 0.08 : 0.074),
              fontWeight: '900',
              textAlign: 'center',
              letterSpacing: pitch ? 0.6 : 1.2,
              marginTop: 2,
              paddingHorizontal: 4,
              textShadowColor: 'rgba(0,0,0,0.5)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
              zIndex: 2,
            }}
          >
            {surname(media.en)}
          </Text>

          {!pitch ? (
            <>
              <View
                style={{
                  height: 1,
                  marginHorizontal: width * 0.12,
                  marginTop: 5,
                  marginBottom: 4,
                  backgroundColor: 'rgba(255,248,232,0.4)',
                  zIndex: 2,
                }}
              />
              <View style={{ flexDirection: 'row', paddingHorizontal: 2, zIndex: 2 }}>
                {ROWS.map((row) => (
                  <View key={row.label} style={{ flex: 1, alignItems: 'center' }}>
                    <Text
                      style={{
                        color: 'rgba(255,248,232,0.72)',
                        fontSize: Math.max(6.5, width * 0.036),
                        fontWeight: '800',
                        letterSpacing: 0.3,
                      }}
                    >
                      {row.label}
                    </Text>
                    <Text
                      style={{
                        color: '#FFF8E8',
                        fontSize: Math.max(10, width * 0.068),
                        fontWeight: '900',
                        marginTop: 1,
                      }}
                    >
                      {media.face?.[row.key] ?? '·'}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <View style={{ flex: 1 }} />
        </LinearGradient>
      </LinearGradient>
    </View>
  );
}

function IconPortraitCard({
  player,
  width,
  variant,
}: {
  player: FcPlayer;
  width: number;
  variant: 'full' | 'pitch';
}) {
  const media = playerMedia(player.id);
  const rating = media.face?.ovr ?? player.rating;
  const tone = iconChrome();
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(media.photo) && !failed;
  const pitch = variant === 'pitch';
  const height = Math.round(width * (pitch ? 1.42 : PORTRAIT_RATIO));
  const pad = Math.max(3, Math.round(width * (pitch ? 0.028 : 0.032)));
  const photoH = Math.round(height * (pitch ? 0.62 : 0.54));
  const radius = width * 0.1;
  const innerRadius = width * 0.075;

  return (
    <View
      style={{
        width,
        height,
        alignSelf: 'center',
        direction: 'ltr',
        borderRadius: radius,
        shadowColor: tone.glow,
        shadowOpacity: pitch ? 0.55 : 0.85,
        shadowRadius: pitch ? 8 : 14,
        shadowOffset: { width: 0, height: pitch ? 3 : 6 },
        elevation: pitch ? 6 : 10,
      }}
    >
      <LinearGradient
        colors={tone.frameColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, borderRadius: radius, padding: pad }}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.45)', 'transparent', 'rgba(0,0,0,0.25)']}
          locations={[0, 0.35, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{
            position: 'absolute',
            top: 1,
            left: 1,
            right: 1,
            bottom: 1,
            borderRadius: radius - 1,
            borderWidth: 1,
            borderColor: 'rgba(255, 236, 170, 0.35)',
          }}
        />
        <LinearGradient
          colors={tone.faceColors}
          locations={[0, 0.45, 1]}
          style={{ flex: 1, borderRadius: innerRadius, overflow: 'hidden' }}
        >
          <CardMetalSheen />

          <View style={{ height: photoH, flexDirection: 'row', zIndex: 2 }}>
            <View style={{ width: width * 0.34, paddingTop: width * 0.03, paddingLeft: width * 0.024, zIndex: 3 }}>
              <Text
                style={{
                  color: tone.accent,
                  fontSize: width * (pitch ? 0.22 : 0.2),
                  fontWeight: '900',
                  lineHeight: width * (pitch ? 0.22 : 0.2),
                  textShadowColor: 'rgba(0,0,0,0.55)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                {rating}
              </Text>
              <Text style={{ color: tone.ink, fontSize: width * (pitch ? 0.08 : 0.072), fontWeight: '800', marginTop: -1, letterSpacing: 0.5 }}>
                {player.position}
              </Text>
              {!pitch ? (
                <LinearGradient
                  colors={['#F5E6A8', '#C9A227', '#8A6A18']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    marginTop: 5,
                    alignSelf: 'flex-start',
                    borderRadius: 4,
                    paddingHorizontal: Math.max(4, width * 0.028),
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ color: '#1A1408', fontSize: Math.max(7, width * 0.048), fontWeight: '900', letterSpacing: 1.1 }}>ICON</Text>
                </LinearGradient>
              ) : null}
            </View>
            <View style={{ flex: 1, overflow: 'hidden' }}>
              {showPhoto ? (
                <Image
                  source={{ uri: media.photo }}
                  onError={() => setFailed(true)}
                  resizeMode="cover"
                  style={photoImageStyle(media.photoFocus)}
                />
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: tone.ink, fontSize: width * 0.16, fontWeight: '900', opacity: 0.2 }}>{player.position}</Text>
                </View>
              )}
            </View>
            <LinearGradient
              colors={['transparent', 'rgba(5,4,2,0.55)', tone.deep]}
              locations={[0, 0.55, 1]}
              style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: photoH * 0.42 }}
            />
          </View>

          <Text
            numberOfLines={1}
            style={{
              color: tone.ink,
              fontSize: width * (pitch ? 0.095 : 0.088),
              fontWeight: '900',
              textAlign: 'center',
              letterSpacing: pitch ? 0.5 : 1.2,
              marginTop: -width * 0.01,
              paddingHorizontal: 4,
              textShadowColor: 'rgba(0,0,0,0.6)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
              zIndex: 2,
            }}
          >
            {surname(media.en)}
          </Text>

          {!pitch ? (
            <>
              <LinearGradient
                colors={['transparent', tone.accent, 'transparent']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{ height: 1.5, marginHorizontal: width * 0.12, marginTop: 3, marginBottom: 2, opacity: 0.7, zIndex: 2 }}
              />

              <View style={{ flexDirection: 'row', marginTop: 1, paddingHorizontal: 3, zIndex: 2 }}>
                {ROWS.map((row) => (
                  <View key={row.label} style={{ flex: 1, alignItems: 'center' }}>
                    <Text
                      style={{
                        color: tone.accent,
                        fontSize: Math.max(7, width * 0.045),
                        fontWeight: '800',
                        opacity: 0.75,
                        letterSpacing: 0.3,
                      }}
                    >
                      {row.label}
                    </Text>
                    <Text style={{ color: tone.ink, fontSize: Math.max(10, width * 0.076), fontWeight: '900' }}>
                      {media.face?.[row.key] ?? '·'}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <View style={{ flex: 1 }} />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: pitch ? 'flex-end' : 'center',
              alignItems: 'center',
              gap: width * 0.06,
              paddingBottom: width * (pitch ? 0.045 : 0.04),
              paddingRight: pitch ? width * 0.04 : 0,
              zIndex: 2,
            }}
          >
            <NationFlag nation={player.nation} size={Math.max(12, width * (pitch ? 0.1 : 0.095))} />
            {!pitch ? (
              <LinearGradient
                colors={['#F5E6A8', '#C9A227']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 5, paddingHorizontal: Math.max(6, width * 0.04), paddingVertical: 2 }}
              >
                <Text style={{ color: '#1A1408', fontSize: Math.max(8, width * 0.052), fontWeight: '900', letterSpacing: 1 }}>ICON</Text>
              </LinearGradient>
            ) : null}
          </View>
        </LinearGradient>
      </LinearGradient>
    </View>
  );
}
