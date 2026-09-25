import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Platform, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { Comments } from '@/components/Comments';
import { ClubBadge } from '@/components/ClubBadge';
import { SquadPitch } from '@/components/SquadPitch';
import { Badge, Button, Card, colors, Field, ImageRow, Muted, Screen, Title } from '@/components/ui';
import { evaluateSquad, formationById } from '@/lib/chemistry';
import { errorMessage, formatRemaining } from '@/lib/format';
import { pickImages } from '@/lib/images';
import { displayName, sbcKindLabel } from '@/lib/labels';
import { catalogChallenge, placedPreview } from '@/lib/sbcCatalog';
import { isOpen, solutionsFor } from '@/lib/selectors';
import { useApp } from '@/lib/store';

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function ShotDrop({
  uris,
  onPress,
  challengeTitle,
}: {
  uris: string[];
  onPress: () => void;
  challengeTitle: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!uris.length) return;
    scale.setValue(0.96);
    Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start();
  }, [uris, scale]);

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Animated.View
        style={{
          transform: [{ scale }],
          borderRadius: 18,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: uris.length ? colors.gold : colors.line,
          backgroundColor: colors.card,
          minHeight: 148,
          padding: 16,
          gap: 12,
        }}
      >
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'right' }}>
          צילום מסך של הסגל שהשלמתם
        </Text>
        <Muted>
          חובה לפתרון של «{challengeTitle}». עד 3 תמונות מהמסך במשחק אחרי שהגשתם את ה-SBC.
        </Muted>
        {uris.length ? <ImageRow uris={uris} /> : null}
      </Animated.View>
    </Pressable>
  );
}

