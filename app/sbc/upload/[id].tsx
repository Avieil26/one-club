import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { ClubBadge } from '@/components/ClubBadge';
import { NationFlag } from '@/components/NationFlag';
import { Badge, Button, Card, colors, Field, ImageRow, Muted, Screen, Title } from '@/components/ui';
import { errorMessage } from '@/lib/format';
import { pickImages } from '@/lib/images';
import { catalogChallenge } from '@/lib/sbcCatalog';
import { sbcFace } from '@/lib/sbcTileTheme';
import { useApp } from '@/lib/store';

export default function SbcUploadSolutionScreen() {
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

  if (!challenge) {
    return (
      <Screen scene="sbc">
        <Title>האתגר לא נמצא</Title>
        <Button label="חזרה לרשימת SBC" onPress={() => router.replace('/sbc')} />
      </Screen>
    );
  }

  const challengeId = challenge.id;
  const challengeTitle = challenge.title;
  const clubs = challenge.clubs ?? [];
  const nations = challenge.nations ?? [];
  const face = sbcFace(challenge);

  async function choose() {
    try {
      const picked = await pickImages(3);
      if (picked.length) setImageUris(picked);
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  async function save() {
    if (!app.user) {
      Alert.alert('נדרשת התחברות', 'כדי לפרסם פתרון לקהילה צריך להתחבר למשתמש.');
      return;
    }
    if (!imageUris.length) {
      Alert.alert('חסר צילום מסך', 'יש לבחור לפחות צילום מסך אחד של הסגל מהמשחק.');
      return;
    }
    if (!explanation.trim()) {
      Alert.alert('חסר הסבר', 'כתבו משפט קצר שמסביר איך סגרתם את האתגר.');
      return;
    }

    setSaving(true);
    try {
      await app.addSolution({ challengeId, explanation, imageUris });
      Alert.alert('הפתרון פורסם', `הפתרון שלך ל«${challengeTitle}» עלה וגלוי לכל הקהילה.`);
      router.replace(`/sbc/${challengeId}`);
    } catch (error) {
      Alert.alert('שגיאה בהעלאה', errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen scene="sbc">
      <Stack.Screen options={{ title: 'צילום פתרון SBC' }} />

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
          <Text style={{ color: colors.gold, fontWeight: '800', fontSize: 13 }}>
            ‹ חזרה לאתגר ה-SBC
          </Text>
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
          {face.he !== face.en ? <Muted>{face.he}</Muted> : null}
        </View>
      </View>

      {/* PHOTO UPLOAD BOX */}
      <Card>
        <Text style={{ color: colors.gold, fontSize: 14, fontWeight: '800', textAlign: 'right' }}>
          📸 צילום מסך של הסגל
        </Text>
        <Muted>
          מעלים עד 3 תמונות מתוך המשחק של הסגל שעמד בדרישות של «{challengeTitle}».
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
                ? `נבחרו ${imageUris.length} תמונות (לחצו להחלפה)`
                : 'לחצו לבחירת תמונות מהגלריה'}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center' }}>
              עד 3 תמונות (סגל, כימיה או דרישות)
            </Text>
            {imageUris.length ? <ImageRow uris={imageUris} /> : null}
          </Animated.View>
        </Pressable>
      </Card>

      {/* EXPLANATION FIELD */}
      <Card>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '800', textAlign: 'right' }}>
          איך סגרתם את האתגר הזה?
        </Text>
        <Field
          label=""
          value={explanation}
          onChangeText={setExplanation}
          multiline
          placeholder="למשל: כימיה מליברפול + צרפתים בכנפיים, עלות משוערת כ-12,000 מטבעות"
        />
      </Card>

      {/* SUBMIT BUTTON */}
      <Button
        label={saving || app.busy ? 'מפרסם פתרון...' : 'פרסום הפתרון לקהילה ✨'}
        variant="gold"
        disabled={saving || app.busy}
        onPress={save}
      />
    </Screen>
  );
}
