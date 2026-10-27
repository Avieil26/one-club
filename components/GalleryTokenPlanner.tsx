import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { TextInput, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { GalleryButton, GalleryGrades, GalleryHero, GalleryPanel, GallerySearch, GalleryText, GalleryToken } from './GalleryUI';
import { GalleryGradeBadge } from './GalleryGradeBadge';
import { loadGalleryPlanner } from '@/lib/galleryData';
import { claimedTokens, parsePlannerNumber, planGallery, plannerStorageKey, type PlannerData, type PlannerResult } from '@/lib/galleryPlanner';
import { GALLERY_GRADES, type GalleryGrade } from '@/lib/galleryTypes';
import { useLanguage } from '@/lib/language';

type Settings = { mode: 'target' | 'budget'; target: string; budget: string; claimed: Record<number, GalleryGrade | null> };
async function readCollected(data: PlannerData, userId?: string) {
 const ids = new Set<number>();
 const marks = await AsyncStorage.multiGet(data.sets.map(s => `fc27-gallery-v1:${userId || 'guest'}:${s.id}`));
 for (const [, value] of marks) {
  try { const parsed = value ? JSON.parse(value) : null; if (Array.isArray(parsed?.collectedIds)) for (const id of parsed.collectedIds) if (Number.isSafeInteger(id) && id > 0) ids.add(id); } catch { /* One corrupt set must not discard the other saved marks. */ }
 }
 return [...ids];
}
const defaults = (): Settings => ({ mode: 'target', target: '100', budget: '75000', claimed: {} });
export function GalleryTokenPlanner({ userId }: { userId?: string }) {
 const { t, language, isRTL: rtl } = useLanguage(), router = useRouter(), { width } = useWindowDimensions();
 const [data, setData] = useState<PlannerData | null>(null), [failed, setFailed] = useState(false), [retry, setRetry] = useState(0);
 const [settings, setSettings] = useState<Settings>(defaults), [owned, setOwned] = useState<number[]>([]);
 const [result, setResult] = useState<PlannerResult | null>(null), [message, setMessage] = useState('');
 const [busy, setBusy] = useState(false), [saving, setSaving] = useState(false), [refreshing, setRefreshing] = useState(false), [storageFailed, setStorageFailed] = useState(false);
 const [progressOpen, setProgressOpen] = useState(false), [query, setQuery] = useState(''), [limit, setLimit] = useState(8), [shown, setShown] = useState(8);
 const row = rtl ? 'row-reverse' : 'row', key = plannerStorageKey(userId);
 useEffect(() => {
  let active = true;
  void loadGalleryPlanner().then(async catalogue => {
   let next = defaults(); let raw: string | null = null; let collected: number[] = []; let unavailable = false;
   try {
    raw = await AsyncStorage.getItem(key);
    const saved = raw ? JSON.parse(raw) : null;
    if (saved && typeof saved === 'object') {
     if (saved.mode === 'target' || saved.mode === 'budget') next.mode = saved.mode;
     if (typeof saved.target === 'string') next.target = saved.target.slice(0, 20);
     if (typeof saved.budget === 'string') next.budget = saved.budget.slice(0, 20);
     if (saved.claimed && typeof saved.claimed === 'object') for (const set of catalogue.sets) {
      const grade = saved.claimed[set.id]; if (GALLERY_GRADES.includes(grade)) next.claimed[set.id] = grade;
     }
    }
   } catch { unavailable = true; }
   try { collected = await readCollected(catalogue, userId); } catch { unavailable = true; }
   if (!active) return;
   setData(catalogue); setSettings(next); setOwned(collected); setStorageFailed(unavailable); setFailed(false);
   const target = next.mode === 'budget' ? null : parsePlannerNumber(next.target);
   const budget = next.budget.trim() ? parsePlannerNumber(next.budget) : null;
   if (raw && !unavailable && (next.mode === 'budget' ? budget !== null : target !== null && target > 0) && (!next.budget.trim() || budget !== null)) {
    setResult(planGallery(catalogue, { target, budget, claimed: next.claimed, collectedIds: collected }));
   }
  }).catch(() => { if (active) setFailed(true); });
  return () => { active = false; };
 }, [key, userId, retry]);
 const sets = useMemo(() => {
  const q = query.trim().toLocaleLowerCase();
  return data?.sets.filter(s => `${s.name} ${s.category}`.toLocaleLowerCase().includes(q)).sort((a, b) => Number(!!settings.claimed[b.id]) - Number(!!settings.claimed[a.id]) || a.name.localeCompare(b.name)) ?? [];
 }, [data, query, settings.claimed]);
 const alreadyClaimed = data?.sets.reduce((n, s) => n + claimedTokens(s, settings.claimed[s.id]), 0) ?? 0;
 const target = settings.mode === 'budget' ? null : parsePlannerNumber(settings.target);
 const budget = settings.budget.trim() ? parsePlannerNumber(settings.budget) : null;
 const valid = (settings.mode === 'budget' ? budget !== null : target !== null && target > 0) && (!settings.budget.trim() || budget !== null);
 function update(next: Settings) { setSettings(next); setResult(null); setMessage(''); setShown(8); }
 function calculate() {
  if (!data || !valid) return;
  setBusy(true); setMessage('');
  // Yield for the loading label before the bounded local calculation.
  setTimeout(() => {
   try { setResult(planGallery(data, { target, budget, claimed: settings.claimed, collectedIds: owned })); setShown(8); }
   catch { setMessage(t('לא ניתן לחשב כרגע. בדקו את הערכים ונסו שוב.', 'Could not calculate. Check your values and try again.')); }
   finally { setBusy(false); }
  }, 0);
 }
 async function refreshCollected() {
  if (!data) return;
  setRefreshing(true);
  try { setOwned(await readCollected(data, userId)); setResult(null); setMessage(t('הקלפים שנאספו עודכנו. חשבו מחדש כדי לכלול אותם במסלול.', 'Collected items refreshed. Recalculate to include them in your route.')); }
  catch { setMessage(t('לא ניתן לרענן את הסימונים כרגע. נסו שוב.', 'Could not refresh your marks. Please try again.')); }
  finally { setRefreshing(false); }
 }
 async function save() {
  setSaving(true);
  try { await AsyncStorage.setItem(key, JSON.stringify(settings)); setMessage(t('המסלול וההתקדמות נשמרו במכשיר. בפתיחה הבאה העלויות יחושבו מחדש.', 'Route and progress saved on this device. Costs are recalculated when you return.')); }
  catch { setMessage(t('השמירה נכשלה. המסלול עדיין מוצג כאן; נסו שוב.', 'Saving failed. Your route is still shown here; try again.')); }
  finally { setSaving(false); }
 }
 const num = (n: number) => n.toLocaleString('en-US');
 const field = (label: string, value: string, onChangeText: (value: string) => void, placeholder: string) => <View style={{ flex: 1, minWidth: 180, gap: 7 }}><GalleryText size={13}>{label}</GalleryText><TextInput accessibilityLabel={label} keyboardType="number-pad" value={value} onChangeText={onChangeText} editable={!busy} maxLength={20} placeholder={placeholder} placeholderTextColor="#AAB2BF" style={{ minHeight: 54, borderRadius: 9, borderWidth: 1, borderColor: '#596575', backgroundColor: '#0D1720', color: '#FFF4DE', fontSize: 24, fontWeight: '700', paddingHorizontal: 15, textAlign: rtl ? 'right' : 'left' }} /></View>;
 return <>
  <GalleryHero compact title={t('מתכנן הטוקנים', 'Token planner')} subtitle={t('בחרו יעד. בנו דרך לפרס הבא.', 'Choose a goal. Plan your next reward.')} art={<GalleryToken size={44} />} />
  {!data ? <GalleryPanel><GalleryText>{failed ? t('לא ניתן לטעון את המתכנן.', 'Could not load the planner.') : t('טוען את האפשרויות שנבדקו…', 'Loading verified options…')}</GalleryText>{failed ? <GalleryButton label={t('ניסיון נוסף', 'Try again')} onPress={() => setRetry(n => n + 1)} /> : null}</GalleryPanel> : <>
   <GalleryPanel style={{ gap: 17 }}>
    <View style={{ flexDirection: row, gap: 8, flexWrap: 'wrap' }}><GalleryButton label={t('לפי יעד טוקנים', 'Token goal')} active={settings.mode === 'target'} disabled={busy} onPress={() => update({ ...settings, mode: 'target' })} /><GalleryButton label={t('לפי תקציב', 'Coin budget')} active={settings.mode === 'budget'} disabled={busy} onPress={() => update({ ...settings, mode: 'budget' })} /></View>
    <View style={{ flexDirection: row, flexWrap: 'wrap', gap: 14 }}>{settings.mode === 'target' ? field(t('כמה טוקנים נוספים תרצו?', 'How many additional tokens?'), settings.target, value => update({ ...settings, target: value }), '100') : null}{field(settings.mode === 'target' ? t('תקציב קוינס מרבי — אפשר להשאיר ריק', 'Maximum coin budget — optional') : t('תקציב קוינס מרבי', 'Maximum coin budget'), settings.budget, value => update({ ...settings, budget: value }), settings.mode === 'target' ? t('ללא הגבלה', 'No limit') : '50,000')}</View>
    {!valid ? <GalleryText size={13} style={{ color: '#FFBEA4' }}>{t('הזינו מספרים שלמים: יעד גדול מאפס ותקציב מאפס עד מיליארד.', 'Enter whole numbers: a positive target and a budget from zero to one billion.')}</GalleryText> : null}
    <GalleryText quiet size={13}>{settings.mode === 'target' ? t('היעד הוא טוקנים חדשים מעבר לפרסים שכבר קיבלתם.', 'Your goal counts new tokens beyond rewards already claimed.') : t('נציע מסלול לצבירת טוקנים במסגרת התקציב שהזנתם.', 'Find a suggested token route within your coin budget.')}</GalleryText>
    <GalleryButton primary testID="planner-calculate" label={busy ? t('מחשב מסלול…', 'Calculating…') : t('בניית המסלול שלי', 'Build my route')} disabled={!valid || busy} onPress={calculate} />
   </GalleryPanel>
   <GalleryPanel style={{ gap: 12 }}>
    <GalleryButton testID="planner-progress-toggle" label={t('אוספים שכבר קיבלתי עליהם פרסים', 'Rewards I have already claimed')} active={progressOpen} disabled={busy} onPress={() => setProgressOpen(v => !v)} />
    <GalleryText quiet size={13}>{t('כבר קיבלתי', 'Already claimed')}: {num(alreadyClaimed)} {t('טוקנים', 'tokens')} · {num(owned.length)} {t('קלפים מסומנים כנאספו בתכנונים ששמרתם', 'items marked collected in your saved plans')}</GalleryText>
    {storageFailed ? <GalleryText size={13} style={{ color: '#FFBEA4' }}>{t('לא הצלחנו לקרוא חלק מהסימונים במכשיר. בדקו את ההתקדמות לפני החישוב.', 'Some device marks could not be read. Check your progress before calculating.')}</GalleryText> : null}
    {progressOpen ? <><GalleryText quiet size={12}>{t('סמנו רק את הדרגה הגבוהה ביותר שכבר דירגתם וקיבלתם עליה פרסים במשחק. זהו סימון ידני, ללא חיבור לחשבון EA.', 'Mark only the highest grade you have already completed and claimed in the game. These are manual marks, without an EA account connection.')}</GalleryText><GalleryButton compact label={refreshing?t('מעדכן…','Refreshing…'):t('רענון קלפים שנאספו','Refresh collected items')} disabled={refreshing||busy} onPress={()=>void refreshCollected()} /><GallerySearch value={query} onChangeText={value => { setQuery(value); setLimit(8); }} placeholder={t('חיפוש אוסף שכבר השלמתם', 'Search a completed set')} />{sets.slice(0, limit).map(set => <View key={set.id} testID={`planner-progress-${set.id}`} style={{ gap: 9, paddingVertical: 12, borderTopWidth: 1, borderColor: '#3A4652' }}><GalleryText style={{ fontWeight: '700' }}>{set.name}</GalleryText><GalleryGrades value={settings.claimed[set.id] ?? null} onChange={grade => update({ ...settings, claimed: { ...settings.claimed, [set.id]: grade } })} /><GalleryButton compact label={t('עדיין לא קיבלתי פרס מהאוסף', 'No rewards claimed from this set')} active={!settings.claimed[set.id]} onPress={() => update({ ...settings, claimed: { ...settings.claimed, [set.id]: null } })} /></View>)}{!sets.length ? <GalleryText>{t('לא נמצאו אוספים.', 'No matching sets.')}</GalleryText> : null}{sets.length > limit ? <GalleryButton label={t('אוספים נוספים', 'More sets')} onPress={() => setLimit(n => n + 8)} /> : null}</> : null}
   </GalleryPanel>
   {result ? <View testID="planner-result" style={{ gap: 15 }}>
    <GalleryPanel style={{ gap: 15, borderColor: result.targetMet ? '#C8A66C' : '#D58B54' }}>
     <GalleryText testID="planner-status" size={24} style={{ fontWeight: '800' }}>{!result.steps.length ? t('לא נמצא מסלול לפי הבחירה הזו', 'No route found for these settings') : result.targetMet ? t('המסלול שלך מוכן', 'Your route is ready') : t('המסלול שנמצא עדיין לא מגיע ליעד', 'The suggested route falls short of your goal')}</GalleryText>
     <View style={{ flexDirection: row, gap: 22, flexWrap: 'wrap', justifyContent: 'space-between' }}><View style={{ gap: 5 }}><GalleryToken value={`+${num(result.tokens)}`} size={30} /><GalleryText quiet size={12}>{t('טוקנים נוספים', 'Additional tokens')}</GalleryText></View><View style={{ gap: 5 }}><GalleryText testID="planner-total-cost" size={28} style={{ fontWeight: '800' }}>◉ {num(result.cost)}</GalleryText><GalleryText quiet size={12}>{t('אומדן קוינס לרכישה', 'Estimated purchase coins')}</GalleryText></View><View style={{ gap: 5 }}><GalleryText size={28} style={{ fontWeight: '800' }}>{result.steps.length}</GalleryText><GalleryText quiet size={12}>{t('אוספים במסלול', 'Sets in your route')}</GalleryText></View></View>
     {!result.targetMet ? <GalleryText>{t('נותרו ליעד', 'Still needed')}: {num(result.shortfall)} {t('טוקנים. אפשר להגדיל תקציב או להפחית יעד.', 'tokens. Try a larger budget or a smaller goal.')}</GalleryText> : null}
     <GalleryText quiet size={13}>{num(result.uniqueItems)} {t('קלפים שונים לרכישה. קלף משותף לכמה אוספים נספר במחיר פעם אחת.', 'distinct items to buy. An item shared across sets is charged once.')}</GalleryText>
     <GalleryText quiet size={12}>{t('מסלול מוצע מתוך ההרכבים שנבדקו, לא הבטחה לפתרון הזול ביותר. מחירי קונסולה מתאריך', 'Suggested route among verified lineups, not a guarantee of the cheapest solution. Console price snapshot:')} {new Date(data.checkedAt).toLocaleDateString(language === 'he' ? 'he-IL' : language === 'ar' ? 'ar' : language === 'pt-BR' ? 'pt-BR' : language === 'es' ? 'es' : 'en-GB')}. {t('האומדן מניח רכישה ושמירת הקלפים, ללא מכירה חוזרת או הכנסה ממנה.', 'Estimate assumes you buy and keep the items, with no resale proceeds.')}</GalleryText>
     {result.unpricedOptions ? <GalleryText quiet size={12}>{result.unpricedOptions} {t('הרכבים לא נכללו בגלל מחיר חסר לקלפים שטרם נאספו.', 'lineups excluded because uncollected items have missing prices.')}</GalleryText> : null}
     <GalleryButton label={saving ? t('שומר…', 'Saving…') : t('שמירת המסלול וההתקדמות', 'Save route and progress')} disabled={saving} onPress={() => void save()} />
    </GalleryPanel>
    {result.steps.slice(0, shown).map((step, index) => {
     const set = data.sets.find(s => s.id === step.option.setId)!;
     return <GalleryPanel key={step.option.id} style={{ gap: 13 }}><View style={{ flexDirection: row, alignItems: 'center', gap: 13 }}><GalleryGradeBadge grade={step.option.grade} size={width < 500 ? 48 : 60} /><View style={{ flex: 1, minWidth: 0, gap: 3 }}><GalleryText size={13} quiet>{t('שלב', 'Step')} {index + 1}</GalleryText><GalleryText size={21} style={{ fontWeight: '800' }}>{set.name}</GalleryText></View><GalleryToken value={`+${step.tokens}`} size={19} /></View><View style={{ flexDirection: row, justifyContent: 'space-between', flexWrap: 'wrap', gap: 9 }}><GalleryText>◉ {num(step.cost)} {t('לשלב הזה', 'for this step')}</GalleryText><GalleryText quiet size={13}>{step.newItemIds.length} {t('קלפים לרכישה', 'items to buy')} · {step.reusedItems} {t('כבר נספרו או נאספו', 'already counted or collected')}</GalleryText></View><GalleryButton testID={`planner-open-${index}`} primary label={t('פתיחת ההרכב', 'Open lineup')} onPress={() => router.push({ pathname: '/gallery/[id]', params: { id: String(set.id), lineup: step.option.id, grade: step.option.grade } })} /></GalleryPanel>;
    })}
    {result.steps.length > shown ? <GalleryButton label={t('שלבים נוספים במסלול', 'More route steps')} onPress={() => setShown(n => n + 8)} /> : null}
   </View> : null}
   {message ? <GalleryPanel><GalleryText testID="planner-message">{message}</GalleryText></GalleryPanel> : null}
   <GalleryText quiet size={12}>{t('אין כאן רכישות או קבלת פרסים. את הדירוג וקבלת הטוקנים מבצעים במשחק.', 'No purchases or rewards are performed here. Grade sets and claim tokens in the game.')}</GalleryText>
  </>}
 </>;
}
