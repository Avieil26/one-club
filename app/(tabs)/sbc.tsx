import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ClubBadge } from '@/components/ClubBadge';
import { NationFlag } from '@/components/NationFlag';
import { SbcRewardPack } from '@/components/SbcRewardPack';
import { PortraitCard } from '@/components/PortraitCard';
import type { FcPlayer } from '@/lib/fcPlayers';
import { Button, Muted, Screen } from '@/components/ui';
import { openSbcChallenges } from '@/lib/selectors';
import { sbcFace, sbcTileTheme } from '@/lib/sbcTileTheme';
import { useApp } from '@/lib/store';
import type { SbcChallenge } from '@/lib/types';

function rowsOf<T>(items: T[], columns: number) {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += columns) rows.push(items.slice(index, index + columns));
  return rows;
}

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function compactRemaining(iso: string | null, now: number) {
  if (!iso) return '';
  const diff = new Date(iso).getTime() - now;
  if (Number.isNaN(diff) || diff <= 0) return '';
  const minutes = Math.floor(diff / 60_000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days}d${hours ? ` ${hours}h` : ''}`;
  if (hours > 0) return `${hours}h${mins ? ` ${mins}m` : ''}`;
  return `${Math.max(1, mins)}m`;
}

function formatCoins(value: number | null | undefined) {
  if (!value || value <= 0) return '';
  if (value >= 1000) {
    const k = value / 1000;
    return `≈${Number.isInteger(k) ? k.toString() : k.toFixed(1)}K`;
  }
  return `≈${value.toLocaleString('en-US')}`;
}

function SbcHeroShell({ width }: { width: number }) {
  const height = Math.round(width * 1.35);
  return (
    <View style={{ width, height, borderRadius: width * 0.13, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,224,140,0.72)', shadowColor: '#D8A93A', shadowOpacity: 0.42, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 8 }}>
      <LinearGradient colors={['#120D24', '#4B2A6D', '#D0A43C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, padding: 7 }}>
        <View style={{ flex: 1, borderRadius: width * 0.10, overflow: 'hidden', backgroundColor: 'rgba(17,10,31,0.72)', borderWidth: 1, borderColor: 'rgba(255,233,169,0.34)' }}>
          <Text style={{ color: '#FFF0B5', fontSize: Math.max(9, width * 0.11), fontWeight: '900', textAlign: 'center', marginTop: 6, letterSpacing: 1.5 }}>HERO</Text>
          <Text style={{ color: 'rgba(255,255,255,0.56)', fontSize: Math.max(5, width * 0.048), fontWeight: '800', textAlign: 'center', marginTop: 1, letterSpacing: 0.8 }}>BASE • MAX 86</Text>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: width * 0.52, height: width * 0.62, borderRadius: width * 0.25, borderWidth: 2, borderColor: 'rgba(255,229,152,0.20)', backgroundColor: 'rgba(255,219,125,0.05)', transform: [{ rotate: '-4deg' }] }} />
            <View style={{ position: 'absolute', width: width * 0.76, height: 1, backgroundColor: 'rgba(255,239,183,0.24)', transform: [{ rotate: '-26deg' }] }} />
          </View>
          <Text style={{ color: 'rgba(255,239,183,0.55)', fontSize: Math.max(5, width * 0.046), fontWeight: '800', textAlign: 'center', paddingBottom: 7 }}>EMPTY HERO CARD</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

function PatatiSbcCard({ width }: { width: number }) {
  const height = Math.round(width * 1.35);
  return (
    <View style={{ width, height, borderRadius: width * 0.13, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(242,207,93,0.72)', shadowColor: '#8F3A49', shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 8 }}>
      <LinearGradient colors={['#1E0E1A', '#7B2639', '#C79B37']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, padding: 6 }}>
        <View style={{ flex: 1, borderRadius: width * 0.10, overflow: 'hidden', backgroundColor: 'rgba(18,11,17,0.72)' }}>
          <View style={{ position: 'absolute', top: 5, left: 5, zIndex: 3 }}>
            <Text style={{ color: '#FFF0B5', fontSize: Math.max(11, width * 0.15), fontWeight: '900' }}>84</Text>
            <Text style={{ color: '#F7EAC8', fontSize: Math.max(6, width * 0.06), fontWeight: '900' }}>RW</Text>
          </View>
          <Image source={{ uri: 'https://www.az.nl/media/rwqf013h/smiling-soccer-player-in-red-29082025114432.png?height=584&rxy=0.44428969359331477%2C0.003865979381443299&v=1dc1b257ac4ccd0&width=584' }} resizeMode="contain" style={{ width: '100%', height: '60%', marginTop: 8 }} />
          <Text numberOfLines={1} style={{ color: '#FFF9E7', fontSize: Math.max(8, width * 0.084), fontWeight: '900', letterSpacing: 0.6, textAlign: 'center' }}>PATATI</Text>
          <Text style={{ color: 'rgba(255,243,211,0.64)', fontSize: Math.max(5, width * 0.043), fontWeight: '800', textAlign: 'center', marginTop: 1 }}>SQUAD FOUNDATIONS</Text>
          <View style={{ flexDirection: 'row', paddingHorizontal: 4, paddingTop: 4 }}>
            {[
              ['PAC', 90], ['SHO', 82], ['PAS', 77],
              ['DRI', 84], ['DEF', 40], ['PHY', 75],
            ].map(([label, value]) => (
              <View key={String(label)} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: 'rgba(255,239,202,0.62)', fontSize: Math.max(4, width * 0.037), fontWeight: '800' }}>{label}</Text>
                <Text style={{ color: '#FFF9E7', fontSize: Math.max(6, width * 0.055), fontWeight: '900' }}>{value}</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const PLAYER_REWARD: Record<string, number> = {
  'sbc-nusa': require('@/assets/images/cards/nusa-destined.png'),
  'sbc-veiga': require('@/assets/images/cards/veiga-destined.png'),
};

const SBC_PLAYER_CARDS: Record<string, { player: FcPlayer; photo: string }> = {
  'sbc-potm-olise': {
    player: { id: 'sbc-card-olise', name: 'אוליסה', en: 'Michael Olise', rating: 91, position: 'RW', nation: 'צרפת', league: 'Bundesliga', club: 'Bayern',
      face: { ovr: 91, pac: 84, sho: 83, pas: 90, dri: 92, def: 48, phy: 70 } },
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Michael_Olise_France_v_Senegal_16_June_2026-307_%28cropped%29.jpg/500px-Michael_Olise_France_v_Senegal_16_June_2026-307_%28cropped%29.jpg',
  },
  'sbc-potm-raphinha': {
    player: { id: 'sbc-card-raphinha', name: 'ראפיניה', en: 'Raphinha', rating: 89, position: 'ST', nation: 'ברזיל', league: 'LaLiga', club: 'Barcelona',
      face: { ovr: 89, pac: 92, sho: 87, pas: 86, dri: 88, def: 55, phy: 77 } },
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Raphinha_Brazil_V_Morocco_13_June_2026-133_%28cropped%29.jpg/500px-Raphinha_Brazil_V_Morocco_13_June_2026-133_%28cropped%29.jpg',
  },
  'sbc-potm-pina': {
    player: { id: 'ea-262531-claudia-pina', name: 'קלאודיה פינה', en: 'Claudia Pina', rating: 89, position: 'LW', nation: 'ספרד', league: 'Liga F Moeve', club: 'ברצלונה',
      face: { ovr: 89, pac: 91, sho: 89, pas: 84, dri: 88, def: 45, phy: 73 } },
    photo: 'https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p262531.png',
  },
  'sbc-dfg-tarciane': {
    player: { id: 'sbc-card-tarciane', name: 'טארסיאני', en: 'Tarciane', rating: 84, position: 'CB', nation: 'ברזיל', league: 'NWSL', club: 'Houston Dash',
      face: { ovr: 84, pac: 80, sho: 45, pas: 74, dri: 70, def: 84, phy: 87 } },
    photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dash%20preseason%202025%20-%2013.jpg',
  },
  'sbc-dfg-akliouche': {
    player: { id: 'sbc-card-akliouche', name: 'אקליוש', en: 'Maghnes Akliouche', rating: 85, position: 'CAM', nation: 'צרפת', league: 'Ligue 1', club: 'Monaco',
      face: { ovr: 85, pac: 84, sho: 83, pas: 86, dri: 89, def: 55, phy: 70 } },
    photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/Maghnes%20Akliouche%20France%20v%20Senegal%2016%20June%202026-512.jpg',
  },
  'sbc-potm-gross': {
    player: { id: 'sbc-card-gross', name: 'גרוס', en: 'Pascal Groß', rating: 84, position: 'CDM', nation: 'גרמניה', league: 'Premier League', club: 'Brighton',
      face: { ovr: 84, pac: 76, sho: 79, pas: 88, dri: 83, def: 77, phy: 79 } },
    photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pascal%20Gross%20Ecuador%20v%20Germany%2025%20June%202026-065.jpg',
  },
  'sbc-potm-malen': {
    player: { id: 'sbc-card-malen', name: 'מאלן', en: 'Donyell Malen', rating: 85, position: 'ST', nation: 'הולנד', league: 'Serie A', club: 'Roma',
      face: { ovr: 85, pac: 87, sho: 85, pas: 75, dri: 86, def: 39, phy: 70 } },
    photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/Netherlands%20v%20Tunisia%202026%20World%20Cup%20-%2055374906960.jpg',
  },
  'sbc-dfg-frattesi': {
    player: { id: 'sbc-card-frattesi', name: 'פרטסי', en: 'Davide Frattesi', rating: 84, position: 'CM', nation: 'איטליה', league: 'Serie A', club: 'Inter',
      face: { ovr: 84, pac: 84, sho: 81, pas: 81, dri: 84, def: 77, phy: 78 } },
    photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/Norway%20Italy%20-%20June%202025%20D%2048.jpg',
  },
};

function SideMark({ club, nation, size }: { club?: string; nation?: string; size: number }) {
  if (nation) return <NationFlag nation={nation} size={size} />;
  if (club) return <ClubBadge club={club} size={size} />;
  return <View style={{ width: size, height: size }} />;
}

function SbcTile({
  challenge,
  now,
  onPress,
}: {
  challenge: SbcChallenge;
  now: number;
  onPress: () => void;
}) {
  const theme = sbcTileTheme(challenge);
  const face = sbcFace(challenge);
  const nations = challenge.nations ?? [];
  const clubs = challenge.clubs ?? [];
  const leftNation = nations[0];
  const rightNation = nations[1];
  const leftClub = nations.length ? undefined : clubs[0];
  const rightClub = nations.length ? undefined : clubs[1];
  const remaining = compactRemaining(challenge.endsAt, now);
  const legacyPlayerCard = PLAYER_REWARD[challenge.id];
  const playerCard = SBC_PLAYER_CARDS[challenge.id];
  const estimatedCost = formatCoins(challenge.estimatedCostCoins);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 118,
        backgroundColor: 'rgba(8,10,14,0.92)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
        overflow: 'visible',
      }}
    >
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', direction: 'ltr' }}>
        <View style={{ width: 5, alignSelf: 'stretch', backgroundColor: face.edge }} />
        <View style={{ width: 58, alignItems: 'center', justifyContent: 'center' }}>
          <SideMark club={leftClub} nation={leftNation} size={36} />
        </View>
        <View style={{ flex: 1, gap: 2, paddingVertical: 12, minWidth: 0 }}>
          <Text style={{ color: '#C9A227', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 }}>{face.category}</Text>
          <Text numberOfLines={1} style={{ color: '#F7F8FA', fontSize: 20, fontWeight: '800' }}>
            {face.en}
          </Text>
          <Text numberOfLines={1} style={{ color: 'rgba(255,255,255,0.62)', fontSize: 13, fontWeight: '700', textAlign: 'right' }}>
            {face.he}
          </Text>
          {remaining ? <Text style={{ color: '#E7C56A', fontSize: 12, fontWeight: '900', marginTop: 4 }}>נשאר {remaining}</Text> : null}
          {estimatedCost ? <Text style={{ color: '#E8E1C9', fontSize: 11, fontWeight: '900', marginTop: 2 }}>{estimatedCost} מטבעות</Text> : null}
        </View>
        <View style={{ width: 58, alignItems: 'center', justifyContent: 'center' }}>
          <SideMark club={rightClub} nation={rightNation} size={36} />
        </View>
        <View style={{ marginRight: 8, width: 88, alignItems: 'center', justifyContent: 'center' }}>
          {challenge.id === 'sbc-max-86-base-hero-upgrade' ? (
            <SbcHeroShell width={84} />
          ) : challenge.id === 'sbc-patati-foundations' ? (
            <PatatiSbcCard width={84} />
          ) : legacyPlayerCard ? (
            <Image source={legacyPlayerCard} resizeMode="contain" accessibilityIgnoresInvertColors style={{ width: 70, height: 92 }} />
          ) : playerCard ? (
            <PortraitCard
              player={playerCard.player}
              width={70}
              edition="base"
              photoOverride={playerCard.photo}
              faceOverride={playerCard.player.face}
              compactStats
            />
          ) : (
            <SbcRewardPack visual={theme.pack} size={58} label={theme.packLabel} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function SbcScreen() {
  const app = useApp();
  const router = useRouter();
  const now = useNow();
  const width = useWindowDimensions().width;
  const columns = width >= 760 ? 2 : 1;
  const challenges = openSbcChallenges(app.sbcChallenges, now);
  const rows = rowsOf(challenges, columns);
  return (
    <Screen refreshing={app.busy} onRefresh={app.refresh} scene="sbc" maxWidth={1080}>
      <View style={{ width: '100%', direction: 'rtl', alignItems: 'flex-start', paddingTop: 4 }}>
        <Text style={{ width: '100%', color: '#F7F8FA', fontSize: 38, fontWeight: '900', letterSpacing: 1, textAlign: 'right' }}>SBC</Text>
        <Text style={{ width: '100%', color: 'rgba(244,247,242,0.55)', fontSize: 12, fontWeight: '700', textAlign: 'right' }}>
          החדשים ביותר למעלה · SBC שפג תוקפו מוסר אוטומטית
        </Text>
      </View>
      <Pressable accessibilityRole="button" onPress={() => router.push('/sbc/calculator')} style={{ width: '100%', alignItems: 'flex-start' }}>
        <Text style={{ color: '#E3B341', fontWeight: '800', textAlign: 'right', width: '100%' }}>מחשבון Streamlined</Text>
      </Pressable>
      {app.user?.isAdmin ? <Button label="אתגר SBC חדש" variant="ghost" onPress={() => router.push('/sbc/new')} /> : null}
      {!challenges.length ? <Muted>אין כרגע SBC פעילים.</Muted> : null}
      {rows.map((row, rowIndex) => (
        <View
          key={row.map((item) => item.id).join('-')}
          style={{ flexDirection: 'row-reverse', gap: 14, alignItems: 'stretch', paddingHorizontal: width >= 700 ? 8 : 0 }}
        >
          {row.map((challenge) => (
            <SbcTile
              key={challenge.id}
              challenge={challenge}
              now={now}
              onPress={() => router.push(`/sbc/${challenge.id}`)}
            />
          ))}
          {Array.from({ length: columns - row.length }).map((_, index) => (
            <View key={`pad-${rowIndex}-${index}`} style={{ flex: 1 }} />
          ))}
        </View>
      ))}
    </Screen>
  );
}
