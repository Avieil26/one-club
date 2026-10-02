import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, Image, PanResponder, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';

import { PortraitCard } from '@/components/PortraitCard';
import { Screen } from '@/components/ui';
import { careerFont } from '@/lib/careerCardTheme';
import type { FcPlayer } from '@/lib/fcPlayers';
import {
  DRAFT_FORMATIONS,
  DRAFT_MANAGERS,
  RESERVE_COUNT,
  SUB_COUNT,
  draftCaptain,
  draftForSlot,
  draftPlayerChem,
  draftSubPack,
  draftTeamRating,
  homeSlot,
  type DraftFormation,
  type DraftManager,
  type DraftSlot,
} from '@/lib/draftRun';

const CREAM = '#F6F1E4';
const GOLD = '#E8C46A';

function Rise({ delay, children }: { delay: number; children: ReactNode }) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    value.setValue(0);
    Animated.timing(value, {
      toValue: 1,
      duration: 1100,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [delay, value]);
  return (
    <Animated.View
      style={{
        opacity: value.interpolate({ inputRange: [0, 0.28, 1], outputRange: [0, 1, 1] }),
        transform: [{ translateX: value.interpolate({ inputRange: [0, 1], outputRange: [88, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

function Pop({ children }: { children: ReactNode }) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(value, {
      toValue: 1,
      duration: 780,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [value]);
  return (
    <Animated.View
      style={{
        opacity: value,
        transform: [{ translateX: value.interpolate({ inputRange: [0, 1], outputRange: [36, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

function squadStars(rating: number) {
  if (rating >= 83) return 5;
  if (rating >= 79) return 4.5;
  if (rating >= 75) return 4;
  if (rating >= 71) return 3.5;
  if (rating >= 69) return 3;
  if (rating >= 67) return 2.5;
  if (rating >= 65) return 2;
  if (rating >= 63) return 1.5;
  if (rating >= 60) return 1;
  if (rating >= 2) return 0.5;
  return 0;
}

function Stars({ value }: { value: number }) {
  return (
    <View style={styles.stars}>
      {[0, 1, 2, 3, 4].map((index) => {
        const amount = Math.max(0, Math.min(1, value - index));
        return (
          <View key={index} style={styles.star}>
            <Text style={styles.starEmpty}>★</Text>
            <View style={[styles.starFill, { width: amount >= 1 ? 16 : amount >= 0.5 ? 8 : 0 }]}>
              <Text style={styles.starOn}>★</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function OfferPanel({ children }: { children: ReactNode }) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    value.setValue(0);
    Animated.timing(value, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [value]);
  return (
    <Animated.View style={{ opacity: value, transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
      <LinearGradient colors={['#07111C', '#12304A', '#0A1828']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.offerPanel}>
        <LinearGradient colors={['rgba(140,220,255,0.45)', 'rgba(140,220,255,0)']} style={styles.offerGlow} />
        <View style={[styles.bracket, styles.bracketTl]} />
        <View style={[styles.bracket, styles.bracketTr]} />
        <View style={[styles.bracket, styles.bracketBl]} />
        <View style={[styles.bracket, styles.bracketBr]} />
        {children}
      </LinearGradient>
    </Animated.View>
  );
}

function DraggableCard({ player, width, onDrop }: { player: FcPlayer; width: number; onDrop: (pageX: number, pageY: number) => void }) {
  const pan = useRef(new Animated.ValueXY()).current;
  const drop = useRef(onDrop);
  drop.current = onDrop;
  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) + Math.abs(gesture.dy) > 6,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (event, gesture) => {
        pan.setValue({ x: 0, y: 0 });
        if (Math.abs(gesture.dx) + Math.abs(gesture.dy) > 10) drop.current(event.nativeEvent.pageX, event.nativeEvent.pageY);
      },
      onPanResponderTerminate: () => pan.setValue({ x: 0, y: 0 }),
    }),
  ).current;
  return (
    <Animated.View {...responder.panHandlers} style={{ transform: pan.getTranslateTransform(), zIndex: 40 }}>
      <PortraitCard player={player} width={width} variant="pitch" />
    </Animated.View>
  );
}

function FormationShape({ formation, height }: { formation: DraftFormation; height: number }) {
  return (
    <View style={[styles.shape, { height }]}>
      {formation.slots.map((slot) => (
        <View key={slot.id} style={[styles.dot, { left: `${slot.x}%`, top: `${slot.y}%` }]}>
          <Text style={styles.dotText}>{slot.position}</Text>
        </View>
      ))}
    </View>
  );
}

export default function DraftScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 768;
  const pitchH = wide ? 920 : 560;
  const cardW = wide ? 150 : Math.max(68, Math.floor((width - 40) / 5) - 8);
  const pitchCard = wide ? 92 : 64;
  const [formation, setFormation] = useState<DraftFormation | null>(null);
  const [placed, setPlaced] = useState<Record<string, FcPlayer>>({});
  const [active, setActive] = useState<string | null>(null);
  const [subs, setSubs] = useState<(FcPlayer | undefined)[]>([]);
  const [reserves, setReserves] = useState<(FcPlayer | undefined)[]>([]);
  const [subSlot, setSubSlot] = useState<number | null>(null);
  const [reserveSlot, setReserveSlot] = useState<number | null>(null);
  const [options, setOptions] = useState<FcPlayer[]>([]);
  const [wave, setWave] = useState(0);
  const [manager, setManager] = useState<DraftManager | null>(null);
  const [phase, setPhase] = useState<'formation' | 'captain' | 'slots' | 'subs' | 'manager' | 'done'>('formation');

  const starters = formation ? formation.slots.map((slot) => placed[slot.id]).filter((player): player is FcPlayer => Boolean(player)) : [];
  const pitchRef = useRef<View>(null);
  function chemistryFor(nextManager: DraftManager | null) {
    if (!formation) return 0;
    const rows = formation.slots.flatMap((slot) => {
      const player = placed[slot.id];
      return player ? [{ player, position: slot.position }] : [];
    });
    const squad = rows.map((row) => row.player);
    return rows.reduce((sum, row) => sum + draftPlayerChem(row.player, squad, nextManager, row.position), 0);
  }
  const chemistry = chemistryFor(manager);
  const rating = starters.length ? draftTeamRating(starters.map((player) => player.rating)) : null;
  const bench = [...subs, ...reserves].filter((player): player is FcPlayer => Boolean(player));
  const used = [...Object.values(placed), ...bench].map((player) => player.id);

  function showOptions(next: FcPlayer[]) {
    setOptions(next);
    setWave((value) => value + 1);
  }

  function begin(next: DraftFormation) {
    setFormation(next);
    setPlaced({});
    setActive(null);
    setSubs([]);
    setReserves([]);
    setSubSlot(null);
    setReserveSlot(null);
    setManager(null);
    setPhase('captain');
    showOptions(draftCaptain(next, []));
  }

  function takeCaptain(player: FcPlayer) {
    if (!formation) return;
    const slot = homeSlot(formation, player, placed);
    if (!slot) return;
    setPlaced({ [slot.id]: player });
    setOptions([]);
    setPhase('slots');
  }

  function openSlot(slot: DraftSlot) {
    if (!formation || placed[slot.id] || phase !== 'slots') return;
    setActive(slot.id);
    setSubSlot(null);
    setReserveSlot(null);
    showOptions(draftForSlot(slot.position, used, Object.keys(placed).length));
  }

  function takeSlot(player: FcPlayer) {
    if (!formation || !active || phase !== 'slots') return;
    const next = { ...placed, [active]: player };
    setPlaced(next);
    setActive(null);
    setOptions([]);
    if (formation.slots.every((slot) => next[slot.id])) setPhase('subs');
  }

  function openSub(index: number) {
    if (phase !== 'subs' || subs[index]) return;
    setSubSlot(index);
    setReserveSlot(null);
    setActive(null);
    showOptions(draftSubPack(used, 8 + bench.length));
  }

  function openReserve(index: number) {
    if (phase !== 'subs' || reserves[index]) return;
    setReserveSlot(index);
    setSubSlot(null);
    setActive(null);
    showOptions(draftSubPack(used, 12 + bench.length));
  }

  function takeBench(player: FcPlayer) {
    if (phase !== 'subs') return;
    if (subSlot !== null) {
      const next = Array.from({ length: SUB_COUNT }, (_, index) => subs[index]);
      next[subSlot] = player;
      setSubs(next);
      setSubSlot(null);
      setOptions([]);
      if (next.filter(Boolean).length >= SUB_COUNT && reserves.filter(Boolean).length >= RESERVE_COUNT) setPhase('manager');
      return;
    }
    if (reserveSlot === null) return;
    const next = Array.from({ length: RESERVE_COUNT }, (_, index) => reserves[index]);
    next[reserveSlot] = player;
    setReserves(next);
    setReserveSlot(null);
    setOptions([]);
    if (subs.filter(Boolean).length >= SUB_COUNT && next.filter(Boolean).length >= RESERVE_COUNT) setPhase('manager');
  }

  function finish(next: DraftManager) {
    setManager(next);
    setPhase('done');
  }

  function dropPlayer(fromId: string, pageX: number, pageY: number) {
    if (!formation) return;
    pitchRef.current?.measureInWindow((x, y, width, height) => {
      if (!width || !height) return;
      const px = ((pageX - x) / width) * 100;
      const py = ((pageY - y) / height) * 100;
      let target: DraftSlot | null = null;
      let best = 16;
      for (const slot of formation.slots) {
        const distance = Math.hypot(slot.x - px, slot.y - py);
        if (distance < best) {
          best = distance;
          target = slot;
        }
      }
      if (!target || target.id === fromId) return;
      const toId = target.id;
      setPlaced((current) => {
        const next = { ...current };
        const moving = next[fromId];
        if (!moving) return current;
        const occupying = next[toId];
        if (occupying) next[fromId] = occupying;
        else delete next[fromId];
        next[toId] = moving;
        return next;
      });
    });
  }

  function again() {
    setFormation(null);
    setPlaced({});
    setActive(null);
    setSubs([]);
    setReserves([]);
    setSubSlot(null);
    setReserveSlot(null);
    setOptions([]);
    setManager(null);
    setPhase('formation');
  }

  const asking = formation?.slots.find((slot) => slot.id === active);
  const title =
    phase === 'formation'
      ? 'בחרו מערך'
      : phase === 'captain'
        ? 'בחרו כוכב'
        : phase === 'manager'
          ? 'בחרו מאמן'
          : phase === 'done'
            ? 'הסגל נסגר'
            : phase === 'subs'
              ? reserveSlot !== null
                ? 'מחוץ לסגל'
                : 'בחרו מחליף'
              : asking
                ? `בחרו ${asking.position}`
                : 'לחצו על עמדה';

  return (
    <Screen scene="draft" maxWidth={wide ? 1180 : 520}>
      <Stack.Screen options={{ headerShown: false }} />
      {phase === 'formation' ? (
        <>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.lead}>המערך נשאר לכל הדרך. אחר כך כוכב, ואז לוחצים על עמדה.</Text>
        </>
      ) : null}

      {phase === 'formation' ? (
        <View style={styles.formations}>
          {DRAFT_FORMATIONS.map((item) => (
            <Pressable key={item.id} accessibilityRole="button" onPress={() => begin(item)} style={[styles.formation, wide && styles.formationWide]}>
              <FormationShape formation={item} height={wide ? 168 : 132} />
              <Text style={styles.formationLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {formation && phase !== 'formation' ? (
        <View ref={pitchRef} style={[styles.pitch, { height: pitchH }]}>
          <LinearGradient colors={['#228A46', '#18753A', '#146432', '#0E5228']} locations={[0, 0.35, 0.7, 1]} style={styles.pitchFill} />
          {Array.from({ length: 8 }, (_, index) => (
            <View
              key={index}
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: (pitchH / 8) * index,
                height: pitchH / 16,
                backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.045)' : 'transparent',
              }}
            />
          ))}
          <View style={styles.lineBox} />
          <View style={styles.lineHalf} />
          <View style={styles.lineCircle} />
          <View style={styles.lineBoxTop} />
          <View style={styles.lineBoxBot} />
          {formation.slots.map((slot) => {
            const player = placed[slot.id];
            const on = active === slot.id;
            const cardH = Math.round(pitchCard * 1.42);
            return (
              <Pressable
                key={slot.id}
                accessibilityRole="button"
                onPress={() => openSlot(slot)}
                style={[
                  styles.token,
                  player ? styles.tokenFilled : styles.tokenEmpty,
                  { left: `${slot.x}%`, top: `${slot.y}%`, width: pitchCard, height: cardH, marginLeft: -pitchCard / 2, marginTop: -cardH / 2 },
                  on && styles.tokenOn,
                ]}
              >
                {player ? (
                  <Pop>
                    <DraggableCard player={player} width={pitchCard} onDrop={(x, y) => dropPlayer(slot.id, x, y)} />
                  </Pop>
                ) : (
                  <Text style={styles.tokenPos}>{slot.position}</Text>
                )}
              </Pressable>
            );
          })}

          {options.length ? (
            <View pointerEvents="box-none" style={styles.offer}>
              <OfferPanel key={wave}>
              <View style={styles.five}>
                {options.map((player, index) => (
                  <Rise key={player.id} delay={180 + (options.length - 1 - index) * 160}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => (phase === 'captain' ? takeCaptain(player) : phase === 'subs' ? takeBench(player) : takeSlot(player))}
                    >
                      <PortraitCard player={player} width={cardW} />
                    </Pressable>
                  </Rise>
                ))}
              </View>
              </OfferPanel>
            </View>
          ) : null}
          <View pointerEvents="none" style={styles.hud}>
            <Text style={styles.hudLabel}>רייטינג</Text>
            <Text style={styles.hudValue}>{rating ?? '—'}</Text>
            <Stars value={rating == null ? 0 : squadStars(rating)} />
            <Text style={styles.hudLabel}>כימיה</Text>
            <Text style={styles.hudChem}>
              {chemistry}
              <Text style={styles.hudOf}>/33</Text>
            </Text>
          </View>
        </View>
      ) : null}

      {formation && phase !== 'formation' ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.benchStrip}>
          <Text style={styles.benchLabel}>מחליפים</Text>
          {Array.from({ length: SUB_COUNT }, (_, index) => {
            const player = subs[index];
            const slotW = wide ? 62 : 52;
            return (
              <Pressable key={`sub-${index}`} accessibilityRole="button" onPress={() => openSub(index)} style={[styles.subSlot, { width: slotW, height: Math.round(slotW * 1.42) }, subSlot === index && styles.tokenOn]}>
                {player ? (
                  <Pop>
                    <PortraitCard player={player} width={slotW - 4} variant="pitch" />
                  </Pop>
                ) : (
                  <Text style={styles.tokenPos}>SUB</Text>
                )}
              </Pressable>
            );
          })}
          <View style={styles.benchDivider} />
          <Text style={styles.benchLabel}>מחוץ לסגל</Text>
          {Array.from({ length: RESERVE_COUNT }, (_, index) => {
            const player = reserves[index];
            const slotW = wide ? 62 : 52;
            return (
              <Pressable key={`out-${index}`} accessibilityRole="button" onPress={() => openReserve(index)} style={[styles.subSlot, { width: slotW, height: Math.round(slotW * 1.42) }, reserveSlot === index && styles.tokenOn]}>
                {player ? (
                  <Pop>
                    <PortraitCard player={player} width={slotW - 4} variant="pitch" />
                  </Pop>
                ) : (
                  <Text style={styles.tokenPos}>—</Text>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {phase === 'manager' ? (
        <View style={styles.managers}>
          {DRAFT_MANAGERS.map((item, index) => (
            <Rise key={item.id} delay={index * 140}>
              <Pressable accessibilityRole="button" onPress={() => finish(item)} style={[styles.managerCard, wide && styles.managerCardWide]}>
                <LinearGradient colors={['#4A3514', '#16110A', '#2A1C0C']} style={styles.managerFill}>
                  <View style={styles.managerShine} />
                  <Image source={{ uri: item.photo }} resizeMode="cover" style={{ width: wide ? 168 : 148, height: wide ? 168 : 136 }} />
                  <Text style={styles.managerName}>{item.name}</Text>
                  <Text style={styles.managerMeta}>{item.league}</Text>
                  <Text style={styles.managerChem}>כימיה {chemistryFor(item)}</Text>
                </LinearGradient>
              </Pressable>
            </Rise>
          ))}
        </View>
      ) : null}

      {phase === 'done' ? (
        <Pressable accessibilityRole="button" onPress={again} style={styles.again}>
          <View style={styles.inset} />
          <Text style={styles.againText}>דראפט חדש</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = {
  top: { flexDirection: 'row' as const, justifyContent: 'space-between' as const },
  pill: {
    fontFamily: careerFont,
    color: '#F3E0A2',
    fontSize: 13,
    fontWeight: '800' as const,
    overflow: 'hidden' as const,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(8,10,14,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(232,196,106,0.45)',
  },
  title: {
    fontFamily: careerFont,
    color: CREAM,
    fontSize: 32,
    fontWeight: '800' as const,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  lead: {
    fontFamily: careerFont,
    color: 'rgba(246,241,228,0.76)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  formations: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 12, justifyContent: 'center' as const },
  formation: {
    width: 168,
    borderRadius: 16,
    padding: 8,
    backgroundColor: 'rgba(16,13,10,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(232,196,106,0.4)',
    gap: 6,
  },
  formationWide: { width: 210 },
  formationLabel: {
    fontFamily: careerFont,
    color: CREAM,
    fontSize: 16,
    fontWeight: '800' as const,
    textAlign: 'center' as const,
  },
  shape: {
    borderRadius: 12,
    backgroundColor: '#18753A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  dot: {
    position: 'absolute' as const,
    minWidth: 28,
    height: 16,
    marginLeft: -14,
    marginTop: -8,
    borderRadius: 4,
    backgroundColor: '#E0B83A',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  dotText: { fontFamily: careerFont, color: '#221608', fontSize: 8, fontWeight: '900' as const },
  pitch: {
    borderRadius: 22,
    backgroundColor: '#146432',
    borderWidth: 1,
    borderColor: 'rgba(255,236,190,0.35)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    direction: 'ltr' as const,
  },
  pitchFill: { position: 'absolute' as const, left: 0, right: 0, top: 0, bottom: 0 },
  lineBox: {
    position: 'absolute' as const,
    left: 16,
    right: 16,
    top: 16,
    bottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
    borderRadius: 12,
  },
  lineHalf: {
    position: 'absolute' as const,
    left: '18%' as const,
    right: '18%' as const,
    top: '50%' as const,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  lineCircle: {
    position: 'absolute' as const,
    left: '50%' as const,
    top: '50%' as const,
    width: 92,
    height: 92,
    marginLeft: -46,
    marginTop: -46,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  lineBoxTop: {
    position: 'absolute' as const,
    left: '50%' as const,
    marginLeft: -70,
    top: 16,
    width: 140,
    height: 64,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  lineBoxBot: {
    position: 'absolute' as const,
    left: '50%' as const,
    marginLeft: -70,
    bottom: 16,
    width: 140,
    height: 64,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  token: {
    position: 'absolute' as const,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  tokenEmpty: {
    backgroundColor: 'rgba(16,12,8,0.62)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,214,140,0.55)',
  },
  tokenFilled: { backgroundColor: 'transparent' },
  tokenOn: { borderColor: '#E8C46A', borderWidth: 2, shadowColor: GOLD, shadowOpacity: 0.7, shadowRadius: 12, elevation: 8 },
  tokenPos: { fontFamily: careerFont, color: '#F6F1E4', fontSize: 11, fontWeight: '800' as const, letterSpacing: 0.4 },
  hud: {
    position: 'absolute' as const,
    top: 18,
    right: 18,
    zIndex: 12,
    alignItems: 'flex-end' as const,
  },
  hudLabel: {
    fontFamily: careerFont,
    color: 'rgba(246,241,228,0.8)',
    fontSize: 12,
    fontWeight: '700' as const,
    writingDirection: 'rtl' as const,
    textShadowColor: 'rgba(0,0,0,0.65)',
    textShadowRadius: 6,
  },
  hudValue: {
    fontFamily: careerFont,
    color: CREAM,
    fontSize: 42,
    fontWeight: '900' as const,
    lineHeight: 46,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowRadius: 8,
  },
  hudChem: { fontFamily: careerFont, color: '#9BE7FF', fontSize: 28, fontWeight: '900' as const, lineHeight: 32 },
  hudOf: { fontFamily: careerFont, color: 'rgba(155,231,255,0.55)', fontSize: 14, fontWeight: '800' as const },
  stars: { flexDirection: 'row' as const, gap: 2, marginBottom: 8 },
  star: { width: 16, height: 16 },
  starEmpty: { color: 'rgba(255,255,255,0.28)', fontSize: 15, lineHeight: 16 },
  starFill: { position: 'absolute' as const, left: 0, top: 0, overflow: 'hidden' as const, height: 16 },
  starOn: { color: '#F5C451', fontSize: 15, lineHeight: 16 },
  offer: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  offerPanel: {
    borderRadius: 8,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(140,220,255,0.35)',
    overflow: 'hidden' as const,
    shadowColor: '#7EE0FF',
    shadowOpacity: 0.35,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  offerGlow: { position: 'absolute' as const, top: 0, left: 0, right: 0, height: 42 },
  bracket: { position: 'absolute' as const, width: 18, height: 18, borderColor: '#9BE7FF' },
  bracketTl: { top: 8, left: 8, borderTopWidth: 2, borderLeftWidth: 2 },
  bracketTr: { top: 8, right: 8, borderTopWidth: 2, borderRightWidth: 2 },
  bracketBl: { bottom: 8, left: 8, borderBottomWidth: 2, borderLeftWidth: 2 },
  bracketBr: { bottom: 8, right: 8, borderBottomWidth: 2, borderRightWidth: 2 },
  five: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 16, justifyContent: 'center' as const, alignItems: 'flex-end' as const, zIndex: 2 },
  benchStrip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(10,12,16,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  benchLabel: {
    fontFamily: careerFont,
    color: CREAM,
    fontSize: 14,
    fontWeight: '800' as const,
    writingDirection: 'rtl' as const,
    marginHorizontal: 4,
  },
  benchDivider: { width: 1, alignSelf: 'stretch' as const, marginHorizontal: 8, backgroundColor: 'rgba(255,255,255,0.12)' },
  subSlot: {
    borderRadius: 10,
    backgroundColor: '#161A22',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  managers: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 12, justifyContent: 'center' as const },
  managerCard: { width: 148, borderRadius: 16, overflow: 'hidden' as const },
  managerCardWide: { width: 168 },
  managerFill: { paddingBottom: 12, borderWidth: 1, borderColor: 'rgba(255,214,120,0.55)', borderRadius: 16, overflow: 'hidden' as const },
  managerShine: { position: 'absolute' as const, top: 0, left: 16, right: 16, height: 1, backgroundColor: 'rgba(255,236,190,0.8)' },
  managerPhoto: { width: '100%' as const, height: 150 },
  managerName: { fontFamily: careerFont, color: CREAM, fontSize: 16, fontWeight: '800' as const, textAlign: 'center' as const, marginTop: 8, writingDirection: 'rtl' as const },
  managerMeta: { fontFamily: careerFont, color: 'rgba(246,241,228,0.7)', fontSize: 12, fontWeight: '700' as const, textAlign: 'center' as const, writingDirection: 'rtl' as const },
  managerChem: { fontFamily: careerFont, color: GOLD, fontSize: 13, fontWeight: '800' as const, textAlign: 'center' as const, marginTop: 4, writingDirection: 'rtl' as const },
  choice: {
    minHeight: 56,
    borderRadius: 12,
    alignItems: 'flex-end' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(20,16,8,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(232,196,106,0.45)',
  },
  choiceText: { fontFamily: careerFont, color: CREAM, fontSize: 16, fontWeight: '800' as const, writingDirection: 'rtl' as const },
  choiceMeta: { fontFamily: careerFont, color: GOLD, fontSize: 12, fontWeight: '700' as const, writingDirection: 'rtl' as const },
  result: {
    flexDirection: 'row' as const,
    borderRadius: 18,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: 'rgba(232,196,106,0.5)',
    backgroundColor: 'rgba(18,14,8,0.88)',
  },
  resultCol: { flex: 1, alignItems: 'center' as const, paddingVertical: 18, gap: 4 },
  resultLabel: { fontFamily: careerFont, color: GOLD, fontSize: 14, fontWeight: '800' as const },
  resultValue: { fontFamily: careerFont, color: CREAM, fontSize: 40, fontWeight: '900' as const },
  again: {
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F4F1E6',
    alignSelf: 'flex-end' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 16,
  },
  inset: { position: 'absolute' as const, top: 0, bottom: 0, right: 0, width: 4, backgroundColor: GOLD },
  againText: { fontFamily: careerFont, color: '#2A0A12', fontSize: 15, fontWeight: '800' as const, writingDirection: 'rtl' as const },
};
