import { useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { AvatarCropModal } from '@/components/AvatarCropModal';
import { PlatformPicker } from '@/components/PlatformPicker';
import { Button, ChoiceGroup, Field, Muted, Screen, Title, colors } from '@/components/ui';
import { errorMessage } from '@/lib/format';
import { pickImages } from '@/lib/images';
import { ARCHETYPES, DIVISIONS, POSITIONS, REGIONS, playerLevelTone } from '@/lib/labels';
import { useApp } from '@/lib/store';
import type { DivisionId, GroundsIntent, PlatformId } from '@/lib/types';

const LEVELS = Array.from({ length: 50 }, (_, i) => i + 1);

export default function NewGroundsScreen() {
  const app = useApp();
  const router = useRouter();
  const [intent, setIntent] = useState<GroundsIntent>('need_player');
  const [platform, setPlatform] = useState<PlatformId>('ps5');
  const [position, setPosition] = useState(POSITIONS[0]);
  const [division, setDivision] = useState<DivisionId>('7');
  const [playerLevel, setPlayerLevel] = useState(15);
  const [skillRating, setSkillRating] = useState('');
  const [archetype, setArchetype] = useState(ARCHETYPES[0]);
  const [region, setRegion] = useState(REGIONS[5]);
  const [eaId, setEaId] = useState('');
  const [gamertag, setGamertag] = useState('');
  const [rawUri, setRawUri] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const levelTone = playerLevelTone(playerLevel);

  async function choosePhoto() {
    try {
      const picked = await pickImages(1);
      if (!picked[0]) return;
      setRawUri(picked[0]);
      setCropOpen(true);
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  async function save() {
    if (!avatarUri) {
      Alert.alert('רגע', 'חייבים לבחור תמונה ולמרכז את הפנים בעיגול לפני הפרסום.');
      return;
    }
    try {
      await app.createGrounds({
        intent,
        platform,
        position,
        division,
        playerLevel,
        skillRating,
        archetype,
        region,
        eaId,
        gamertag,
        avatarUri,
        // Same cropped face is the card image — not the raw full screenshot
        levelImageUri: avatarUri,
      });
      Alert.alert('פורסם', 'המודעה עלתה לגראונדס.');
      router.replace('/grounds');
    } catch (error) {
      Alert.alert('הפרסום נכשל', errorMessage(error));
    }
  }

  return (
    <Screen scene="grounds">
      <Stack.Screen options={{ title: 'מודעה' }} />
      <Title>פרטי שחקן בגראונדס</Title>
      <Muted>בלי וואטסאפ — אחרי הפרסום אפשר לשלוח הודעה ולעקוב מתוך האפליקציה.</Muted>

      <ChoiceGroup
        options={[
          { id: 'need_player', label: 'חסר שחקן' },
          { id: 'looking_for_club', label: 'מחפש קבוצה' },
        ]}
        value={intent}
        onChange={setIntent}
      />
      <PlatformPicker value={platform} onChange={setPlatform} />

      <Field
        label={platform === 'pc' ? 'שם משתמש במחשב' : 'שם משתמש בקונסולה'}
        value={gamertag}
        onChangeText={setGamertag}
        placeholder="כמו שמופיע ב־EA / בקונסולה"
      />
      <Field label="EA ID" value={eaId} onChangeText={setEaId} placeholder="מזהה EA שלכם" />

      <ChoiceGroup label="עמדה" options={POSITIONS.map((item) => ({ id: item, label: item }))} value={position} onChange={setPosition} />
      <ChoiceGroup label="דיוויז׳ן ב-Pro Clubs" options={DIVISIONS} value={division} onChange={setDivision} />

      <Text style={{ color: colors.muted, textAlign: 'right', fontWeight: '700', marginBottom: 6 }}>רמת ארכיטיפ (1–50)</Text>
      <View
        style={{
          alignSelf: 'flex-end',
          backgroundColor: levelTone.bg,
          borderRadius: 999,
          paddingHorizontal: 14,
          paddingVertical: 6,
          marginBottom: 8,
        }}
      >
        <Text style={{ color: levelTone.text, fontWeight: '900' }}>{levelTone.label}</Text>
      </View>
      <ChoiceGroup
        options={LEVELS.filter((n) => n % 5 === 0 || n === 1 || n === 50).map((n) => ({
          id: String(n),
          label: String(n),
        }))}
        value={String(playerLevel)}
        onChange={(id) => setPlayerLevel(Number(id))}
      />
      <Field
        label="רמה מדויקת (1–50)"
        value={String(playerLevel)}
        onChangeText={(v) => {
          const n = Number(v.replace(/\D/g, ''));
          if (!v) return;
          if (n >= 1 && n <= 50) setPlayerLevel(n);
        }}
        keyboardType="number-pad"
      />

      <ChoiceGroup
        label="ארכיטיפ"
        options={ARCHETYPES.map((item) => ({ id: item, label: item }))}
        value={archetype}
        onChange={setArchetype}
      />
      <ChoiceGroup label="אזור" options={REGIONS.map((item) => ({ id: item, label: item }))} value={region} onChange={setRegion} />
      <Field label="Skill Rating, לא חובה" value={skillRating} onChangeText={setSkillRating} keyboardType="number-pad" />

      <Muted>תמונת פרופיל — העלו צילום ומרכזו את הפנים בעיגול</Muted>
      <Button label={avatarUri ? 'החלפת תמונה' : 'העלאת תמונה + חיתוך'} variant="ghost" onPress={choosePhoto} />
      {avatarUri ? (
        <Pressable onPress={() => rawUri && setCropOpen(true)} style={{ alignSelf: 'center', marginVertical: 8 }}>
          <View style={{ width: 112, height: 112, borderRadius: 56, overflow: 'hidden', borderWidth: 3, borderColor: levelTone.bg }}>
            <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </View>
          <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 6, fontWeight: '600' }}>לחצו לעריכת החיתוך</Text>
        </Pressable>
      ) : null}

      <Button label="פרסום מודעה" onPress={save} />

      {rawUri ? (
        <AvatarCropModal
          uri={rawUri}
          visible={cropOpen}
          onCancel={() => setCropOpen(false)}
          onConfirm={(cropped) => {
            setAvatarUri(cropped);
            setCropOpen(false);
          }}
        />
      ) : null}
    </Screen>
  );
}
