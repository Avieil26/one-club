import { useLanguage } from '@/lib/language';
import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { PlatformPicker } from '@/components/PlatformPicker';
import { SquadPhoto } from '@/components/SquadPhoto';
import { Button, ChoiceGroup, Field, Screen, Title } from '@/components/ui';
import { errorMessage } from '@/lib/format';
import { pickImages } from '@/lib/images';
import { FORMATIONS, RARITIES, rarityLabel } from '@/lib/labels';
import { useApp } from '@/lib/store';
import type { FutKind, PackRarity, PlatformId } from '@/lib/types';

export default function NewFutScreen() {
  const { t, language } = useLanguage();
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
      fail(t("רגע", "Something went wrong"), errorMessage(error));
    }
  }

  async function save() {
    if (!app.user) {
      fail(t("צריך להתחבר", "Sign in required"), t("כדי לפרסם צריך להתחבר למשתמש.", "Sign in to publish a post."));
      return;
    }
    if (kind === 'pack' && !playerName.trim()) {
      fail(t("חסר שם", "Name required"), t("כתבו את שם השחקן שיצא בחבילה.", "Enter the name of the player from your pack."));
      return;
    }
    if (!body.trim()) {
      fail(t("חסר טקסט", "Description required"), t("כתבו כמה מילים על מה שעלה. בלי זה אי אפשר לפרסם.", "Add a short description before publishing."));
      return;
    }
    if (!imageUris.length) {
      fail(t("חסר צילום", "Image required"), t("בחרו צילום של החבילה או הקבוצה.", "Choose an image of your pack or squad."));
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
      const where = kind === 'pack' ? t("החבילה עלתה ומופיעה בחבילות.", "Your pack has been published in Packs.") : t("הקבוצה עלתה ומופיעה בקבוצות.", "Your squad has been published in Squads.");
      Alert.alert(t("פורסם", "Published"), where);
      router.replace(`/ultimate?tab=${kind}&posted=1`);
    } catch (error) {
      fail(t("הפרסום נכשל", "Could not publish"), errorMessage(error));
    }
  }

  return (
    <Screen scene="ultimate">
      <Stack.Screen options={{ title: t("פוסט חדש", "New post") }} />
      <Title>{kind === 'squad' ? t("הקבוצה שלי", "My squad") : t("יצא לי", "My pack pull")}</Title>
      <ChoiceGroup
        options={[
          { id: 'squad', label: t("קבוצה", "Squad") },
          { id: 'pack', label: t("חבילה", "Pack") },
        ]}
        value={kind}
        onChange={setKind}
      />
      <PlatformPicker value={platform} onChange={setPlatform} />
      {kind === 'squad' ? (
        <ChoiceGroup label={t("מערך", "Formation")} options={FORMATIONS.map((item) => ({ id: item, label: item }))} value={formation} onChange={setFormation} />
      ) : (
        <>
          <Field label={t("שם השחקן", "Player name")} value={playerName} onChangeText={setPlayerName} />
          <ChoiceGroup label={t("סוג פריט", "Item type")} options={RARITIES.map((item) => ({ ...item, label: rarityLabel(item.id, language) }))} value={packRarity} onChange={setPackRarity} />
        </>
      )}
      <Field label={t("כמה מילים (חובה)", "Description (required)")} value={body} onChangeText={setBody} multiline />
      <Button label={t("בחירת צילום", "Choose image")} variant="ghost" onPress={choose} />
      <SquadPhoto uris={imageUris} tall />
      {status ? <Text style={{ color: '#F07164', fontWeight: '800', textAlign: 'right', fontSize: 15 }}>{status}</Text> : null}
      <Button label={app.busy ? t("מפרסם...", "Publishing…") : t("פרסום", "Publish")} onPress={save} disabled={app.busy} />
    </Screen>
  );
}
