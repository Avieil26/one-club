import { useLanguage } from '@/lib/language';
import { useState } from 'react';
import { Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { Button, ChoiceGroup, Field, Screen, Title } from '@/components/ui';
import { errorMessage } from '@/lib/format';
import { useApp } from '@/lib/store';
import type { SbcKind } from '@/lib/types';

export default function NewSbcScreen() {
  const { t } = useLanguage();
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
        <Title>{t("רק מנהל יכול ליצור SBC", "Only an administrator can create an SBC")}</Title>
      </Screen>
    );
  }

  async function save() {
    try {
      await app.createSbc({ title, kind, requirements, endsAt, targetScore });
      router.back();
    } catch (error) {
      Alert.alert(t("רגע", "Something went wrong"), t(errorMessage(error), errorMessage(error, 'en')));
    }
  }

  return (
    <Screen scene="sbc">
      <Stack.Screen options={{ title: t("SBC חדש", "New SBC") }} />
      <Title>{t("אתגר SBC", "SBC challenge")}</Title>
      <Field label={t("שם", "Name")} value={title} onChangeText={setTitle} />
      <ChoiceGroup
        options={[
          { id: 'streamlined', label: 'Streamlined' },
          { id: 'classic', label: t("קלאסי", "Classic") },
        ]}
        value={kind}
        onChange={setKind}
      />
      <Field label={t("דרישות", "Requirements")} value={requirements} onChangeText={setRequirements} multiline />
      {kind === 'streamlined' ? (
        <Field label={t("יעד ניקוד", "Target score")} value={targetScore} onChangeText={setTargetScore} keyboardType="number-pad" />
      ) : null}
      <Field label={t("תאריך סיום", "End date")} value={endsAt} onChangeText={setEndsAt} placeholder="2026-10-20" />
      <Button label={t("פרסום", "Publish")} onPress={save} disabled={app.busy} />
    </Screen>
  );
}

