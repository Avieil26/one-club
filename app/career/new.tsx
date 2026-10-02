import { useState } from 'react';
import { Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { Button, ChoiceGroup, Field, Screen, Title } from '@/components/ui';
import { errorMessage } from '@/lib/format';
import { useApp } from '@/lib/store';
import type { CareerMode } from '@/lib/types';

export default function NewChallengeScreen() {
  const app = useApp();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<CareerMode>('manager');
  const [rules, setRules] = useState('');
  const [proofRequirements, setProofRequirements] = useState('');
  const [shareCode, setShareCode] = useState('');
  const [endsAt, setEndsAt] = useState('');

  if (!app.user?.isAdmin) {
    return (
      <Screen scene="career">
        <Title>רק מנהל יכול ליצור אתגר</Title>
      </Screen>
    );
  }

  async function save() {
    try {
      await app.createChallenge({ title, mode, rules, proofRequirements, shareCode, endsAt });
      router.back();
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  return (
    <Screen scene="career">
      <Stack.Screen options={{ title: 'אתגר חדש' }} />
      <Title>אתגר חדש</Title>
      <Field label="כותרת" value={title} onChangeText={setTitle} />
      <ChoiceGroup
        label="סוג"
        options={[
          { id: 'manager', label: 'קריירת מאמן' },
          { id: 'player', label: 'קריירת שחקן' },
        ]}
        value={mode}
        onChange={setMode}
      />
      <Field label="חוקים" value={rules} onChangeText={setRules} multiline />
      <Field label="מה חייב להופיע בצילום" value={proofRequirements} onChangeText={setProofRequirements} multiline />
      <Field label="קוד שיתוף מהמשחק, אם יש" value={shareCode} onChangeText={setShareCode} />
      <Field label="תאריך סיום" value={endsAt} onChangeText={setEndsAt} placeholder="2026-10-20" />
      <Button label="פרסום האתגר" onPress={save} disabled={app.busy} />
    </Screen>
  );
}

