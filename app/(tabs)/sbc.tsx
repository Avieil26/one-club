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
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(hours / 24);
  if (days >= 1) return `${days}d`;
  if (hours >= 1) return `${hours}h`;
  return `${Math.max(1, Math.floor(diff / 60_000))}m`;
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
          {remaining ? <Text style={{ color: '#E7C56A', fontSize: 12, fontWeight: '800', marginTop: 4 }}>{remaining}</Text> : null}
        </View>
        <View style={{ width: 58, alignItems: 'center', justifyContent: 'center' }}>
          <SideMark club={rightClub} nation={rightNation} size={36} />
        </View>
        <View style={{ marginRight: 8, width: 72, alignItems: 'center', justifyContent: 'center' }}>
          {legacyPlayerCard ? (
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
  const challenges = openSbcChallenges(app.sbcChallenges, now).sort((a, b) => sbcFace(a).rank - sbcFace(b).rank);
  const rows = rowsOf(challenges, columns);
  return (
    <Screen refreshing={app.busy} onRefresh={app.refresh} scene="sbc" maxWidth={1080}>
      <View style={{ width: '100%', direction: 'rtl', alignItems: 'flex-start', paddingTop: 4 }}>
        <Text style={{ width: '100%', color: '#F7F8FA', fontSize: 38, fontWeight: '900', letterSpacing: 1, textAlign: 'right' }}>SBC</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={() => router.push('/sbc/calculator')} style={{ width: '100%', alignItems: 'flex-start' }}>
        <Text style={{ color: '#E3B341', fontWeight: '800', textAlign: 'right', width: '100%' }}>מחשבון Streamlined</Text>
      </Pressable>
      <Muted>מרקי מאצ׳אפס עד 1 באוקטובר. סיום כל ארבעת המשחקים נותן חבילת זהב גדולה.</Muted>
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
