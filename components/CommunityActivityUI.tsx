import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GROUNDS_PREVIEW_BACKGROUND } from '@/assets/groundsPreviewBackground';
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
 const { language } = useLanguage(); const rtl = language === 'he';
 return <View style={{ gap: 9, minWidth: 0 }}><Text style={[activityStyles.label, { textAlign: rtl ? 'right' : 'left' }]}>{label}</Text><View style={[activityStyles.wrap, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
  {options.map((o) => <Pressable key={o.value} accessibilityRole="button" accessibilityLabel={o.label} accessibilityState={{ selected: value === o.value }} onPress={() => onChange(o.value)} style={[activityStyles.chip, value === o.value && activityStyles.chipActive]}>
   <Text style={[activityStyles.chipText, value === o.value && { color: '#88F0F0' }]}>{o.label}</Text></Pressable>)}
 </View></View>;
}
export function ActivityField({ label, value, onChangeText, placeholder, maxLength, multiline = false }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; maxLength?: number; multiline?: boolean }) {
 const { language } = useLanguage(); const rtl = language === 'he';
 return <View style={{ gap: 8, minWidth: 0 }}>
  <Text style={[activityStyles.label, { textAlign: rtl ? 'right' : 'left' }]}>{label}</Text>
  <TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#78909E" maxLength={maxLength} multiline={multiline} style={{ width: '100%', minHeight: multiline ? 106 : 48, borderWidth: 1, borderColor: '#2B4553', borderRadius: 5, backgroundColor: '#020C15', paddingHorizontal: 13, paddingVertical: 13, color: '#F5F8FA', fontSize: 14, lineHeight: 21, textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr', textAlignVertical: multiline ? 'top' : 'center' }} />
 </View>;
}
export function ActivitySurface({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
 if (onPress) return <Pressable accessibilityRole="button" onPress={onPress} style={activityStyles.surface}>{children}</Pressable>;
 return <View style={activityStyles.surface}>{children}</View>;
}
export function Panel({ eyebrow, title, children }: { eyebrow?: string; title: string; children: ReactNode }) {
 const { language } = useLanguage(); const rtl = language === 'he';
 return <View style={activityStyles.panel}>
  <View style={[activityStyles.sectionHead, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
   {eyebrow ? <Text style={activityStyles.eyebrow}>{eyebrow}</Text> : null}
   <Text style={[activityStyles.heading, { textAlign: rtl ? 'right' : 'left' }]}>{title}</Text>
  </View><View style={{ gap: 18 }}>{children}</View>
 </View>;
}
export function ActivityHero({ kind, title, description, children }: { kind: 'sessions' | 'journeys'; title: string; description: string; children?: ReactNode }) {
 const { t, language } = useLanguage(); const rtl = language === 'he'; const career = kind === 'journeys'; const accent = career ? '#E9C36A' : '#44D8E5';
 return <ImageBackground testID={career ? 'community-hero-journeys' : 'community-hero-sessions'} source={career ? require('@/assets/images/scene-career-scout.png') : { uri: GROUNDS_PREVIEW_BACKGROUND }} resizeMode="cover" style={activityStyles.hero} imageStyle={{ opacity: 0.55 }}>
  <LinearGradient colors={['rgba(3,12,20,0.42)', 'rgba(3,12,20,0.98)']} style={activityStyles.heroContent}>
   <View style={[activityStyles.heroTop, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
    <View style={[activityStyles.heroIcon, { borderColor: accent }]}><Ionicons name={career ? 'trophy-outline' : 'people-outline'} size={22} color={accent} /></View>
    <Text style={[activityStyles.eyebrow, { color: accent }]}>{career ? 'CAREER / COMMUNITY' : 'THE GROUNDS / MATCHDAY'}</Text>
   </View>
   <Text style={[activityStyles.heroTitle, { textAlign: rtl ? 'right' : 'left' }]}>{title}</Text>
   <Text style={[activityStyles.heroDescription, { textAlign: rtl ? 'right' : 'left' }]}>{description}</Text>
   <View style={{ alignSelf: 'stretch', gap: 12 }}>{children}</View>
   <View style={[activityStyles.heroFooter, { borderTopColor: career ? '#6B5630' : '#24515A' }]}><Text style={[activityStyles.label, { color: accent, textAlign: rtl ? 'right' : 'left' }]}>{career ? t('שמירות אישיות · חוקים משותפים · יומן עונה', 'Individual saves · Shared rules · Season journal') : t('Rush · Clubs · Co-op · חבורה שבועית', 'Rush · Clubs · Co-op · Weekly squads')}</Text></View>
  </LinearGradient>
 </ImageBackground>;
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
 hero: { width: '100%', overflow: 'hidden', borderWidth: 1, borderColor: '#284450', borderRadius: 8, backgroundColor: '#040D16' },
 heroContent: { padding: 24, paddingTop: 28, gap: 18 },
 heroTop: { alignItems: 'center', gap: 12 },
 heroIcon: { width: 42, height: 42, borderWidth: 1, borderRadius: 7, backgroundColor: 'rgba(3,15,23,0.8)', alignItems: 'center', justifyContent: 'center' },
 heroTitle: { color: '#FFFFFF', fontSize: 32, lineHeight: 39, fontWeight: '900', flexShrink: 1 },
 heroDescription: { color: '#CEDAE1', fontSize: 14, lineHeight: 23, maxWidth: 640 },
 heroFooter: { paddingTop: 15, marginTop: 4, borderTopWidth: 1 },
 panel: { backgroundColor: 'rgba(3,13,22,0.96)', borderWidth: 1, borderColor: '#253F4C', borderRadius: 7, padding: 18, gap: 20, width: '100%' },
 surface: { width: '100%', minWidth: 0, backgroundColor: 'rgba(3,13,22,0.96)', borderWidth: 1, borderColor: '#253F4C', borderRadius: 7, padding: 18, gap: 12 },
 sectionHead: { alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#203743', paddingBottom: 14 },
 eyebrow: { color: '#53DCE4', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, flexShrink: 1 },
 heading: { color: '#F3F7F9', fontSize: 20, lineHeight: 27, fontWeight: '900', flex: 1, minWidth: 0 },
 label: { color: '#A9BDC9', fontSize: 11, fontWeight: '800', lineHeight: 17 },
 wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
 chip: { maxWidth: '100%', minHeight: 44, justifyContent: 'center', borderWidth: 1, borderColor: '#304654', backgroundColor: '#07131F', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 5 },
 chipActive: { backgroundColor: '#103A45', borderColor: '#44D8E5' },
 chipText: { color: '#D6E2E9', fontSize: 12, fontWeight: '800', flexShrink: 1 },
 progress: { height: 6, backgroundColor: '#20323F', borderRadius: 2, overflow: 'hidden' },
});
