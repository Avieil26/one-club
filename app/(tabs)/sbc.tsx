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
  const height = Math.round(width * 1.48);
  return (
    <View style={{ width, height, borderRadius: width * 0.14, overflow: 'hidden', borderWidth: 1.5, borderColor: '#C9F7EA', shadowColor: '#43E0BF', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 7 }}>
      <LinearGradient
        colors={['#120E28', '#30205A', '#7557A8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, padding: 5 }}
      >
        <View style={{ flex: 1, borderRadius: width * 0.105, overflow: 'hidden', backgroundColor: 'rgba(8,10,20,0.45)', borderWidth: 1, borderColor: 'rgba(237,224,255,0.25)' }}>
          <View style={{ position: 'absolute', top: -width * 0.08, right: -width * 0.12, width: width * 0.66, height: width * 0.66, borderRadius: width, borderWidth: 1, borderColor: 'rgba(220,210,255,0.14)' }} />
          <View style={{ position: 'absolute', top: height * 0.12, left: -width * 0.28, width: width * 1.25, height: 1, backgroundColor: 'rgba(168,247,228,0.22)', transform: [{ rotate: '-28deg' }] }} />
          <Text style={{ color: '#FFFFFF', fontSize: Math.max(8, width * 0.11), fontWeight: '900', textAlign: 'center', letterSpacing: 1.2, marginTop: 7 }}>
            HERO
          </Text>
          <Text style={{ color: 'rgba(228,220,255,0.68)', fontSize: Math.max(5, width * 0.048), fontWeight: '800', textAlign: 'center', letterSpacing: 1 }}>
            MAX 86
          </Text>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: width * 0.43, height: width * 0.48, borderRadius: width * 0.16, borderWidth: 1.5, borderColor: 'rgba(221,246,255,0.18)', backgroundColor: 'rgba(170,237,255,0.035)', transform: [{ rotate: '-7deg' }] }} />
            <View style={{ position: 'absolute', width: width * 0.9, height: 1.5, backgroundColor: 'rgba(242,231,255,0.12)', transform: [{ rotate: '-31deg' }] }} />
            <Text style={{ position: 'absolute', color: 'rgba(239,234,255,0.76)', fontSize: Math.max(6, width * 0.055), fontWeight: '900', letterSpacing: 0.8 }}>
              BASE HERO PACK
            </Text>
          </View>
          <View style={{ alignItems: 'center', paddingBottom: 7 }}>
            <Text style={{ color: '#9FF5DB', fontSize: Math.max(5, width * 0.045), fontWeight: '900', letterSpacing: 0.9 }}>
              UNTRADEABLE
            </Text>
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
        <View style={{ marginRight: 6, width: 86, alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
          {challenge.id === 'sbc-max-86-base-hero-upgrade' ? (
            <SbcHeroShell width={76} />
          ) : challenge.id === 'sbc-patati-foundations' ? (
            <PortraitCard
              player={{
                id: 'patati--foundations',
                name: 'Patati',
                en: 'Weslley Patati',
                rating: 84,
                position: 'RW',
                nation: 'ברזיל',
                league: 'Eredivisie',
                club: 'AZ',
                edition: 'squadFoundations',
                face: { ovr: 84, pac: 90, sho: 82, pas: 77, dri: 84, def: 40, phy: 75 },
              }}
              width={74}
              edition="squadFoundations"
              compactStats
            />
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
