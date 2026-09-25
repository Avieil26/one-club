import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type SceneId = 'home' | 'career' | 'ultimate' | 'grounds' | 'sbc' | 'market' | 'modal';

const SCENES: Record<
  SceneId,
  {
    source: number;
    tint: [string, string, string];
    wash: string;
    vignette: [string, string, string, string];
    base: string;
  }
> = {
  home: {
    source: require('@/assets/images/scene-home.png'),
    tint: ['rgba(4,8,7,0.58)', 'rgba(6,12,10,0.4)', 'rgba(3,6,5,0.78)'],
    wash: 'rgba(8,14,12,0.28)',
    vignette: ['rgba(0,0,0,0.48)', 'transparent', 'transparent', 'rgba(0,0,0,0.76)'],
    base: '#05080A',
  },
  career: {
    source: require('@/assets/images/scene-career.png'),
    tint: ['rgba(4,8,14,0.6)', 'rgba(8,14,22,0.42)', 'rgba(3,6,12,0.8)'],
    wash: 'rgba(10,16,24,0.3)',
    vignette: ['rgba(0,0,0,0.48)', 'transparent', 'transparent', 'rgba(0,0,0,0.76)'],
    base: '#05080A',
  },
  ultimate: {
    source: require('@/assets/images/scene-ultimate.png'),
    tint: ['rgba(10,8,4,0.58)', 'rgba(14,12,6,0.4)', 'rgba(6,5,2,0.8)'],
    wash: 'rgba(16,12,6,0.28)',
    vignette: ['rgba(0,0,0,0.48)', 'transparent', 'transparent', 'rgba(0,0,0,0.76)'],
    base: '#05080A',
  },
  grounds: {
    source: require('@/assets/images/scene-grounds.png'),
    tint: ['rgba(4,8,12,0.58)', 'rgba(8,14,18,0.4)', 'rgba(3,6,10,0.8)'],
    wash: 'rgba(8,14,18,0.3)',
    vignette: ['rgba(0,0,0,0.48)', 'transparent', 'transparent', 'rgba(0,0,0,0.76)'],
    base: '#05080A',
  },
  sbc: {
    source: require('@/assets/images/scene-sbc.png'),
    tint: ['rgba(4,8,16,0.35)', 'rgba(6,10,18,0.18)', 'rgba(3,6,12,0.45)'],
    wash: 'rgba(4,8,14,0.12)',
    vignette: ['rgba(0,0,0,0.28)', 'transparent', 'transparent', 'rgba(0,0,0,0.42)'],
    base: '#060A14',
  },
  market: {
    source: require('@/assets/images/market-stadium-bg.png'),
    tint: ['rgba(3,6,5,0.55)', 'rgba(5,10,8,0.35)', 'rgba(3,6,5,0.72)'],
    wash: 'rgba(8,14,12,0.22)',
    vignette: ['rgba(0,0,0,0.48)', 'transparent', 'transparent', 'rgba(0,0,0,0.76)'],
    base: '#05080A',
  },
  modal: {
    source: require('@/assets/images/scene-ultimate.png'),
    tint: ['rgba(2,3,6,0.72)', 'rgba(4,5,10,0.55)', 'rgba(2,2,4,0.88)'],
    wash: 'rgba(6,8,14,0.35)',
    vignette: ['rgba(0,0,0,0.48)', 'transparent', 'transparent', 'rgba(0,0,0,0.76)'],
    base: '#05080A',
  },
};

/** Full-viewport scene background (absolute, behind UI). */
export function SceneAtmosphere({ scene }: { scene: SceneId }) {
  const config = SCENES[scene];
  const { width, height } = useWindowDimensions();

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { zIndex: 0, elevation: 0, backgroundColor: config.base, overflow: 'hidden' },
      ]}
    >
      <Image
        source={config.source}
        resizeMode="cover"
        style={{ position: 'absolute', top: 0, left: 0, width: Math.max(width, 1), height: Math.max(height, 1) }}
      />
      <LinearGradient colors={config.tint} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={config.vignette} locations={[0, 0.18, 0.55, 1]} style={StyleSheet.absoluteFill} />
      {config.wash !== 'transparent' ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: config.wash }]} />
      ) : null}
    </View>
  );
}

/** @deprecated use SceneAtmosphere scene="market" */
export function MarketAtmosphere() {
  return <SceneAtmosphere scene="market" />;
}
