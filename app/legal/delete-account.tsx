import { Link, Stack } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LegalLinks } from '@/components/LegalLinks';
import { SiteNav } from '@/components/SiteNav';
import { colors } from '@/components/ui';
import { useLanguage } from '@/lib/language';

const email = 'avielindapurkar717@gmail.com';
// Encode reserved punctuation too: Expo Router treats raw parentheses as route groups.
function mailPart(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}
export default function DeleteAccountScreen() {
  const { isRTL, t } = useLanguage();
  const textStyle = { color: colors.text, fontSize: 16, lineHeight: 26, textAlign: isRTL ? 'right' as const : 'left' as const, writingDirection: isRTL ? 'rtl' as const : 'ltr' as const };
  const subject = 'ONE CLUB - Account and data deletion request';
  const body = t('שלום ONE CLUB,\nאני מבקש/ת למחוק את החשבון שלי ואת הנתונים המשויכים אליו.\nכתובת האימייל של החשבון:\nשם תצוגה (לא חובה):', 'Hello ONE CLUB,\nPlease delete my account and its associated data.\nAccount email:\nDisplay name (optional):');
  const requestUrl = `mailto:${email}?subject=${mailPart(subject)}&body=${mailPart(body)}`;
  return <View style={{ flex: 1, backgroundColor: colors.bg }}>
    <Stack.Screen options={{ headerShown: false, title: t('מחיקת חשבון ונתונים', 'Account and data deletion') }} />
    <ScrollView contentContainerStyle={{ width: '100%', maxWidth: 840, alignSelf: 'center', padding: 20, paddingBottom: 64, gap: 20 }}>
      <SiteNav />
      <View testID="account-deletion-page" style={{ gap: 18 }}>
        <Text accessibilityRole="header" style={[textStyle, { fontSize: 30, lineHeight: 40, fontWeight: '900' }]}>{t('ONE CLUB — מחיקת חשבון ונתונים', 'ONE CLUB — Account and data deletion')}</Text>
        <Text style={textStyle}>{t('אפשר לבקש כאן למחוק את חשבון ONE CLUB ואת הנתונים המשויכים אליו, גם ללא התחברות ובלי להתקין את האפליקציה מחדש.', 'Request deletion of your ONE CLUB account and its associated data here, without signing in or reinstalling the app.')}</Text>
        <Text accessibilityRole="header" style={[textStyle, { color: colors.gold, fontSize: 21, fontWeight: '800' }]}>{t('איך שולחים בקשה?', 'How to request deletion')}</Text>
        <Text style={textStyle}>{t('1. שלחו הודעה מהאימייל שאיתו נרשמתם, עם בקשה למחיקת החשבון והנתונים. אם אין לכם גישה לאימייל הזה, ציינו זאת בפנייה כדי שנוכל לבדוק דרך אחרת לאימות הבעלות.', '1. Email us from the address registered to your account, requesting account and data deletion. If you cannot access that address, explain this so we can discuss another way to verify ownership.')}</Text>
        <Link href={requestUrl} asChild><Pressable testID="request-account-deletion" accessibilityRole="link" style={{ minHeight: 52, borderRadius: 12, padding: 14, backgroundColor: '#FD6502', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center' }}>{t('בקשת מחיקה בדוא״ל', 'Request deletion by email')}</Text></Pressable></Link>
        <Text selectable testID="deletion-contact" style={[textStyle, { writingDirection: 'ltr', textAlign: 'center', color: colors.gold }]}>{email}</Text>
        <Text style={textStyle}>{t('אם לא נפתח יישום דוא״ל, העתיקו את הכתובת ושלחו אליה הודעה מתיבת הדוא״ל שלכם.', 'If no email app opens, copy the address and send a message from your email service.')}</Text>
        <Text style={textStyle}>{t('2. נאמת שהחשבון שייך לכם לפני טיפול בבקשה. אין לשלוח סיסמאות או קודי אימות.', '2. We verify account ownership before processing the request. Do not send passwords or verification codes.')}</Text>
        <Text style={textStyle}>{t('3. הבקשה חלה על החשבון, פרטי הפרופיל והנתונים המשויכים לחשבון, לרבות תוכן ותמונות שהעליתם. בקשה נשלחת לטיפול ואינה מוחקת את החשבון מיד בלחיצה.', '3. The request covers your account, profile and associated data, including content and photos you uploaded. Sending a request starts a review; clicking the link does not immediately delete your account.')}</Text>
        <Text accessibilityRole="header" style={[textStyle, { color: colors.gold, fontSize: 21, fontWeight: '800' }]}>{t('נתונים שייתכן שיישמרו', 'Data that may be retained')}</Text>
        <Text style={textStyle}>{t('כמפורט במדיניות הפרטיות, מידע שנדרש לשמור מכוח חובה חוקית עשוי להישמר. אם נדרשת שמירה כזו במקרה שלכם, נסביר במענה לבקשה מה נשמר, למה ולכמה זמן.', 'As described in our privacy policy, information subject to a legal retention obligation may be retained. If this applies to your request, we will explain what is retained, why and for how long in our response.')}</Text>
        <Link href="/legal/privacy" style={[textStyle, { color: colors.gold, textDecorationLine: 'underline' }]}>{t('למדיניות הפרטיות המלאה', 'Read the full privacy policy')}</Link>
      </View>
      <LegalLinks />
    </ScrollView>
  </View>;
}
