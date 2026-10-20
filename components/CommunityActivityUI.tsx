import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, colors, Muted } from '@/components/ui';
import { useLanguage } from '@/lib/language';

export function useActivityQuery<T>(loader: () => Promise<T>, enabled: boolean) {
 const [revision, setRevision] = useState(0);
 const [result, setResult] = useState<{ loader: typeof loader; revision: number; data: T | null; error: unknown } | null>(null);
 const generation = useRef(0);
 useEffect(() => {
  const current = ++generation.current;
  if (!enabled) return;
  loader().then((data) => { if (current === generation.current) setResult({ loader, revision, data, error: null }); })
   .catch((error: unknown) => { if (current === generation.current) setResult({ loader, revision, data: null, error }); });
  return () => { generation.current += 1; };
 }, [loader, enabled, revision]);
 const current = enabled && result?.loader === loader ? result : null;
 return { data: current?.data ?? null, error: current?.error ?? null, loading: enabled && (!current || current.revision !== revision), refresh: () => setRevision((v) => v + 1) };
}
export function useCommunityNow() {
 const [now, setNow] = useState(Date.now);
 useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(timer); }, []);
 return now;
}
export function Choices({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
 return <View style={{ gap: 8 }}><Muted>{label}</Muted><View style={activityStyles.wrap}>
  {options.map((o) => <Pressable key={o.value} accessibilityRole="button" accessibilityState={{ selected: value === o.value }} onPress={() => onChange(o.value)} style={[activityStyles.chip, value === o.value && activityStyles.chipActive]}>
   <Text style={activityStyles.chipText}>{o.label}</Text></Pressable>)}
 </View></View>;
}
export function Panel({ eyebrow, title, children }: { eyebrow?: string; title: string; children: ReactNode }) {
 const { language } = useLanguage();
 return <View style={activityStyles.panel}>
  {eyebrow ? <Text style={[activityStyles.eyebrow, { textAlign: language === 'he' ? 'right' : 'left' }]}>{eyebrow}</Text> : null}
  <Text style={[activityStyles.heading, { textAlign: language === 'he' ? 'right' : 'left' }]}>{title}</Text>{children}
 </View>;
}
export function CommunitySignIn() {
 const { t } = useLanguage(); const router = useRouter();
 return <Card><Muted>{t('מתחברים כדי לתאם עם שחקנים ולשמור את ההתקדמות.', 'Sign in to coordinate with players and save your progress.')}</Muted>
  <Button label={t('התחברות', 'Sign in')} onPress={() => router.push('/login')} /></Card>;
}
const ERRORS: Record<string, [string, string]> = {
 SIGN_IN: ['צריך להתחבר מחדש.', 'Please sign in again.'],
 FULL: ['המפגש מלא כרגע. נסו שוב אחרי שהתפנה מקום.', 'This session is full. Retry when a spot opens.'],
 CLOSED: ['הפעילות נסגרה או כבר התחילה. רעננו את הרשימה.', 'This activity has closed or already started. Refresh the list.'],
 PLATFORM: ['בחרו פלטפורמה שהמארח מאפשר.', 'Choose a platform allowed by the host.'],
 OWNER_ONLY: ['רק יוצר הפעילות יכול לבצע את הפעולה.', 'Only the host can do this.'],
 INVALID_TIME: ['בחרו זמן בעוד 5 דקות עד 90 יום, בפורמט שמופיע בשדה.', 'Choose a time 5 minutes to 90 days ahead, using the format shown.'],
 JOIN_FIRST: ['הצטרפו למסע לפני עדכון ההתקדמות.', 'Join the journey before posting progress.'],
 MILESTONES: ['בחרו 1–6 אבני דרך שונות, באורך 3–100 תווים כל אחת.', 'Choose 1–6 different milestones, 3–100 characters each.'],
 HOST_LIMIT: ['סגרו פעילות קיימת לפני פתיחת פעילות חדשה.', 'Close an existing activity before creating another.'],
 NOT_STARTED: ['אפשר לסיים את המפגש רק אחרי שעת ההתחלה.', 'You can complete a session after its start time.'],
 NOT_COMPLETED: ['מסיימים את המפגש השבועי לפני הזמנת החבורה למפגש הבא.', 'Complete the weekly session before inviting the group to the next one.'],
 NOT_FOUND: ['הפעילות לא נמצאה.', 'Activity not found.'],
};
export function CommunityError({ error }: { error: unknown }) {
 const { language, t } = useLanguage(); if (!error) return null;
 const message = typeof error === 'object' && 'message' in error ? String(error.message) : '';
 const key = Object.keys(ERRORS).find((code) => message.includes(code));
 return <Text accessibilityRole="alert" style={{ color: colors.danger, lineHeight: 23, textAlign: language === 'he' ? 'right' : 'left' }}>
  {key ? ERRORS[key][language === 'he' ? 0 : 1] : t('הפעולה לא הושלמה. בדקו את הפרטים והחיבור ונסו שוב.', 'Could not complete this action. Check your details and connection, then retry.')}
 </Text>;
}
export const activityStyles = StyleSheet.create({
 panel: { backgroundColor: '#101F2A', borderWidth: 1, borderColor: '#2B495A', borderRadius: 20, padding: 20, gap: 14, width: '100%' },
 eyebrow: { color: '#75E6B9', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
 heading: { color: '#F3F7F9', fontSize: 23, fontWeight: '900', flexShrink: 1 },
 wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
 chip: { maxWidth: '100%', borderWidth: 1, borderColor: '#3A5262', backgroundColor: '#101923', paddingHorizontal: 13, paddingVertical: 10, borderRadius: 12 },
 chipActive: { backgroundColor: '#164C43', borderColor: '#75E6B9' },
 chipText: { color: '#F3F7F9', fontSize: 13, fontWeight: '700', flexShrink: 1 },
 progress: { height: 6, backgroundColor: '#243747', borderRadius: 6, overflow: 'hidden' },
});
