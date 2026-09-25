import { useState } from 'react';
import { Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { PlatformPicker } from '@/components/PlatformPicker';
import { Button, ChoiceGroup, Field, ImageRow, Screen, Title } from '@/components/ui';
import { errorMessage } from '@/lib/format';
import { pickImages } from '@/lib/images';
import { FORMATIONS, RARITIES } from '@/lib/labels';
import { useApp } from '@/lib/store';
import type { FutKind, PackRarity, PlatformId } from '@/lib/types';

export default function NewFutScreen() {
  const params = useLocalSearchParams<{ kind?: string }>();
  const app = useApp();
  const router = useRouter();
  const [kind, setKind] = useState<FutKind>(params.kind === 'pack' ? 'pack' : 'squad');
  const [formation, setFormation] = useState(FORMATIONS[0]);
  const [platform, setPlatform] = useState<PlatformId>('ps5');
  const [body, setBody] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [packRarity, setPackRarity] = useState<PackRarity>('regular');
  const [imageUris, setImageUris] = useState<string[]>([]);

  async function choose() {
    try {
      const picked = await pickImages(3);
      if (picked.length) setImageUris(picked);
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  async function save() {
    try {
      await app.createFutPost({
        kind,
        formation,
        platform,
        body,
        playerName,
        packRarity: kind === 'pack' ? packRarity : null,
        imageUris,
      });
      router.back();
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  return (
    <Screen scene="ultimate">
      <Stack.Screen options={{ title: 'פוסט חדש' }} />
      <Title>{kind === 'squad' ? 'הקבוצה שלי' : 'יצא לי'}</Title>
      <ChoiceGroup
        options={[
          { id: 'squad', label: 'קבוצה' },
          { id: 'pack', label: 'חבילה' },
        ]}
        value={kind}
        onChange={setKind}
      />
      <PlatformPicker value={platform} onChange={setPlatform} />
      {kind === 'squad' ? (
        <ChoiceGroup label="מערך" options={FORMATIONS.map((item) => ({ id: item, label: item }))} value={formation} onChange={setFormation} />
      ) : (
        <>
          <Field label="שם השחקן" value={playerName} onChangeText={setPlayerName} />
          <ChoiceGroup label="סוג פריט" options={RARITIES} value={packRarity} onChange={setPackRarity} />
        </>
      )}
      <Field label="כמה מילים" value={body} onChangeText={setBody} multiline />
      <Button label="בחירת צילום" variant="ghost" onPress={choose} />
      <ImageRow uris={imageUris} />
      <Button label="פרסום" onPress={save} disabled={app.busy} />
    </Screen>
  );
}
