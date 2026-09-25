import { type ReactNode } from 'react';
import { Image, ImageBackground, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, LinearGradient as SvgGrad, Rect, Stop } from 'react-native-svg';

import { colors } from '@/components/ui';
import {
  displayName,
  divisionLabel,
  intentLabel,
  platformLabel,
  playerLevelTone,
} from '@/lib/labels';
import type { GroundsPost, Profile, UserFollow } from '@/lib/types';

type Props = {
  post: GroundsPost;
  profiles: Profile[];
  follows: UserFollow[];
  meId: string | null;
  onMessage: (userId: string) => void;
  onFollow: (userId: string) => void;
  onNeedAuth?: () => void;
};

function crestFor(level: number): { colors: [string, string, string]; label: string; text: string } {
  const n = Math.min(50, Math.max(1, Math.round(level) || 1));
  if (n <= 10) return { colors: ['#B8C0C8', '#6A727C', '#2A3038'], label: 'ROOKIE', text: '#F3F4F6' };
  if (n <= 20) return { colors: ['#F0F4F8', '#A8B4C0', '#4A5868'], label: 'SILVER', text: '#111827' };
  if (n <= 30) return { colors: ['#F5D0A0', '#C07A3E', '#5A3214'], label: 'BRONZE', text: '#1E1008' };
  if (n <= 40) return { colors: ['#FFE9A0', '#E3B341', '#8A6418'], label: 'GOLD', text: '#1A1208' };
  return { colors: ['#FFE9A0', '#E3B341', '#8A6418'], label: 'ELITE', text: '#1A1208' };
}

/** PREVIEW framing: vertical stadium plate — floodlights in corners, wet pitch below, no zoom crop */
function CinematicHero({ children }: { children: ReactNode }) {
  return (
    <ImageBackground
      source={require('@/assets/images/grounds-card-hero.png')}
      style={{ height: 248, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
      imageStyle={{ resizeMode: 'cover' }}
    >
      {/* Soft teal cinematic wash — matches PREVIEW fog hue, not flat black */}
      <LinearGradient
        colors={['rgba(8,24,40,0.35)', 'rgba(6,18,32,0.08)', 'rgba(4,12,22,0.45)']}
        locations={[0, 0.45, 1]}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <View style={{ zIndex: 2, paddingVertical: 16 }}>{children}</View>
    </ImageBackground>
  );
}

/** Dark metallic plaque like PREVIEW — crest + ladder + colored level bar */
function RankMonument({ level, division }: { level: number; division: string }) {
  const tone = playerLevelTone(level);
  const crest = crestFor(level);
  const uid = `rail-${Math.round(level)}`;

  return (
    <LinearGradient
      colors={['#3A4552', '#1A222C', '#0A0E14', '#252E38']}
      locations={[0, 0.28, 0.62, 1]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={{
        width: 104,
        borderRadius: 12,
        paddingTop: 12,
        paddingBottom: 14,
        paddingHorizontal: 8,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(180,200,220,0.28)',
        shadowColor: '#7EB6FF',
        shadowOpacity: 0.35,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 14,
      }}
    >
      <LinearGradient
        colors={crest.colors}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{
          width: 74,
          borderRadius: 10,
          paddingVertical: 7,
          alignItems: 'center',
          marginBottom: 8,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.4)',
        }}
      >
        <Text style={{ color: crest.text, fontSize: 9, letterSpacing: 2.2, fontWeight: '900' }}>★★★</Text>
        <Text style={{ color: crest.text, fontSize: 12, fontWeight: '900', letterSpacing: 1 }}>{crest.label}</Text>
      </LinearGradient>

      <Svg width={42} height={58} viewBox="0 0 42 58" style={{ marginBottom: 10 }}>
        <Defs>
          <SvgGrad id={uid} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F4F7FB" />
            <Stop offset="0.45" stopColor="#C5CED8" />
            <Stop offset="1" stopColor="#6A7684" />
          </SvgGrad>
        </Defs>
        <Rect x="8" y="2" width="4.5" height="54" rx="2" fill={`url(#${uid})`} />
        <Rect x="29.5" y="2" width="4.5" height="54" rx="2" fill={`url(#${uid})`} />
        {[10, 19, 28, 37, 46].map((y) => (
          <Rect key={y} x="8" y={y} width="26" height="3.6" rx="1.2" fill={`url(#${uid})`} />
        ))}
      </Svg>

      <LinearGradient
        colors={tone.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 8,
          paddingHorizontal: 14,
          paddingVertical: 8,
          minWidth: 82,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.45)',
        }}
      >
        <Text style={{ color: tone.text, fontWeight: '900', fontSize: 15 }}>{tone.label}</Text>
      </LinearGradient>

      <Text
        style={{
          color: '#F7F4EA',
          fontWeight: '800',
          fontSize: 13,
          marginTop: 10,
          textShadowColor: 'rgba(0,0,0,0.8)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 4,
        }}
      >
        {division}
      </Text>
    </LinearGradient>
  );
}

