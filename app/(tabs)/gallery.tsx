import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui';
import { GalleryButton, GalleryGrades, GalleryHero, GalleryItemArt, GalleryPanel, GallerySearch, GalleryText, GalleryToken } from '@/components/GalleryUI';
import { loadGalleryIndex, type GalleryIndex } from '@/lib/galleryData';
import { useLanguage } from '@/lib/language';
export default function GalleryScreen() {
 const { t, language } = useLanguage(), router = useRouter();
 const [data, setData] = useState<GalleryIndex | null>(null), [failed, setFailed] = useState(false), [retry, setRetry] = useState(0);
 const [query, setQuery] = useState(''), [category, setCategory] = useState('all'), [visible, setVisible] = useState(18);
 const deferred = useDeferredValue(query), width = useWindowDimensions().width;
 const rtl = language === 'he', row = rtl ? 'row-reverse' : 'row';
 const columns = width >= 1150 ? 3 : width >= 700 ? 2 : 1;
 useEffect(() => { let active = true; void loadGalleryIndex().then(d => { if (active) { setData(d); setFailed(false); } }).catch(() => { if (active) setFailed(true); }); return () => { active = false; }; }, [retry]);
 const categories = useMemo(() => [...new Map(data?.sets.map(s => [s.categorySlug, s.category])).entries()], [data]);
 const filtered = useMemo(() => {
  const q = deferred.toLocaleLowerCase().trim();
  return data?.sets.filter(s => (category === 'all' || s.categorySlug === category) && `${s.name} ${s.category} ${s.preview.map(p => `${p.he ?? ''} ${p.cardName}`).join(' ')}`.toLocaleLowerCase().includes(q)).sort((a,b) => (a.name === 'Como' ? -1 : b.name === 'Como' ? 1 : 0) || b.planCount-a.planCount || a.name.localeCompare(b.name)) ?? [];
 }, [data, category, deferred]);
 return <Screen scene="gallery" maxWidth={1320}>
  <GalleryHero title={t('הגלריה', 'The Gallery')} subtitle={t('האוסף שלך. הדרך לפרס הבא.', 'Your collection. Your route to the next reward.')}>
   <View style={{ flexDirection: row, alignItems: 'center', flexWrap: 'wrap', gap: 18 }}><GalleryToken size={24} /><GalleryText>{t('אוספים קלפים · משלימים אוספים · מדרגים במשחק', 'Collect items · Complete sets · Grade in game')}</GalleryText></View>
  </GalleryHero>
  <GalleryPanel><GalleryText>{t('הקלפים לא נצרכים בגלריה. גם קלפים שהיו אצלך ונמכרו יכולים להיחשב. בחרו אוסף כדי לראות את כל דרגות D–S, הדרישות, הפרסים והפתרונות.', 'Gallery items are not consumed. Items you previously owned and sold can still count. Choose a set to see all D–S grades, requirements, rewards and solutions.')}</GalleryText></GalleryPanel>
  <GallerySearch value={query} onChangeText={value => { setQuery(value); setVisible(18); }} placeholder={t('חיפוש אוסף, מועדון או ליגה', 'Search a set, club or league')} />
  <View style={{ flexDirection: row, gap: 7, flexWrap: 'wrap' }}><GalleryButton label={t('הכול', 'All')} active={category === 'all'} onPress={() => { setCategory('all'); setVisible(18); }} />{categories.map(([slug,name]) => <GalleryButton key={slug} label={name} active={category === slug} onPress={() => { setCategory(slug); setVisible(18); }} />)}</View>
  {data ? <GalleryText quiet size={12}>{filtered.length} {t('אוספים', 'sets')} · {t('נבדק ב־', 'Checked ')}{new Date(data.checkedAt).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-GB')}</GalleryText> : <GalleryText>{failed ? t('לא ניתן לטעון את הגלריה כרגע.', 'The Gallery could not be loaded.') : t('טוען את האוספים…', 'Loading sets…')}</GalleryText>}
  {failed ? <GalleryButton label={t('ניסיון נוסף', 'Try again')} onPress={() => setRetry(n => n + 1)} /> : null}
  {Array.from({ length: Math.ceil(Math.min(visible, filtered.length) / columns) }, (_,index) => <View key={index} style={{ flexDirection: row, gap: 14, alignItems: 'stretch' }}>{filtered.slice(index * columns, (index + 1) * columns).map(set => <Pressable key={set.id} testID="gallery-set-tile" accessibilityRole="button" accessibilityLabel={`${set.name} Gallery`} onPress={() => router.push(`/gallery/${set.id}`)} style={{ flex: 1, minWidth: 0, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#4F4B43', backgroundColor: 'rgba(17,23,32,0.98)' }}>
   <View style={{ padding: 18, gap: 10, borderBottomWidth: 1, borderBottomColor: '#41434A', backgroundColor: '#262722' }}><View style={{ flexDirection: row, justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>{set.badge ? <Image source={{ uri: set.badge }} style={{ width: 48, height: 48 }} resizeMode="contain" /> : <GalleryToken size={28} />}<View style={{ flex: 1 }}><GalleryText size={22} style={{ fontWeight: '800' }}>{set.name}</GalleryText><GalleryText quiet size={11}>{set.category}</GalleryText></View></View>
    <View style={{ flexDirection: 'row', direction: 'ltr', justifyContent: 'center', paddingTop: 6 }}>{set.preview.slice(0,3).map((p,i) => <View key={p.eaId} style={{ marginHorizontal: -5, transform: [{ translateY: i === 1 ? -5 : 0 }] }}><GalleryItemArt item={p} width={columns === 1 && width < 400 ? 85 : 98} /></View>)}</View>
   </View>
   <View style={{ padding: 16, gap: 13 }}><View style={{ flexDirection: row, justifyContent: 'space-between' }}><GalleryText size={13}>{set.requiredCards} {t('קלפים באוסף', 'item slots')}</GalleryText><GalleryToken value={set.totalTokens} size={16} /></View><GalleryGrades value={null} /><View style={{ flexDirection: row, justifyContent: 'space-between', alignItems: 'center', gap: 8 }}><GalleryText size={12} quiet>{set.planCount ? `${set.planCount} ${t('אפשרויות שנבדקו בחישוב', 'calculation-checked options')}` : t('דרישות ופרסים', 'Requirements & rewards')}</GalleryText><GalleryText size={14} style={{ color: '#F2AA6D', fontWeight: '700' }}>{t('פתיחת האוסף', 'Open set')} ›</GalleryText></View></View>
  </Pressable>)}{Array.from({ length: columns - filtered.slice(index * columns, (index + 1) * columns).length },(_,i) => <View key={i} style={{ flex: 1 }} />)}</View>)}
  {visible < filtered.length ? <GalleryButton label={t('הצגת אוספים נוספים', 'Show more sets')} onPress={() => setVisible(n => n + 18)} /> : null}
  {data && !filtered.length ? <GalleryText>{t('לא נמצאו אוספים לחיפוש הזה.', 'No sets match this search.')}</GalleryText> : null}
 </Screen>;
}
