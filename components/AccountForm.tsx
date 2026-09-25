import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { Button, colors, Field, Muted } from '@/components/ui';
import { errorMessage } from '@/lib/format';
import { useApp } from '@/lib/store';

export function AccountForm() {
  const app = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registering, setRegistering] = useState(true);
  const [staff, setStaff] = useState(false);

  async function run(work: () => Promise<void>) {
    try {
      await work();
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  return (
    <View style={{ gap: 14, width: '100%', maxWidth: 480 }}>
      <Text style={{ color: colors.text, fontSize: 36, fontWeight: '800', textAlign: 'right' }}>{registering ? 'הרשמה' : 'כניסה'}</Text>
      <Muted>{registering ? 'שם, אימייל וסיסמה. אחרי זה נכנסים לדף הבית.' : 'אימייל וסיסמה של החשבון שנרשמתם איתו.'}</Muted>
      {registering ? <Field label="שם בקהילה" value={name} onChangeText={setName} placeholder="איך לקרוא לך" /> : null}
      <Field label="אימייל" value={email} onChangeText={setEmail} placeholder="name@email.com" keyboardType="email-address" />
      <Field label="סיסמה" value={password} onChangeText={setPassword} placeholder="לפחות 6 תווים" secure />
      <Button
        label={registering ? 'הרשמה וכניסה' : 'כניסה'}
        disabled={app.busy}
        onPress={() => run(() => (registering ? app.signUpEmail(email, password, name) : app.signInEmail(email, password)))}
      />
      <Button label="הרשמה עם Google" variant="gold" disabled={app.busy} onPress={() => run(() => app.signInGoogle())} />
      <Button label={registering ? 'יש לי כבר חשבון' : 'להרשמה'} variant="link" onPress={() => setRegistering((value) => !value)} />
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
