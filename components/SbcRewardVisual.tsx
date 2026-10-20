import { Image, Text, View } from 'react-native';
import artwork from '@/assets/data/sbc-reward-art-20261020.json';
import { SbcRewardPack } from '@/components/SbcRewardPack';
import { sbcTileTheme } from '@/lib/sbcTileTheme';
import type { SbcChallenge } from '@/lib/types';

type PlayerArt = { kind: 'player'; background: string; portrait: string; nation: string; league: string; club: string; name: string; rating: number; position: string; stats: number[]; sourceUrl: string };
type PickArt = { kind: 'pick'; image: string; sourceUrl: string };
const artById = artwork as Record<string, PlayerArt | PickArt>;
const labels = ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'];
export function SbcRewardVisual({ challenge, width = 100 }: { challenge: SbcChallenge; width?: number }) {
 const art = artById[challenge.id]; const height = width * 1.4;
 if (art?.kind === 'pick') return <Image source={{ uri: art.image }} accessibilityLabel={challenge.reward ?? challenge.title} resizeMode="contain" style={{ width, height }} />;
 if (art?.kind === 'player') {
  const ink = challenge.id === 'sbc-potm-pina' ? '#382255' : '#FFF8ED';
  return <View accessibilityRole="image" accessibilityLabel={`${art.name} ${art.rating} ${art.position}`} style={{ width, height, direction: 'ltr' }}>
   <Image source={{ uri: art.background }} resizeMode="contain" style={{ position: 'absolute', width, height }} />
   <Image source={{ uri: art.portrait }} resizeMode="contain" style={{ position: 'absolute', width: width * 0.79, height: height * 0.61, top: height * 0.10, right: width * 0.025 }} />
   <View style={{ position: 'absolute', left: width * 0.14, top: height * 0.17, alignItems: 'center' }}>
    <Text style={{ color: ink, fontSize: width * 0.23, lineHeight: width * 0.25, fontWeight: '900' }}>{art.rating}</Text>
    <Text style={{ color: ink, fontSize: width * 0.09, fontWeight: '800' }}>{art.position}</Text>
   </View>
   <Text numberOfLines={1} style={{ position: 'absolute', top: height * 0.62, left: width * 0.10, width: width * 0.80, textAlign: 'center', color: ink, fontSize: width * 0.10, fontWeight: '900' }}>{art.name}</Text>
   <View style={{ position: 'absolute', top: height * 0.74, left: width * 0.10, width: width * 0.80, flexDirection: 'row', justifyContent: 'space-between' }}>
    {art.stats.map((n, i) => <View key={labels[i]} style={{ alignItems: 'center' }}><Text style={{ color: ink, fontSize: width * 0.052, fontWeight: '800' }}>{labels[i]}</Text><Text style={{ color: ink, fontSize: width * 0.08, fontWeight: '900' }}>{n}</Text></View>)}
   </View>
   <View style={{ position: 'absolute', top: height * 0.85, width, flexDirection: 'row', gap: width * 0.04, justifyContent: 'center' }}>
    {[art.nation, art.league, art.club].map((uri) => <Image key={uri} source={{ uri }} resizeMode="contain" style={{ width: width * 0.10, height: width * 0.10 }} />)}
   </View>
  </View>;
 }
 if (challenge.id === 'sbc-getting-started') return <View accessibilityRole="image" accessibilityLabel="Coin Boost" style={{ width, height, alignItems: 'center', justifyContent: 'center', gap: 5 }}>
  <Text style={{ color: '#E9C36A', fontSize: width * 0.45, fontWeight: '900' }}>◉</Text>
  <Text style={{ color: '#F5DEA0', fontSize: width * 0.105, fontWeight: '900' }}>COIN BOOST</Text>
 </View>;
 const theme = sbcTileTheme(challenge);
 const stamp = challenge.reward?.match(/\d+\s*(?:×|x)\s*\d{2}\+/i)?.[0] ?? theme.packLabel;
 return <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
  <SbcRewardPack visual={theme.pack} size={width * 0.82} label={theme.packLabel} />
  {stamp ? <Text style={{ position: 'absolute', bottom: 5, paddingHorizontal: 7, paddingVertical: 3, backgroundColor: '#07101B', borderWidth: 1, borderColor: '#A58A49', color: '#F5DEA0', fontSize: Math.max(9, width * 0.11), fontWeight: '900' }}>{stamp}</Text> : null}
 </View>;
}
