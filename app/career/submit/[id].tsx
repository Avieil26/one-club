import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { CareerCreamButton, CareerStripes } from '@/components/CareerChallengeCard';
import { ImageRow, Muted, Screen, Title } from '@/components/ui';
import { careerCream, careerFont, careerThemeFor } from '@/lib/careerCardTheme';
import { useLanguage } from '@/lib/language';
import { careerChallengeCopy } from '@/lib/careerLocalization';
import { errorMessage } from '@/lib/format';
import { pickImages } from '@/lib/images';
import { useApp } from '@/lib/store';

export default function SubmitChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const { language, t } = useLanguage();
  const router = useRouter();
  const challenge = app.challenges.find((item) => item.id === id);
  const [playerOrClubName, setPlayerOrClubName] = useState('');
  const [note, setNote] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const copy = challenge ? careerChallengeCopy(challenge, language) : null;
  const challengeTitle = copy?.title ?? t('האתגר', 'the challenge');

  async function choose() {
    try {
      const picked = await pickImages(3);
      if (picked.length) setImageUris(picked);
    } catch (error) {
      Alert.alert(t('רגע', 'Something went wrong'), t(errorMessage(error), errorMessage(error, 'en')));
    }
  }

  async function save() {
    if (!id) return;
    try {
      if (!imageUris.length) {
        Alert.alert(t('רגע', 'Something went wrong'), t('צריך לפחות צילום מסך אחד שמתאים לאתגר הקריירה הזה', 'Upload at least one screenshot that meets this challenge’s requirements.'));
        return;
      }
      await app.submitCareer({ challengeId: id, playerOrClubName, note, imageUris });
      Alert.alert(
        t('נשלח לאישור', 'Submitted for approval'),
        t('ההגשה ל«{title}» נשלחה לבדיקה. היא תופיע רק אחרי אישור מנהל.', 'Your submission for “{title}” is awaiting review. It will appear after administrator approval.').replace('{title}', challengeTitle),
      );
      router.replace(`/career/${id}`);
    } catch (error) {
      Alert.alert(t('רגע', 'Something went wrong'), t(errorMessage(error), errorMessage(error, 'en')));
    }
  }

  if (!challenge) {
    return (
      <Screen scene="career">
        <Title>{t('האתגר לא נמצא', 'Challenge not found')}</Title>
      </Screen>
    );
  }

  const theme = careerThemeFor(challenge);

  return (
    <Screen scene="career">
      <Stack.Screen options={{ title: t('הגשה', 'Submit proof') }} />
      <View style={[styles.sheet, { backgroundColor: theme.background }]}>
        <CareerStripes theme={theme} />
        <Text style={[styles.kicker, { color: theme.accent }]}>{challengeTitle}</Text>
        <Title>{t('הגשה ל«{title}»', 'Submit proof for “{title}”').replace('{title}', challengeTitle)}</Title>
        <Muted>{t('ההגשה נשלחת למנהל לבדיקה ולא מופיעה בפיד לפני אישור.', 'Your submission is reviewed by an administrator before it appears in the feed.')}</Muted>
        {challenge.proofRequirements ? (
          <Muted>{t('מה חייב להופיע בצילום: ', 'Required proof: ')}{copy?.proofRequirements}</Muted>
        ) : null}
        <View style={styles.field}>
          <Text style={styles.label}>{t('שם השחקן או המועדון', 'Player or club name')}</Text>
          <TextInput
            value={playerOrClubName}
            onChangeText={setPlayerOrClubName}
            placeholderTextColor="rgba(247,244,234,0.38)"
            style={[styles.input, { borderRightColor: theme.inset }]}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>{t('מה עשיתם', 'What did you achieve?')}</Text>
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
            <Text style={styles.dropTitle}>{t('צילום מסך להוכחה', 'Proof screenshots')}</Text>
            <Muted>{t('חובה להגשה ל«{title}». עד 3 תמונות.', 'Required for “{title}”. Up to 3 images.').replace('{title}', challengeTitle)}</Muted>
            {imageUris.length ? <ImageRow uris={imageUris} /> : null}
          </View>
        </Pressable>
        <CareerCreamButton
          theme={theme}
          label={t('שליחת ההגשה לאתגר הזה', 'Submit proof for this challenge')}
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
