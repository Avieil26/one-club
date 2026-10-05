import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ClubBadge } from '@/components/ClubBadge';
import { NationFlag } from '@/components/NationFlag';
import { SbcRewardPack } from '@/components/SbcRewardPack';
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

type SbcPlayerCardData = {
  rating: number;
  position: string;
  name: string;
  photo: string;
  stats: [number, number, number, number, number, number];
};

// Current FC27 player SBC rewards. The card is rendered into the exact same
// 70x92 slot previously occupied by the pack artwork.
const SBC_PLAYER_CARDS: Record<string, SbcPlayerCardData> = {
  'sbc-potm-olise': {
    rating: 91, position: 'RW', name: 'OLISE',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Michael_Olise_France_v_Senegal_16_June_2026-307_%28cropped%29.jpg/500px-Michael_Olise_France_v_Senegal_16_June_2026-307_%28cropped%29.jpg',
    stats: [84, 83, 90, 92, 48, 70],
  },
  'sbc-potm-raphinha': {
    rating: 89, position: 'ST', name: 'RAPHINHA',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Raphinha_Brazil_V_Morocco_13_June_2026-133_%28cropped%29.jpg/500px-Raphinha_Brazil_V_Morocco_13_June_2026-133_%28cropped%29.jpg',
    stats: [92, 87, 86, 88, 55, 77],
  },
  'sbc-dfg-tarciane': {
    rating: 84, position: 'CB', name: 'TARCIANE',
    photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dash%20preseason%202025%20-%2013.jpg',
    stats: [80, 45, 74, 70, 84, 87],
  },
  'sbc-dfg-akliouche': {
    rating: 85, position: 'CAM', name: 'AKLIOUCHE',
    photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/Maghnes%20Akliouche%20France%20v%20Senegal%2016%20June%202026-512.jpg',
    stats: [84, 83, 86, 89, 55, 70],
  },
  'sbc-potm-gross': {
    rating: 84, position: 'CDM', name: 'GROSS',
    photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pascal%20Gross%20Ecuador%20v%20Germany%2025%20June%202026-065.jpg',
    stats: [76, 79, 88, 83, 77, 79],
  },
  'sbc-potm-malen': {
    rating: 85, position: 'ST', name: 'MALEN',
    photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/Netherlands%20v%20Tunisia%202026%20World%20Cup%20-%2055374906960.jpg',
    stats: [87, 85, 75, 86, 39, 70],
  },
  'sbc-dfg-frattesi': {
    rating: 84, position: 'CM', name: 'FRATTESI',
    photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/Norway%20Italy%20-%20June%202025%20D%2048.jpg',
    stats: [84, 81, 81, 84, 77, 78],
  },
};

const SBC_STAT_LABELS = ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'];

const PLAYER_REWARD: Record<string, number> = {
  'sbc-nusa': require('@/assets/images/cards/nusa-destined.png'),
  'sbc-veiga': require('@/assets/images/cards/veiga-destined.png'),
};

function SbcPlayerCard({ data }: { data: SbcPlayerCardData }) {
  return (
    <View
      style={{
        width: 70,
        height: 92,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1.2,
        borderColor: '#D7B64C',
        backgroundColor: '#081214',
        shadowColor: '#000',
        shadowOpacity: 0.42,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 5,
      }}
    >
      <LinearGradient
        colors={['#0B2926', '#123F3B', '#0B1719', '#6E5314']}
        locations={[0, 0.38, 0.72, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.8 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 22 }}
      />
      <View style={{ position: 'absolute', top: 4, left: 5, zIndex: 5 }}>
        <Text style={{ color: '#FFF3CA', fontSize: 15, lineHeight: 15, fontWeight: '900' }}>{data.rating}</Text>
        <Text style={{ color: '#FFF3CA', fontSize: 7.5, lineHeight: 8, fontWeight: '900', letterSpacing: 0.4 }}>{data.position}</Text>
      </View>
      <View
        style={{
          position: 'absolute',
          top: 2,
          right: 2,
          width: 56,
          height: 56,
          borderTopRightRadius: 8,
          borderBottomLeftRadius: 24,
          overflow: 'hidden',
          opacity: 0.98,
        }}
      >
        <Image
          source={{ uri: data.photo }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          style={{ width: 56, height: 56, backgroundColor: 'rgba(0,0,0,0.08)' }}
        />
      </View>
      <View
        style={{
          position: 'absolute',
          left: 4,
          right: 4,
          bottom: 3,
          paddingTop: 4,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,241,188,0.42)',
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            color: '#FFF9E7',
            fontSize: 7.2,
            lineHeight: 8,
            fontWeight: '900',
            textAlign: 'center',
            letterSpacing: 0.45,
          }}
        >
          {data.name}
        </Text>
        <View style={{ marginTop: 3, gap: 1.5 }}>
          {[0, 1].map((row) => (
            <View key={row} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {[0, 1, 2].map((col) => {
                const index = row * 3 + col;
                return (
                  <View key={index} style={{ width: 19.2, alignItems: 'center' }}>
                    <Text style={{ color: 'rgba(255,249,231,0.7)', fontSize: 4.1, lineHeight: 5, fontWeight: '800' }}>
                      {SBC_STAT_LABELS[index]}
                    </Text>
                    <Text style={{ color: '#FFF9E7', fontSize: 7.2, lineHeight: 7.5, fontWeight: '900' }}>
                      {data.stats[index]}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
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
            <SbcPlayerCard data={playerCard} />
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
