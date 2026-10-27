import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui';
import { GalleryButton, GalleryGrades, GalleryHero, GalleryItemArt, GalleryPanel, GallerySearch, GallerySetBackdrop, GalleryText, GalleryToken } from '@/components/GalleryUI';
import { GalleryGradeBadge } from '@/components/GalleryGradeBadge';
import { GALLERY_GRADES } from '@/lib/galleryTypes';
import { loadGalleryIndex, type GalleryIndex } from '@/lib/galleryData';
import { useLanguage } from '@/lib/language';
export default function GalleryScreen() {
 const { t, language, isRTL: rtl } = useLanguage(), router = useRouter();
 const [data, setData] = useState<GalleryIndex | null>(null), [failed, setFailed] = useState(false), [retry, setRetry] = useState(0);
 const [query, setQuery] = useState(''), [category, setCategory] = useState('all'), [visible, setVisible] = useState(18);
 const [filtersOpen, setFiltersOpen] = useState(false);
 const deferred = useDeferredValue(query), width = useWindowDimensions().width;
 const row = rtl ? 'row-reverse' : 'row';
 const columns = width >= 1150 ? 3 : width >= 700 ? 2 : 1;
 useEffect(() => { let active = true; void loadGalleryIndex().then(d => { if (active) { setData(d); setFailed(false); } }).catch(() => { if (active) setFailed(true); }); return () => { active = false; }; }, [retry]);
 const categories = useMemo(() => [...new Map(data?.sets.map(s => [s.categorySlug, s.category])).entries()], [data]);
 const filtered = useMemo(() => {
  const q = deferred.toLocaleLowerCase().trim();
  const featured = ['Como', 'Arsenal', 'FC Barcelona', 'Heroes', 'TOTW', 'Icons'];
  const rank = (name: string) => featured.includes(name) ? featured.indexOf(name) : 99;
  return data?.sets.filter(s => (category === 'all' || s.categorySlug === category) && `${s.name} ${s.category} ${s.preview.map(p => `${p.he ?? ''} ${p.cardName}`).join(' ')}`.toLocaleLowerCase().includes(q)).sort((a,b) => rank(a.name)-rank(b.name) || b.planCount-a.planCount || a.name.localeCompare(b.name)) ?? [];
 }, [data, category, deferred]);
 return <Screen scene="gallery" maxWidth={1320}>
  <GalleryHero compact title={t('הגלריה', 'The Gallery')} subtitle={t('האוסף שלך. הדרך לפרס הבא.', 'Your collection. Your route to the next reward.')} art={width>=700?<View style={{flexDirection:'row',direction:'ltr'}}>{data?.sets.find(s=>s.name==='Heroes')?.preview.slice(0,3).map((item,i)=><View key={item.eaId} style={{marginHorizontal:-8,transform:[{translateY:i===1?-9:0}]}}><GalleryItemArt item={item} width={width>=1150?82:70}/></View>)}</View>:undefined}>
   <GalleryText size={12} quiet>{t('אוספים קלפים · משלימים אוספים · מדרגים במשחק', 'Collect items · Complete sets · Grade in game')}</GalleryText>
  </GalleryHero>
  <GalleryPanel style={{paddingVertical:12}}><View style={{flexDirection:row,alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}><View style={{gap:3,flex:1,minWidth:150}}><GalleryText size={16} style={{fontWeight:'800'}}>{t('כל אוסף. חמש דרגות.', 'Every collection. Five grades.')}</GalleryText><GalleryText size={12} quiet>{t('הקלפים נשארים אצלך. הדרישות והפרסים בכל אוסף.', 'Your items stay yours. Discover every requirement and reward.')}</GalleryText></View><View style={{flexDirection:'row',direction:'ltr',gap:6}}>{GALLERY_GRADES.map(grade=><GalleryGradeBadge key={grade} grade={grade} size={width<500?37:46}/>)}</View></View></GalleryPanel>
  <GalleryPanel style={{gap:10,borderColor:'#AE8B56'}}><GalleryText size={22} style={{fontWeight:'800'}}>{t('הדרך שלך לטוקנים נוספים','Your route to more tokens')}</GalleryText><GalleryText quiet size={13}>{t('בחרו יעד או תקציב וקבלו מסלול לפי האוספים והקלפים שכבר אספתם.','Choose a goal or budget and plan around your sets and collected items.')}</GalleryText><GalleryButton testID="gallery-open-planner" primary label={t('פתיחת מתכנן הטוקנים','Open token planner')} onPress={()=>router.push('/gallery/planner')}/></GalleryPanel>
  <GallerySearch value={query} onChangeText={value => { setQuery(value); setVisible(18); }} placeholder={t('חיפוש אוסף, מועדון או ליגה', 'Search a set, club or league')} />
  {width<700?<GalleryButton label={`${category==='all'?t('כל האוספים','All collections'):categories.find(([slug])=>slug===category)?.[1]}  ${filtersOpen?'⌃':'⌄'}`} onPress={()=>setFiltersOpen(open=>!open)}/>:null}
  {width>=700||filtersOpen?<View style={{ flexDirection: row, gap: 7, flexWrap: 'wrap' }}><GalleryButton compact label={t('הכול', 'All')} active={category === 'all'} onPress={() => { setCategory('all'); setVisible(18); setFiltersOpen(false); }} />{categories.map(([slug,name]) => <GalleryButton compact key={slug} label={name.split(' / ')[0]} active={category === slug} onPress={() => { setCategory(slug); setVisible(18); setFiltersOpen(false); }} />)}</View>:null}
  {data ? <GalleryText quiet size={12}>{filtered.length} {t('אוספים', 'sets')} · {t('נבדק ב־', 'Checked ')}{new Date(data.checkedAt).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-GB')}</GalleryText> : <GalleryText>{failed ? t('לא ניתן לטעון את הגלריה כרגע.', 'The Gallery could not be loaded.') : t('טוען את האוספים…', 'Loading sets…')}</GalleryText>}
  {failed ? <GalleryButton label={t('ניסיון נוסף', 'Try again')} onPress={() => setRetry(n => n + 1)} /> : null}
  {Array.from({ length: Math.ceil(Math.min(visible, filtered.length) / columns) }, (_,index) => <View key={index} style={{ flexDirection: row, gap: 14, alignItems: 'stretch' }}>{filtered.slice(index * columns, (index + 1) * columns).map(set => <Pressable key={set.id} testID="gallery-set-tile" accessibilityRole="button" accessibilityLabel={`${set.name} Gallery`} onPress={() => router.push(`/gallery/${set.id}`)} style={{ flex: 1, minWidth: 0, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#4F4B43', backgroundColor: 'rgba(17,23,32,0.98)' }}>
   <View style={{ padding: 16, gap: 6, minHeight:250, overflow:'hidden' }}><GallerySetBackdrop name={set.name}/><View style={{alignItems:'center',gap:3}}>{set.badge ? <Image source={{ uri: set.badge }} style={{ width: 46, height: 46 }} resizeMode="contain" /> : <GalleryToken size={25} />}<GalleryText size={23} style={{ fontWeight: '900', textAlign:'center', textTransform:'uppercase', letterSpacing:0.5 }}>{set.name}</GalleryText><GalleryText quiet size={10} style={{textAlign:'center',letterSpacing:1}}>{set.category}</GalleryText></View>
    <View style={{ flexDirection: 'row', direction: 'ltr', justifyContent: 'center', paddingTop: 6 }}>{set.preview.slice(0,3).map((p,i) => <View key={p.eaId} style={{ marginHorizontal: -4, transform: [{ translateY: i === 1 ? -6 : 0 }] }}><GalleryItemArt item={p} width={columns === 1 && width < 400 ? 85 : 98} /></View>)}</View>
   </View>
   <LinearGradient colors={['#14202A','#0B141C']} style={{ padding: 14, gap: 12 }}><View style={{ flexDirection: row, justifyContent: 'space-between' }}><GalleryText size={13}>{set.requiredCards} {t('קלפים באוסף', 'item slots')}</GalleryText><GalleryToken value={set.totalTokens} size={16} /></View><GalleryGrades value={null} /><View style={{height:1,backgroundColor:'#35434D'}}/><View style={{ flexDirection: row, justifyContent: 'space-between', alignItems: 'center', gap: 8 }}><GalleryText size={11} quiet>{set.planCount ? `${set.planCount} ${t('אפשרויות לאוסף', 'lineup options')}` : t('דרישות ופרסים', 'Requirements & rewards')}</GalleryText><GalleryText size={14} style={{ color: '#FF913D', fontWeight: '800' }}>{t('לפתרונות', 'View collection')} ›</GalleryText></View></LinearGradient>
  </Pressable>)}{Array.from({ length: columns - filtered.slice(index * columns, (index + 1) * columns).length },(_,i) => <View key={i} style={{ flex: 1 }} />)}</View>)}
  {visible < filtered.length ? <GalleryButton label={t('הצגת אוספים נוספים', 'Show more sets')} onPress={() => setVisible(n => n + 18)} /> : null}
  {data && !filtered.length ? <GalleryText>{t('לא נמצאו אוספים לחיפוש הזה.', 'No sets match this search.')}</GalleryText> : null}
 </Screen>;
}
