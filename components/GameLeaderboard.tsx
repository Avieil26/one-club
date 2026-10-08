import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { careerFont } from '@/lib/careerCardTheme';
import { currentGamePeriod, GAME_LABELS, loadGameLeaderboard, type GameId, type GameLeaderboardRow } from '@/lib/gameScores';
import { useApp } from '@/lib/store';

const GAME_IDS: GameId[] = ['who', 'grid', 'club', 'draft'];
const CREAM = '#F6F1E4';
const GOLD = '#E8C46A';

function periodLabel(period: string) {
  const parts = period.split('-').map(Number);
  const value = new Date(parts[0], parts[1] - 1, 1);
  return value.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
}

export function GameLeaderboard() {
  const app = useApp();
  const [game, setGame] = useState<GameId>('who');
  const [rows, setRows] = useState<GameLeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const period = useMemo(() => currentGamePeriod(), []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    loadGameLeaderboard(game, period)
      .then((next) => {
        if (alive) setRows(next);
      })
      .catch(() => {
        if (alive) setRows([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [game, period]);

  const nextMonth = new Date(Number(period.slice(0, 4)), Number(period.slice(5, 7)), 1).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <View style={styles.panel}>
      <Text style={styles.kicker}>LEADERBOARD</Text>
      <Text style={styles.title}>טבלת החודש</Text>
      <Text style={styles.subtitle}>{periodLabel(period)} · מתחלפת אוטומטית ב־{nextMonth}</Text>

      <View style={styles.tabs}>
        {GAME_IDS.map((id) => {
          const active = id === game;
          return (
            <Pressable
              key={id}
              accessibilityRole="button"
              onPress={() => setGame(id)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{GAME_LABELS[id]}</Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={GOLD} />
        </View>
      ) : rows.length ? (
        <View style={{ gap: 4 }}>
          {rows.map((row, index) => {
            const profile = app.profiles.find((item) => item.id === row.userId);
            const mine = row.userId === app.user?.id;
            return (
              <Pressable
                key={row.userId}
                disabled={!profile}
                onPress={() => profile && undefined}
                style={[styles.row, mine && styles.rowMine]}
              >
                <Text style={styles.place}>{index + 1}</Text>
                <View style={styles.nameBlock}>
                  <Text numberOfLines={1} style={styles.name}>
                    {profile?.displayName ?? 'שחקן'}{mine ? ' · אתה' : ''}
                  </Text>
                </View>
                <Text style={styles.score}>{row.score.toLocaleString('en-US')}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Text style={styles.empty}>עדיין אין תוצאות בטבלה הזאת החודש.</Text>
      )}

      {!app.user ? <Text style={styles.note}>התחברו כדי שהשיא שלכם יישמר בטבלת החודש.</Text> : null}
    </View>
  );
}

const styles = {
  panel: {
    marginTop: 8,
    borderRadius: 22,
    padding: 16,
    backgroundColor: 'rgba(16,10,14,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(232,196,106,0.28)',
    gap: 12,
  },
  kicker: { color: GOLD, fontFamily: careerFont, fontSize: 12, fontWeight: '900' as const, letterSpacing: 1.1, textAlign: 'right' as const },
  title: { color: CREAM, fontFamily: careerFont, fontSize: 26, fontWeight: '900' as const, textAlign: 'right' as const },
  subtitle: { color: 'rgba(246,241,228,0.68)', fontFamily: careerFont, fontSize: 13, textAlign: 'right' as const },
  tabs: { flexDirection: 'row-reverse' as const, flexWrap: 'wrap' as const, gap: 6 },
  tab: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  tabActive: { backgroundColor: GOLD, borderColor: GOLD },
  tabText: { color: CREAM, fontFamily: careerFont, fontSize: 12, fontWeight: '900' as const },
  tabTextActive: { color: '#2A0A12' },
  loading: { paddingVertical: 22, alignItems: 'center' as const },
  row: { minHeight: 52, borderRadius: 12, paddingHorizontal: 10, flexDirection: 'row-reverse' as const, alignItems: 'center' as const, gap: 10, backgroundColor: 'rgba(255,255,255,0.025)' },
  rowMine: { backgroundColor: 'rgba(232,196,106,0.12)', borderWidth: 1, borderColor: 'rgba(232,196,106,0.28)' },
  place: { width: 26, color: GOLD, fontFamily: careerFont, fontSize: 15, fontWeight: '900' as const, textAlign: 'center' as const },
  nameBlock: { flex: 1, minWidth: 0 },
  name: { color: CREAM, fontFamily: careerFont, fontSize: 14, fontWeight: '900' as const, textAlign: 'right' as const },
  score: { color: GOLD, fontFamily: careerFont, fontSize: 16, fontWeight: '900' as const },
  empty: { color: 'rgba(246,241,228,0.68)', fontFamily: careerFont, fontSize: 14, textAlign: 'right' as const, paddingVertical: 8 },
  note: { color: 'rgba(246,241,228,0.58)', fontFamily: careerFont, fontSize: 12, textAlign: 'right' as const },
};