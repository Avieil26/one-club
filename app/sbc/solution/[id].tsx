import { classicSegments, communitySquadStatus, checkClassicSquad } from '@/lib/sbcClassic';
import { sbcCheckText } from '@/lib/sbcLocalization';
import { rememberCommunityReturn } from '@/lib/communityReturn';
import { useLanguage } from '@/lib/language';
import { useMemo } from 'react';
import { Alert, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { SbcModerationActions } from '@/components/SbcModerationActions';
import { Comments } from '@/components/Comments';
import { SolutionGallery } from '@/components/SolutionGallery';
import { SquadPitch } from '@/components/SquadPitch';
import { Badge, Button, Card, colors, Muted, Screen, Title } from '@/components/ui';
import { evaluateSquad, formationById } from '@/lib/chemistry';
import { errorMessage } from '@/lib/format';
import { displayName } from '@/lib/labels';
import { catalogChallenge, placedPreview } from '@/lib/sbcCatalog';
import { useApp } from '@/lib/store';

export default function SbcSolutionScreen() {
  const { t, language } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const router = useRouter();
  const solution = app.solutions.find((item) => item.id === id);
  const stored = app.sbcChallenges.find((item) => item.id === solution?.challengeId);
  const challenge = solution
    ? { ...catalogChallenge(solution.challengeId), ...stored, ...catalogChallenge(solution.challengeId) }
    : null;
  const formation = formationById(solution?.formation);
  const placed = useMemo(() => placedPreview(solution?.squad), [solution?.squad]);
  const report = useMemo(
    () => (solution?.squad ? evaluateSquad(formation, placed, challenge?.rules ?? null) : null),
    [challenge?.rules, formation, placed, solution?.squad],
  );

  if (!solution || !challenge || (solution.status !== 'approved' && !app.user?.isAdmin && solution.userId !== app.user?.id)) {
    return (
      <Screen scene="sbc">
        <Title>{t("הפתרון לא נמצא", "Solution not found")}</Title>
        <Button label={t("חזרה ל-SBC", "Back to SBC")} onPress={() => router.replace('/sbc')} />
      </Screen>
    );
  }

  const published = solution.status === 'approved';
  const ups = solution.workedUserIds.length;
  const downs = solution.failedUserIds?.length ?? 0;
  const status = communitySquadStatus(solution.challengeId, solution.formation, solution.squad);
  const checkedSegment = classicSegments(solution.challengeId)[0];
  const checkedReport = checkedSegment && solution.squad && solution.formation ? checkClassicSquad(checkedSegment, solution.formation, solution.squad) : null;
  const mine = solution.userId === app.user?.id;
  const votedUp = app.user ? solution.workedUserIds.includes(app.user.id) : false;
  const votedDown = app.user ? (solution.failedUserIds ?? []).includes(app.user.id) : false;
  const solutionId = solution.id;

  async function vote(next: 'up' | 'down') {
    const choice = (next === 'up' && votedUp) || (next === 'down' && votedDown) ? 'clear' : next;
    try {
      await app.voteSolution(solutionId, choice);
    } catch (error) {
      Alert.alert(t("רגע", "Something went wrong"), t(errorMessage(error), errorMessage(error, 'en')));
    }
  }

  return (
    <Screen scene="sbc">
      <Stack.Screen options={{ title: t("פתרון SBC", "SBC solution") }} />
      <Button label={t("חזרה לאתגר", "Back to challenge")} variant="ghost" onPress={() => router.replace(`/sbc/${challenge.id}`)} />
      <Title>{displayName(app.profiles, solution.userId)}</Title>
      <Badge text={solution.status === 'pending' ? t('ממתין לאישור מנהל', 'Awaiting administrator review') : published ? t('אושר על ידי מנהל', 'Approved by an administrator') : t('הפתרון לא אושר', 'Solution not approved')} tone={published ? 'green' : 'amber'} />
      {!published ? <Muted>{t('הפתרון אינו מפורסם בקהילה. דירוגים ותגמולים זמינים רק אחרי אישור.', 'This solution is not published in the community. Ratings and rewards are available only after approval.')}</Muted> : null}
      <SbcModerationActions solution={solution} />
      {status === 'checked' ? <Muted>{t('✓ ההרכב נבדק גם אוטומטית מול הדרישות', '✓ The squad also passes the automatic requirements check')}</Muted> : status === 'invalid' ? <Muted>{t('ההרכב אינו עומד בדרישות הנוכחיות — אין להשתמש בו להשלמת האתגר.', 'This squad does not meet the current requirements. Do not use it to complete this challenge.')}</Muted> : null}
      {status === 'invalid' && checkedReport ? <Card>{checkedReport.checks.filter((c) => !c.ok).map((c) => <Muted key={c.label}>✗ {sbcCheckText(c.label, language)}</Muted>)}</Card> : null}
      <Muted>{solution.explanation}</Muted>
      {solution.squad ? (
        <View style={{ gap: 10 }}>
          <Text style={{ color: colors.text, fontWeight: '800', textAlign: 'right' }}>
            {report ? t(`כימיה ${report.chemistry}/33`, `Chemistry ${report.chemistry}/33`) : t("הסגל שנבנה", "Submitted squad")}
            {report?.rating == null ? '' : t(` · דירוג קבוצה ${report.rating}`, ` · Squad rating ${report.rating}`)}
          </Text>
          <SquadPitch appearance="sbc" formation={formation} placed={placed} playerChem={report?.playerChem ?? {}} showChemHud={false} />
        </View>
      ) : null}
      <SolutionGallery uris={solution.imageUris} />
      {published ? <Card>
        <Text style={{ color: colors.text, fontWeight: '800', textAlign: 'right' }}>{t("האם הפתרון עבד?", "Did this solution work?")}</Text>
        <Muted>{t("לייק ודיסלייק עוזרים לאחרים לדעת אם שווה לנסות את הסגל הזה.", "Likes and dislikes help others decide whether to try this squad.")}</Muted>
        <View style={{ flexDirection: 'row-reverse', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button
              label={votedUp ? t(`סימנתם שעבד · ${ups}`, `Marked as working · ${ups}`) : t(`עבד לי · ${ups}`, `Worked for me · ${ups}`)}
              variant={votedUp ? 'copper' : 'ghost'}
              onPress={() => vote('up')}
              disabled={app.busy || mine || !app.user}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label={t(`לא עבד · ${downs}`, `Did not work · ${downs}`)}
              variant={votedDown ? 'danger' : 'ghost'}
              onPress={() => vote('down')}
              disabled={app.busy || mine || !app.user}
            />
          </View>
        </View>
        {mine ? <Muted>{t("אי אפשר לדרג פתרון של עצמך.", "You cannot rate your own solution.")}</Muted> : null}
        {!app.user ? <Button label={t("התחברות כדי לדרג", "Sign in to rate")} variant="ghost" onPress={() => { void rememberCommunityReturn(`/sbc/solution/${solution.id}`).then(() => router.push('/register')); }} /> : null}
      </Card> : null}
      {published ? <Comments targetType="sbc_solution" targetId={solution.id} /> : null}
    </Screen>
  );
}