export default function SbcDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const router = useRouter();
  const now = useNow();
  const windowWidth = useWindowDimensions().width;
  const stored = app.sbcChallenges.find((item) => item.id === id);
  const challenge = stored
    ? { ...catalogChallenge(String(id)), ...stored, ...catalogChallenge(String(id)) }
    : catalogChallenge(String(id));
  const [explanation, setExplanation] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const formation = formationById(challenge?.previewFormation === '442' ? '442' : '433');
  const placed = useMemo(() => placedPreview(challenge?.previewSquad), [challenge?.previewSquad]);
  const report = useMemo(
    () => evaluateSquad(formation, placed, challenge?.rules ?? null),
    [challenge?.rules, formation, placed],
  );

  if (!challenge) {
    return (
      <Screen scene="sbc">
        <Title>האתגר לא נמצא</Title>
      </Screen>
    );
  }

  if (!isOpen(challenge, now)) {
    return (
      <Screen scene="sbc">
        <Title>{challenge.title}</Title>
        <Muted>הזמן ל-SBC הזה נגמר, והוא הוסר אוטומטית מהרשימה הפעילה.</Muted>
        <Button label="חזרה לרשימת SBC" onPress={() => router.replace('/sbc')} />
      </Screen>
    );
  }

  const challengeId = challenge.id;
  const challengeTitle = challenge.title;
  const remaining = formatRemaining(challenge.endsAt, now);
  const solutions = solutionsFor(app.solutions, challengeId);
  const clubs = challenge.clubs ?? [];
  const split = Platform.OS === 'web' && windowWidth >= 1000;

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
      if (!imageUris.length) {
        Alert.alert('רגע', 'צריך לפחות צילום מסך אחד של הסגל שהשלמתם ל-SBC הזה');
        return;
      }
      if (!explanation.trim()) {
        Alert.alert('רגע', 'כתבו משפט קצר איך סגרתם את האתגר');
        return;
      }
      await app.addSolution({ challengeId, explanation, imageUris });
      setExplanation('');
      setImageUris([]);
      Alert.alert('פורסם', `הפתרון ל«${challengeTitle}» עלה ומופיע למטה לקהילה.`);
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  async function worked(solutionId: string) {
    try {
      await app.markWorked(solutionId);
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  return (
    <Screen scene="sbc">
      <Stack.Screen options={{ title: 'SBC' }} />
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
        {clubs.map((club) => (
          <ClubBadge key={club} size={54} club={club} />
        ))}
        <View style={{ flex: 1 }}>
          <Badge text={sbcKindLabel(challenge.kind)} tone={challenge.kind === 'streamlined' ? 'copper' : 'blue'} />
          <Title>{challenge.title}</Title>
        </View>
      </View>
      <Muted>
        {challenge.reward ? `${challenge.reward} · ` : ''}
        {challenge.endsAt ? `נשאר: ${remaining}` : remaining}
      </Muted>
      {challenge.kind === 'classic' && challenge.previewSquad ? (
        <View style={split ? { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 18 } : { gap: 14 }}>
          <View style={split ? { flex: 1, minWidth: 0, gap: 14 } : { gap: 14 }}>
            <Text style={{ color: colors.text, fontWeight: '800', textAlign: 'right' }}>
              כימיה {report.chemistry}/33
              {report.rating === null ? '' : ` · דירוג קבוצה ${report.rating}`}
            </Text>
            <SquadPitch formation={formation} placed={placed} playerChem={report.playerChem} />
          </View>
          <View style={split ? { width: 320, gap: 14 } : { gap: 14 }}>
            <Card>
              {report.checks.map((check) => (
                <Text key={check.label} style={{ color: check.ok ? colors.green : colors.muted, textAlign: 'right' }}>
                  {check.ok ? '✓' : '✗'} {check.label}
                </Text>
              ))}
            </Card>
            <Button
              label="בניית הסגל לפי הדרישות"
              variant="copper"
              onPress={() => router.push(`/sbc/build/${challengeId}`)}
            />
          </View>
        </View>
      ) : (
        <Card>
          <Muted>{challenge.requirements}</Muted>
          {challenge.targetScore ? <Muted>יעד ניקוד: {challenge.targetScore}</Muted> : null}
        </Card>
      )}
      {challenge.kind === 'streamlined' ? (
        <Button
          label="פתיחת המחשבון"
          variant="copper"
          onPress={() => router.push(`/sbc/calculator?target=${challenge.targetScore ?? ''}`)}
        />
      ) : challenge.kind === 'classic' && challenge.previewSquad ? null : (
        <Button
          label="בניית הסגל לפי הדרישות"
          variant="copper"
          onPress={() => router.push(`/sbc/build/${challengeId}`)}
        />
      )}
      {challenge.kind === 'classic' ? (
        <>
          <Card>
            <Text style={{ color: colors.gold, fontWeight: '800', fontSize: 13, textAlign: 'right', letterSpacing: 0.4 }}>
              פתרון לקהילה
            </Text>
            <Title>פתרון ל«{challenge.title}»</Title>
            <Muted>מעלים צילום של הסגל שהשלמתם בדיוק לאתגר הזה. כולם יראו אותו כאן תחת אותו SBC.</Muted>
          </Card>
          <ShotDrop uris={imageUris} onPress={choose} challengeTitle={challenge.title} />
          <Field
            label="איך סגרתם את האתגר הזה"
            value={explanation}
            onChangeText={setExplanation}
            multiline
            placeholder="למשל: כימיה מליברפול + צרפתים בכנפיים"
          />
          <Button label="פרסום הפתרון ל-SBC הזה" onPress={save} disabled={app.busy} />
        </>
      ) : null}

      {challenge.kind === 'classic' ? (
        <View style={{ gap: 10 }}>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'right' }}>
            פתרונות ל«{challenge.title}»
          </Text>
          <Muted>
            {solutions.length
              ? `${solutions.length} פתרונות שפורסמו לאתגר הזה`
              : 'עדיין אין פתרונות לאתגר הזה. תהיו הראשונים.'}
          </Muted>
        </View>
      ) : null}

      {solutions.map((solution) => {
        const marked = app.user ? solution.workedUserIds.includes(app.user.id) : false;
        return (
          <Card key={solution.id}>
            <Text style={{ color: colors.gold, fontWeight: '700', fontSize: 12, textAlign: 'right' }}>
              פתרון ל· {challenge.title}
            </Text>
            <Text style={{ color: colors.text, fontWeight: '700', textAlign: 'right' }}>
              {displayName(app.profiles, solution.userId)}
            </Text>
            <Muted>{solution.explanation}</Muted>
            <ImageRow uris={solution.imageUris} />
            <Button
              label={
                marked
                  ? `סימנתם שזה עבד · ${solution.workedUserIds.length}`
                  : `עבד לי · ${solution.workedUserIds.length}`
              }
              variant={marked ? 'copper' : 'ghost'}
              onPress={() => worked(solution.id)}
              disabled={app.busy || marked || solution.userId === app.user?.id}
            />
            <Comments targetType="sbc_solution" targetId={solution.id} />
          </Card>
        );
      })}
    </Screen>
  );
}
