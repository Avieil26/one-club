import { SbcClassicSolution } from '@/components/SbcClassicSolution';
import { classicSegments, communitySquadStatus } from '@/lib/sbcClassic';
import { SbcRewardVisual } from '@/components/SbcRewardVisual';
import { SbcPointsSolution } from '@/components/SbcPointsSolution';
import { ItemScore } from '@/components/ItemScore';
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
  const { t, language, locale } = useLanguage();
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
  const remaining = formatRemaining(challenge.endsAt, now, locale);
  const allSolutions = solutionsFor(app.solutions, challengeId);
  const solutions = allSolutions.filter((s) => communitySquadStatus(challengeId, s.formation, s.squad) !== 'invalid');
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
        {challenge.reward ? `${sbcText(challenge.reward, locale)} · ` : ''}
        {challenge.endsAt ? t('נשאר: {value}', 'Remaining: {value}').replace('{value}', remaining) : remaining}
      </Muted>
      {challenge.groupReward ? <Muted>{t('פרס נוסף אחרי השלמת כל ארבעת חלקי Marquee Matchups: ', 'Bonus after completing all four Marquee Matchups segments: ')}{challenge.groupReward}</Muted> : null}
      {challenge.kind === 'classic' && classicSegments(challengeId).length ? <SbcClassicSolution key={challengeId} challengeId={challengeId} /> : challenge.kind === 'classic' && challenge.previewSquad && !challenge.manualValidation && challenge.rules && report.ready ? (
        <View style={split ? { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 18 } : { gap: 14 }}>
          <View style={split ? { flex: 1, minWidth: 0, gap: 14 } : { gap: 14 }}>
            <Title>{t('פתרון לאתגר', 'Challenge solution')}</Title>
            <Text style={{ color: colors.text, fontWeight: '800', textAlign: language === 'he' ? 'right' : 'left', writingDirection: language === 'he' ? 'rtl' : 'ltr' }}>
              {challenge.rules?.chemistry
                ? t('כימיה {value}/33', 'Chemistry {value}/33').replace('{value}', String(report.chemistry))
                : t("בלי דרישת כימיה", "No chemistry requirement")}
              {report.rating === null ? '' : t(' · דירוג קבוצה {value}', ' · Squad rating {value}').replace('{value}', String(report.rating))}
            </Text>
            <SquadPitch appearance="sbc" formation={formation} placed={placed} playerChem={report.playerChem} showChemHud={false} />
          </View>
          <View style={split ? { width: 320, gap: 14 } : { gap: 14 }}>
            <Card>
              {report.checks.map((check) => (
                <Text key={check.label} style={{ color: check.ok ? colors.green : colors.muted, textAlign: language === 'he' ? 'right' : 'left', writingDirection: language === 'he' ? 'rtl' : 'ltr' }}>
                  {check.ok ? '✓' : '✗'} {sbcCheckText(check.label, locale)}
                </Text>
              ))}
            </Card>
          </View>
        </View>
      ) : challenge.kind !== 'streamlined' ? (
        <Card>
          <Muted>{sbcText(challenge.requirements, locale)}</Muted>
          {challenge.targetScore ? <ItemScore value={challenge.targetScore} /> : null}
        </Card>
      ) : null}
      {challenge.kind === 'streamlined' ? <SbcPointsSolution challengeId={challengeId} /> : null}
      {challenge.kind === 'streamlined' ? (
        <Button
          label={t("פתיחת המחשבון", "Open calculator")}
          variant="copper"
          onPress={() => router.push(`/sbc/calculator?challenge=${challenge.id}`)}
        />
      ) : null}

      {challenge.kind === 'classic' ? (
        <View style={{ gap: 10, marginTop: 4 }}>
          <Text style={{ color: colors.gold, fontWeight: '800', fontSize: 13, textAlign: language === 'he' ? 'right' : 'left', writingDirection: language === 'he' ? 'rtl' : 'ltr', letterSpacing: 0.4 }}>{t("הצעת פתרון לאתגר", "Submit a challenge solution")}</Text>
          <Muted>{t("בניית סגל פותחת מגרש ריק: לוחצים על עמדה, מחפשים שחקן, ומניחים את הקלף. צילום מעלה תמונה מהמשחק.", "Build a squad by selecting positions and adding players to an empty pitch, or upload a screenshot from the game.")}</Muted>
          {!challenge.manualValidation ? <Button label={t("בניית סגל באפליקציה", "Build a squad in the app")} variant="copper" onPress={() => router.push(`/sbc/build/${challengeId}`)} /> : <Muted>{t('באתגר הזה משתפים צילום מהמשחק עם שם החלק והסבר קצר.', 'For this challenge, share an in-game screenshot with the segment name and a short explanation.')}</Muted>}
          <Button label={t("צילום פתרון מהמשחק", "Upload an in-game solution")} variant="gold" onPress={() => router.push(`/sbc/upload/${challengeId}`)} />
        </View>
      ) : null}

      {challenge.kind === 'classic' ? (
        <View style={{ gap: 6, marginTop: 12 }}>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', textAlign: language === 'he' ? 'right' : 'left', writingDirection: language === 'he' ? 'rtl' : 'ltr' }}>{t("פתרונות הקהילה", "Community solutions")}</Text>
          <Muted>
            {solutions.length
              ? t('{count} פתרונות. לחצו על כרטיס כדי לפתוח את המגרש, התמונה והתגובות.', '{count} solutions. Select a card to view the pitch, images and comments.').replace('{count}', String(solutions.length))
              : t("עדיין אין פתרונות לאתגר הזה. תהיו הראשונים לפרסם!", "No solutions yet. Be the first to submit one!")}
          </Muted>
        </View>
      ) : null}

      {app.solutions.filter((solution) => solution.challengeId === challengeId && solution.userId === app.user?.id && solution.status !== 'approved').map((solution) => <Card key={solution.id}>
        <Badge text={solution.status === 'pending' ? t('הפתרון שלך ממתין לאישור מנהל', 'Your solution is awaiting administrator review') : t('הפתרון שלך לא אושר', 'Your solution was not approved')} tone="amber" />
        <Muted>{solution.explanation}</Muted>
        <Button label={t('צפייה בהגשה שלי', 'View my submission')} variant="ghost" onPress={() => router.push(`/sbc/solution/${solution.id}`)} />
      </Card>)}

      {solutions.map((solution) => {
        const ups = solution.workedUserIds.length;
        const downs = solution.failedUserIds?.length ?? 0;
        const shot = solution.imageUris.find((uri) => uri !== 'squad');
        return (
          <Card key={solution.id} onPress={() => router.push(`/sbc/solution/${solution.id}`)}>
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16, textAlign: language === 'he' ? 'right' : 'left', writingDirection: language === 'he' ? 'rtl' : 'ltr' }}>
              {displayName(app.profiles, solution.userId)}
            </Text>
            <Muted>{communitySquadStatus(challengeId, solution.formation, solution.squad) === 'checked' ? t('✓ ההרכב עומד בדרישות האתגר', '✓ Challenge solution') : t('אושר על ידי מנהל', 'Approved by an administrator')}</Muted>
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
            <Text style={{ color: colors.gold, fontWeight: '800', textAlign: language === 'he' ? 'right' : 'left', writingDirection: language === 'he' ? 'rtl' : 'ltr' }}>{t("עבד לי", "Worked for me")}{ups}{t("· לא עבד", "· Did not work")}{downs}
            </Text>
            <Text style={{ color: colors.link, fontWeight: '700', textAlign: language === 'he' ? 'right' : 'left', writingDirection: language === 'he' ? 'rtl' : 'ltr' }}>{t("פתיחת הפתרון המלא", "View full solution")}</Text>
          </Card>
        );
      })}
    </Screen>
  );
}
