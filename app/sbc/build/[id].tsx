import { sbcCheckText } from '@/lib/sbcLocalization';
import { sbcFace } from '@/lib/sbcTileTheme';
import { checkClassicSquad, classicSegments, classicFormation } from '@/lib/sbcClassic';
import { playerDisplayName } from '@/lib/playerDisplayName';
import { useLanguage } from '@/lib/language';
import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { PortraitCard } from '@/components/PortraitCard';
import { SquadPitch } from '@/components/SquadPitch';
import { Button, ChoiceGroup, colors, Field, Muted, Screen, Title } from '@/components/ui';
import {
  evaluateSquad,
  FORMATIONS,
  formationById,
  isFormationId,
  positionFits,
  slotPosition,
  type FormationId,
} from '@/lib/chemistry';
import { PLAYERS, type FcPlayer } from '@/lib/fcPlayers';
import { playerMedia } from '@/lib/playerMedia';
import { catalogChallenge } from '@/lib/sbcCatalog';
import { useApp } from '@/lib/store';
import { errorMessage } from '@/lib/format';
import { isOpen } from '@/lib/selectors';

function blankSquad(formationId: FormationId): Record<string, FcPlayer | null> {
  const placed: Record<string, FcPlayer | null> = {};
  for (const slot of formationById(formationId).lines.flat()) placed[slot.id] = null;
  return placed;
}

