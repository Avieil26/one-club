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
        <Title>׳¨׳§ ׳׳ ׳”׳ ׳™׳›׳•׳ ׳׳™׳¦׳•׳¨ SBC</Title>
      </Screen>
    );
  }

  async function save() {
    try {
      await app.createSbc({ title, kind, requirements, endsAt, targetScore });
      router.back();
    } catch (error) {
      Alert.alert('׳¨׳’׳¢', errorMessage(error));
    }
  }

  return (
    <Screen scene="sbc">
      <Stack.Screen options={{ title: 'SBC ׳—׳“׳©' }} />
      <Title>׳׳×׳’׳¨ SBC</Title>
      <Field label="׳©׳" value={title} onChangeText={setTitle} />
      <ChoiceGroup
        options={[
          { id: 'streamlined', label: 'Streamlined' },
          { id: 'classic', label: '׳§׳׳׳¡׳™' },
        ]}
        value={kind}
        onChange={setKind}
      />
      <Field label="׳“׳¨׳™׳©׳•׳×" value={requirements} onChangeText={setRequirements} multiline />
      {kind === 'streamlined' ? (
        <Field label="׳™׳¢׳“ ׳ ׳™׳§׳•׳“" value={targetScore} onChangeText={setTargetScore} keyboardType="number-pad" />
      ) : null}
      <Field label="׳×׳׳¨׳™׳ ׳¡׳™׳•׳" value={endsAt} onChangeText={setEndsAt} placeholder="2026-10-20" />
      <Button label="׳₪׳¨׳¡׳•׳" onPress={save} disabled={app.busy} />
    </Screen>
  );
}

