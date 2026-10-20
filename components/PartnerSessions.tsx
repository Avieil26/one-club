import { useCallback, useState } from 'react';
import { Share } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Button, Card, Field, Muted, Screen, Title } from '@/components/ui';
import { Choices, CommunityError, CommunitySignIn, Panel, useActivityQuery, useCommunityNow } from '@/components/CommunityActivityUI';
import { communityAction, loadActivity, loadCommunityNames, loadSessions, localSessionTime, localTimeInput, PLATFORMS, sessionMatches, type PartnerSession } from '@/lib/communityActivities';
import { communityActivityUrl } from '@/lib/communitySharing';
import { useApp } from '@/lib/store';
import { useLanguage } from '@/lib/language';

const MODES = ['Rush', 'Clubs', 'Co-op', 'Practice'];
const REGIONS = ['Middle East', 'Europe', 'Americas', 'Asia-Pacific'];
function useSessionOptions() {
 const { t } = useLanguage();
 return {
  modes: MODES.map((value) => ({ value, label: value === 'Practice' ? t('אימון', 'Practice') : value })),
  regions: REGIONS.map((value, i) => ({ value, label: [t('מזרח תיכון', 'Middle East'), t('אירופה', 'Europe'), t('אמריקה', 'Americas'), t('אסיה והפסיפיק', 'Asia-Pacific')][i] })),
  languages: [{ value: 'he', label: t('עברית', 'Hebrew') }, { value: 'en', label: t('אנגלית', 'English') }],
  styles: [{ value: 'casual', label: t('רגוע ומשימות', 'Casual & objectives') }, { value: 'competitive', label: t('תחרותי', 'Competitive') }],
 };
}
function SessionInfo({ session }: { session: PartnerSession }) {
 const { t, language } = useLanguage(); const options = useSessionOptions();
 const now = useCommunityNow();
 const joined = session.partner_session_members.filter((m) => m.status === 'joined').length;
 const date = new Date(session.starts_at).toLocaleString(language === 'he' ? 'he-IL' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });
 return <>
  <Muted>{date} · {t('בזמן המקומי שלך', 'Your local time')}</Muted>
  <Muted>{session.mode} · {session.platforms.join(' / ')} · {joined}/{session.capacity} {t('שחקנים', 'players')}</Muted>
  <Muted>{options.regions.find((o) => o.value === session.region)?.label} · {options.languages.find((o) => o.value === session.language)?.label} · {options.styles.find((o) => o.value === session.play_style)?.label}</Muted>
  <Muted>{session.status === 'cancelled' ? t('בוטל', 'Cancelled') : session.status === 'completed' ? t('הסתיים', 'Completed') : new Date(session.starts_at).getTime() < now ? t('שעת ההתחלה עברה', 'Start time has passed') : session.weekly ? t('חבורה שבועית', 'Weekly group') : t('מפגש חד־פעמי', 'One-off session')}</Muted>
 </>;
}
export function PartnerSessionsList() {
 const { user } = useApp(); const uid = user?.id; const { t, language } = useLanguage(); const router = useRouter(); const options = useSessionOptions();
 const [scope, setScope] = useState('upcoming');
 const [platform, setPlatform] = useState(''); const [mode, setMode] = useState(''); const [region, setRegion] = useState(''); const [filterLanguage, setFilterLanguage] = useState<string>(language); const [day, setDay] = useState('');
 const loader = useCallback(() => loadSessions(scope as 'upcoming' | 'mine', uid!, { platform, mode, language: filterLanguage, region }), [scope, uid, platform, mode, filterLanguage, region]);
 const query = useActivityQuery(loader, Boolean(uid)); const all = { value: '', label: t('הכול', 'All') };
 const sessions = (query.data ?? []).filter((s) => scope === 'mine' || sessionMatches(s, { platform, mode, region, language: filterLanguage, day }));
 return <Screen scene="grounds" refreshing={query.loading} onRefresh={query.refresh} maxWidth={840}>
  <Stack.Screen options={{ title: t('חבורה קבועה', 'Regular squad') }} />
  <Panel eyebrow="THE GROUNDS / PLAY TOGETHER" title={t('קובעים. משחקים. חוזרים ביחד.', 'Plan it. Play it. Come back together.')}>
   <Muted>{t('קבעו שעה למשימות, Rush, Clubs או אימון. אחרי מפגש מוצלח אפשר להזמין את אותה חבורה לשבוע הבא.', 'Set a time for objectives, Rush, Clubs or practice. After a good session, invite the same group back next week.')}</Muted>
   {uid ? <Button label={t('קביעת מפגש', 'Schedule a session')} onPress={() => router.push('/grounds/sessions/new')} /> : <CommunitySignIn />}
  </Panel>
  {uid ? <>
   <Choices label={t('המפגשים', 'Sessions')} value={scope} onChange={setScope} options={[{ value: 'upcoming', label: t('מפגשים קרובים', 'Upcoming') }, { value: 'mine', label: t('שלי והזמנות', 'Mine & invitations') }]} />
   {scope === 'upcoming' ? <Card>
    <Choices label={t('פלטפורמה', 'Platform')} value={platform} onChange={setPlatform} options={[all, ...PLATFORMS.map((v) => ({ value: v, label: v }))]} />
    <Choices label={t('מצב משחק', 'Mode')} value={mode} onChange={setMode} options={[all, ...options.modes]} />
    <Choices label={t('שפה', 'Language')} value={filterLanguage} onChange={setFilterLanguage} options={[all, ...options.languages]} />
    <Choices label={t('אזור', 'Region')} value={region} onChange={setRegion} options={[all, ...options.regions]} />
    <Field label={t('תאריך מקומי, רשות (YYYY-MM-DD)', 'Local date, optional (YYYY-MM-DD)')} value={day} onChangeText={setDay} maxLength={10} placeholder="2026-10-24" />
   </Card> : null}
   <Button label={t('רענון מפגשים', 'Refresh sessions')} onPress={query.refresh} variant="ghost" />
   <CommunityError error={query.error} />
   {query.loading ? <Muted>{t('טוען מפגשים…', 'Loading sessions…')}</Muted> : null}
   {!query.loading && !query.error && !sessions.length ? <Card><Title>{t('החבורה הבאה מתחילה איתך', 'The next squad starts with you')}</Title><Muted>{t('אין מפגשים שמתאימים כרגע. נסו לשנות סינון או קבעו שעה והזמינו חברים דרך קישור.', 'No matching sessions yet. Change the filters or set a time and invite friends with a link.')}</Muted></Card> : null}
   {sessions.map((s) => <Card key={s.id}>
    <Title>{s.title}</Title><SessionInfo session={s} />
    {s.partner_session_members.some((m) => m.user_id === uid && m.status === 'invited') ? <Muted>{t('החבורה הזמינה אותך שוב — צריך לאשר הגעה', 'Your squad invited you back — confirm your spot')}</Muted> : null}
    <Button label={t('פרטים והצטרפות', 'Details & join')} onPress={() => router.push(`/grounds/sessions/${s.id}`)} variant="ghost" />
   </Card>)}
  </> : null}
 </Screen>;
}
export function PartnerSessionForm() {
 const { user } = useApp(); const { t, language } = useLanguage(); const router = useRouter(); const options = useSessionOptions();
 const [title, setTitle] = useState(''); const [mode, setMode] = useState('Rush'); const [platform, setPlatform] = useState<string>('PS5'); const [platforms, setPlatforms] = useState<string[]>(['PS5']);
 const [region, setRegion] = useState(language === 'he' ? 'Middle East' : 'Europe'); const [spoken, setSpoken] = useState<string>(language); const [style, setStyle] = useState('casual'); const [capacity, setCapacity] = useState('4'); const [weekly, setWeekly] = useState('yes'); const [notes, setNotes] = useState('');
 const [time, setTime] = useState(() => localTimeInput(new Date(Date.now() + 7200_000))); const [error, setError] = useState<unknown>(null); const [busy, setBusy] = useState(false);
 async function create() {
  if (busy) return; setError(null); const startsAt = localSessionTime(time);
  if (!startsAt) { setError(new Error('INVALID_TIME')); return; }
  if (title.trim().length < 3 || !platforms.length) { setError(new Error('INVALID_FORM')); return; }
  setBusy(true);
  try {
   const id = await communityAction('create_session', { title: title.trim(), mode, platform, platforms, region, language: spoken, play_style: style, capacity: Number(capacity), weekly: weekly === 'yes', notes: notes.trim(), starts_at: startsAt, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' });
   router.replace(`/grounds/sessions/${id}`);
  } catch (e) { setError(e); } finally { setBusy(false); }
 }
 return <Screen scene="grounds" maxWidth={740}>
  <Stack.Screen options={{ title: t('מפגש חדש', 'New session') }} />
  <Title>{t('מפגש חדש', 'New session')}</Title>
  {!user ? <CommunitySignIn /> : <Panel title={t('מקום ושעה לחבורה שלך', 'A time and place for your squad')}>
   <Field label={t('שם המפגש', 'Session title')} value={title} onChangeText={setTitle} maxLength={90} placeholder={t('למשל: משימות Rush בלי לחץ', 'e.g. Relaxed Rush objectives')} />
   <Choices label={t('מצב משחק', 'Mode')} value={mode} options={options.modes} onChange={(v) => { setMode(v); setCapacity(v === 'Clubs' ? '11' : v === 'Rush' ? '4' : '2'); }} />
   <Choices label={t('הפלטפורמה שלי', 'My platform')} value={platform} options={PLATFORMS.map((v) => ({ value: v, label: v }))} onChange={(v) => { setPlatform(v); setPlatforms((p) => [...new Set([...p, v])]); }} />
   <Muted>{t('פלטפורמות שמותר להצטרף מהן:', 'Platforms allowed to join:')}</Muted>
   {PLATFORMS.map((p) => <Button key={p} label={`${platforms.includes(p) ? '✓ ' : '+ '}${p}`} variant={platforms.includes(p) ? 'primary' : 'ghost'} onPress={() => setPlatforms((items) => items.includes(p) ? items.filter((v) => v !== p || v === platform) : [...items, p])} />)}
   <Muted>{t('בחרו רק פלטפורמות שמתאימות לגרסת המשחק ול־Cross-play שלכם.', 'Allow only platforms compatible with your game version and cross-play settings.')}</Muted>
   <Choices label={t('אזור שרתים', 'Server region')} value={region} options={options.regions} onChange={setRegion} />
   <Choices label={t('שפה במפגש', 'Session language')} value={spoken} options={options.languages} onChange={setSpoken} />
   <Choices label={t('סגנון', 'Play style')} value={style} options={options.styles} onChange={setStyle} />
   <Field label={t('תאריך ושעה מקומיים (YYYY-MM-DD HH:mm)', 'Local date & time (YYYY-MM-DD HH:mm)')} value={time} onChangeText={setTime} maxLength={16} placeholder="2026-10-24 20:30" />
   <Muted>{t('אזור זמן: ', 'Timezone: ')}{Intl.DateTimeFormat().resolvedOptions().timeZone}</Muted>
   <Choices label={t('מקומות, כולל אותך', 'Spots, including you')} value={capacity} options={(mode === 'Clubs' ? ['2','4','6','11'] : mode === 'Rush' ? ['2','4'] : ['2']).map((v) => ({ value: v, label: v }))} onChange={setCapacity} />
   <Choices label={t('לשחק שוב עם אותה חבורה', 'Play again with the same squad')} value={weekly} options={[{ value: 'yes', label: t('חבורה שבועית', 'Weekly group') }, { value: 'no', label: t('חד־פעמי', 'One-off') }]} onChange={setWeekly} />
   <Field label={t('משימות, עמדות ותיאום (רשות)', 'Objectives, positions & coordination (optional)')} value={notes} onChangeText={setNotes} maxLength={600} multiline />
   <CommunityError error={error} /><Button label={busy ? t('שומר…', 'Saving…') : t('פרסום המפגש', 'Publish session')} disabled={busy || title.trim().length < 3} onPress={() => void create()} />
   <Button label={t('חזרה', 'Back')} variant="ghost" onPress={() => router.back()} />
  </Panel>}
 </Screen>;
}
export function PartnerSessionDetail({ id }: { id: string }) {
 const { user } = useApp(); const uid = user?.id; const { t } = useLanguage(); const router = useRouter();
 const loader = useCallback(async () => {
  const session = await loadActivity('session', id) as PartnerSession | null;
  const profiles = session ? await loadCommunityNames(session.partner_session_members.map((m) => m.user_id)) : [];
  return { session, profiles };
 }, [id]);
 const query = useActivityQuery(loader, Boolean(uid)); const session = query.data?.session;
 const [platform, setPlatform] = useState(''); const [error, setError] = useState<unknown>(null); const [busy, setBusy] = useState(false); const [confirmCancel, setConfirmCancel] = useState(false);
 const now = useCommunityNow();
 const mine = session?.partner_session_members.find((m) => m.user_id === uid);
 const full = (session?.partner_session_members.filter((m) => m.status === 'joined').length ?? 0) >= (session?.capacity ?? 0);
 const host = session?.host_user_id === uid; const future = session ? new Date(session.starts_at).getTime() > now : false;
 async function act(action: string) {
  if (busy) return; setBusy(true); setError(null);
  try { const next = await communityAction(action, { id, platform: platform || mine?.platform || session?.platforms[0] });
   if (action === 'repeat_session') router.push(`/grounds/sessions/${next}`); else query.refresh();
  } catch (e) { setError(e); query.refresh(); } finally { setBusy(false); }
 }
 return <Screen scene="grounds" refreshing={query.loading} onRefresh={query.refresh} maxWidth={800}>
  <Stack.Screen options={{ title: t('מפגש החבורה', 'Squad session') }} />
  <Button label={t('כל המפגשים', 'All sessions')} onPress={() => router.replace('/grounds/sessions')} variant="ghost" />
  {uid ? <Button label={t('רענון המפגש', 'Refresh session')} onPress={query.refresh} variant="ghost" /> : null}
  {!uid ? <CommunitySignIn /> : null}<CommunityError error={query.error || error} />
  {query.loading ? <Muted>{t('טוען…', 'Loading…')}</Muted> : null}
  {uid && query.data && !session ? <Title>{t('המפגש לא נמצא', 'Session not found')}</Title> : null}
  {session ? <>
   <Panel eyebrow="THE GROUNDS / SQUAD SESSION" title={session.title}><SessionInfo session={session} />{session.notes ? <Muted>{session.notes}</Muted> : null}
    <Button label={t('שיתוף קישור לחברים', 'Share a link with friends')} variant="ghost" onPress={() => { void Share.share({ message: `${session.title}\n${communityActivityUrl('session', id)}` }).catch(setError); }} />
   </Panel>
   {!host && session.status === 'open' && future && mine?.status !== 'joined' ? <Card>
    <Choices label={t('הפלטפורמה שלי', 'My platform')} value={platform || mine?.platform || session.platforms[0]} options={session.platforms.map((v) => ({ value: v, label: v }))} onChange={setPlatform} />
    <Button disabled={busy || full} label={full ? t('המפגש מלא כרגע', 'Session is full') : mine?.status === 'invited' ? t('אישור הגעה', 'Accept invitation') : t('הצטרפות למפגש', 'Join session')} onPress={() => void act('join_session')} />
   </Card> : null}
   {!host && session.status === 'open' && future && (mine?.status === 'joined' || mine?.status === 'invited') ? <Button disabled={busy} label={t('לא אוכל להגיע', 'I cannot make it')} onPress={() => void act('leave_session')} variant="ghost" /> : null}
   <Title>{t('החבורה', 'The squad')}</Title>
   {session.partner_session_members.filter((m) => m.status !== 'left').map((m) => <Card key={m.user_id}>
    <Muted>{query.data?.profiles.find((p) => p.id === m.user_id)?.display_name || t('שחקן קהילה', 'Community player')} · {m.platform} · {m.status === 'invited' ? t('ממתין לאישור', 'Invited') : t('מגיע', 'Confirmed')}</Muted>
    {m.user_id !== uid ? <Button label={t('הודעה פרטית', 'Direct message')} onPress={() => router.push(`/grounds/chat/${m.user_id}`)} variant="ghost" /> : null}
   </Card>)}
   {host && session.status === 'open' ? <Card>
    {!future ? <Button disabled={busy} label={t('המפגש הסתיים', 'Complete session')} onPress={() => void act('complete_session')} /> : null}
    <Button disabled={busy} label={confirmCancel ? t('אישור ביטול המפגש', 'Confirm cancellation') : t('ביטול המפגש', 'Cancel session')} variant="danger" onPress={() => confirmCancel ? void act('cancel_session') : setConfirmCancel(true)} />
   </Card> : null}
   {host && session.weekly && session.status === 'completed' ? <Card><Muted>{t('נזמין את מי שהצטרף למפגש הבא באותו יום ובאותה שעה. כל שחקן צריך לאשר מחדש.', 'Invite confirmed players to next week at the same local time. Everyone needs to accept again.')}</Muted><Button disabled={busy} label={t('הזמנת החבורה לשבוע הבא', 'Invite squad to next week')} onPress={() => void act('repeat_session')} /></Card> : null}
  </> : null}
 </Screen>;
}
