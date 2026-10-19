import { playerDisplayName } from '@/lib/playerDisplayName';
import { useLanguage } from '@/lib/language';
import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { PortraitCard } from '@/components/PortraitCard';
import { SquadPitch } from '@/components/SquadPitch';
import { Button, colors, Muted, Screen, Title } from '@/components/ui';
import { FORMATIONS, isFormationId, type FormationId } from '@/lib/chemistry';
import { PLAYERS, type FcPlayer } from '@/lib/fcPlayers';
import { errorMessage } from '@/lib/format';
import { formationById, normalizeSquad, playerById } from '@/lib/profileSquad';
import { useApp } from '@/lib/store';
import type { ProfileSquad } from '@/lib/types';

const BENCH_MAX = 7;

export default function SquadBuilderScreen() {
  const { t, language } = useLanguage();
  const app = useApp();
  const router = useRouter();
  const params = useLocalSearchParams<{ returnTo?: string }>();
  const saved = app.user?.squad ?? null;
  const [formationId, setFormationId] = useState<FormationId>(
    saved?.formation && isFormationId(saved.formation) ? saved.formation : '433',
  );
  const [slots, setSlots] = useState<Record<string, string>>(saved?.slots ?? {});
  const [bench, setBench] = useState<string[]>(saved?.bench ?? []);
  const [active, setActive] = useState<string | null>(null);
  const [benchHold, setBenchHold] = useState<string | null>(null);
  const [addingBench, setAddingBench] = useState(false);
  const [query, setQuery] = useState('');

  const formation = formationById(formationId);
  const taken = useMemo(() => new Set([...Object.values(slots), ...bench]), [slots, bench]);

  const placed = useMemo(() => {
    const next: Record<string, FcPlayer | null> = {};
    for (const slot of formation.lines.flat()) {
      const id = slots[slot.id];
      next[slot.id] = id ? playerById(id) : null;
    }
    return next;
  }, [formation, slots]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return PLAYERS.filter((player) => {
      if (taken.has(player.id)) return false;
      const hay = `${player.name} ${player.en ?? ''} ${player.club}`.toLowerCase();
      return hay.includes(q);
    }).slice(0, 8);
  }, [query, taken]);

  function switchFormation(nextId: FormationId) {
    const allowed = new Set(formationById(nextId).lines.flat().map((slot) => slot.id));
    const nextSlots: Record<string, string> = {};
    for (const [slotId, playerId] of Object.entries(slots)) {
      if (allowed.has(slotId)) nextSlots[slotId] = playerId;
    }
    setFormationId(nextId);
    setSlots(nextSlots);
    setActive(null);
    setBenchHold(null);
  }

  function moveOnPitch(fromSlot: string, toSlot: string) {
    setSlots((current) => {
      const moving = current[fromSlot];
      if (!moving || fromSlot === toSlot) return current;
      const next = { ...current };
      const occupant = next[toSlot];
      if (occupant) next[fromSlot] = occupant;
      else delete next[fromSlot];
      next[toSlot] = moving;
      return next;
    });
    setActive(null);
    setBenchHold(null);
  }

  function benchToPitch(playerId: string, slotId: string) {
    const occupant = slots[slotId];
    setSlots((current) => ({ ...current, [slotId]: playerId }));
    setBench((current) => {
      const without = current.filter((id) => id !== playerId);
      if (occupant) without.push(occupant);
      return without;
    });
    setActive(null);
    setBenchHold(null);
  }

  function pitchToBench(slotId: string) {
    const playerId = slots[slotId];
    if (!playerId) return;
    if (bench.length >= BENCH_MAX) {
      Alert.alert(t("רגע", "Something went wrong"), t("הספסל מלא", "The bench is full"));
      return;
    }
    setSlots((current) => {
      const next = { ...current };
      delete next[slotId];
      return next;
    });
    setBench((current) => [...current, playerId]);
    setActive(null);
  }

  function pick(player: FcPlayer) {
    if (addingBench) {
      if (bench.length >= BENCH_MAX) {
        Alert.alert(t("רגע", "Something went wrong"), t("אפשר עד 7 מחליפים", "You can add up to 7 substitutes"));
        return;
      }
      setBench((current) => [...current, player.id]);
      setAddingBench(false);
    } else if (active) {
      setSlots((current) => ({ ...current, [active]: player.id }));
      setActive(null);
    }
    setQuery('');
  }

  function clearSlot(slotId: string) {
    setSlots((current) => {
      const next = { ...current };
      delete next[slotId];
      return next;
    });
  }

  async function save() {
    if (!app.user) {
      Alert.alert(t("רגע", "Something went wrong"), t("צריך להתחבר", "Sign in required"));
      return;
    }
    const squad: ProfileSquad = { formation: formationId, slots, bench };
    if (!normalizeSquad(squad)) {
      Alert.alert(t("רגע", "Something went wrong"), t("שימו לפחות שחקן אחד בסגל", "Add at least one player to your squad"));
      return;
    }
    try {
      await app.saveSquad(squad);
      Alert.alert(t("הסגל נשמר", "Squad saved"), t("הקבוצה מופיעה בפרופיל.", "Your squad is displayed on your profile."));
      router.replace(params.returnTo === 'champions' ? '/champions' : '/profile');
    } catch (error) {
      Alert.alert(t("רגע", "Something went wrong"), errorMessage(error));
    }
  }

  return (
    <Screen scene="ultimate">
      <Stack.Screen options={{ title: t("בניית הקבוצה", "Build your squad") }} />
      <Title>{t("בניית הקבוצה", "Build your squad")}</Title>
      <Muted>{t("לחצו על עמדה וחפשו שחקן. שחקן שכבר על המגרש זז בלחיצה עליו ואז על העמדה שרוצים.", "Select a position and search for a player. To move a player, select their card, then the destination position.")}</Muted>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {FORMATIONS.map((item) => {
          const on = item.id === formationId;
          return (
            <Pressable key={item.id} onPress={() => switchFormation(item.id)}>
              <LinearGradient
                colors={on ? ['#F0D78A', '#C4922A'] : ['#16382E', '#0E2420']}
                style={{
                  borderRadius: 14,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: on ? '#F0D78A' : 'rgba(61,220,151,0.25)',
                }}
              >
                <Text style={{ color: on ? '#1A1208' : colors.text, fontWeight: '800' }}>{item.label}</Text>
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>

      <SquadPitch
        formation={formation}
        placed={placed}
        playerChem={{}}
        activeSlot={active}
        onSlot={(slotId) => {
          setAddingBench(false);
          setQuery('');
          if (benchHold) {
            benchToPitch(benchHold, slotId);
            return;
          }
          if (active && active !== slotId && slots[active]) {
            moveOnPitch(active, slotId);
            return;
          }
          setBenchHold(null);
          setActive(slotId);
        }}
      />

      {active ? (
        <View style={{ gap: 8 }}>
          <Muted>
            {slots[active]
              ? t(`נבחר ${playerById(slots[active])?.name ?? 'שחקן'}. לחצו על עמדה אחרת כדי להעביר אותו. אם היא תפוסה, השניים מתחלפים.`, `${playerById(slots[active]) ? playerDisplayName(playerById(slots[active])!, 'en') : 'Player'} selected. Select another position to move the player or swap cards.`)
              : t("נבחרה עמדה ריקה. חפשו שחקן למטה, או לחצו על שחקן שכבר על המגרש.", "Empty position selected. Search below or select a player already on the pitch.")}
          </Muted>
          {slots[active] ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Button label={t("העברה לספסל", "Move to bench")} variant="copper" onPress={() => pitchToBench(active)} />
              <Button label={t("פינוי העמדה", "Clear position")} variant="ghost" onPress={() => clearSlot(active)} />
            </View>
          ) : null}
        </View>
      ) : null}
      {benchHold ? (
        <View style={{ gap: 8 }}>
          <Muted>{t(`נבחר ${playerById(benchHold)?.name ?? 'מחליף'} מהספסל. לחצו על עמדה במגרש כדי להכניס אותו.`, `${playerById(benchHold) ? playerDisplayName(playerById(benchHold)!, 'en') : 'Substitute'} selected from the bench. Select a position on the pitch.`)}</Muted>
          <Button
            label={t("הוצאה מהסגל", "Remove from squad")}
            variant="ghost"
            onPress={() => {
              setBench((current) => current.filter((id) => id !== benchHold));
              setBenchHold(null);
            }}
          />
        </View>
      ) : null}

      <Text style={{ color: colors.text, fontWeight: '800', textAlign: 'right' }}>{t("מחליפים ·", "Substitutes ·")}{bench.length}/{BENCH_MAX}</Text>
      {bench.length ? <Muted>{t("לחיצה על מחליף בוחרת אותו. אחר כך לחצו על עמדה במגרש.", "Select a substitute, then select a position on the pitch.")}</Muted> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {bench.map((id) => {
          const player = playerById(id);
          if (!player) return null;
          const held = benchHold === id;
          return (
            <Pressable
              key={id}
              onPress={() => {
                setAddingBench(false);
                setQuery('');
                if (active && slots[active]) {
                  benchToPitch(id, active);
                  return;
                }
                setActive(null);
                setBenchHold(held ? null : id);
              }}
              style={{
                borderRadius: 12,
                borderWidth: 2,
                borderColor: held ? '#F0D78A' : 'transparent',
              }}
            >
              <PortraitCard player={player} width={72} variant="pitch" />
            </Pressable>
          );
        })}
      </View>
      <Button
        label={addingBench ? t("בחרו מחליף מהחיפוש", "Choose a substitute from search") : t("הוספת מחליף", "Add substitute")}
        variant="copper"
        disabled={bench.length >= BENCH_MAX}
        onPress={() => {
          setActive(null);
          setBenchHold(null);
          setAddingBench(true);
          setQuery('');
        }}
      />

      {active || addingBench ? (
        <View style={{ gap: 8 }}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t("שם שחקן, לפחות שתי אותיות", "Player name, at least two letters")}
            placeholderTextColor="rgba(197,213,200,0.55)"
            textAlign="right"
            autoFocus
            style={{
              color: colors.text,
              backgroundColor: 'rgba(12,22,18,0.9)',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(227,179,65,0.35)',
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 16,
            }}
          />
          {results.map((player) => (
            <Pressable key={player.id} onPress={() => pick(player)}>
              <LinearGradient
                colors={['rgba(32,48,42,0.95)', 'rgba(14,24,20,0.95)']}
                style={{
                  borderRadius: 14,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(120,180,150,0.28)',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Text style={{ color: colors.gold, fontWeight: '900', width: 36, textAlign: 'center' }}>{player.rating}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '800', textAlign: 'right' }}>{playerDisplayName(player, language)}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'right' }}>
                    {player.position} · {player.club}
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>
          ))}
          {query.trim().length >= 2 && !results.length ? <Muted>{t("אין שחקן פנוי בשם הזה.", "No available player matches this name.")}</Muted> : null}
        </View>
      ) : null}

      <Button label={app.busy ? t("שומר...", "Saving…") : t("שמירת הקבוצה", "Save squad")} onPress={save} disabled={app.busy} />
    </Screen>
  );
}
