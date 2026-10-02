import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { CareerCreamButton, CareerStripes } from '@/components/CareerChallengeCard';
import { ImageRow, Muted, Screen, Title } from '@/components/ui';
import { careerCream, careerFont, careerThemeFor } from '@/lib/careerCardTheme';
import { errorMessage } from '@/lib/format';
import { pickImages } from '@/lib/images';
import { TRUSTED_APPROVALS } from '@/lib/labels';
import { useApp } from '@/lib/store';

export default function SubmitChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const router = useRouter();
  const challenge = app.challenges.find((item) => item.id === id);
  const [playerOrClubName, setPlayerOrClubName] = useState('');
  const [note, setNote] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const trusted = (app.user?.approvedCount ?? 0) >= TRUSTED_APPROVALS;
  const challengeTitle = challenge?.title ?? 'האתגר';

  async function choose() {
    try {
      const picked = await pickImages(3);
      if (picked.length) setImageUris(picked);
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  async function save() {
    if (!id) return;
    try {
      if (!imageUris.length) {
        Alert.alert('רגע', 'צריך לפחות צילום מסך אחד שמתאים לאתגר הקריירה הזה');
        return;
      }
      await app.submitCareer({ challengeId: id, playerOrClubName, note, imageUris });
      Alert.alert(
        trusted ? 'פורסם' : 'נשלח לאישור',
        trusted
          ? `ההגשה ל«${challengeTitle}» עלתה לקהילה.`
          : `ההגשה ל«${challengeTitle}» תופיע אחרי אישור.`,
      );
      router.replace(`/career/${id}`);
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  if (!challenge) {
    return (
      <Screen scene="career">
        <Title>האתגר לא נמצא</Title>
      </Screen>
    );
  }

  const theme = careerThemeFor(challenge);

  return (
    <Screen scene="career">
      <Stack.Screen options={{ title: 'הגשה' }} />
      <View style={[styles.sheet, { backgroundColor: theme.background }]}>
        <CareerStripes theme={theme} />
        <Text style={[styles.kicker, { color: theme.accent }]}>{challenge.title}</Text>
        <Title>הגשה ל«{challenge.title}»</Title>
        <Muted>
          {trusted
            ? 'אתם מאומתים, אז ההגשה תפורסם מיד תחת האתגר הזה.'
            : 'ההגשה ממתינה לאישור ולא מופיעה בפיד לפני כן.'}
        </Muted>
        {challenge.proofRequirements ? (
          <Muted>מה חייב להופיע בצילום: {challenge.proofRequirements}</Muted>
        ) : null}
        <View style={styles.field}>
          <Text style={styles.label}>שם השחקן או המועדון</Text>
          <TextInput
            value={playerOrClubName}
            onChangeText={setPlayerOrClubName}
            placeholderTextColor="rgba(247,244,234,0.38)"
            style={[styles.input, { borderRightColor: theme.inset }]}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>מה עשיתם</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholderTextColor="rgba(247,244,234,0.38)"
            multiline
            style={[styles.input, styles.tall, { borderRightColor: theme.inset }]}
          />
        </View>
        <Pressable accessibilityRole="button" onPress={choose}>
          <View style={[styles.drop, { borderRightColor: theme.inset, borderColor: theme.accent }]}>
            <Text style={styles.dropTitle}>צילום מסך להוכחה</Text>
            <Muted>חובה להגשה ל«{challenge.title}». עד 3 תמונות.</Muted>
            {imageUris.length ? <ImageRow uris={imageUris} /> : null}
          </View>
        </Pressable>
        <CareerCreamButton
          theme={theme}
          label="שליחת ההגשה לאתגר הזה"
          onPress={app.busy ? undefined : save}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    paddingTop: 22,
    gap: 12,
  },
  kicker: {
    fontFamily: careerFont,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  field: { gap: 6 },
  label: {
    color: 'rgba(247,244,234,0.7)',
    fontFamily: careerFont,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  input: {
    minHeight: 44,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(247,244,234,0.14)',
    borderRightWidth: 3,
    color: careerCream,
    fontFamily: careerFont,
    fontSize: 15,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  tall: { minHeight: 96, textAlignVertical: 'top' },
  drop: {
    borderRadius: 8,
    padding: 14,
    minHeight: 108,
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderRightWidth: 3,
  },
  dropTitle: {
    color: careerCream,
    fontFamily: careerFont,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
