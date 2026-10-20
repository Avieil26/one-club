import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { SbcRewardVisual } from '@/components/SbcRewardVisual';
import { Button, Muted, Screen } from '@/components/ui';
import { openSbcChallenges } from '@/lib/selectors';
import { SBC_AUDIT_CHECKED_AT } from '@/lib/sbcLive20261020';
import { sbcFace } from '@/lib/sbcTileTheme';
import { useApp } from '@/lib/store';
import type { SbcChallenge } from '@/lib/types';
import { useLanguage } from '@/lib/language';

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

function SbcTile({ challenge, now, onPress }: { challenge: SbcChallenge; now: number; onPress: () => void }) {
 const viewportWidth = useWindowDimensions().width;
 const { language, t } = useLanguage(); const rtl = language === 'he'; const face = sbcFace(challenge); const remaining = compactRemaining(challenge.endsAt, now);
 return <Pressable accessibilityRole="button" accessibilityLabel={face.en} onPress={onPress} style={{ flex: 1, minWidth: 0, backgroundColor: 'rgba(5,12,22,0.96)', borderWidth: 1, borderColor: '#30404D', borderRadius: 7, overflow: 'hidden' }}>
  <View style={{ height: 3, backgroundColor: face.edge }} />
  <View style={{ padding: 14, gap: 14, flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center' }}>
   <SbcRewardVisual challenge={challenge} width={viewportWidth < 760 ? 116 : 132} />
   <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
    <Text style={{ color: '#D6B46B', fontSize: 9, fontWeight: '900', letterSpacing: 1, textAlign: rtl ? 'right' : 'left' }}>{face.category}</Text>
    <Text numberOfLines={3} style={{ color: '#F7F8FA', fontSize: 18, lineHeight: 23, fontWeight: '900', textAlign: rtl ? 'right' : 'left' }}>{language === 'he' ? face.he : face.en}</Text>
    {remaining ? <Text style={{ color: '#C3CED6', fontSize: 12, fontWeight: '700', textAlign: rtl ? 'right' : 'left' }}>{t('נותרו ', 'Ends in ')}{remaining}</Text> : null}
    <Text style={{ color: '#83DCE4', fontSize: 11, fontWeight: '800', textAlign: rtl ? 'right' : 'left' }}>{t('דרישות ופתרונות', 'Requirements & solutions')} →</Text>
   </View>
  </View>
 </Pressable>;
}

export default function SbcScreen() {
  const app = useApp();
  const { language, t } = useLanguage();
  const rtl = language === 'he';
  const router = useRouter();
  const now = useNow();
  const width = useWindowDimensions().width;
  const columns = width >= 760 ? 2 : 1;
  const challenges = openSbcChallenges(app.sbcChallenges, now);
  const rows = rowsOf(challenges, columns);
  return (
    <Screen refreshing={app.busy} onRefresh={app.refresh} scene="sbc" maxWidth={1080}>
      <View style={{ width: '100%', direction: rtl ? 'rtl' : 'ltr', alignItems: rtl ? 'flex-start' : 'flex-end', paddingTop: 4 }}>
        <Text style={{ width: '100%', color: '#F7F8FA', fontSize: 38, fontWeight: '900', letterSpacing: 1, textAlign: rtl ? 'right' : 'left' }}>SBC</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={() => router.push('/sbc/calculator')} style={{ width: '100%', alignItems: rtl ? 'flex-start' : 'flex-end' }}>
        <Text style={{ color: '#E3B341', fontWeight: '800', textAlign: rtl ? 'right' : 'left', width: '100%' }}>{t('מחשבון Streamlined', 'Streamlined calculator')}</Text>
      </Pressable>
      <Muted>{t('הקטלוג נבדק לאחרונה: ', 'Catalogue last checked: ')}{new Date(SBC_AUDIT_CHECKED_AT).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-GB')}{t('. אתגרים שפג תוקפם יורדים אוטומטית מהרשימה.', '. Expired challenges are removed automatically.')}</Muted>
      {app.user?.isAdmin ? <Button label={t('אתגר SBC חדש', 'New SBC challenge')} variant="ghost" onPress={() => router.push('/sbc/new')} /> : null}
      {!challenges.length ? <Muted>{t('אין כרגע SBC פעילים.', 'There are no active SBCs right now.')}</Muted> : null}
      {rows.map((row, rowIndex) => (
        <View
          key={row.map((item) => item.id).join('-')}
          style={{ flexDirection: rtl ? 'row-reverse' : 'row', gap: 14, alignItems: 'stretch', paddingHorizontal: width >= 700 ? 8 : 0 }}
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
