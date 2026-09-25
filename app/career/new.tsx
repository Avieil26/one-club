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
        <Title>׳¨׳§ ׳׳ ׳”׳ ׳™׳›׳•׳ ׳׳™׳¦׳•׳¨ ׳׳×׳’׳¨</Title>
      </Screen>
    );
  }

  async function save() {
    try {
      await app.createChallenge({ title, mode, rules, proofRequirements, shareCode, endsAt });
      router.back();
    } catch (error) {
      Alert.alert('׳¨׳’׳¢', errorMessage(error));
    }
  }

  return (
    <Screen scene="career">
      <Stack.Screen options={{ title: '׳׳×׳’׳¨ ׳—׳“׳©' }} />
      <Title>׳׳×׳’׳¨ ׳—׳“׳©</Title>
      <Field label="׳›׳•׳×׳¨׳×" value={title} onChangeText={setTitle} />
      <ChoiceGroup
        label="׳¡׳•׳’"
        options={[
          { id: 'manager', label: '׳§׳¨׳™׳™׳¨׳× ׳׳׳׳' },
          { id: 'player', label: '׳§׳¨׳™׳™׳¨׳× ׳©׳—׳§׳' },
        ]}
        value={mode}
        onChange={setMode}
      />
      <Field label="׳—׳•׳§׳™׳" value={rules} onChangeText={setRules} multiline />
      <Field label="׳׳” ׳—׳™׳™׳‘ ׳׳”׳•׳₪׳™׳¢ ׳‘׳¦׳™׳׳•׳" value={proofRequirements} onChangeText={setProofRequirements} multiline />
      <Field label="׳§׳•׳“ ׳©׳™׳×׳•׳£ ׳׳”׳׳©׳—׳§, ׳׳ ׳™׳©" value={shareCode} onChangeText={setShareCode} />
      <Field label="׳×׳׳¨׳™׳ ׳¡׳™׳•׳" value={endsAt} onChangeText={setEndsAt} placeholder="2026-10-20" />
      <Button label="׳₪׳¨׳¡׳•׳ ׳”׳׳×׳’׳¨" onPress={save} disabled={app.busy} />
    </Screen>
  );
}

