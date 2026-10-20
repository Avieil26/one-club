import { SbcRewardVisual } from '@/components/SbcRewardVisual';
import { preparedRoute } from '@/lib/sbcPrepared';
import { sbcCheckText, sbcText } from '@/lib/sbcLocalization';
import { useLanguage } from '@/lib/language';
import { useEffect, useMemo, useState } from 'react';
import { Image, Platform, Text, useWindowDimensions, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

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
  const { t, language } = useLanguage();
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
        <Title>{t("האתגר לא נמצא", "Challenge not found")}</Title>
      </Screen>
    );
  }

  if (!isOpen(challenge, now)) {
    return (
      <Screen scene="sbc">
        <Title>{language === 'en' ? sbcFace(challenge).en : challenge.title}</Title>
        <Muted>{t("הזמן ל-SBC הזה נגמר, והוא הוסר אוטומטית מהרשימה הפעילה.", "This SBC has expired and was automatically removed from the active list.")}</Muted>
        <Button label={t("חזרה לרשימת SBC", "Back to SBCs")} onPress={() => router.replace('/sbc')} />
      </Screen>
    );
  }

  const challengeId = challenge.id;
  const challengeTitle = language === 'en' ? sbcFace(challenge).en : challenge.title;
  const remaining = formatRemaining(challenge.endsAt, now, language);
  const ready = preparedRoute(challengeId);
  const solutions = solutionsFor(app.solutions, challengeId);
  const face = sbcFace(challenge);
  const split = Platform.OS === 'web' && windowWidth >= 1000;

  return (
    <Screen scene="sbc">
      <Stack.Screen options={{ title: 'SBC' }} />
      <View style={{ flexDirection: language === 'he' ? 'row-reverse' : 'row', alignItems: 'center', gap: 18 }}>
        <SbcRewardVisual challenge={challenge} width={windowWidth < 600 ? 132 : 180} />
        <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
          <Badge text={face.category} tone={challenge.kind === 'streamlined' ? 'copper' : 'blue'} />
          <Title>{face.en}</Title>
          {language === 'he' && face.he !== face.en ? <Muted>{face.he}</Muted> : null}
        </View>
      </View>
      <Muted>
        {challenge.reward ? `${sbcText(challenge.reward, language)} · ` : ''}
        {challenge.endsAt ? t(`נשאר: ${remaining}`, `Remaining: ${remaining}`) : remaining}
      </Muted>
      {challenge.groupReward ? <Muted>{t('פרס נוסף אחרי השלמת כל ארבעת חלקי Marquee Matchups: ', 'Bonus after completing all four Marquee Matchups segments: ')}{challenge.groupReward}</Muted> : null}
      {challenge.lastCheckedAt ? <Muted>{t('נבדק לאחרונה: ', 'Last checked: ')}{new Date(challenge.lastCheckedAt).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-GB')}</Muted> : null}
      {challenge.kind === 'classic' && challenge.previewSquad ? (
        <View style={split ? { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 18 } : { gap: 14 }}>
          <View style={split ? { flex: 1, minWidth: 0, gap: 14 } : { gap: 14 }}>
            <Title>{t('סגל מוכן לדוגמה', 'Ready example squad')}</Title>
            <Text style={{ color: colors.text, fontWeight: '800', textAlign: 'right' }}>
              {challenge.rules?.chemistry
                ? t(`כימיה ${report.chemistry}/33`, `Chemistry ${report.chemistry}/33`)
                : t("בלי דרישת כימיה", "No chemistry requirement")}
              {report.rating === null ? '' : t(` · דירוג קבוצה ${report.rating}`, ` · Squad rating ${report.rating}`)}
            </Text>
            <SquadPitch formation={formation} placed={placed} playerChem={report.playerChem} showChemHud={false} />
          </View>
          <View style={split ? { width: 320, gap: 14 } : { gap: 14 }}>
            <Card>
              {report.checks.map((check) => (
                <Text key={check.label} style={{ color: check.ok ? colors.green : colors.muted, textAlign: 'right' }}>
                  {check.ok ? '✓' : '✗'} {sbcCheckText(check.label, language)}
                </Text>
              ))}
            </Card>
          </View>
        </View>
      ) : (
        <Card>
          <Muted>{sbcText(challenge.requirements, language)}</Muted>
          {challenge.targetScore ? <Muted>{t("יעד ניקוד:", "Target score:")}{challenge.targetScore}</Muted> : null}
        </Card>
      )}
      {ready && challenge.kind === 'streamlined' ? <Card>
        <Text style={{ color: colors.gold, fontWeight: '900', fontSize: 20, textAlign: language === 'he' ? 'right' : 'left' }}>{t('צירוף דירוגים מוכן', 'Ready rating combination')}</Text>
        <Muted>{t('קלפים רגילים נדירים לפי הדירוגים הבאים:', 'Use base rare player items with these ratings:')}</Muted>
        {ready.lines.map((line) => <View key={line.rating} style={{ flexDirection: language === 'he' ? 'row-reverse' : 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line }}>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '900' }}>{line.rating} OVR</Text>
          <Text style={{ color: colors.gold, fontWeight: '800' }}>{line.count} × {t('קלפים נדירים', 'rare items')}</Text>
        </View>)}
        <Muted>{t('לפני ההגשה ודאו במשחק שהגעתם ליעד הניקוד. גרסאות מיוחדות של קלפים עשויות לשנות את הניקוד.', 'Confirm the target score in-game before submitting. Special card versions can affect the score.')}</Muted>
      </Card> : null}
      {challenge.kind === 'streamlined' ? (
        <Button
          label={t("פתיחת המחשבון", "Open calculator")}
          variant="copper"
          onPress={() => router.push(`/sbc/calculator?target=${challenge.targetScore ?? ''}`)}
        />
      ) : null}

      {challenge.kind === 'classic' ? (
        <View style={{ gap: 10, marginTop: 4 }}>
          <Text style={{ color: colors.gold, fontWeight: '800', fontSize: 13, textAlign: 'right', letterSpacing: 0.4 }}>{t("הצעת פתרון לאתגר", "Submit a challenge solution")}</Text>
          <Muted>{t("בניית סגל פותחת מגרש ריק: לוחצים על עמדה, מחפשים שחקן, ומניחים את הקלף. צילום מעלה תמונה מהמשחק.", "Build a squad by selecting positions and adding players to an empty pitch, or upload a screenshot from the game.")}</Muted>
          {!challenge.manualValidation ? <Button label={t("בניית סגל באפליקציה", "Build a squad in the app")} variant="copper" onPress={() => router.push(`/sbc/build/${challengeId}`)} /> : <Muted>{t('באתגר הזה משתפים צילום מהמשחק עם שם החלק והסבר קצר.', 'For this challenge, share an in-game screenshot with the segment name and a short explanation.')}</Muted>}
          <Button label={t("צילום פתרון מהמשחק", "Upload an in-game solution")} variant="gold" onPress={() => router.push(`/sbc/upload/${challengeId}`)} />
        </View>
      ) : null}

      {challenge.kind === 'classic' ? (
        <View style={{ gap: 6, marginTop: 12 }}>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'right' }}>{t("פתרונות הקהילה", "Community solutions")}</Text>
          <Muted>
            {solutions.length
              ? t(`${solutions.length} פתרונות. לחצו על כרטיס כדי לפתוח את המגרש, התמונה והתגובות.`, `${solutions.length} solutions. Select a card to view the pitch, images and comments.`)
              : t("עדיין אין פתרונות לאתגר הזה. תהיו הראשונים לפרסם!", "No solutions yet. Be the first to submit one!")}
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
              <Muted>{solution.squad ? t("סגל שנבנה באפליקציה", "Squad built in the app") : t("בלי תמונה", "No image")}</Muted>
            )}
            <Text style={{ color: colors.gold, fontWeight: '800', textAlign: 'right' }}>{t("עבד לי", "Worked for me")}{ups}{t("· לא עבד", "· Did not work")}{downs}
            </Text>
            <Text style={{ color: colors.link, fontWeight: '700', textAlign: 'right' }}>{t("פתיחת הפתרון המלא", "View full solution")}</Text>
          </Card>
        );
      })}
    </Screen>
  );
}
