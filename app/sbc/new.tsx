import { useState } from 'react';
import { Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { Button, ChoiceGroup, Field, Screen, Title } from '@/components/ui';
import { errorMessage } from '@/lib/format';
import { useApp } from '@/lib/store';
import type { SbcKind } from '@/lib/types';

export default function NewSbcScreen() {
  const app = useApp();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<SbcKind>('streamlined');
  const [requirements, setRequirements] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [targetScore, setTargetScore] = useState('');

  if (!app.user?.isAdmin) {
    return (
      <Screen scene="sbc">
        <Title>רק מנהל יכול ליצור SBC</Title>
      </Screen>
    );
  }

  async function save() {
    try {
      await app.createSbc({ title, kind, requirements, endsAt, targetScore });
      router.back();
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  return (
    <Screen scene="sbc">
      <Stack.Screen options={{ title: 'SBC חדש' }} />
      <Title>אתגר SBC</Title>
      <Field label="שם" value={title} onChangeText={setTitle} />
      <ChoiceGroup
        options={[
          { id: 'streamlined', label: 'Streamlined' },
          { id: 'classic', label: 'קלאסי' },
        ]}
        value={kind}
        onChange={setKind}
      />
      <Field label="דרישות" value={requirements} onChangeText={setRequirements} multiline />
      {kind === 'streamlined' ? (
        <Field label="יעד ניקוד" value={targetScore} onChangeText={setTargetScore} keyboardType="number-pad" />
      ) : null}
      <Field label="תאריך סיום" value={endsAt} onChangeText={setEndsAt} placeholder="2026-10-20" />
      <Button label="פרסום" onPress={save} disabled={app.busy} />
    </Screen>
  );
}

