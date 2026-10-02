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
  positionFits,
  slotPosition,
  type FormationId,
} from '@/lib/chemistry';
import { PLAYERS, type FcPlayer } from '@/lib/fcPlayers';
import { playerMedia } from '@/lib/playerMedia';
import { catalogChallenge } from '@/lib/sbcCatalog';
import { useApp } from '@/lib/store';
import { errorMessage } from '@/lib/format';

function blankSquad(formationId: FormationId): Record<string, FcPlayer | null> {
  const placed: Record<string, FcPlayer | null> = {};
  for (const slot of formationById(formationId).lines.flat()) placed[slot.id] = null;
  return placed;
}

export default function SquadBuildScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const router = useRouter();
  const stored = app.sbcChallenges.find((item) => item.id === id);
  const challenge = stored
    ? { ...catalogChallenge(String(id)), ...stored, ...catalogChallenge(String(id)) }
    : catalogChallenge(String(id));
  const [formationId, setFormationId] = useState<FormationId>(challenge?.previewFormation === '442' ? '442' : '433');
  const [placed, setPlaced] = useState<Record<string, FcPlayer | null>>(() =>
    blankSquad(challenge?.previewFormation === '442' ? '442' : '433'),
  );
  const [active, setActive] = useState<string | null>(challenge?.previewFormation === '442' ? 'lst' : 'st');
  const [query, setQuery] = useState('');
  const [explanation, setExplanation] = useState('');
  const formation = formationById(formationId);
  const report = useMemo(
    () => evaluateSquad(formation, placed, challenge?.rules ?? null),
    [challenge?.rules, formation, placed],
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

  if (!challenge || challenge.kind !== 'classic') {
    return (
      <Screen scene="sbc">
        <Title>אין כאן בניית סגל</Title>
        <Muted>המסך הזה מיועד ל-SBC עם כימיה. ל-Streamlined יש מחשבון ניקוד.</Muted>
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
      Alert.alert('הסגל עדיין לא עומד בדרישות', failed.join('\n'));
      return;
    }
    if (!explanation.trim()) {
      Alert.alert('רגע', 'כתבו משפט קצר איך סגרתם את האתגר');
      return;
    }
    const squad: Record<string, string> = {};
    for (const line of formation.lines) {
      for (const slot of line) {
        const player = placed[slot.id];
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
      Alert.alert('פורסם', `הסגל עלה כפתרון ל«${challenge.title}».`);
      router.replace(`/sbc/${challenge.id}`);
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  return (
    <Screen scene="sbc">
      <Stack.Screen options={{ title: 'בניית סגל' }} />
      <Title>{challenge.title}</Title>
      <Muted>מגרש ריק. לחצו על עמדה, חפשו את שם השחקן באנגלית, והניחו את הקלף.</Muted>
      <ChoiceGroup
        label="מערך"
        options={FORMATIONS.map((item) => ({ id: item.id, label: item.label }))}
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
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16, textAlign: 'right' }}>
            כימיה {report.chemistry}/33
          </Text>
          <Text style={{ color: colors.muted, fontWeight: '700', textAlign: 'right' }}>
            מדינות {report.nations}
            {report.rating === null ? '' : ` · דירוג ${report.rating}`}
          </Text>
        </View>
        {report.checks.map((check) => (
          <Text key={check.label} style={{ color: check.ok ? colors.green : colors.muted, textAlign: 'right' }}>
            {check.ok ? '✓' : '✗'} {check.label}
          </Text>
        ))}
      </LinearGradient>

      <SquadPitch
        formation={formation}
        placed={placed}
        playerChem={report.playerChem}
        activeSlot={active}
        onSlot={setActive}
      />
      <Text style={{ color: colors.text, fontWeight: '800', textAlign: 'right' }}>
        {active ? `עמדה נבחרת: ${slotPosition(formation, active)}` : 'לחצו על עמדה במגרש'}
      </Text>
      <Button label="פינוי העמדה" variant="ghost" onPress={clearSlot} />
      <Field label="חיפוש שחקן" value={query} onChangeText={setQuery} placeholder="למשל Haaland" />
      <Muted>
        {query.trim()
          ? `${results.total.toLocaleString('he-IL')} שחקנים נמצאו במאגר`
          : 'הקלפים של העמדה. חיפוש מוצא כל שחקן במאגר, בעברית או באנגלית.'}
      </Muted>
      <View style={{ gap: 8 }}>
        {results.shown.map((player) => (
          <Pressable
            key={player.id}
            accessibilityRole="button"
            accessibilityLabel={player.name}
            onPress={() => choose(player)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 4 }}
          >
            <PortraitCard player={player} width={92} />
            <View style={{ flex: 1, alignItems: 'flex-end', gap: 4 }}>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 17, textAlign: 'right' }}>
                {player.name}
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
        <Muted>ממשיכים להקליד כדי לראות את השאר. כולם נמצאים בחיפוש.</Muted>
      ) : null}
      <Field
        label="איך סגרתם את האתגר"
        value={explanation}
        onChangeText={setExplanation}
        multiline
        placeholder="למשל: כסף מליגת העל הבלגית, עם בלגים לכימיה"
      />
      <Button
        label="שליחת הסגל כפתרון"
        onPress={publish}
        disabled={app.busy || !report.ready}
      />
      <Muted>
        כימיה מודרנית כמו ב-EA FC: שלושה יהלומים לכל שחקן לפי מועדון / מדינה / ליגה בסגל. עמדה לא נכונה = 0. סך הכל עד 33.
      </Muted>
    </Screen>
  );
}
