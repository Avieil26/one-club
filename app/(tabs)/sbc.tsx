import { ItemScore } from '@/components/ItemScore';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, Text, useWindowDimensions, View, TextInput } from 'react-native';
import { SbcRewardVisual } from '@/components/SbcRewardVisual';
import { Button, Muted, Screen } from '@/components/ui';
import { openSbcChallenges } from '@/lib/selectors';
import { SBC_AUDIT_CHECKED_AT } from '@/lib/sbcLive20261020';
import { endsSoon, filterSbcs, newlyReleased, type SbcFilter } from '@/lib/sbcBrowse';
import { sbcFace, localizedSbcTitle } from '@/lib/sbcTileTheme';
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
 const { locale, t, isRTL: rtl } = useLanguage(); const face = sbcFace(challenge); const remaining = compactRemaining(challenge.endsAt, now);
 return <Pressable accessibilityRole="button" accessibilityLabel={locale === 'he' || locale === 'en' ? face.en : localizedSbcTitle(challenge, locale)} onPress={onPress} style={{ flex: 1, minWidth: 0, backgroundColor: 'rgba(5,12,22,0.96)', borderWidth: 1, borderColor: '#30404D', borderRadius: 7, overflow: 'hidden' }}>
  <View style={{ height: 3, backgroundColor: face.edge }} />
  <View style={{ padding: 14, gap: 14, flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center' }}>
   <SbcRewardVisual challenge={challenge} width={viewportWidth < 760 ? 116 : 132} />
   <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
    {endsSoon(challenge, now) || newlyReleased(challenge, now) ? <Text style={{ color: endsSoon(challenge, now) ? '#FFB59C' : '#88E1BE', fontSize: 11, fontWeight: '800', textAlign: rtl ? 'right' : 'left' }}>{endsSoon(challenge, now) ? t('מסתיים ב־24 השעות הקרובות', 'Ends within 24 hours') : t('חדש', 'New')}</Text> : null}
    <Text style={{ color: '#D6B46B', fontSize: 9, fontWeight: '900', letterSpacing: 1, textAlign: rtl ? 'right' : 'left' }}>{face.category}</Text>
    <Text numberOfLines={3} style={{ color: '#F7F8FA', fontSize: 18, lineHeight: 23, fontWeight: '900', textAlign: rtl ? 'right' : 'left' }}>{localizedSbcTitle(challenge, locale)}</Text>
    {challenge.kind === 'streamlined' && challenge.targetScore ? <ItemScore value={challenge.targetScore} size={16} /> : null}
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
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SbcFilter>('all');
  const filtered = filterSbcs(challenges, query, filter, now);
  const rows = rowsOf(filtered, columns);
  return (
    <Screen refreshing={app.busy} onRefresh={app.refresh} scene="sbc" maxWidth={1080}>
      <View style={{ width: '100%', direction: rtl ? 'rtl' : 'ltr', alignItems: rtl ? 'flex-start' : 'flex-end', paddingTop: 4 }}>
        <Text style={{ width: '100%', color: '#F7F8FA', fontSize: 38, fontWeight: '900', letterSpacing: 1, textAlign: rtl ? 'right' : 'left' }}>SBC</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={() => router.push('/sbc/calculator')} style={{ width: '100%', alignItems: rtl ? 'flex-start' : 'flex-end' }}>
        <Text style={{ color: '#E3B341', fontWeight: '800', textAlign: rtl ? 'right' : 'left', width: '100%' }}>{t('תכנון השלמת נקודות', 'Plan your remaining points')}</Text>
      </Pressable>
      <TextInput accessibilityLabel={t('חיפוש SBC', 'Search SBCs')} placeholder={t('חיפוש שחקן, חבילה או אתגר', 'Search player, pack or challenge')} value={query} onChangeText={setQuery} placeholderTextColor="#94A6B5" style={{ minHeight: 48, borderWidth: 1, borderColor: '#3B4A58', borderRadius: 6, padding: 13, color: '#F7F8FA', backgroundColor: '#080F17', textAlign: rtl ? 'right' : 'left' }} />
      <View accessibilityRole="tablist" style={{ flexDirection: rtl ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: 8 }}>
        {([{value:'all',label:t('הכול','All')},{value:'players',label:t('שחקנים','Players')},{value:'packs',label:t('חבילות','Packs')},{value:'upgrades',label:t('שדרוגים','Upgrades')},{value:'ending',label:t('מסתיימים בקרוב','Ending soon')}] as {value:SbcFilter;label:string}[]).map(option=><Pressable key={option.value} accessibilityRole="tab" aria-selected={filter===option.value} accessibilityState={{selected:filter===option.value}} onPress={()=>setFilter(option.value)} style={{ minHeight: 44, paddingHorizontal: 13, justifyContent:'center', borderRadius: 5, borderWidth: 1, borderColor:filter===option.value?'#E9C36A':'#30404D', backgroundColor:filter===option.value?'#2A2519':'#080F17' }}><Text style={{color:filter===option.value?'#F5DEA0':'#C3CED6',fontWeight:'800'}}>{option.label}</Text></Pressable>)}
      </View>
      <Muted>{filtered.length} {t('אתגרים', 'challenges')} · {t('עודכן: ', 'Updated: ')}{new Date(SBC_AUDIT_CHECKED_AT).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-GB')}</Muted>
      {app.user?.isAdmin ? <Button label={t('אתגר SBC חדש', 'New SBC challenge')} variant="ghost" onPress={() => router.push('/sbc/new')} /> : null}
      {!filtered.length ? <View style={{ gap: 12 }}><Muted>{t('לא נמצאו אתגרים. נסו חיפוש או סינון אחרים.', 'No matching challenges. Try another search or filter.')}</Muted><Button label={t('איפוס חיפוש וסינון', 'Reset search & filters')} variant="ghost" onPress={()=>{setQuery('');setFilter('all');}} /></View> : null}
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
