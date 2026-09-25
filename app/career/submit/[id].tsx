import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { Button, Card, colors, Field, ImageRow, Muted, Screen, Title } from '@/components/ui';
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
      router.back();
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

  return (
    <Screen scene="career">
      <Stack.Screen options={{ title: 'הגשה' }} />
      <Card>
        <Text style={{ color: colors.gold, fontWeight: '800', fontSize: 13, textAlign: 'right' }}>הגשה לקריירה</Text>
        <Title>הגשה ל«{challenge.title}»</Title>
        <Muted>
          {trusted
            ? 'אתם מאומתים, אז ההגשה תפורסם מיד תחת האתגר הזה.'
            : 'ההגשה ממתינה לאישור ולא מופיעה בפיד לפני כן.'}
        </Muted>
        {challenge.proofRequirements ? <Muted>מה חייב להופיע בצילום: {challenge.proofRequirements}</Muted> : null}
      </Card>
      <Field label="שם השחקן או המועדון" value={playerOrClubName} onChangeText={setPlayerOrClubName} />
      <Field label="מה עשיתם" value={note} onChangeText={setNote} multiline />
      <Pressable accessibilityRole="button" onPress={choose}>
        <View
          style={{
            borderRadius: 18,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: imageUris.length ? colors.gold : colors.line,
            backgroundColor: colors.card,
            minHeight: 120,
            padding: 16,
            gap: 10,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800', textAlign: 'right' }}>
            צילום מסך להוכחה
          </Text>
          <Muted>חובה להגשה ל«{challenge.title}». עד 3 תמונות.</Muted>
          {imageUris.length ? <ImageRow uris={imageUris} /> : null}
        </View>
      </Pressable>
      <Button label="שליחת ההגשה לאתגר הזה" onPress={save} disabled={app.busy} />
    </Screen>
  );
}
