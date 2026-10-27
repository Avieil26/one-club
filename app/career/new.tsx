import { useState } from 'react';
import { Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { Button, ChoiceGroup, Field, Screen, Title } from '@/components/ui';
import { useLanguage } from '@/lib/language';
import { errorMessage } from '@/lib/format';
import { useApp } from '@/lib/store';
import type { CareerMode } from '@/lib/types';

export default function NewChallengeScreen() {
  const app = useApp();
  const { t, locale } = useLanguage();
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
        <Title>{t('רק מנהל יכול ליצור אתגר', 'Only an administrator can create a challenge')}</Title>
      </Screen>
    );
  }

  async function save() {
    try {
      await app.createChallenge({ title, mode, rules, proofRequirements, shareCode, endsAt });
      router.back();
    } catch (error) {
      Alert.alert(t('רגע', 'Something went wrong'), errorMessage(error, locale));
    }
  }

  return (
    <Screen scene="career">
      <Stack.Screen options={{ title: t('אתגר חדש', 'New challenge') }} />
      <Title>{t('אתגר חדש', 'New challenge')}</Title>
      <Field label={t('כותרת', 'Title')} value={title} onChangeText={setTitle} />
      <ChoiceGroup
        label={t('סוג', 'Mode')}
        options={[
          { id: 'manager', label: t('קריירת מאמן', 'Manager career') },
          { id: 'player', label: t('קריירת שחקן', 'Player career') },
        ]}
        value={mode}
        onChange={setMode}
      />
      <Field label={t('חוקים', 'Rules')} value={rules} onChangeText={setRules} multiline />
      <Field label={t('מה חייב להופיע בצילום', 'Required proof')} value={proofRequirements} onChangeText={setProofRequirements} multiline />
      <Field label={t('קוד שיתוף מהמשחק, אם יש', 'In-game share code, if available')} value={shareCode} onChangeText={setShareCode} />
      <Field label={t('תאריך סיום', 'End date')} value={endsAt} onChangeText={setEndsAt} placeholder="2026-10-20" />
      <Button label={t('פרסום האתגר', 'Publish challenge')} onPress={save} disabled={app.busy} />
    </Screen>
  );
}

