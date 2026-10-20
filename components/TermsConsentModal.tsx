import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { colors } from '@/components/ui';
import { inlineLatin } from '@/lib/legalBidi';
import { hasAcceptedTerms, recordAcceptedTerms } from '@/lib/legal';
import { useApp } from '@/lib/store';
import { useLanguage } from '@/lib/language';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function TermsConsentModal() {
  const app = useApp();
  const insets = useSafeAreaInsets();
  const { language, t } = useLanguage();
  const rtl = language === 'he';
  const router = useRouter();
  const userId = app.user?.id;
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [errorPrompt, setErrorPrompt] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setVisible(false);
      return;
    }

    void hasAcceptedTerms(userId).then((accepted) => {
      if (active && !accepted) {
        setVisible(true);
      }
    });

    return () => {
      active = false;
    };
  }, [userId]);

  if (!visible || !app.user) return null;

  async function handleAccept() {
    if (!checked) {
      setErrorPrompt(true);
      return;
    }
    setSaving(true);
    try {
      await recordAcceptedTerms(userId);
      setVisible(false);
    } catch {
      setVisible(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDecline() {
    try {
      await app.signOut();
    } catch {}
    setVisible(false);
    router.replace('/register');
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(3, 8, 6, 0.88)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
          paddingTop: Math.max(16, insets.top + 8),
          paddingBottom: Math.max(16, insets.bottom + 8),
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 520,
            maxHeight: '92%',
            backgroundColor: '#0C1510',
            borderColor: 'rgba(227, 179, 65, 0.45)',
            borderWidth: 1.5,
            borderRadius: 20,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.6,
            shadowRadius: 24,
          }}
        >
          {/* Header Bar */}
          <View
            style={{
              backgroundColor: 'rgba(227, 179, 65, 0.1)',
              borderBottomColor: 'rgba(227, 179, 65, 0.25)',
              borderBottomWidth: 1,
              paddingVertical: 14,
              paddingHorizontal: 18,
              flexDirection: 'row', direction: rtl ? 'rtl' : 'ltr',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', direction: rtl ? 'rtl' : 'ltr', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 18 }}>⚖️</Text>
              <Text style={{ flex: 1, color: colors.gold, fontWeight: '900', fontSize: 14, letterSpacing: 0.5 }}>
                {t('אישור תנאים נדרש • LEGAL CONSENT', 'Terms approval required • LEGAL CONSENT')}
              </Text>
            </View>
            <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '700' }}>1 CLUB</Text>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
            {/* Title & Welcome */}
            <View style={{ gap: 4 }}>
              <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900', textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }}>
                {rtl ? inlineLatin('ברוכים הבאים ל-FC27 ישראל!') : t('ברוכים הבאים ל-FC27 ישראל!', 'Welcome to FC27 Israel!')}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 22, textAlign: rtl ? 'right' : 'left' }}>
                {t(`שלום ${app.user.displayName}, לפני שתוכל/י להשתמש באפליקציה, חובה לקרוא ולאשר את תנאי השימוש ומדיניות הפרטיות המעודכנים.`, `Hello ${app.user.displayName}, please read and accept the current Terms of Use and Privacy Policy before using the app.`)}
              </Text>
            </View>

            {/* Core Highlights Box */}
            <View
              style={{
                backgroundColor: 'rgba(18, 28, 22, 0.85)',
                borderColor: 'rgba(80, 110, 92, 0.4)',
                borderWidth: 1,
                borderRadius: 14,
                padding: 14,
                gap: 10,
              }}
            >
              <View style={{ flexDirection: 'row', direction: rtl ? 'rtl' : 'ltr', alignItems: 'flex-start', gap: 8 }}>
                <Text style={{ color: colors.gold, fontSize: 14 }}>•</Text>
                <Text style={{ flex: 1, color: colors.text, fontSize: 13, lineHeight: 20, textAlign: rtl ? 'right' : 'left' }}>
                  <Text style={{ fontWeight: '800', color: colors.gold }}>{t('אתר מעריצים עצמאי:', 'Independent fan site:')} </Text>
                  {rtl
                    ? inlineLatin('האתר אינו קשור, מאושר או נתמך על ידי Electronic Arts Inc. כל המותגים, שמות המשחקים ותמונות השחקנים שייכים לבעליהם ומשמשים בשימוש הוגן (Fair Use) בלבד.')
                    : t('האתר אינו קשור, מאושר או נתמך על ידי Electronic Arts Inc. כל המותגים, שמות המשחקים ותמונות השחקנים שייכים לבעליהם ומשמשים בשימוש הוגן (Fair Use) בלבד.', 'This site is not affiliated with, endorsed, or supported by Electronic Arts Inc. All brands, game names, and player images belong to their respective owners and are used under applicable fair-use principles.')}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', direction: rtl ? 'rtl' : 'ltr', alignItems: 'flex-start', gap: 8 }}>
                <Text style={{ color: colors.gold, fontSize: 14 }}>•</Text>
                <Text style={{ flex: 1, color: colors.text, fontSize: 13, lineHeight: 20, textAlign: rtl ? 'right' : 'left' }}>
                  <Text style={{ fontWeight: '800', color: colors.gold }}>{t('איסור סחר בכסף אמיתי:', 'Real-money trading is prohibited:')} </Text>
                  {rtl ? inlineLatin('חל איסור מוחלט על מסחר במטבעות משחק (Coins), חשבונות או נכסים וירטואליים תמורת כסף אמיתי.') : t('חל איסור מוחלט על מסחר במטבעות משחק (Coins), חשבונות או נכסים וירטואליים תמורת כסף אמיתי.', 'Trading game coins, accounts, or virtual assets for real money is strictly prohibited.')}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', direction: rtl ? 'rtl' : 'ltr', alignItems: 'flex-start', gap: 8 }}>
                <Text style={{ color: colors.gold, fontSize: 14 }}>•</Text>
                <Text style={{ flex: 1, color: colors.text, fontSize: 13, lineHeight: 20, textAlign: rtl ? 'right' : 'left' }}>
                  <Text style={{ fontWeight: '800', color: colors.gold }}>{t('פרטיות ובטיחות:', 'Privacy and safety:')} </Text>
                  {t('מידע אישי אינו נמכר לאיש. שימוש מתחת לגיל 18 מותנה בהסכמת הורה או אפוטרופוס חוקי.', 'We do not sell personal information. Users under 18 may use the site only with parent or legal-guardian consent.')}
                </Text>
              </View>
            </View>

            {/* Direct Links to Documents */}
            <View
              style={{
                flexDirection: 'row', direction: rtl ? 'rtl' : 'ltr',
                gap: 8,
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 4,
              }}
            >
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push('/legal/terms')}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: 'rgba(227, 179, 65, 0.12)',
                  borderColor: 'rgba(227, 179, 65, 0.4)',
                  borderWidth: 1,
                }}
              >
                <Text style={{ color: colors.gold, fontSize: 13, fontWeight: '800' }}>{t('📄 תנאי השימוש המלאים', '📄 Full Terms of Use')}</Text>
              </Pressable>

              <Pressable
                accessibilityRole="link"
                onPress={() => router.push('/legal/privacy')}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: 'rgba(227, 179, 65, 0.12)',
                  borderColor: 'rgba(227, 179, 65, 0.4)',
                  borderWidth: 1,
                }}
              >
                <Text style={{ color: colors.gold, fontSize: 13, fontWeight: '800' }}>{t('🔒 מדיניות הפרטיות', '🔒 Privacy Policy')}</Text>
              </Pressable>
            </View>

            {/* Interactive Checkbox */}
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              onPress={() => {
                setChecked((prev) => !prev);
                if (errorPrompt) setErrorPrompt(false);
              }}
              style={{
                backgroundColor: errorPrompt ? 'rgba(240, 113, 100, 0.12)' : 'rgba(24, 38, 30, 0.9)',
                borderColor: errorPrompt ? colors.danger : checked ? colors.gold : 'rgba(80, 110, 92, 0.6)',
                borderWidth: 1.5,
                borderRadius: 14,
                padding: 14,
                flexDirection: 'row', direction: rtl ? 'rtl' : 'ltr',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {/* Checkbox square */}
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  borderWidth: 2,
                  borderColor: checked ? colors.gold : errorPrompt ? colors.danger : 'rgba(197, 213, 200, 0.6)',
                  backgroundColor: checked ? colors.gold : 'rgba(10, 16, 14, 0.9)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {checked ? (
                  <Text style={{ color: '#1A1404', fontSize: 16, fontWeight: '900', lineHeight: 20 }}>✓</Text>
                ) : null}
              </View>

              <Text style={{ flex: 1, color: colors.text, fontSize: 14, fontWeight: '700', lineHeight: 22, textAlign: rtl ? 'right' : 'left' }}>
                {rtl ? inlineLatin('קראתי, הבנתי ואני מסכים/ה במלואם לתנאי השימוש ולמדיניות הפרטיות של 1 CLUB.') : t('קראתי, הבנתי ואני מסכים/ה במלואם לתנאי השימוש ולמדיניות הפרטיות של 1 CLUB.', 'I have read, understood, and agree to the 1 CLUB Terms of Use and Privacy Policy.')}
              </Text>
            </Pressable>

            {errorPrompt ? (
              <Text style={{ color: colors.danger, fontSize: 12.5, fontWeight: '800', textAlign: rtl ? 'right' : 'left', paddingHorizontal: 4 }}>
                {t('⚠️ עליך לסמן V בתיבה למעלה כדי לאשר את התנאים ולהיכנס לאפליקציה.', '⚠️ Please check the box above to accept the terms and enter the app.')}
              </Text>
            ) : null}

            {/* Action Buttons */}
            <View style={{ gap: 10, marginTop: 4 }}>
              <Pressable
                accessibilityRole="button"
                disabled={saving}
                onPress={handleAccept}
                style={{
                  backgroundColor: checked ? colors.gold : 'rgba(227, 179, 65, 0.35)',
                  borderRadius: 12,
                  minHeight: 48,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: colors.gold,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: checked ? 0.3 : 0,
                  shadowRadius: 8,
                }}
              >
                <Text style={{ color: checked ? colors.goldInk : 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: '900' }}>
                  {saving ? t('מאשר...', 'Accepting...') : t('אישור וכניסה לאפליקציה', 'Accept and enter the app')}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={handleDecline}
                style={{
                  borderRadius: 12,
                  minHeight: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600' }}>
                  {t('אינני מסכים/ה (התנתקות ויציאה)', 'I do not agree (sign out and exit)')}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
