import { useCallback, useState } from 'react';
import { Share, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Button, Card, Field, Muted, Screen, Title } from '@/components/ui';
import { activityStyles, Choices, CommunityError, CommunitySignIn, Panel, useActivityQuery } from '@/components/CommunityActivityUI';
import { communityAction, loadActivity, loadCommunityNames, loadJourneys, loadJourneyUpdates, type CareerJourney } from '@/lib/communityActivities';
import { communityActivityUrl } from '@/lib/communitySharing';
import { useApp } from '@/lib/store';
import { useLanguage } from '@/lib/language';

export function CareerJourneysList() {
 const { user } = useApp(); const { language, t } = useLanguage(); const router = useRouter();
 const uid = user?.id;
 const [scope, setScope] = useState('active'); const [spoken, setSpoken] = useState<string>(language);
 const loader = useCallback(() => loadJourneys(scope as 'active' | 'mine', uid!, spoken), [scope, uid, spoken]); const query = useActivityQuery(loader, Boolean(user));
 const journeys = (query.data ?? []).filter((j) => scope === 'mine' ? j.career_journey_members.some((m) => m.user_id === user?.id) : j.status === 'active' && (!spoken || j.language === spoken));
 return <Screen scene="career" maxWidth={840} refreshing={query.loading} onRefresh={query.refresh}>
  <Stack.Screen options={{ title: t('מסעות קריירה', 'Career journeys') }} />
  <Panel eyebrow="CAREER / THE LONG GAME" title={t('העונה שלך. הסיפור של כולנו.', 'Your season. Our shared story.')}>
   <Muted>{t('בוחרים מועדון, מסכימים על חוקים ואבני דרך, ומשתפים את ההתקדמות לאורך העונה. כל אחד משחק בשמירה שלו ב־EA FC.', 'Choose a club, agree on rules and milestones, and share progress throughout the season. Everyone plays their own EA FC save.')}</Muted>
   {user ? <Button label={t('פתיחת מסע', 'Start a journey')} onPress={() => router.push('/career/journeys/new')} /> : <CommunitySignIn />}
  </Panel>
  {user ? <>
   <Choices label={t('מסעות', 'Journeys')} value={scope} onChange={setScope} options={[{ value: 'active', label: t('מסעות פתוחים', 'Open journeys') }, { value: 'mine', label: t('המסעות שלי', 'My journeys') }]} />
   {scope === 'active' ? <Choices label={t('שפת הקהילה', 'Community language')} value={spoken} onChange={setSpoken} options={[{ value: '', label: t('כל השפות', 'All languages') }, { value: 'he', label: t('עברית', 'Hebrew') }, { value: 'en', label: t('אנגלית', 'English') }]} /> : null}
   <Button label={t('רענון מסעות', 'Refresh journeys')} onPress={query.refresh} variant="ghost" />
   <CommunityError error={query.error} />{query.loading ? <Muted>{t('טוען מסעות…', 'Loading journeys…')}</Muted> : null}
   {!query.loading && !query.error && !journeys.length ? <Card><Title>{t('כל מסע מתחיל בעונה אחת', 'Every journey starts with one season')}</Title><Muted>{t('פתחו מסע עם חוקים פשוטים והזמינו את הקהילה להצטרף.', 'Start a journey with simple rules and invite the community to join.')}</Muted></Card> : null}
   {journeys.map((j) => <Card key={j.id}>
    <Title>{j.title}</Title><Muted>{j.club} · {j.milestones.length} {t('אבני דרך', 'milestones')} · {j.career_journey_members.filter((m) => m.active).length} {t('משתתפים', 'participants')}</Muted>
    {j.status === 'archived' ? <Muted>{t('המסע נסגר — הסיפור נשמר', 'Archived — the story is preserved')}</Muted> : null}
    <Button label={t('כניסה למסע', 'Open journey')} onPress={() => router.push(`/career/journeys/${j.id}`)} variant="ghost" />
   </Card>)}
  </> : null}
 </Screen>;
}
export function CareerJourneyForm() {
 const { user } = useApp(); const { t, language } = useLanguage(); const router = useRouter();
 const [title, setTitle] = useState(''); const [club, setClub] = useState(''); const [rules, setRules] = useState(''); const [milestones, setMilestones] = useState(''); const [spoken, setSpoken] = useState<string>(language);
 const [difficulty, setDifficulty] = useState('World Class'); const [season, setSeason] = useState('1'); const [busy, setBusy] = useState(false); const [error, setError] = useState<unknown>(null);
 async function create() {
  if (busy) return; setError(null);
  const steps = milestones.split('\n').map((s) => s.trim()).filter(Boolean);
  if (steps.length < 1 || steps.length > 6 || steps.some((s) => s.length < 3 || s.length > 100) || new Set(steps).size !== steps.length) { setError(new Error('MILESTONES')); return; }
  setBusy(true);
  try { const id = await communityAction('create_journey', { title: title.trim(), club: club.trim(), rules: rules.trim(), milestones: steps, language: spoken, difficulty: difficulty.trim(), season: season.trim() }); router.replace(`/career/journeys/${id}`); }
  catch (e) { setError(e); } finally { setBusy(false); }
 }
 return <Screen scene="career" maxWidth={740}>
  <Stack.Screen options={{ title: t('מסע חדש', 'New journey') }} />
  <Title>{t('מסע חדש', 'New journey')}</Title>
  {!user ? <CommunitySignIn /> : <Panel title={t('מסכימים על הדרך לפני שמתחילים', 'Set the ground rules before kick-off')}>
   <Field label={t('שם המסע', 'Journey title')} value={title} onChangeText={setTitle} maxLength={90} placeholder={t('למשל: מחזירים מועדון לליגת האלופות', 'e.g. Back to the Champions League')} />
   <Field label={t('המועדון והקבוצה שלי', 'Suggested club & my club')} value={club} onChangeText={setClub} maxLength={80} placeholder="FC Schalke 04" />
   <Field label={t('חוקים משותפים', 'Shared rules')} value={rules} onChangeText={setRules} maxLength={1000} multiline placeholder={t('תקציב, רכש, אקדמיה ורמת קושי. ציינו אם כולם בוחרים אותו מועדון.', 'Budget, transfers, academy and difficulty. Specify if everyone must use the same club.')} />
   <Field label={t('אבני דרך — אחת בכל שורה, עד 6', 'Milestones — one per line, up to 6')} value={milestones} onChangeText={setMilestones} maxLength={606} multiline placeholder={t('לסיים חלון העברות ראשון\nלעלות ליגה\nלהעפיל לאירופה', 'Finish the first transfer window\nWin promotion\nQualify for Europe')} />
   <Field label={t('רמת הקושי שלי', 'My difficulty')} value={difficulty} onChangeText={setDifficulty} maxLength={40} />
   <Field label={t('העונה בשמירה שלי', 'Season in my save')} value={season} onChangeText={setSeason} maxLength={20} />
   <Choices label={t('שפת המסע', 'Journey language')} value={spoken} onChange={setSpoken} options={[{ value: 'he', label: t('עברית', 'Hebrew') }, { value: 'en', label: t('אנגלית', 'English') }]} />
   <Muted>{t('החוקים ואבני הדרך נשמרים כפי שפורסמו, כדי שלכולם תהיה אותה נקודת פתיחה. ההתקדמות מבוססת על דיווח אישי.', 'Rules and milestones stay as published so everyone shares the same starting point. Progress is self-reported.')}</Muted>
   <CommunityError error={error} />
   <Button disabled={busy || title.trim().length < 3 || club.trim().length < 2 || rules.trim().length < 5 || difficulty.trim().length < 2 || !season.trim()} label={busy ? t('שומר…', 'Saving…') : t('פתיחת המסע', 'Publish journey')} onPress={() => void create()} />
   <Button label={t('חזרה', 'Back')} onPress={() => router.back()} variant="ghost" />
  </Panel>}
 </Screen>;
}
export function CareerJourneyDetail({ id }: { id: string }) {
 const { user } = useApp(); const uid = user?.id; const { t, language } = useLanguage(); const router = useRouter();
 const loader = useCallback(async () => {
  const [record, updates] = await Promise.all([loadActivity('journey', id), loadJourneyUpdates(id)]);
  const journey = record as CareerJourney | null;
  const profiles = journey ? await loadCommunityNames(journey.career_journey_members.map((m) => m.user_id)) : [];
  return { journey, updates, profiles };
 }, [id]);
 const query = useActivityQuery(loader, Boolean(uid)); const journey = query.data?.journey;
 const [club, setClub] = useState(''); const [difficulty, setDifficulty] = useState('World Class'); const [season, setSeason] = useState('1'); const [milestone, setMilestone] = useState('-1'); const [note, setNote] = useState('');
 const [busy, setBusy] = useState(false); const [error, setError] = useState<unknown>(null); const [confirmArchive, setConfirmArchive] = useState(false);
 const mine = journey?.career_journey_members.find((m) => m.user_id === uid); const owner = journey?.owner_user_id === uid;
 const updates = query.data?.updates ?? []; const open = journey?.status === 'active';
 async function act(action: string) {
  if (busy) return; setBusy(true); setError(null);
  try { await communityAction(action, { id, club: club.trim() || journey?.club, difficulty: difficulty.trim(), season: season.trim(), milestone: Number(milestone), note: note.trim() }); setNote(''); query.refresh(); }
  catch (e) { setError(e); } finally { setBusy(false); }
 }
 return <Screen scene="career" maxWidth={840} refreshing={query.loading} onRefresh={query.refresh}>
  <Stack.Screen options={{ title: t('מסע קריירה', 'Career journey') }} />
  <Button label={t('כל המסעות', 'All journeys')} onPress={() => router.replace('/career/journeys')} variant="ghost" />
  {uid ? <Button label={t('רענון המסע', 'Refresh journey')} onPress={query.refresh} variant="ghost" /> : null}
  {!uid ? <CommunitySignIn /> : null}<CommunityError error={query.error || error} />
  {query.loading ? <Muted>{t('טוען…', 'Loading…')}</Muted> : null}
  {uid && query.data && !journey ? <Title>{t('המסע לא נמצא', 'Journey not found')}</Title> : null}
  {journey ? <>
   <Panel eyebrow="CAREER / SHARED JOURNEY" title={journey.title}>
    <Muted>{journey.club}</Muted><Muted>{journey.rules}</Muted>
    <Muted>{t('כל אחד משחק בשמירה שלו. דיווחים אישיים, בלי סנכרון לחשבון EA ובלי נקודות על סימון התקדמות.', 'Everyone plays their own save. Self-reported progress, without EA account sync or points for marking milestones.')}</Muted>
    {!open ? <Muted>{t('המסע נסגר. כל העדכונים נשמרו לקריאה.', 'This journey is archived. Updates are preserved for reading.')}</Muted> : null}
    <Button label={t('שיתוף המסע', 'Share journey')} variant="ghost" onPress={() => { void Share.share({ message: `${journey.title}\n${communityActivityUrl('journey', id)}` }).catch(setError); }} />
   </Panel>
   <Card><Title>{t('אבני הדרך', 'Milestones')}</Title>{journey.milestones.map((step, i) => <Muted key={i}>{updates.some((u) => u.user_id === uid && u.milestone === i) ? '✓' : `${i + 1}.`} {step}</Muted>)}</Card>
   {open && !mine?.active ? <Panel title={t('מצטרפים לעונה', 'Join the season')}>
    <Field label={t('המועדון שלי (בהתאם לחוקים)', 'My club (follow the shared rules)')} value={club} onChangeText={setClub} placeholder={journey.club} maxLength={80} />
    <Field label={t('רמת קושי', 'Difficulty')} value={difficulty} onChangeText={setDifficulty} maxLength={40} />
    <Field label={t('עונה', 'Season')} value={season} onChangeText={setSeason} maxLength={20} />
    <Button label={mine ? t('חזרה למסע', 'Rejoin journey') : t('הצטרפות למסע', 'Join journey')} disabled={busy || difficulty.trim().length < 2 || !season.trim()} onPress={() => void act('join_journey')} />
   </Panel> : null}
   {open && mine?.active ? <Panel title={t('עדכון קצר מהשמירה שלי', 'A short update from my save')}>
    <Choices label={t('עדכון רגיל או אבן דרך שהושלמה', 'Journal note or completed milestone')} value={milestone} onChange={setMilestone} options={[{ value: '-1', label: t('עדכון מהעונה', 'Season update') }, ...journey.milestones.map((step, i) => ({ value: String(i), label: `${i + 1}. ${step}` }))]} />
    <Field label={t('מה קרה בשמירה?', 'What happened in your save?')} value={note} onChangeText={setNote} maxLength={600} multiline />
    <Muted>{Number(milestone) >= 0 ? t('עדכון חוזר מחליף את הדיווח הקודם לאותה אבן דרך.', 'Posting again replaces your previous report for this milestone.') : t('העדכון מתווסף ליומן ואינו מסמן אבן דרך כהושלמה.', 'This note is added to the journal without completing a milestone.')}</Muted>
   <CommunityError error={error} /><Button label={t('שמירת העדכון', 'Save update')} disabled={busy || note.trim().length < 3} onPress={() => void act('update_journey')} />
   </Panel> : null}
   <Title>{t('האנשים וההתקדמות', 'Players & progress')}</Title>
   {journey.career_journey_members.map((m) => {
    const complete = updates.filter((u) => u.user_id === m.user_id && u.milestone >= 0).length;
    return <Card key={m.user_id}><Muted>{query.data?.profiles.find((p) => p.id === m.user_id)?.display_name || t('שחקן קהילה', 'Community player')}{!m.active ? t(' · עזב את המסע', ' · Left journey') : ''}</Muted>
     <Muted>{m.club} · {m.difficulty} · {t('עונה', 'Season')} {m.season} · {complete}/{journey.milestones.length}</Muted>
     <View style={activityStyles.progress}><View style={{ height: 6, width: `${100 * complete / journey.milestones.length}%`, backgroundColor: '#75E6B9' }} /></View>
    </Card>;
   })}
   <Title>{t('יומן העונה', 'Season journal')}</Title>
   {!updates.length ? <Muted>{t('העדכון הראשון יופיע כאן. בינתיים מתחילים לשחק.', 'The first update will appear here. Time to kick off.')}</Muted> : null}
   {updates.map((u) => <Card key={u.id}>
    <Muted>{query.data?.profiles.find((p) => p.id === u.user_id)?.display_name || t('שחקן קהילה', 'Community player')} · {new Date(u.created_at).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-GB')}</Muted>
    <Title>{u.milestone >= 0 ? journey.milestones[u.milestone] : t('עדכון מהעונה', 'Season update')}</Title><Muted>{u.note}</Muted>
   </Card>)}
   {open && mine?.active && !owner ? <Button disabled={busy} variant="ghost" label={t('עזיבת המסע (העדכונים נשמרים)', 'Leave journey (keep updates)')} onPress={() => void act('leave_journey')} /> : null}
   {open && owner ? <Button disabled={busy} variant="danger" label={confirmArchive ? t('אישור סגירת המסע', 'Confirm archive') : t('סגירת המסע ושמירת היומן', 'Archive journey & preserve journal')} onPress={() => confirmArchive ? void act('archive_journey') : setConfirmArchive(true)} /> : null}
  </> : null}
 </Screen>;
}
