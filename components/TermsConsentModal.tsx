import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { colors } from '@/components/ui';
import { inlineLatin } from '@/lib/legalBidi';
import { hasAcceptedTerms, recordAcceptedTerms } from '@/lib/legal';
import { useApp } from '@/lib/store';

export function TermsConsentModal() {
  const app = useApp();
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
              flexDirection: 'row', direction: 'rtl',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 18 }}>⚖️</Text>
              <Text style={{ color: colors.gold, fontWeight: '900', fontSize: 14, letterSpacing: 0.5 }}>
                אישור תנאים נדרש • LEGAL CONSENT
              </Text>
            </View>
            <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '700' }}>1 CLUB</Text>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
            {/* Title & Welcome */}
            <View style={{ gap: 4 }}>
              <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' }}>
                {inlineLatin('ברוכים הבאים ל-FC27 ישראל!')}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 22, textAlign: 'right' }}>
                שלום {app.user.displayName}, לפני שתוכל/י להשתמש באפליקציה, חובה לקרוא ולאשר את תנאי השימוש ומדיניות הפרטיות המעודכנים.
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
              <View style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'flex-start', gap: 8 }}>
                <Text style={{ color: colors.gold, fontSize: 14 }}>•</Text>
                <Text style={{ flex: 1, color: colors.text, fontSize: 13, lineHeight: 20, textAlign: 'right' }}>
                  <Text style={{ fontWeight: '800', color: colors.gold }}>אתר מעריצים עצמאי: </Text>
                  {inlineLatin(
                    'האתר אינו קשור, מאושר או נתמך על ידי Electronic Arts Inc. כל המותגים, שמות המשחקים ותמונות השחקנים שייכים לבעליהם ומשמשים בשימוש הוגן (Fair Use) בלבד.',
                  )}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'flex-start', gap: 8 }}>
                <Text style={{ color: colors.gold, fontSize: 14 }}>•</Text>
                <Text style={{ flex: 1, color: colors.text, fontSize: 13, lineHeight: 20, textAlign: 'right' }}>
                  <Text style={{ fontWeight: '800', color: colors.gold }}>איסור סחר בכסף אמיתי: </Text>
                  {inlineLatin('חל איסור מוחלט על מסחר במטבעות משחק (Coins), חשבונות או נכסים וירטואליים תמורת כסף אמיתי.')}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'flex-start', gap: 8 }}>
                <Text style={{ color: colors.gold, fontSize: 14 }}>•</Text>
                <Text style={{ flex: 1, color: colors.text, fontSize: 13, lineHeight: 20, textAlign: 'right' }}>
                  <Text style={{ fontWeight: '800', color: colors.gold }}>פרטיות ובטיחות: </Text>
                  מידע אישי אינו נמכר לאיש. שימוש מתחת לגיל 18 מותנה בהסכמת הורה או אפוטרופוס חוקי.
                </Text>
              </View>
            </View>

            {/* Direct Links to Documents */}
            <View
              style={{
                flexDirection: 'row', direction: 'rtl',
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
                <Text style={{ color: colors.gold, fontSize: 13, fontWeight: '800' }}>📄 תנאי השימוש המלאים</Text>
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
                <Text style={{ color: colors.gold, fontSize: 13, fontWeight: '800' }}>🔒 מדיניות הפרטיות</Text>
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
                flexDirection: 'row', direction: 'rtl',
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

              <Text style={{ flex: 1, color: colors.text, fontSize: 14, fontWeight: '700', lineHeight: 22, textAlign: 'right' }}>
                {inlineLatin('קראתי, הבנתי ואני מסכים/ה במלואם לתנאי השימוש ולמדיניות הפרטיות של 1 CLUB.')}
              </Text>
            </Pressable>

            {errorPrompt ? (
              <Text style={{ color: colors.danger, fontSize: 12.5, fontWeight: '800', textAlign: 'right', paddingHorizontal: 4 }}>
                ⚠️ עליך לסמן V בתיבה למעלה כדי לאשר את התנאים ולהיכנס לאפליקציה.
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
                  {saving ? 'מאשר...' : 'אישור וכניסה לאפליקציה'}
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
                  אינני מסכים/ה (התנתקות ויציאה)
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