export default function SquadBuildScreen() {
  const { t, language } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const router = useRouter();
  const stored = app.sbcChallenges.find((item) => item.id === id);
  const challenge = stored
    ? { ...catalogChallenge(String(id)), ...stored, ...catalogChallenge(String(id)) }
    : catalogChallenge(String(id));
  const initialFormation = challenge?.previewFormation && isFormationId(challenge.previewFormation) ? challenge.previewFormation : '433';
  const classicSegment = classicSegments(String(id))[0];
  const fixedFormation = classicSegment?.formation;
  const activeSlots = classicSegment?.activeSlots;
  const [formationId, setFormationId] = useState<FormationId>(initialFormation);
  const [placed, setPlaced] = useState<Record<string, FcPlayer | null>>(() =>
    blankSquad(initialFormation),
  );
  const [active, setActive] = useState<string | null>(activeSlots?.[0] ?? formationById(initialFormation).lines[0]?.[0]?.id ?? null);
  const [query, setQuery] = useState('');
  const [explanation, setExplanation] = useState('');
  const formation = classicSegment ? classicFormation(classicSegment, formationId) : formationById(formationId);
  const report = useMemo(
    () => classicSegment ? checkClassicSquad(classicSegment, formationId, Object.fromEntries(Object.entries(placed).flatMap(([slot, player]) => player ? [[slot, player.id]] : []))) : evaluateSquad(formation, placed, challenge?.rules ?? null),
    [challenge?.rules, classicSegment, formation, formationId, placed],
  );

  const used = useMemo(() => {
    const ids = new Set<string>();
    for (const line of formation.lines) {
      for (const slot of line) {
        const player = placed[slot.id];
        if (player) ids.add(player.id);
      }
    }
    return ids;
  }, [formation, placed]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const wanted = active ? slotPosition(formation, active) : 'ST';
    const matched = PLAYERS.filter((player) => {
      if (used.has(player.id) && placed[active ?? '']?.id !== player.id) return false;
      if (!needle) return positionFits(player.position, wanted);
      const media = playerMedia(player.baseId ?? player.id);
      const hay = `${player.name} ${player.en ?? ''} ${media.en} ${player.nation} ${player.club} ${player.league} ${player.position}`.toLowerCase();
      return hay.includes(needle);
    }).sort((a, b) => {
      if (needle) {
        const aName = `${a.name} ${playerMedia(a.baseId ?? a.id).en}`.toLowerCase();
        const bName = `${b.name} ${playerMedia(b.baseId ?? b.id).en}`.toLowerCase();
        const aHit = aName.startsWith(needle) || aName.includes(` ${needle}`) ? 0 : 1;
        const bHit = bName.startsWith(needle) || bName.includes(` ${needle}`) ? 0 : 1;
        if (aHit !== bHit) return aHit - bHit;
      }
      const fit = Number(positionFits(b.position, wanted)) - Number(positionFits(a.position, wanted));
      if (fit !== 0) return fit;
      return b.rating - a.rating;
    });
    const limit = needle ? 24 : 8;
    return { shown: matched.slice(0, limit), total: matched.length };
  }, [active, formation, placed, query, used]);

  if (!challenge || !isOpen(challenge) || challenge.kind !== 'classic' || challenge.manualValidation) {
    return (
      <Screen scene="sbc">
        <Title>{t("אין כאן בניית סגל", "Squad building is unavailable here")}</Title>
        <Muted>{t('חזרו לעמוד האתגר כדי לראות אם הוא פעיל, לפתוח מחשבון או לשתף צילום מהמשחק.', 'Return to the challenge to check availability, open its calculator or share an in-game screenshot.')}</Muted>
        <Button label={t('חזרה לאתגר', 'Back to challenge')} onPress={() => router.replace(`/sbc/${id}`)} variant="ghost" />
      </Screen>
    );
  }

  function choose(player: FcPlayer) {
    if (!active) return;
    setPlaced((current) => ({ ...current, [active]: player }));
    setQuery('');
  }

  function clearSlot() {
    if (!active) return;
    setPlaced((current) => ({ ...current, [active]: null }));
  }

  async function publish() {
    if (!challenge) return;
    if (!report.ready) {
      const failed = report.checks.filter((check) => !check.ok).map((check) => check.label);
      Alert.alert(t("הסגל עדיין לא עומד בדרישות", "The squad does not meet the requirements yet"), failed.join('\n'));
      return;
    }
    if (!explanation.trim()) {
      Alert.alert(t("רגע", "Something went wrong"), t("כתבו משפט קצר איך סגרתם את האתגר", "Add a short explanation of how you completed the challenge"));
      return;
    }
    const squad: Record<string, string> = {};
    for (const line of formation.lines) {
      for (const slot of line) {
        const player = placed[slot.id];
        if (activeSlots && !activeSlots.includes(slot.id)) continue;
        if (!player) return;
        squad[slot.id] = player.id;
      }
    }
    try {
      await app.addSolution({
        challengeId: challenge.id,
        explanation,
        imageUris: [],
        squad,
        formation: formationId,
      });
      Alert.alert(t("נשלח לאישור", "Submitted for review"), t(`הסגל ל«${challenge.title}» ממתין לאישור מנהל.`, `Your squad for “${challenge.title}” is awaiting administrator review.`));
      router.replace(`/sbc/${challenge.id}`);
    } catch (error) {
      Alert.alert(t("רגע", "Something went wrong"), errorMessage(error));
    }
  }

  return (
    <Screen scene="sbc">
      <Stack.Screen options={{ title: t("בניית סגל", "Build squad") }} />
      <Title>{language === 'en' ? sbcFace(challenge).en : sbcFace(challenge).he}</Title>
      <Muted>{t("מגרש ריק. לחצו על עמדה, חפשו את שם השחקן באנגלית, והניחו את הקלף.", "Start with an empty pitch. Select a position, search for a player in English and add their card.")}</Muted>
      <ChoiceGroup
        label={t("מערך", "Formation")}
        options={FORMATIONS.filter((item) => !fixedFormation || item.id === fixedFormation).map((item) => ({ id: item.id, label: item.label }))}
        value={formationId}
        onChange={(next) => {
          setFormationId(next);
          setPlaced(blankSquad(next));
          setActive(formationById(next).lines[0]?.[0]?.id ?? null);
          setQuery('');
        }}
      />

      <LinearGradient
        colors={['rgba(8, 28, 22, 0.95)', 'rgba(12, 36, 28, 0.9)']}
        style={{
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(61, 220, 151, 0.28)',
          padding: 14,
          gap: 8,
        }}
      >
        <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16, textAlign: 'right' }}>{t("כימיה", "Chemistry")}{report.chemistry}/33
          </Text>
          <Text style={{ color: colors.muted, fontWeight: '700', textAlign: 'right' }}>{t("מדינות", "Nations")}{report.nations}
            {report.rating === null ? '' : t(` · דירוג ${report.rating}`, ` · Rating ${report.rating}`)}
          </Text>
        </View>
        {report.checks.map((check) => (
          <Text key={check.label} style={{ color: check.ok ? colors.green : colors.muted, textAlign: 'right' }}>
            {check.ok ? '✓' : '✗'} {sbcCheckText(check.label, language)}
          </Text>
        ))}
      </LinearGradient>

      <SquadPitch
        activeSlots={activeSlots}
        appearance="sbc"
        formation={formation}
        placed={placed}
        playerChem={report.playerChem}
        activeSlot={active}
        onSlot={setActive}
      />
      <Text style={{ color: colors.text, fontWeight: '800', textAlign: 'right' }}>
        {active ? t(`עמדה נבחרת: ${slotPosition(formation, active)}`, `Selected position: ${slotPosition(formation, active)}`) : t("לחצו על עמדה במגרש", "Select a position on the pitch")}
      </Text>
      <Button label={t("פינוי העמדה", "Clear position")} variant="ghost" onPress={clearSlot} />
      <Field label={t("חיפוש שחקן", "Search players")} value={query} onChangeText={setQuery} placeholder={t("למשל Haaland", "For example, Haaland")} />
      <Muted>
        {query.trim()
          ? t(`${results.total.toLocaleString('he-IL')} שחקנים נמצאו במאגר`, `${results.total.toLocaleString('en-US')} players found`)
          : t("הקלפים של העמדה. חיפוש מוצא כל שחקן במאגר, בעברית או באנגלית.", "Players for this position. Search the full database in Hebrew or English.")}
      </Muted>
      <View style={{ gap: 8 }}>
        {results.shown.map((player) => (
          <Pressable
            key={player.id}
            accessibilityRole="button"
            accessibilityLabel={playerDisplayName(player, language)}
            onPress={() => choose(player)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 4 }}
          >
            <PortraitCard player={player} width={92} />
            <View style={{ flex: 1, alignItems: 'flex-end', gap: 4 }}>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 17, textAlign: 'right' }}>
                {playerDisplayName(player, language)}
              </Text>
              <Text style={{ color: colors.muted, fontWeight: '700', textAlign: 'right' }}>
                {player.rating} · {player.position}
              </Text>
              <Muted>
                {player.club} · {player.league}
              </Muted>
            </View>
          </Pressable>
        ))}
      </View>
      {results.total > results.shown.length ? (
        <Muted>{t("ממשיכים להקליד כדי לראות את השאר. כולם נמצאים בחיפוש.", "Keep typing to narrow the results. All players are searchable.")}</Muted>
      ) : null}
      <Field
        label={t("איך סגרתם את האתגר", "How did you complete the challenge?")}
        value={explanation}
        onChangeText={setExplanation}
        multiline
        placeholder={t("למשל: כסף מליגת העל הבלגית, עם בלגים לכימיה", "For example: silver cards from the Belgian league, with Belgian players for chemistry")}
      />
      <Button
        label={t("שליחת הסגל לאישור", "Submit squad for review")}
        onPress={publish}
        disabled={app.busy || !report.ready}
      />
      <Muted>{t("כימיה מודרנית כמו ב-EA FC: שלושה יהלומים לכל שחקן לפי מועדון / מדינה / ליגה בסגל. עמדה לא נכונה = 0. סך הכל עד 33.", "EA FC chemistry: up to three diamonds per player based on club, nation and league links. An incorrect position gives 0. Maximum total: 33.")}</Muted>
    </Screen>
  );
}
