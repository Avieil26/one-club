import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { careerFont } from '@/lib/careerCardTheme';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { useApp } from '@/lib/store';

type Row = {
  userId: string;
  wins: number;
  losses: number;
  cqp: number;
  rank: number | null;
};

function monthStartIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export function ChampionsLeaderboard() {
  const app = useApp();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    getSupabase()
      .from('champions_runs')
      .select('user_id,wins,losses,cqp,rank')
      .gte('updated_at', monthStartIso())
      .order('cqp', { ascending: false })
      .order('wins', { ascending: false })
      .order('losses', { ascending: true })
      .limit(10)
      .then(({ data, error }) => {
        if (!alive) return;
        setRows(
          error
            ? []
            : (data ?? []).map((row) => ({
                userId: row.user_id,
                wins: Number(row.wins) || 0,
                losses: Number(row.losses) || 0,
                cqp: Number(row.cqp) || 0,
                rank: row.rank == null ? null : Number(row.rank),
              })),
        );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <View style={styles.panel}>
      <Text style={styles.kicker}>CHAMPIONS LEADERBOARD</Text>
      <Text style={styles.title}>טבלת החודש</Text>
      <Text style={styles.subtitle}>מדורגת לפי CQP, ואז לפי ניצחונות. מתחלפת בתחילת כל חודש.</Text>
      {loading ? (
        <View style={styles.loading}><ActivityIndicator color="#E8C46A" /></View>
      ) : rows.length ? (
        <View style={{ gap: 5 }}>
          {rows.map((row, index) => {
            const profile = app.profiles.find((item) => item.id === row.userId);
            const mine = row.userId === app.user?.id;
            return (
              <View key={row.userId} style={[styles.row, mine && styles.rowMine]}>
                <Text style={styles.place}>{index + 1}</Text>
                <View style={styles.nameBlock}>
                  <Text numberOfLines={1} style={styles.name}>{profile?.displayName ?? 'שחקן'}{mine ? ' · אתה' : ''}</Text>
                  <Text style={styles.record}>{row.wins}-{row.losses}{row.rank != null ? ' · ' + row.rank : ''}</Text>
                </View>
                <Text style={styles.cqp}>{row.cqp.toLocaleString('en-US')}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={styles.empty}>עדיין אין תוצאות Champions החודש.</Text>
      )}
    </View>
  );
}

const styles = {
  panel: { borderRadius: 18, padding: 13, backgroundColor: '#0A1116', borderWidth: 1, borderColor: 'rgba(216,47,66,.20)', marginTop: 12 },
  kicker: { color: '#E14A59', fontFamily: careerFont, fontSize: 9, fontWeight: '900' as const, letterSpacing: 1.2, textAlign: 'right' as const },
  title: { color: '#EEF2F5', fontFamily: careerFont, fontSize: 24, fontWeight: '900' as const, textAlign: 'right' as const, marginTop: 2 },
  subtitle: { color: '#78838D', fontFamily: careerFont, fontSize: 11, fontWeight: '700' as const, lineHeight: 17, textAlign: 'right' as const, marginTop: 4, marginBottom: 9 },
  loading: { paddingVertical: 18, alignItems: 'center' as const },
  row: { minHeight: 52, borderRadius: 11, paddingHorizontal: 9, flexDirection: 'row-reverse' as const, alignItems: 'center' as const, gap: 9, backgroundColor: 'rgba(255,255,255,.025)' },
  rowMine: { backgroundColor: 'rgba(235,201,98,.08)', borderWidth: 1, borderColor: 'rgba(235,201,98,.20)' },
  place: { width: 24, color: '#BEC7CF', fontFamily: careerFont, fontSize: 14, fontWeight: '900' as const, textAlign: 'center' as const },
  nameBlock: { flex: 1, minWidth: 0 },
  name: { color: '#F2F5F7', fontFamily: careerFont, fontSize: 12, fontWeight: '900' as const, textAlign: 'right' as const },
  record: { color: '#77828C', fontFamily: careerFont, fontSize: 9, fontWeight: '800' as const, textAlign: 'right' as const, marginTop: 2 },
  cqp: { color: '#E9CB64', fontFamily: careerFont, fontSize: 15, fontWeight: '900' as const, width: 58, textAlign: 'left' as const },
  empty: { color: '#77828C', fontFamily: careerFont, fontSize: 12, fontWeight: '700' as const, textAlign: 'right' as const, paddingVertical: 8 },
};