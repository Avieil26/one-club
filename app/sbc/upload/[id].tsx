import { useLanguage } from '@/lib/language';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { ClubBadge } from '@/components/ClubBadge';
import { NationFlag } from '@/components/NationFlag';
import { Badge, Button, Card, colors, Field, ImageRow, Muted, Screen, Title } from '@/components/ui';
import { errorMessage } from '@/lib/format';
import { pickImages } from '@/lib/images';
import { catalogChallenge } from '@/lib/sbcCatalog';
import { isOpen } from '@/lib/selectors';
import { sbcFace } from '@/lib/sbcTileTheme';
import { useApp } from '@/lib/store';

export default function SbcUploadSolutionScreen() {
  const { t, language } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const router = useRouter();
  const stored = app.sbcChallenges.find((item) => item.id === id);
  const challenge = stored
    ? { ...catalogChallenge(String(id)), ...stored, ...catalogChallenge(String(id)) }
    : catalogChallenge(String(id));

  const [explanation, setExplanation] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!imageUris.length) return;
    scale.setValue(0.96);
    Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start();
  }, [imageUris, scale]);

  if (!challenge || !isOpen(challenge)) {
    return (
      <Screen scene="sbc">
        <Title>{t("האתגר לא נמצא", "Challenge not found")}</Title>
        <Button label={t("חזרה לרשימת SBC", "Back to SBCs")} onPress={() => router.replace('/sbc')} />
      </Screen>
    );
  }

  const challengeId = challenge.id;
  const challengeTitle = language === 'en' ? sbcFace(challenge).en : challenge.title;
  const clubs = challenge.clubs ?? [];
  const nations = challenge.nations ?? [];
  const face = sbcFace(challenge);

  async function choose() {
    try {
      const picked = await pickImages(3);
      if (picked.length) setImageUris(picked);
    } catch (error) {
      Alert.alert(t("רגע", "Something went wrong"), errorMessage(error));
    }
  }

  async function save() {
    if (!challenge || !isOpen(challenge)) { router.replace(`/sbc/${id}`); return; }
    if (!app.user) {
      Alert.alert(t("נדרשת התחברות", "Sign in required"), t("כדי לפרסם פתרון לקהילה צריך להתחבר למשתמש.", "Sign in to share a solution with the community."));
      return;
    }
    if (!imageUris.length) {
      Alert.alert(t("חסר צילום מסך", "Screenshot required"), t("יש לבחור לפחות צילום מסך אחד של הסגל מהמשחק.", "Choose at least one in-game screenshot of your squad."));
      return;
    }
    if (!explanation.trim()) {
      Alert.alert(t("חסר הסבר", "Explanation required"), t("כתבו משפט קצר שמסביר איך סגרתם את האתגר.", "Add a short explanation of how you completed the challenge."));
      return;
    }

    setSaving(true);
    try {
      await app.addSolution({ challengeId, explanation, imageUris });
      Alert.alert(t("הפתרון פורסם", "Solution published"), t(`הפתרון שלך ל«${challengeTitle}» עלה וגלוי לכל הקהילה.`, `Your solution for “${challengeTitle}” is now visible to the community.`));
      router.replace(`/sbc/${challengeId}`);
    } catch (error) {
      Alert.alert(t("שגיאה בהעלאה", "Upload error"), errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen scene="sbc">
      <Stack.Screen options={{ title: t("צילום פתרון SBC", "SBC solution screenshot") }} />

      {/* TOP BAR / BACK NAVIGATION */}
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          direction: 'rtl',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: 1,
            borderColor: 'rgba(227, 179, 65, 0.35)',
          }}
        >
          <Text style={{ color: colors.gold, fontWeight: '800', fontSize: 13 }}>{t("‹ חזרה לאתגר ה-SBC", "‹ Back to the SBC challenge")}</Text>
        </Pressable>
      </View>

      {/* CHALLENGE INFO CARD */}
      <View
        style={{
          flexDirection: 'row-reverse',
          alignItems: 'center',
          gap: 12,
          padding: 14,
          borderRadius: 16,
          backgroundColor: 'rgba(12, 18, 26, 0.85)',
          borderWidth: 1,
          borderColor: 'rgba(227, 179, 65, 0.25)',
        }}
      >
        {nations.map((nation) => (
          <NationFlag key={nation} nation={nation} size={28} />
        ))}
        {clubs.map((club) => (
          <ClubBadge key={club} size={48} club={club} />
        ))}
        <View style={{ flex: 1 }}>
          <Badge text={face.category} tone={challenge.kind === 'streamlined' ? 'copper' : 'blue'} />
          <Title>{challengeTitle}</Title>
          {language === 'he' && face.he !== face.en ? <Muted>{face.he}</Muted> : null}
        </View>
      </View>

      {/* PHOTO UPLOAD BOX */}
      <Card>
        <Text style={{ color: colors.gold, fontSize: 14, fontWeight: '800', textAlign: 'right' }}>{t("📸 צילום מסך של הסגל", "📸 Squad screenshot")}</Text>
        <Muted>{t("מעלים עד 3 תמונות מתוך המשחק של הסגל שעמד בדרישות של «", "Upload up to 3 in-game images of the squad that meets the requirements for “")}{challengeTitle}».
        </Muted>

        <Pressable accessibilityRole="button" onPress={choose}>
          <Animated.View
            style={{
              transform: [{ scale }],
              borderRadius: 14,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: imageUris.length ? colors.gold : 'rgba(227, 179, 65, 0.45)',
              backgroundColor: 'rgba(18, 24, 34, 0.7)',
              minHeight: 120,
              padding: 16,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Text style={{ color: colors.gold, fontSize: 24 }}>📷</Text>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', textAlign: 'center' }}>
              {imageUris.length
                ? t(`נבחרו ${imageUris.length} תמונות (לחצו להחלפה)`, `${imageUris.length} images selected (select to replace)`)
                : t("לחצו לבחירת תמונות מהגלריה", "Select images from your gallery")}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center' }}>{t("עד 3 תמונות (סגל, כימיה או דרישות)", "Up to 3 images (squad, chemistry or requirements)")}</Text>
            {imageUris.length ? <ImageRow uris={imageUris} /> : null}
          </Animated.View>
        </Pressable>
      </Card>

      {/* EXPLANATION FIELD */}
      <Card>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '800', textAlign: 'right' }}>{t("איך סגרתם את האתגר הזה?", "How did you complete this challenge?")}</Text>
        <Field
          label=""
          value={explanation}
          onChangeText={setExplanation}
          multiline
          placeholder={t("למשל: כימיה מליברפול + צרפתים בכנפיים, עלות משוערת כ-12,000 מטבעות", "For example: Liverpool links and French wingers, costing approximately 12,000 coins")}
        />
      </Card>

      {/* SUBMIT BUTTON */}
      <Button
        label={saving || app.busy ? t("מפרסם פתרון...", "Publishing solution…") : t("פרסום הפתרון לקהילה ✨", "Share solution with the community ✨")}
        variant="gold"
        disabled={saving || app.busy}
        onPress={save}
      />
    </Screen>
  );
}