export function GroundsPlayerCard({ post, profiles, follows, meId, onMessage, onFollow, onNeedAuth }: Props) {
  const tone = playerLevelTone(post.playerLevel);
  const name = displayName(profiles, post.userId);
  const followers = follows.filter((f) => f.followingId === post.userId).length;
  const following = follows.filter((f) => f.followerId === post.userId).length;
  const iFollow = Boolean(meId && follows.some((f) => f.followerId === meId && f.followingId === post.userId));
  const isMe = Boolean(meId && meId === post.userId);
  const hasAvatar = Boolean(post.avatarUri && post.avatarUri !== 'placeholder');

  function pressMessage() {
    if (!meId) {
      onNeedAuth?.();
      return;
    }
    if (isMe) return;
    onMessage(post.userId);
  }

  function pressFollow() {
    if (!meId) {
      onNeedAuth?.();
      return;
    }
    if (isMe) return;
    onFollow(post.userId);
  }

  return (
    <View
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#141A20',
        borderWidth: 1,
        borderColor: 'rgba(120,160,190,0.18)',
      }}
    >
      <CinematicHero>
        <RankMonument level={post.playerLevel} division={divisionLabel(post.division)} />
      </CinematicHero>

      {/* Bottom panel — dark slate like PREVIEW */}
      <View style={{ padding: 14, gap: 12, backgroundColor: '#1A2228' }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View
            style={{
              width: 76,
              height: 76,
              borderRadius: 38,
              overflow: 'hidden',
              backgroundColor: '#0A100E',
              borderWidth: 2,
              borderColor: tone.bg,
            }}
          >
            {hasAvatar ? (
              <Image source={{ uri: post.avatarUri! }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.muted, fontWeight: '800', fontSize: 24 }}>{name.slice(0, 1)}</Text>
              </View>
            )}
          </View>

          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
              {post.levelVerified ? (
                <View style={{ backgroundColor: '#1A5C3E', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ color: '#E8FFF4', fontWeight: '800', fontSize: 11 }}>רמה מאומתת</Text>
                </View>
              ) : null}
              {isMe ? (
                <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ color: 'rgba(247,244,234,0.8)', fontWeight: '800', fontSize: 11 }}>המודעה שלך</Text>
                </View>
              ) : null}
            </View>
            <Text style={{ color: '#F7F4EA', fontSize: 17, fontWeight: '800', textAlign: 'right' }}>
              {intentLabel(post.intent)} · {post.position}
            </Text>
            <Text style={{ color: 'rgba(220,230,240,0.75)', fontSize: 13, textAlign: 'right', fontWeight: '600' }}>
              {platformLabel(post.platform)} · {post.archetype}
            </Text>
            <Text style={{ color: 'rgba(220,230,240,0.75)', fontSize: 13, textAlign: 'right' }}>
              EA ID: {post.eaId || '—'} · {post.gamertag || '—'}
            </Text>
            <Text style={{ color: 'rgba(180,200,220,0.55)', fontSize: 12, textAlign: 'right' }}>
              {followers} עוקבים · {following} עוקב · {name}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, opacity: isMe ? 0.45 : 1 }}>
          <Pressable
            disabled={isMe}
            onPress={pressMessage}
            style={{
              flex: 1,
              backgroundColor: '#1F6B5C',
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}>הודעה</Text>
          </Pressable>
          <Pressable
            disabled={isMe}
            onPress={pressFollow}
            style={{
              flex: 1,
              backgroundColor: iFollow && !isMe ? 'rgba(255,255,255,0.08)' : 'transparent',
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: 'rgba(255,255,255,0.75)',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}>
              {iFollow && !isMe ? 'עוקב' : 'עקוב'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
