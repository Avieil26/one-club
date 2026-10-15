import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { Button, colors, Field, Muted } from '@/components/ui';
import { errorMessage } from '@/lib/format';
import { recordAcceptedTerms } from '@/lib/legal';
import { useApp } from '@/lib/store';
import { useLanguage } from '@/lib/language';

export function AccountForm() {
  const app = useApp();
  const { language, t } = useLanguage();
  const rtl = language === 'he';
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registering, setRegistering] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);

  async function run(work: () => Promise<void>) {
    try {
      await work();
    } catch (error) {
      Alert.alert(t('רגע', 'Please try again'), errorMessage(error));
    }
  }

  function validateTerms(): boolean {
    if (registering && !termsAccepted) {
      setTermsError(true);
      Alert.alert(
        t('אישור תנאים נדרש', 'Terms acceptance required'),
        t('כדי להירשם לאפליקציה, חובה לקרוא ולסמן אישור לתנאי השימוש ולמדיניות הפרטיות.', 'Please read and accept the Terms of Use and Privacy Policy to create an account.'),
      );
      return false;
    }
    return true;
  }

  async function handleEmailAuth() {
    if (!validateTerms()) return;
    await run(async () => {
      if (registering) {
        await app.signUpEmail(email, password, name);
        if (termsAccepted) {
          await recordAcceptedTerms(app.user?.id);
        }
      } else {
        await app.signInEmail(email, password);
      }
    });
  }

  async function handleGoogleAuth() {
    if (!validateTerms()) return;
    await run(async () => {
      await app.signInGoogle();
      if (termsAccepted) {
        await recordAcceptedTerms(app.user?.id);
      }
    });
  }

  function toggleMode() {
    setRegistering((value) => !value);
    setTermsError(false);
  }

  return (
    <View style={{ gap: 14, width: '100%', maxWidth: 480 }}>
      <Text style={{ color: colors.text, fontSize: 36, fontWeight: '800', textAlign: rtl ? 'right' : 'left' }}>{registering ? t('הרשמה', 'Create account') : t('כניסה', 'Sign in')}</Text>
      <Muted>{registering ? t('שם, אימייל וסיסמה. אחרי זה נכנסים לדף הבית.', 'Your name, email and password — then you are ready to join.') : t('אימייל וסיסמה של החשבון שנרשמתם איתו.', 'Enter the email and password for your account.')}</Muted>
      {registering ? <Field label={t("שם בקהילה", "Community name")} value={name} onChangeText={setName} placeholder={t("איך לקרוא לך", "How should we call you?")} /> : null}
      <Field label={t("אימייל", "Email")} value={email} onChangeText={setEmail} placeholder="name@email.com" keyboardType="email-address" />
      <Field label={t("סיסמה", "Password")} value={password} onChangeText={setPassword} placeholder={t("לפחות 6 תווים", "At least 6 characters")} secure />

      {/* CHECKBOX FOR TERMS & PRIVACY (SIGNUP ONLY) */}
      {registering ? (
        <View style={{ gap: 6, marginVertical: 2 }}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: termsAccepted }}
            accessibilityLabel={t("אני מאשר את תנאי השימוש ומדיניות הפרטיות", "I accept the Terms of Use and Privacy Policy")}
            onPress={() => {
              setTermsAccepted((prev) => !prev);
              if (termsError) setTermsError(false);
            }}
            style={{
              backgroundColor: termsError ? 'rgba(240, 113, 100, 0.1)' : 'rgba(22, 32, 26, 0.85)',
              borderColor: termsError ? colors.danger : termsAccepted ? colors.gold : 'rgba(80, 110, 92, 0.55)',
              borderWidth: 1.5,
              borderRadius: 12,
              padding: 12,
              flexDirection: rtl ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            {/* Checkbox Icon Box */}
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: termsAccepted ? colors.gold : termsError ? colors.danger : 'rgba(197, 213, 200, 0.55)',
                backgroundColor: termsAccepted ? colors.gold : 'rgba(10, 16, 14, 0.9)',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 2,
              }}
            >
              {termsAccepted ? (
                <Text style={{ color: '#1A1404', fontSize: 15, fontWeight: '900', lineHeight: 18 }}>✓</Text>
              ) : null}
            </View>

            {/* Label and Links */}
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: colors.text, fontSize: 14, lineHeight: 22, textAlign: 'right' }}>
                {t("קראתי ואני מסכים/ה ל", "I have read and agree to the ")}
                <Text
                  accessibilityRole="link"
                  style={{ color: colors.gold, fontWeight: '800', textDecorationLine: 'underline' }}
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    router.push('/legal/terms');
                  }}
                >
                  {t("תנאי השימוש", "Terms of Use")}
                </Text>
                {' '}{t('ול', 'and the ')}
                <Text
                  accessibilityRole="link"
                  style={{ color: colors.gold, fontWeight: '800', textDecorationLine: 'underline' }}
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    router.push('/legal/privacy');
                  }}
                >
                  {t("מדיניות הפרטיות", "Privacy Policy")}
                </Text>
                .
              </Text>
              <Text style={{ color: colors.muted, fontSize: 11.5, textAlign: 'right', lineHeight: 17 }}>
                {t("השימוש מתחת לגיל 18 מותנה בהסכמת הורה או אפוטרופוס חוקי.", "Users under 18 need consent from a parent or legal guardian.")}
              </Text>
            </View>
          </Pressable>

          {termsError ? (
            <Text style={{ color: colors.danger, fontSize: 12.5, fontWeight: '700', textAlign: 'right', paddingHorizontal: 4 }}>
              ⚠️ חובה לסמן שקראת והסכמת לתנאי השימוש ומדיניות הפרטיות כדי להירשם.
            </Text>
          ) : null}
        </View>
      ) : null}

      <Button
        label={registering ? t('הרשמה וכניסה', 'Create account') : t('כניסה', 'Sign in')}
        disabled={app.busy}
        onPress={handleEmailAuth}
      />
      <Button
        label={registering ? t('הרשמה עם Google', 'Sign up with Google') : t('כניסה עם Google', 'Sign in with Google')}
        variant="gold"
        disabled={app.busy}
        onPress={handleGoogleAuth}
      />

      <Button label={registering ? t('יש לי כבר חשבון', 'I already have an account') : t('להרשמה', 'Create an account')} variant="link" onPress={toggleMode} />
      <Button label={t('שינוי שפה', 'Change language')} variant="link" onPress={() => router.push('/language')} />
    </View>
  );
}
