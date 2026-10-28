import { HERO_ART } from '@/lib/heroArt';
import { RECENT_CARD_ART } from '@/lib/recentCardArt';
import { Ionicons } from '@expo/vector-icons';
import { Image, Text, View } from 'react-native';
import { SBC_COMPLETE_CARDS, SBC_REWARD_IMAGES } from '@/assets/sbcRewardAssets';
import artwork from '@/assets/data/sbc-reward-art-20261020.json';
import { SbcRewardPack } from '@/components/SbcRewardPack';
import { sbcTileTheme } from '@/lib/sbcTileTheme';
import type { SbcChallenge } from '@/lib/types';

type PlayerArt = { kind: 'player'; background: string; portrait: string; nation: string; league: string; club: string; name: string; rating: number; position: string; stats: number[]; sourceUrl: string };
type PickArt = { kind: 'pick'; image: string; sourceUrl: string };
const artById = artwork as Record<string, PlayerArt | PickArt>;
function bundledImage(url: string) {
 const source = SBC_REWARD_IMAGES[url];
 if (!source) throw new Error('Missing bundled SBC reward image');
 return source;
}
const labels = ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'];
export function SbcRewardVisual({ challenge, width = 100 }: { challenge: SbcChallenge; width?: number }) {
 // Complete Ultimate Scream item 67312611, sourced from FUT.GG and bundled locally.
 if (challenge.id === 'sbc-bellerin-20261027') return <View testID={`sbc-reward-${challenge.id}`} accessibilityRole="image" accessibilityLabel="Héctor Bellerín Ultimate Scream 85 RM" style={{ width, height: width * 1.4 }}><Image testID={`sbc-card-complete-${challenge.id}`} source={require('@/assets/images/sbc-rewards/bellerin-67312611.png')} resizeMode="contain" style={{ width, height: width * 1.4 }} /></View>;
 if (challenge.id === 'sbc-showdown-carlos-20261028') return <View testID={`sbc-reward-${challenge.id}`} accessibilityRole="image" accessibilityLabel="Carlos Augusto Showdown 83 LB" style={{ width, height: width * 1.4 }}><Image source={require('@/assets/images/sbc-rewards/carlos-50590296.png')} resizeMode="contain" style={{ width, height: width * 1.4 }} /></View>;
 if (challenge.id === 'sbc-showdown-ruben-20261028') return <View testID={`sbc-reward-${challenge.id}`} accessibilityRole="image" accessibilityLabel="Ruben Loftus-Cheek Showdown 83 CAM" style={{ width, height: width * 1.4 }}><Image source={require('@/assets/images/sbc-rewards/ruben-50545314.png')} resizeMode="contain" style={{ width, height: width * 1.4 }} /></View>;
 if (challenge.id === 'sbc-hero-20261026') {
  const heroes = ['hero-ruicosta', 'hero-luishernandez', 'hero-henriklarsson', 'hero-parkjisung'];
  const cardWidth = width * 0.44;
  return <View testID={`sbc-reward-${challenge.id}`} accessibilityRole="image" accessibilityLabel="1 of 4 Base Hero Player Pick: Rui Costa, Hernández, Larsson, Park Ji-sung" style={{ width, height: width * 1.6, direction: 'ltr' }}>
    {heroes.map((id, index) => <Image key={id} testID={`sbc-hero-choice-${id}`} source={HERO_ART[id]} resizeMode="contain" style={{ position: 'absolute', width: cardWidth, height: cardWidth * 1.6, left: index % 2 * width * 0.5 + width * 0.03, top: Math.floor(index / 2) * width * 0.65 }} />)}
    <Text style={{ position: 'absolute', bottom: 0, width, textAlign: 'center', color: '#FFD0A1', fontSize: Math.max(10, width * 0.1), fontWeight: '900' }}>HERO · 1 OF 4</Text>
  </View>;
 }
 const recentReward = ({ 'sbc-mor-20261025': 'recent-50562888', 'sbc-woltemade-20261025': 'recent-67362886' } as Record<string, string>)[challenge.id];
 if (recentReward) return <View testID={`sbc-reward-${challenge.id}`} accessibilityRole="image" accessibilityLabel={challenge.reward ?? challenge.title} style={{ width, height: width * 1.4 }}><Image testID={`sbc-card-complete-${challenge.id}`} source={RECENT_CARD_ART[recentReward]} resizeMode="contain" style={{ width, height: width * 1.4 }} /></View>;
 const art = artById[challenge.id]; const height = width * 1.4;
 const testID = `sbc-reward-${challenge.id}`;
 const complete = SBC_COMPLETE_CARDS[challenge.id];
 if (complete && art?.kind === 'player') return <View testID={testID} accessibilityRole="image" accessibilityLabel={`${art.name} ${art.rating} ${art.position}`} style={{ width, height }}>
  <Image testID={`sbc-card-complete-${challenge.id}`} source={complete} resizeMode="contain" style={{ width, height }} />
 </View>;
 if (art?.kind === 'pick') return <View testID={testID} accessibilityRole="image" accessibilityLabel={challenge.reward ?? challenge.title} style={{ width, height }}><Image source={bundledImage(art.image)} resizeMode="contain" style={{ width, height }} /></View>;
 if (art?.kind === 'player') {
  const ink = '#FFF8ED';
  return <View testID={testID} accessibilityRole="image" accessibilityLabel={`${art.name} ${art.rating} ${art.position}`} style={{ width, height, direction: 'ltr' }}>
   <Image testID={`sbc-card-frame-${challenge.id}`} source={bundledImage(art.background)} resizeMode="contain" style={{ position: 'absolute', top: 0, left: 0, width, height }} />
   <Image source={bundledImage(art.portrait)} resizeMode="contain" style={{ position: 'absolute', width: width * 0.79, height: height * 0.61, top: height * 0.10, right: width * 0.025 }} />
   <View style={{ position: 'absolute', left: width * 0.14, top: height * 0.17, alignItems: 'center' }}>
    <Text style={{ color: ink, fontSize: width * 0.23, lineHeight: width * 0.25, fontWeight: '900' }}>{art.rating}</Text>
    <Text style={{ color: ink, fontSize: width * 0.09, fontWeight: '800' }}>{art.position}</Text>
   </View>
   <Text numberOfLines={1} style={{ position: 'absolute', top: height * 0.62, left: width * 0.10, width: width * 0.80, textAlign: 'center', color: ink, fontSize: width * 0.10, fontWeight: '900' }}>{art.name}</Text>
   <View style={{ position: 'absolute', top: height * 0.74, left: width * 0.10, width: width * 0.80, flexDirection: 'row', justifyContent: 'space-between' }}>
    {art.stats.map((n, i) => <View key={labels[i]} style={{ alignItems: 'center' }}><Text style={{ color: ink, fontSize: width * 0.052, fontWeight: '800' }}>{labels[i]}</Text><Text style={{ color: ink, fontSize: width * 0.08, fontWeight: '900' }}>{n}</Text></View>)}
   </View>
   <View style={{ position: 'absolute', top: height * 0.85, width, flexDirection: 'row', gap: width * 0.04, justifyContent: 'center' }}>
    {[art.nation, art.league, art.club].map((uri) => <Image key={uri} source={bundledImage(uri)} resizeMode="contain" style={{ width: width * 0.10, height: width * 0.10 }} />)}
   </View>
  </View>;
 }
 if (challenge.id === 'sbc-getting-started') return <View testID={testID} accessibilityRole="image" accessibilityLabel="Coin Boost" style={{ width, height, alignItems: 'center', justifyContent: 'center', gap: 5 }}>
  <Ionicons name="cash-outline" size={width * 0.46} color="#E9C36A" />
  <Text style={{ color: '#F5DEA0', fontSize: width * 0.105, fontWeight: '900' }}>COIN BOOST</Text>
 </View>;
 const theme = sbcTileTheme(challenge);
 const stamp = challenge.reward?.match(/\d+\s*(?:×|x)\s*\d{2}\+/i)?.[0] ?? theme.packLabel;
 return <View testID={testID} style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
  <SbcRewardPack visual={theme.pack} size={width * 0.82} label={theme.packLabel} />
  {stamp ? <Text style={{ position: 'absolute', bottom: 5, paddingHorizontal: 7, paddingVertical: 3, backgroundColor: '#07101B', borderWidth: 1, borderColor: '#A58A49', color: '#F5DEA0', fontSize: Math.max(9, width * 0.11), fontWeight: '900' }}>{stamp}</Text> : null}
 </View>;
}
