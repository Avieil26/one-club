import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { cardQuality } from '@/lib/chemistry';

export type CardTone = {
  face: string;
  deep: string;
  shine: string;
  frame: string;
  ink: string;
};

export type TierTone = CardTone & {
  frameColors: [string, string, string, string];
  faceColors: [string, string, string];
  accent: string;
  glow: string;
  label: 'GOLD' | 'SILVER' | 'BRONZE' | 'ICON';
};

export type IconTone = TierTone;

export function cardChrome(rating: number): CardTone {
  return tierChrome(rating);
}

/** FUTBIN-style gold / silver / bronze metallic chrome. */
export function tierChrome(rating: number): TierTone {
  const quality = cardQuality(rating);
  if (quality === 'silver') {
    return {
      face: '#C8D2DE',
      deep: '#3A4554',
      shine: 'rgba(255,255,255,0.5)',
      frame: '#8A96A6',
      ink: '#121820',
      accent: '#F4F7FB',
      glow: 'rgba(140, 160, 185, 0.55)',
      label: 'SILVER',
      frameColors: ['#F8FBFE', '#C8D4E0', '#6A7888', '#E8EEF4'],
      faceColors: ['#D8E2EC', '#8A9AAB', '#3E4A58'],
    };
  }
  if (quality === 'bronze') {
    return {
      face: '#D9A074',
      deep: '#4A2810',
      shine: 'rgba(255, 236, 210, 0.45)',
      frame: '#9A6235',
      ink: '#1E1008',
      accent: '#F6D8B6',
      glow: 'rgba(170, 95, 45, 0.5)',
      label: 'BRONZE',
      frameColors: ['#F5D0A0', '#C07A3E', '#5A3214', '#E4A862'],
      faceColors: ['#E0A878', '#A06030', '#4A2810'],
    };
  }
  return {
    face: '#E8C86A',
    deep: '#5A4010',
    shine: 'rgba(255, 248, 220, 0.5)',
    frame: '#C9A227',
    ink: '#221608',
    accent: '#FFF3C8',
    glow: 'rgba(201, 162, 39, 0.6)',
    label: 'GOLD',
    frameColors: ['#FFF3C0', '#E0B83A', '#8A6418', '#F0D060'],
    faceColors: ['#F0D878', '#C9A227', '#6A5014'],
  };
}

/** Premium ICON chrome — metallic black/gold, FUT-style. */
export function iconChrome(): IconTone {
  return {
    face: '#1A140C',
    deep: '#050402',
    shine: 'rgba(255, 220, 140, 0.22)',
    frame: '#C9A227',
    ink: '#F7E7B4',
    accent: '#F0D060',
    glow: 'rgba(201, 162, 39, 0.55)',
    label: 'ICON',
    frameColors: ['#F5E6A8', '#C9A227', '#8A6A18', '#E8C547'],
    faceColors: ['#2A2114', '#12100A', '#050402'],
  };
}

export function MetalFace({ tone, children, style }: { tone: CardTone; children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ backgroundColor: tone.face, overflow: 'hidden' }, style]}>
      <View
        style={{
          position: 'absolute',
          top: -30,
          bottom: -30,
          left: '22%',
          width: 16,
          backgroundColor: tone.shine,
          transform: [{ rotate: '18deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: -30,
          bottom: -30,
          left: '58%',
          width: 8,
          backgroundColor: tone.shine,
          transform: [{ rotate: '18deg' }],
        }}
      />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '38%', backgroundColor: tone.deep, opacity: 0.28 }} />
      {children}
    </View>
  );
}

export function CardMetalSheen({ bright = false }: { bright?: boolean }) {
  const top = bright ? 'rgba(255,255,255,0.35)' : 'rgba(255,236,170,0.28)';
  const stripe = bright ? 'rgba(255,255,255,0.18)' : 'rgba(255, 230, 150, 0.14)';
  const thin = bright ? 'rgba(255,255,255,0.12)' : 'rgba(255, 240, 180, 0.1)';
  return (
    <>
      <LinearGradient
        colors={[top, 'transparent', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '42%', zIndex: 1, pointerEvents: 'none' }}
      />
      <View
        style={{
          position: 'absolute',
          top: -40,
          bottom: -40,
          left: '18%',
          width: 18,
          backgroundColor: stripe,
          transform: [{ rotate: '16deg' }],
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: -40,
          bottom: -40,
          left: '52%',
          width: 7,
          backgroundColor: thin,
          transform: [{ rotate: '16deg' }],
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}

export function IconMetalSheen() {
  return <CardMetalSheen />;
}
