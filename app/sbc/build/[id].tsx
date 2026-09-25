import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { SquadPitch } from '@/components/SquadPitch';
import { Button, Card, ChoiceGroup, colors, Field, Muted, Screen, Title } from '@/components/ui';
import {
  evaluateSquad,
  FORMATIONS,
  formationById,
  positionFits,
  slotPosition,
  type FormationId,
} from '@/lib/chemistry';
import { PLAYERS, type FcPlayer } from '@/lib/fcPlayers';
import { catalogChallenge, placedPreview } from '@/lib/sbcCatalog';
import { useApp } from '@/lib/store';

export default function SquadBuildScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const stored = app.sbcChallenges.find((item) => item.id === id);
  const challenge = stored
    ? { ...catalogChallenge(String(id)), ...stored, ...catalogChallenge(String(id)) }
    : catalogChallenge(String(id));
  const [formationId, setFormationId] = useState<FormationId>(challenge?.previewFormation === '442' ? '442' : '433');
  const [placed, setPlaced] = useState<Record<string, FcPlayer | null>>(() => placedPreview(challenge?.previewSquad));
  const [active, setActive] = useState<string | null>('st');
  const [query, setQuery] = useState('');
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
    const needle = query.trim();
    const wanted = active ? slotPosition(formation, active) : 'ST';
    return PLAYERS.filter((player) => {
      if (used.has(player.id) && placed[active ?? '']?.id !== player.id) return false;
      if (!needle) return true;
      return `${player.name} ${player.nation} ${player.club} ${player.league} ${player.position}`.includes(needle);
    })
      .sort((a, b) => {
        const fit = Number(positionFits(b.position, wanted)) - Number(positionFits(a.position, wanted));
        if (fit !== 0) return fit;
        return b.rating - a.rating;
      })
      .slice(0, 30);
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

  return (
    <Screen scene="sbc">
      <Stack.Screen options={{ title: 'בניית סגל' }} />
      <Title>{challenge.title}</Title>
      <Muted>{challenge.requirements}</Muted>
      <ChoiceGroup
        label="מערך"
        options={FORMATIONS.map((item) => ({ id: item.id, label: item.label }))}
        value={formationId}
        onChange={setFormationId}
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
      <Button label="פינוי העמדה" variant="ghost" onPress={clearSlot} />
      <Field label="חיפוש שחקן" value={query} onChangeText={setQuery} placeholder="שם, מדינה, מועדון או ליגה" />
      <Muted>
        כימיה מודרנית כמו ב-EA FC: שלושה יהלומים לכל שחקן לפי מועדון / מדינה / ליגה בסגל. עמדה לא נכונה = 0. סך הכל עד 33.
      </Muted>
      {results.map((player) => (
        <Card key={player.id} onPress={() => choose(player)}>
          <Text style={{ color: colors.text, fontWeight: '700', textAlign: 'right' }}>
            {player.rating} · {player.name} · {player.position}
          </Text>
          <Muted>
            {player.nation} · {player.club} · {player.league}
          </Muted>
        </Card>
      ))}
    </Screen>
  );
}
