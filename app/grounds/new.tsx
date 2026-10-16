import { useState } from 'react';
import { useLanguage } from '@/lib/language';
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
  const { t, language } = useLanguage();
  const rtl = language === 'he';
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
      Alert.alert(t('רגע', 'Notice'), errorMessage(error));
    }
  }

  async function save() {
    if (!gamertag.trim() && !eaId.trim()) {
      Alert.alert(t('רגע', 'Notice'), t('צריך למלא לפחות שם משתמש או EA ID לפני הפרסום.', 'Enter at least a gamertag or EA ID before publishing.'));
      return;
    }
    try {
      if (avatarUri) await app.setAvatar(avatarUri);
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
        // Profile avatar is saved separately. It is not used as level-verification proof.
        avatarUri: null,
        levelImageUri: null,
      });
      Alert.alert(t('פורסם', 'Published'), t('המודעה עלתה לגראונדס.', 'Your post is now live on The Grounds.'));
      router.replace('/grounds');
    } catch (error) {
      Alert.alert(t('הפרסום נכשל', 'Publishing failed'), errorMessage(error));
    }
  }

  return (
    <Screen scene="grounds">
      <Stack.Screen options={{ title: t('מודעה', 'Post') }} />
      <Title>{t('פרטי שחקן בגראונדס', 'Player details for The Grounds')}</Title>
      <Muted>{t('בלי וואטסאפ — אחרי הפרסום אפשר לשלוח הודעה ולעקוב מתוך האפליקציה.', 'No WhatsApp needed — after publishing, you can message and follow players inside the app.')}</Muted>

      <ChoiceGroup
        options={[
          { id: 'need_player', label: t('חסר שחקן', 'Looking for a player') },
          { id: 'looking_for_club', label: t('מחפש קבוצה', 'Looking for a club') },
        ]}
        value={intent}
        onChange={setIntent}
      />
      <PlatformPicker value={platform} onChange={setPlatform} label={t('פלטפורמה', 'Platform')} />

      <Field
        label={platform === 'pc' ? t('שם משתמש במחשב', 'PC username') : t('שם משתמש בקונסולה', 'Console gamertag')}
        value={gamertag}
        onChangeText={setGamertag}
        placeholder={t('כמו שמופיע ב־EA / בקונסולה', 'As shown in EA or on your console')}
      />
      <Field label="EA ID" value={eaId} onChangeText={setEaId} placeholder={t('מזהה EA שלכם', 'Your EA ID')} />

      <ChoiceGroup label={t('עמדה', 'Position')} options={POSITIONS.map((item) => ({ id: item, label: t(item, ({ 'שוער':'Goalkeeper', 'בלם':'Centre back', 'מגן':'Full back', 'קשר הגנתי':'Defensive midfielder', 'קשר':'Midfielder', 'קשר התקפי':'Attacking midfielder', 'כנף':'Winger', 'חלוץ':'Striker', 'כל עמדה':'Any position' } as Record<string,string>)[item] ?? item) }))} value={position} onChange={setPosition} />
      <ChoiceGroup label={t('דיוויז׳ן ב-Pro Clubs', 'Pro Clubs division')} options={DIVISIONS.map((item) => ({ ...item, label: t(item.label, item.id === 'elite' ? 'Elite' : `Division ${item.id}`) }))} value={division} onChange={setDivision} />

      <Text style={{ color: colors.muted, textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr', fontWeight: '700', marginBottom: 6 }}>{t('רמת ארכיטיפ (1–50)', 'Archetype level (1–50)')}</Text>
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
        <Text style={{ color: levelTone.text, fontWeight: '900' }}>{language === 'en' ? `Level ${playerLevel}` : levelTone.label}</Text>
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
        label={t('רמה מדויקת (1–50)', 'Exact level (1–50)')}
        value={String(playerLevel)}
        onChangeText={(v) => {
          const n = Number(v.replace(/\D/g, ''));
          if (!v) return;
          if (n >= 1 && n <= 50) setPlayerLevel(n);
        }}
        keyboardType="number-pad"
      />

      <ChoiceGroup
        label={t("ארכיטיפ", "Archetype")}
        options={ARCHETYPES.map((item) => ({ id: item, label: language === "en" ? item.split(" · ")[0] : item }))}
        value={archetype}
        onChange={setArchetype}
      />
      <ChoiceGroup label={t('אזור', 'Region')} options={REGIONS.map((item) => ({ id: item, label: t(item, ({ 'צפון':'North', 'שרון':'Sharon', 'מרכז':'Central', 'ירושלים':'Jerusalem', 'דרום':'South', 'אונליין בלבד':'Online only' } as Record<string,string>)[item] ?? item) }))} value={region} onChange={setRegion} />
      <Muted>{t('תמונת פרופיל (רשות) — תמונה שתעלו תשמש גם בפרופיל המשתמש שלכם', 'Profile photo (optional) — the image will also be used on your user profile.')}</Muted>
      <Button label={avatarUri ? t('החלפת תמונה', 'Change photo') : t('העלאת תמונה (רשות) + חיתוך', 'Upload photo (optional) and crop')} variant="ghost" onPress={choosePhoto} />
      {avatarUri ? (
        <Pressable onPress={() => rawUri && setCropOpen(true)} style={{ alignSelf: 'center', marginVertical: 8 }}>
          <View style={{ width: 112, height: 112, borderRadius: 56, overflow: 'hidden', borderWidth: 3, borderColor: levelTone.bg }}>
            <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </View>
          <Text style={{ color: colors.muted, textAlign: 'center', writingDirection: rtl ? 'rtl' : 'ltr', marginTop: 6, fontWeight: '600' }}>{t('לחצו לעריכת החיתוך', 'Tap to adjust the crop')}</Text>
        </Pressable>
      ) : null}

      <Button label={t('פרסום מודעה', 'Publish post')} onPress={save} />

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
