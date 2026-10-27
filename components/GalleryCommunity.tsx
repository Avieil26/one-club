import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { useRouter } from 'expo-router';
import { GalleryButton, GalleryPanel, GalleryText } from '@/components/GalleryUI';
import { galleryProofUrls, loadGallerySubmissions, moderateGallerySolution } from '@/lib/galleryCommunity';
import { useApp } from '@/lib/store';
import { useLanguage } from '@/lib/language';
import type { GallerySubmission } from '@/lib/galleryTypes';
export function GalleryCommunity({ setId, pendingOnly = false, onChoose, onCount }: { setId?: number; pendingOnly?: boolean; onChoose?: (solution: GallerySubmission) => void; onCount?: (count: number) => void }) {
 const { t } = useLanguage(), app = useApp(), router = useRouter();
 const [rows, setRows] = useState<GallerySubmission[]>([]), [failed, setFailed] = useState(false), [version, setVersion] = useState(0);
 const userId = app.user?.id;
 useEffect(() => { let active = true; void loadGallerySubmissions(setId, pendingOnly).then(data => { if (active) { setRows(data); setFailed(false); onCount?.(data.length); } }).catch(() => { if (active) setFailed(true); }); return () => { active = false; }; }, [setId, pendingOnly, version, userId, onCount]);
 return <View style={{ gap: 14 }}><GalleryText size={23} style={{ fontWeight: '800' }}>{pendingOnly ? t('פתרונות גלריה לאישור', 'Gallery solutions awaiting review') : t('פתרונות הקהילה', 'Community solutions')}</GalleryText><GalleryText quiet size={13}>{t('פתרונות מתפרסמים רק אחרי בדיקת מנהל. עצם ההעלאה אינה מעניקה XP.', 'Solutions are published only after administrator review. Uploading alone does not award XP.')}</GalleryText>
 {failed ? <><GalleryText>{t('לא ניתן לטעון פתרונות כרגע.', 'Solutions could not be loaded.')}</GalleryText><GalleryButton label={t('ניסיון נוסף', 'Try again')} onPress={() => setVersion(n=>n+1)} /></> : !rows.length ? <GalleryText quiet>{t('אין כרגע פתרונות להצגה.', 'There are no solutions to display yet.')}</GalleryText> : null}
 {rows.map(solution => <CommunitySolution key={solution.id} solution={solution} onRefresh={() => setVersion(n=>n+1)} onChoose={() => onChoose ? onChoose(solution) : router.push(`/gallery/${solution.set_id}?review=${solution.id}`)} author={app.profiles.find(p=>p.id===solution.user_id)?.displayName || t('חבר קהילה', 'Community member')} admin={!!app.user?.isAdmin} />)}
 </View>;
}
function CommunitySolution({ solution, onRefresh, onChoose, author, admin }: { solution: GallerySubmission; onRefresh: () => void; onChoose: () => void; author: string; admin: boolean }) {
 const { t } = useLanguage();
 const [urls, setUrls] = useState<string[]>([]), [busy, setBusy] = useState(false), [error, setError] = useState(false);
 async function showProof() { setBusy(true); try { setUrls(await galleryProofUrls(solution.proof_paths)); setError(false); } catch { setError(true); } finally { setBusy(false); } }
 async function moderate(status: 'approved' | 'rejected') { setBusy(true); try { await moderateGallerySolution(solution.id,status); onRefresh(); } catch { setError(true); } finally { setBusy(false); } }
 return <GalleryPanel><GalleryText size={19} style={{ fontWeight: '700' }}>{solution.title}</GalleryText><GalleryText quiet size={13}>{author} · {solution.claimed_grade} · {solution.game_score.toLocaleString('en-US')}</GalleryText><GalleryText>{solution.note}</GalleryText><GalleryText size={13} style={{ color: '#E1C798' }}>{solution.status === 'approved' ? t('אושר על ידי מנהל', 'Approved by an administrator') : solution.status === 'pending' ? t('ממתין לאישור מנהל', 'Awaiting administrator review') : t('הפתרון לא אושר', 'Solution not approved')}</GalleryText>
  <GalleryButton label={t('צפייה בקלפים', 'View items')} onPress={onChoose} /><GalleryButton label={t('צילום הדירוג במשחק', 'In-game grading proof')} disabled={busy} onPress={() => void showProof()} />
  {urls.map(uri=><Image key={uri} source={{uri}} resizeMode="contain" style={{ width: '100%', height: 260 }} />)}
  {admin ? <View style={{gap:8}}><GalleryButton label={t('אישור ופרסום פתרון הגלריה', 'Approve and publish Gallery solution')} disabled={busy || !urls.length || solution.status === 'approved'} onPress={() => void moderate('approved')} primary /><GalleryButton label={t('דחייה / ביטול האישור', 'Reject / revoke approval')} disabled={busy} onPress={() => void moderate('rejected')} /></View> : null}
  {error ? <GalleryText>{t('הפעולה נכשלה. נסו שוב.', 'The action failed. Please try again.')}</GalleryText> : null}
 </GalleryPanel>;
}
