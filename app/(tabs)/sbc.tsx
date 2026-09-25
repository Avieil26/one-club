import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';

import { ClubBadge } from '@/components/ClubBadge';
import { SbcChallengeBadge, SbcRewardPack } from '@/components/SbcRewardPack';
import { Button, Muted, Screen, Title } from '@/components/ui';
import { formatRemaining } from '@/lib/format';
import { openSbcChallenges } from '@/lib/selectors';
import { sbcTileTheme } from '@/lib/sbcTileTheme';
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

function SbcTile({
  challenge,
  solutionCount,
  now,
  onPress,
}: {
  challenge: SbcChallenge;
  solutionCount: number;
  now: number;
  onPress: () => void;
}) {
  const theme = sbcTileTheme(challenge);
  const [group, name] = challenge.title.includes(' · ') ? challenge.title.split(' · ') : ['', challenge.title];
  const clubs = challenge.clubs ?? [];
  const remaining = formatRemaining(challenge.endsAt, now);
  const urgent = Boolean(challenge.endsAt) && new Date(challenge.endsAt!).getTime() - now < 24 * 60 * 60 * 1000;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
        shadowColor: theme.accent,
        shadowOpacity: 0.18,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}
    >
      <LinearGradient
        colors={theme.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ minHeight: 122, padding: 8, gap: 5, direction: 'ltr' }}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.12)', 'transparent', 'rgba(0,0,0,0.2)']}
          locations={[0, 0.45, 1]}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {theme.badgeText ? (
            <SbcChallengeBadge text={theme.badgeText} tone={theme.badgeTone} size={38} />
          ) : clubs.length ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <ClubBadge club={clubs[clubs.length - 1]} size={28} />
              {clubs.length > 1 ? <ClubBadge club={clubs[0]} size={28} /> : null}
            </View>
          ) : (
            <View
              style={{
                paddingHorizontal: 7,
                paddingVertical: 3,
                borderRadius: 7,
                backgroundColor: 'rgba(0,0,0,0.28)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.16)',
              }}
            >
              <Text style={{ color: theme.accent, fontSize: 9, fontWeight: '800', letterSpacing: 0.6 }}>
                {challenge.kind === 'streamlined' ? 'STREAM' : 'CLASSIC'}
              </Text>
            </View>
          )}
          <SbcRewardPack visual={theme.pack} size={34} label={theme.packLabel} />
        </View>

        <View style={{ gap: 2, alignItems: 'flex-end', marginTop: 'auto' }}>
          {group ? <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700' }}>{group}</Text> : null}
          <Text style={{ color: '#F7F8FA', fontSize: 14, fontWeight: '800', textAlign: 'right' }}>{name}</Text>
          {challenge.reward ? (
            <Text style={{ color: theme.accent, fontSize: 11, fontWeight: '800', textAlign: 'right' }}>{challenge.reward}</Text>
          ) : null}
          <Text
            style={{
              color: urgent ? '#FFE08A' : 'rgba(255,255,255,0.88)',
              fontSize: 11,
              fontWeight: '800',
              textAlign: 'right',
            }}
          >
            {challenge.endsAt ? `נשאר: ${remaining}` : remaining}
          </Text>
          {challenge.kind === 'classic' ? (
            <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 10, fontWeight: '700', textAlign: 'right' }}>
              {solutionCount ? `${solutionCount} פתרונות` : 'עדיין אין פתרונות'}
            </Text>
          ) : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function SbcScreen() {
  const app = useApp();
  const router = useRouter();
  const now = useNow();
  const width = useWindowDimensions().width;
  const columns = width >= 980 ? 3 : 2;
  const challenges = openSbcChallenges(app.sbcChallenges, now);
  const rows = rowsOf(challenges, columns);
  const solutionCounts = app.solutions.reduce<Record<string, number>>((acc, solution) => {
    if (solution.status !== 'approved') return acc;
    acc[solution.challengeId] = (acc[solution.challengeId] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Screen refreshing={app.busy} onRefresh={app.refresh} scene="sbc" maxWidth={920}>
      <Title>SBC</Title>
      <Muted>כל אתגר בצבע שלו. כשהזמן נגמר — האתגר יורד אוטומטית.</Muted>
      <Button label="מחשבון Streamlined" variant="copper" onPress={() => router.push('/sbc/calculator')} />
      {app.user?.isAdmin ? <Button label="אתגר SBC חדש" variant="ghost" onPress={() => router.push('/sbc/new')} /> : null}
      {!challenges.length ? <Muted>אין כרגע SBC פעילים.</Muted> : null}
      {rows.map((row, rowIndex) => (
        <View
          key={row.map((item) => item.id).join('-')}
          style={{ flexDirection: 'row-reverse', gap: 12, alignItems: 'stretch', paddingHorizontal: width >= 700 ? 12 : 0 }}
        >
          {row.map((challenge) => (
            <SbcTile
              key={challenge.id}
              challenge={challenge}
              solutionCount={solutionCounts[challenge.id] ?? 0}
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
