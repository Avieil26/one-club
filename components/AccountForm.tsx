import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { Button, colors, Field, Muted } from '@/components/ui';
import { errorMessage } from '@/lib/format';
import { recordAcceptedTerms } from '@/lib/legal';
import { useApp } from '@/lib/store';

export function AccountForm() {
  const app = useApp();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registering, setRegistering] = useState(true);
  const [staff, setStaff] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);

  async function run(work: () => Promise<void>) {
    try {
      await work();
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  function validateTerms(): boolean {
    if (registering && !termsAccepted) {
      setTermsError(true);
      Alert.alert(
        'אישור תנאים נדרש',
        'כדי להירשם לאפליקציה, חובה לקרוא ולסמן אישור לתנאי השימוש ולמדיניות הפרטיות.',
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
      <Text style={{ color: colors.text, fontSize: 36, fontWeight: '800', textAlign: 'right' }}>{registering ? 'הרשמה' : 'כניסה'}</Text>
      <Muted>{registering ? 'שם, אימייל וסיסמה. אחרי זה נכנסים לדף הבית.' : 'אימייל וסיסמה של החשבון שנרשמתם איתו.'}</Muted>
      {registering ? <Field label="שם בקהילה" value={name} onChangeText={setName} placeholder="איך לקרוא לך" /> : null}
      <Field label="אימייל" value={email} onChangeText={setEmail} placeholder="name@email.com" keyboardType="email-address" />
      <Field label="סיסמה" value={password} onChangeText={setPassword} placeholder="לפחות 6 תווים" secure />

      {/* CHECKBOX FOR TERMS & PRIVACY (SIGNUP ONLY) */}
      {registering ? (
        <View style={{ gap: 6, marginVertical: 2 }}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: termsAccepted }}
            accessibilityLabel="אני מאשר את תנאי השימוש ומדיניות הפרטיות"
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
              flexDirection: 'row-reverse',
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
                קראתי ואני מסכים/ה ל
                <Text
                  accessibilityRole="link"
                  style={{ color: colors.gold, fontWeight: '800', textDecorationLine: 'underline' }}
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    router.push('/legal/terms');
                  }}
                >
                  תנאי השימוש
                </Text>
                {' '}ול
                <Text
                  accessibilityRole="link"
                  style={{ color: colors.gold, fontWeight: '800', textDecorationLine: 'underline' }}
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    router.push('/legal/privacy');
                  }}
                >
                  מדיניות הפרטיות
                </Text>
                .
              </Text>
              <Text style={{ color: colors.muted, fontSize: 11.5, textAlign: 'right', lineHeight: 17 }}>
                השימוש מתחת לגיל 18 מותנה בהסכמת הורה או אפוטרופוס חוקי.
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
        label={registering ? 'הרשמה וכניסה' : 'כניסה'}
        disabled={app.busy}
        onPress={handleEmailAuth}
      />
      <Button
        label={registering ? 'הרשמה עם Google' : 'כניסה עם Google'}
        variant="gold"
        disabled={app.busy}
        onPress={handleGoogleAuth}
      />

      <Button label={registering ? 'יש לי כבר חשבון' : 'להרשמה'} variant="link" onPress={toggleMode} />
      <Pressable accessibilityRole="button" onPress={() => setStaff((value) => !value)}>
        <Text style={{ color: colors.muted, textAlign: 'right', fontSize: 13 }}>כניסת צוות</Text>
      </Pressable>
      {staff ? (
        <View style={{ gap: 8 }}>
          <Button label="אביאל · מנהל" variant="ghost" disabled={app.busy} onPress={() => run(() => app.signInDemo('admin'))} />
          <Button label="מאיה" variant="ghost" disabled={app.busy} onPress={() => run(() => app.signInDemo('maya'))} />
          <Button label="נועם" variant="ghost" disabled={app.busy} onPress={() => run(() => app.signInDemo('noam'))} />
        </View>
      ) : null}
    </View>
  );
}
