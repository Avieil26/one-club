import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { PlatformPicker } from '@/components/PlatformPicker';
import { SquadPhoto } from '@/components/SquadPhoto';
import { Button, ChoiceGroup, Field, Screen, Title } from '@/components/ui';
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
  const [status, setStatus] = useState<string | null>(null);

  function fail(title: string, message: string) {
    setStatus(message);
    Alert.alert(title, message);
  }

  async function choose() {
    try {
      const picked = await pickImages(3);
      if (picked.length) {
        setImageUris(picked);
        setStatus(null);
      }
    } catch (error) {
      fail('רגע', errorMessage(error));
    }
  }

  async function save() {
    if (!app.user) {
      fail('צריך להתחבר', 'כדי לפרסם צריך להתחבר למשתמש.');
      return;
    }
    if (kind === 'pack' && !playerName.trim()) {
      fail('חסר שם', 'כתבו את שם השחקן שיצא בחבילה.');
      return;
    }
    if (!body.trim()) {
      fail('חסר טקסט', 'כתבו כמה מילים על מה שעלה. בלי זה אי אפשר לפרסם.');
      return;
    }
    if (!imageUris.length) {
      fail('חסר צילום', 'בחרו צילום של החבילה או הקבוצה.');
      return;
    }
    setStatus(null);
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
      const where = kind === 'pack' ? 'החבילה עלתה ומופיעה בחבילות.' : 'הקבוצה עלתה ומופיעה בקבוצות.';
      Alert.alert('פורסם', where);
      router.replace(`/ultimate?tab=${kind}&posted=1`);
    } catch (error) {
      fail('הפרסום נכשל', errorMessage(error));
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
      <Field label="כמה מילים (חובה)" value={body} onChangeText={setBody} multiline />
      <Button label="בחירת צילום" variant="ghost" onPress={choose} />
      <SquadPhoto uris={imageUris} tall />
      {status ? <Text style={{ color: '#F07164', fontWeight: '800', textAlign: 'right', fontSize: 15 }}>{status}</Text> : null}
      <Button label={app.busy ? 'מפרסם...' : 'פרסום'} onPress={save} disabled={app.busy} />
    </Screen>
  );
}
