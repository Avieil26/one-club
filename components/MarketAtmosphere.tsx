import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type SceneId = 'home' | 'career' | 'ultimate' | 'champions' | 'grounds' | 'sbc' | 'market' | 'modal' | 'games' | 'draft' | 'board';

const SCENES: Record<
  SceneId,
  {
    source: number | null;
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
    source: require('@/assets/images/scene-career-scout.png'),
    tint: ['rgba(8,14,22,0.40)', 'rgba(8,14,22,0.30)', 'rgba(8,14,22,0.50)'],
    wash: 'rgba(8,14,22,0.22)',
    vignette: ['rgba(0,0,0,0.25)', 'transparent', 'transparent', 'rgba(0,0,0,0.50)'],
    base: '#070D14',
  },
  champions: {
    source: null,
    tint: ['rgba(90, 0, 10, 0.82)', 'rgba(32, 4, 8, 0.72)', 'rgba(3, 5, 9, 0.92)'],
    wash: 'rgba(126, 8, 18, 0.22)',
    vignette: ['rgba(2,0,0,0.15)', 'transparent', 'transparent', 'rgba(0,0,0,0.78)'],
    base: '#070609',
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
    source: require('@/assets/images/scene-sbc-tunnel.png'),
    tint: ['rgba(0,0,0,0.18)', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.28)'],
    wash: 'transparent',
    vignette: ['rgba(0,0,0,0.2)', 'transparent', 'transparent', 'rgba(0,0,0,0.35)'],
    base: '#07080A',
  },
  market: {
    source: require('@/assets/images/market-stadium-bg.png'),
    tint: ['rgba(3,6,5,0.55)', 'rgba(5,10,8,0.35)', 'rgba(3,6,5,0.72)'],
    wash: 'rgba(8,14,12,0.22)',
    vignette: ['rgba(0,0,0,0.48)', 'transparent', 'transparent', 'rgba(0,0,0,0.76)'],
    base: '#05080A',
  },
  draft: {
    source: require('@/assets/images/scene-ultimate.png'),
    tint: ['rgba(12,8,4,0.62)', 'rgba(8,10,8,0.38)', 'rgba(4,6,5,0.78)'],
    wash: 'rgba(8,10,8,0.18)',
    vignette: ['rgba(0,0,0,0.35)', 'transparent', 'transparent', 'rgba(0,0,0,0.62)'],
    base: '#07060A',
  },
  games: {
    source: require('@/assets/images/scene-grounds.png'),
    tint: ['rgba(5,7,12,0.42)', 'rgba(5,7,12,0.18)', 'rgba(4,8,6,0.62)'],
    wash: 'rgba(5,8,10,0.12)',
    vignette: ['rgba(0,0,0,0.28)', 'transparent', 'transparent', 'rgba(0,0,0,0.45)'],
    base: '#05070C',
  },
  board: {
    source: require('@/assets/images/board-stadium.jpg'),
    tint: ['rgba(7,8,12,0.94)', '#07080c', '#07080c'],
    wash: 'rgba(7,8,12,0.4)',
    vignette: ['#07080c', '#07080c', '#07080c', '#07080c'],
    base: '#07080c',
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
      {config.source ? (
        <Image
          source={config.source}
          resizeMode="cover"
          style={{ position: 'absolute', top: 0, left: 0, width: Math.max(width, 1), height: Math.max(height, 1) }}
        />
      ) : null}
      {scene === 'champions' ? (
        <>
          <View style={{ position: 'absolute', width: width * 1.45, height: 160, top: height * 0.04, left: -width * 0.18, backgroundColor: 'rgba(176, 19, 32, 0.18)', transform: [{ rotate: '-16deg' }] }} />
          <View style={{ position: 'absolute', width: width * 1.35, height: 110, top: height * 0.28, right: -width * 0.22, backgroundColor: 'rgba(230, 34, 51, 0.12)', transform: [{ rotate: '-16deg' }] }} />
          <View style={{ position: 'absolute', width: width * 1.15, height: 90, top: height * 0.68, left: -width * 0.16, backgroundColor: 'rgba(173, 12, 27, 0.16)', transform: [{ rotate: '-16deg' }] }} />
          <LinearGradient colors={['transparent', 'rgba(214, 22, 42, 0.15)', 'transparent']} start={{x:0,y:0.3}} end={{x:1,y:0.7}} style={StyleSheet.absoluteFill} />
        </>
      ) : null}
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
