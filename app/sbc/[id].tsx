import { useEffect, useMemo, useState } from 'react';
import { Image, Platform, Text, useWindowDimensions, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { ClubBadge } from '@/components/ClubBadge';
import { NationFlag } from '@/components/NationFlag';
import { SquadPitch } from '@/components/SquadPitch';
import { Badge, Button, Card, colors, Muted, Screen, Title } from '@/components/ui';
import { evaluateSquad, formationById } from '@/lib/chemistry';
import { formatRemaining } from '@/lib/format';
import { displayName } from '@/lib/labels';
import { catalogChallenge, placedPreview } from '@/lib/sbcCatalog';
import { sbcFace } from '@/lib/sbcTileTheme';
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
  const formation = formationById(challenge?.previewFormation);
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
  const nations = challenge.nations ?? [];
  const face = sbcFace(challenge);
  const split = Platform.OS === 'web' && windowWidth >= 1000;

  return (
    <Screen scene="sbc">
      <Stack.Screen options={{ title: 'SBC' }} />
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
        {nations.map((nation) => (
          <NationFlag key={nation} nation={nation} size={28} />
        ))}
        {clubs.map((club) => (
          <ClubBadge key={club} size={54} club={club} />
        ))}
        <View style={{ flex: 1 }}>
          <Badge text={face.category} tone={challenge.kind === 'streamlined' ? 'copper' : 'blue'} />
          <Title>{face.en}</Title>
          {face.he !== face.en ? <Muted>{face.he}</Muted> : null}
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
              {challenge.rules?.chemistry
                ? `כימיה ${report.chemistry}/33`
                : 'בלי דרישת כימיה'}
              {report.rating === null ? '' : ` · דירוג קבוצה ${report.rating}`}
            </Text>
            <SquadPitch formation={formation} placed={placed} playerChem={report.playerChem} showChemHud={false} />
          </View>
          <View style={split ? { width: 320, gap: 14 } : { gap: 14 }}>
            <Card>
              {report.checks.map((check) => (
                <Text key={check.label} style={{ color: check.ok ? colors.green : colors.muted, textAlign: 'right' }}>
                  {check.ok ? '✓' : '✗'} {check.label}
                </Text>
              ))}
            </Card>
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
      ) : null}

      {challenge.kind === 'classic' ? (
        <View style={{ gap: 10, marginTop: 4 }}>
          <Text style={{ color: colors.gold, fontWeight: '800', fontSize: 13, textAlign: 'right', letterSpacing: 0.4 }}>
            הצעת פתרון לאתגר
          </Text>
          <Muted>בניית סגל פותחת מגרש ריק: לוחצים על עמדה, מחפשים שחקן, ומניחים את הקלף. צילום מעלה תמונה מהמשחק.</Muted>
          <Button label="בניית סגל באפליקציה" variant="copper" onPress={() => router.push(`/sbc/build/${challengeId}`)} />
          <Button label="צילום פתרון מהמשחק" variant="gold" onPress={() => router.push(`/sbc/upload/${challengeId}`)} />
        </View>
      ) : null}

      {challenge.kind === 'classic' ? (
        <View style={{ gap: 6, marginTop: 12 }}>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'right' }}>פתרונות הקהילה</Text>
          <Muted>
            {solutions.length
              ? `${solutions.length} פתרונות. לחצו על כרטיס כדי לפתוח את המגרש, התמונה והתגובות.`
              : 'עדיין אין פתרונות לאתגר הזה. תהיו הראשונים לפרסם!'}
          </Muted>
        </View>
      ) : null}

      {solutions.map((solution) => {
        const ups = solution.workedUserIds.length;
        const downs = solution.failedUserIds?.length ?? 0;
        const shot = solution.imageUris[0];
        return (
          <Card key={solution.id} onPress={() => router.push(`/sbc/solution/${solution.id}`)}>
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16, textAlign: 'right' }}>
              {displayName(app.profiles, solution.userId)}
            </Text>
            <Muted>{solution.explanation}</Muted>
            {shot ? (
              <Image
                source={{ uri: shot }}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
                style={{ width: '100%', height: 220, borderRadius: 14, backgroundColor: '#07140F' }}
              />
            ) : (
              <Muted>{solution.squad ? 'סגל שנבנה באפליקציה' : 'בלי תמונה'}</Muted>
            )}
            <Text style={{ color: colors.gold, fontWeight: '800', textAlign: 'right' }}>
              עבד לי {ups} · לא עבד {downs}
            </Text>
            <Text style={{ color: colors.link, fontWeight: '700', textAlign: 'right' }}>פתיחת הפתרון המלא</Text>
          </Card>
        );
      })}
    </Screen>
  );
}
