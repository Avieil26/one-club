import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

import { Screen } from '@/components/ui';
import { SbcRewardPack, type PackVisual } from '@/components/SbcRewardPack';
import { getSupabase } from '@/lib/supabase';
import { pickImages } from '@/lib/images';
import { useApp } from '@/lib/store';
import type { PlatformId, ProfileSquad } from '@/lib/types';
import { PLAYERS, type FcPlayer } from '@/lib/fcPlayers';
import { FORMATIONS, formationById } from '@/lib/chemistry';

type IconName = keyof typeof Ionicons.glyphMap;
type SectionId = 'center' | 'community' | 'rewards' | 'tekkz' | 'tactics' | 'controller';

type TekkzRole = [string, string];

const NAV: { id: SectionId; label: string; icon: IconName }[] = [
  { id: 'tekkz', label: 'TEKKZ Pro', icon: 'star-outline' },
  { id: 'center', label: 'העמוד שלי', icon: 'trophy-outline' },
  { id: 'rewards', label: 'פרסים', icon: 'gift-outline' },
  { id: 'community', label: 'שחקני הקהילה', icon: 'people-outline' },
  { id: 'tactics', label: 'טקטיקות והרכבים', icon: 'git-network-outline' },
  { id: 'controller', label: 'הגדרות שלט', icon: 'game-controller-outline' },
];

const FUT_CHAMPIONS_LOGO_URL = 'https://www.fifplay.com/img/public/fut-champions-logo.png';

const TEKKZ_IMAGE_URL =
  'https://images.ctfassets.net/lz8ubpsr15g3/5Z7Z6NZx6FOizy9NaLmq91/9cbc5311ccc70ad286b5147bf5b2e987/Tekkz_01.png?fm=webp&h=700&q=80&w=900';

const TEKKZ_ROLES: TekkzRole[] = [
  ['GK', 'Defend'],
  ['RB', 'Balanced'],
  ['CB', 'Defend'],
  ['CB', 'Defend'],
  ['LB', 'Balanced'],
  ['RM', 'Inside Forward · Balanced'],
  ['CM', 'Deep-Lying Playmaker · Build-Up'],
  ['CM', 'Deep-Lying Playmaker · Build-Up'],
  ['LM', 'Inside Forward · Balanced'],
  ['CAM', 'Playmaker · Balanced'],
  ['ST', 'Advanced Forward · Attack'],
];

const FC27_FORMATIONS = [
  '4-2-1-3','4-4-1-1','4-3-1-2','4-1-2-1-2 Narrow','4-3-3 Attack','4-2-3-1 Wide','4-4-2','4-3-3 Holding',
  '4-1-2-1-2 Wide','4-2-3-1','4-4-2 Holding','4-1-4-1','4-3-2-1','4-3-3 Defend','4-2-2-2','4-3-3',
  '4-5-1 Flat','4-2-4','4-1-3-2','4-5-1 Attack','5-2-1-2','3-5-2','3-4-2-1','3-4-1-2','5-3-2','5-4-1','5-2-3','3-4-3','3-1-4-2',
] as const;

const BUILD_UP_STYLES = ['Balanced','Short Passing','Counter'] as const;
const DEFENSIVE_APPROACHES = ['Deep','Balanced','High','Aggressive'] as const;

type ControllerSettingKey =
  | 'layout' | 'throughPass' | 'groundPass' | 'shot' | 'defending'
  | 'autoSwitch' | 'autoMove' | 'rightStick' | 'rightStickRef' | 'analogSprint';

const CONTROLLER_SETTINGS: { key: ControllerSettingKey; label: string; options: string[] }[] = [
  { key: 'layout', label: 'Controller Layout', options: ['Classic', 'Alternate'] },
  { key: 'throughPass', label: 'Through Pass Assistance', options: ['Assisted', 'Semi', 'Manual'] },
  { key: 'groundPass', label: 'Ground Pass Assistance', options: ['Assisted', 'Manual'] },
  { key: 'shot', label: 'Shot Assistance', options: ['Assisted', 'Precision', 'Manual'] },
  { key: 'defending', label: 'Defending', options: ['Tactical Defending', 'Advanced Defending'] },
  { key: 'autoSwitch', label: 'Auto Switching', options: ['Air Balls and Loose Balls', 'Automatic', 'None'] },
  { key: 'autoMove', label: 'Auto Switching Move Assistance', options: ['None', 'Low', 'High'] },
  { key: 'rightStick', label: 'Right Stick Switching', options: ['Classic'] },
  { key: 'rightStickRef', label: 'Right Stick Switching Reference', options: ['Player Relative', 'Ball Relative'] },
  { key: 'analogSprint', label: 'Analog Sprint', options: ['On', 'Off'] },
];

const CONTROLLER_ROWS = [
  ['Competitive Preset', 'On'],
  ['Auto Shots', 'Off'],
  ['Shot Assistance', 'Semi'],
  ['Through Pass Assistance', 'Assisted'],
  ['Player Switching', 'Right Stick'],
  ['Analog Sprint', 'Off'],
] as const;


type ChampionsRun = {
  matchesPlayed: number;
  wins: number;
  losses: number;
  cqp: number;
  rank: number | null;
  updatedAt?: string;
};

type CommunityItem = {
  id: string;
  user_id: string;
  kind: 'tactic' | 'tip' | 'guide';
  title: string;
  body: string;
  formation: string | null;
  platform: PlatformId;
  settings: Record<string, any>;
  image_uris: string[];
  featured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

type RewardTier = {
  wins: number;
  rank: string;
  coins: number;
  tokens: number;
  cqp: number;
};

type TokenReward = {
  title: string;
  details: string;
  tokens: number;
  kind?: 'pack' | 'cosmetic' | 'evolution';
  visual?: PackVisual;
  packLabel?: string;
  tradeable?: boolean;
  icon?: IconName;
};

const REWARD_TIERS: RewardTier[] = [
  { wins: 0, rank: 'לא מדורג', coins: 0, tokens: 0, cqp: 0 },
  { wins: 1, rank: 'Contender V', coins: 0, tokens: 15, cqp: 0 },
  { wins: 2, rank: 'Contender IV', coins: 0, tokens: 20, cqp: 50 },
  { wins: 3, rank: 'Contender III', coins: 0, tokens: 30, cqp: 100 },
  { wins: 4, rank: 'Contender II', coins: 0, tokens: 40, cqp: 150 },
  { wins: 5, rank: 'Contender I', coins: 2500, tokens: 50, cqp: 200 },
  { wins: 6, rank: 'Champions V', coins: 5000, tokens: 60, cqp: 300 },
  { wins: 7, rank: 'Champions IV', coins: 10000, tokens: 75, cqp: 350 },
  { wins: 8, rank: 'Champions III', coins: 15000, tokens: 90, cqp: 400 },
  { wins: 9, rank: 'Champions II', coins: 25000, tokens: 110, cqp: 450 },
  { wins: 10, rank: 'Champions I', coins: 35000, tokens: 135, cqp: 500 },
  { wins: 11, rank: 'Elite V', coins: 50000, tokens: 165, cqp: 600 },
  { wins: 12, rank: 'Elite IV', coins: 75000, tokens: 215, cqp: 700 },
  { wins: 13, rank: 'Elite III', coins: 105000, tokens: 275, cqp: 800 },
  { wins: 14, rank: 'Elite II', coins: 145000, tokens: 350, cqp: 900 },
  { wins: 15, rank: 'Elite I', coins: 250000, tokens: 450, cqp: 1000 },
];

const TOKEN_STORE: TokenReward[] = [
  { title: '2x 77+ Gold Players Pack', details: '2 Gold Player Items rated 77+', tokens: 5, visual: 'gold-small', packLabel: '77+', tradeable: true },
  { title: '10x 75+ Gold Players Pack', details: '10 Gold Player Items rated 75+', tokens: 15, visual: 'rare-75', packLabel: '75+', tradeable: false },
  { title: '1 of 5 83+ Gold Player Pick', details: 'Choose 1 of 5 Gold Players rated 83+', tokens: 15, visual: 'pick', packLabel: '83+', tradeable: true },
  { title: '5x 82+ Gold Players Pack', details: '5 Gold Player Items rated 82+', tokens: 25, visual: 'gold', packLabel: '82+', tradeable: true },
  { title: '10x 80+ Gold Players Pack', details: '10 Gold Player Items rated 80+', tokens: 25, visual: 'gold', packLabel: '80+', tradeable: true },
  { title: 'TOTW Player Pack', details: '1 active Team of the Week Player', tokens: 25, visual: 'gold', packLabel: 'TOTW', tradeable: true },
  { title: '20x 81+ Gold Players Pack', details: '20 Gold Player Items rated 81+', tokens: 50, visual: 'gold', packLabel: '81+', tradeable: true },
  { title: '1 of 4 85+ Gold Player Pick', details: 'Choose 1 of 4 Gold Players rated 85+', tokens: 50, visual: 'pick', packLabel: '85+', tradeable: false },
  { title: '1 of 5 FUT Champions TOTW 3 Player Pick', details: 'Choose 1 of 5 FUT Champions TOTW 3', tokens: 50, visual: 'pick', packLabel: 'TOTW 3', tradeable: false },
  { title: '2x 86+ Gold Players Pack', details: '2 Gold Player Items rated 86+', tokens: 75, visual: 'gold-jumbo', packLabel: '86+', tradeable: true },
  { title: '10x 83+ Gold Players Pack', details: '10 Gold Player Items rated 83+', tokens: 75, visual: 'gold', packLabel: '83+', tradeable: true },
  { title: '10x 84+ Gold Players Pack', details: '10 Gold Player Items rated 84+', tokens: 100, visual: 'gold', packLabel: '84+', tradeable: false },
  { title: '1 of 5 82+ FUT Champions TOTW 3 Player Pick', details: 'Choose 1 of 5 FUT Champions TOTW 3 rated 82+', tokens: 100, visual: 'pick', packLabel: '82+ TOTW', tradeable: false },
  { title: 'Frontline Flair', details: 'Evolution · 1 purchase', tokens: 100, tradeable: false },
  { title: '5x 86+ Gold Players Pack', details: '5 Gold Player Items rated 86+', tokens: 125, visual: 'gold-jumbo', packLabel: '86+', tradeable: false },
  { title: '3x 88+ Gold Players Pack', details: '3 Gold Player Items rated 88+', tokens: 200, visual: 'gold-giant', packLabel: '88+', tradeable: true },
  { title: 'Uppercut Jump Punch', details: 'Cosmetic · 1 purchase', tokens: 15, tradeable: false },
  { title: 'FC24 TBD', details: 'Cosmetic reward · 1 purchase', tokens: 25, tradeable: false },
];

function rewardForWins(wins: number) {
  return REWARD_TIERS[Math.max(0, Math.min(15, wins))];
}

function formatCoins(value: number) {
  return new Intl.NumberFormat('en-US').format(Math.max(0, value));
}

function Panel({ children, style }: { children: ReactNode; style?: object }) {
  return (
    <View style={[styles.panel, style]}>
      <LinearGradient
        colors={['rgba(13,14,20,.76)', 'rgba(7,9,14,.84)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {children}
    </View>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  icon,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon: IconName;
}) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionHeadingIcon}>
        <Ionicons name={icon} size={18} color="#F55760" />
      </View>
      <View style={styles.sectionHeadingText}>
        {eyebrow ? <Text style={styles.sectionEyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function MetricCard({
  label,
  value,
  tone = 'gold',
  note,
}: {
  label: string;
  value: string;
  tone?: 'gold' | 'red' | 'green';
  note: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, tone === 'green' && styles.metricGreen, tone === 'red' && styles.metricRed]}>
        {value}
      </Text>
      <Text style={styles.metricNote}>{note}</Text>
      <View style={styles.metricBar}>
        <View
          style={[
            styles.metricBarFill,
            tone === 'red' && styles.metricBarRed,
            tone === 'green' && styles.metricBarGreen,
          ]}
        />
      </View>
    </View>
  );
}

function MiniPitch({ formation, compact = false }: { formation: string; compact?: boolean }) {
  const active = FORMATIONS.find((item) => item.label === formation) ?? formationById('433');
  return (
    <View style={[styles.pitch, compact && styles.pitchCompact]}>
      <View style={styles.pitchMidline} />
      <View style={styles.pitchCircle} />
      <View style={styles.pitchBoxTop} />
      <View style={styles.pitchBoxBottom} />
      <View style={styles.pitchGoalTop} />
      <View style={styles.pitchGoalBottom} />
      {active.lines.flatMap((line, rowIndex) =>
        line.map((slot, index) => {
          const x = line.length === 1 ? 0.5 : 0.12 + (index / Math.max(1, line.length - 1)) * 0.76;
          const y = active.lines.length === 1 ? 0.5 : 0.08 + (rowIndex / Math.max(1, active.lines.length - 1)) * 0.84;
          const size = compact ? 23 : 32;
          return (
            <View key={slot.id} style={{
              position: 'absolute',
              left: String(x * 100) + '%',
              top: String(y * 100) + '%',
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              borderRadius: size / 2,
              backgroundColor: '#E6C75A',
              borderWidth: 2,
              borderColor: '#FFF0A5',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ color: '#231909', fontSize: compact ? 6 : 7, fontWeight: '900' }}>{slot.position}</Text>
            </View>
          );
        }),
      )}
      <View style={styles.pitchBadge}>
        <Text style={styles.pitchBadgeText}>{active.label}</Text>
      </View>
    </View>
  );
}

function FormationPickerModal({
  visible,
  selected,
  onClose,
  onSelect,
}: {
  visible: boolean;
  selected: string;
  onClose: () => void;
  onSelect: (formation: string) => void;
}) {
  const { width } = useWindowDimensions();
  const mobile = width < 720;
  if (!visible) return null;
  return (
    <View style={styles.modalBackdrop}>
        <View style={[styles.formationPicker, mobile && styles.formationPickerMobile]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderCopy}>
              <Text style={styles.modalKicker}>FC27 FORMATIONS</Text>
              <Text style={styles.modalTitle}>בחר מערך</Text>
              <Text style={styles.modalHint}>כל המערכים במקום אחד. בחר מערך והחלון ייסגר.</Text>
            </View>
            <Pressable onPress={onClose} style={styles.modalClose}><Ionicons name="close" size={19} color="#fff" /></Pressable>
          </View>
          <ScrollView style={styles.formationGridScroll} contentContainerStyle={styles.formationGrid}>
            {FORMATIONS.map((item) => (
              <Pressable key={item.id} onPress={() => { onSelect(item.label); onClose(); }}
                style={[styles.formationOption, mobile ? styles.formationOptionMobile : styles.formationOptionDesktop, selected === item.label && styles.formationOptionActive]}>
                <Text style={[styles.formationOptionText, selected === item.label && styles.formationOptionTextActive]}>{item.label}</Text>
                {selected === item.label ? <Ionicons name="checkmark-circle" size={15} color="#fff" /> : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
  );
}


function CommunitySquadBuilder({
  visible,
  formationLabel,
  initial,
  onClose,
  onSave,
}: {
  visible: boolean;
  formationLabel: string;
  initial: ProfileSquad | null;
  onClose: () => void;
  onSave: (squad: ProfileSquad) => void;
}) {
  const base = FORMATIONS.find((item) => item.label === formationLabel) ?? FORMATIONS[0];
  const [formationId, setFormationId] = useState(base.id);
  const [slots, setSlots] = useState<Record<string, string>>(initial?.slots ?? {});
  const [bench, setBench] = useState<string[]>(initial?.bench ?? []);
  const [active, setActive] = useState<string | null>(null);
  const [benchHold, setBenchHold] = useState<string | null>(null);
  const [addingBench, setAddingBench] = useState(false);
  const [query, setQuery] = useState('');
  const [showFormations, setShowFormations] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const next = FORMATIONS.find((item) => item.label === formationLabel) ?? FORMATIONS[0];
    setFormationId(next.id);
    setSlots(initial?.formation === next.id ? (initial.slots ?? {}) : {});
    setBench(initial?.formation === next.id ? (initial.bench ?? []) : []);
    setActive(null);
    setBenchHold(null);
    setAddingBench(false);
    setQuery('');
    setShowFormations(false);
  }, [visible, formationLabel, initial]);

  const formation = formationById(formationId);
  const taken = useMemo(() => new Set([...Object.values(slots), ...bench]), [slots, bench]);
  const placed = useMemo(() => {
    const next: Record<string, FcPlayer | null> = {};
    formation.lines.flat().forEach((slot) => {
      const id = slots[slot.id];
      next[slot.id] = id ? (PLAYERS.find((player) => player.id === id) ?? null) : null;
    });
    return next;
  }, [formation, slots]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return PLAYERS.filter((player) => !taken.has(player.id) && (player.name + ' ' + (player.en ?? '') + ' ' + player.club).toLowerCase().includes(q)).slice(0, 8);
  }, [query, taken]);

  function switchFormation(nextId: typeof base.id) {
    const allowed = new Set(formationById(nextId).lines.flat().map((slot) => slot.id));
    const nextSlots: Record<string, string> = {};
    Object.entries(slots).forEach(([slotId, playerId]) => { if (allowed.has(slotId)) nextSlots[slotId] = playerId; });
    setFormationId(nextId);
    setSlots(nextSlots);
    setActive(null);
    setBenchHold(null);
    setShowFormations(false);
  }

  function pickPlayer(player: FcPlayer) {
    if (addingBench) {
      if (bench.length >= 7) return;
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

  function movePlayer(fromSlot: string, toSlot: string) {
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
  }

  function benchToPitch(playerId: string, slotId: string) {
    const occupant = slots[slotId];
    setSlots((current) => ({ ...current, [slotId]: playerId }));
    setBench((current) => {
      const next = current.filter((id) => id !== playerId);
      if (occupant) next.push(occupant);
      return next;
    });
    setActive(null);
    setBenchHold(null);
  }

  function pitchToBench(slotId: string) {
    const playerId = slots[slotId];
    if (!playerId || bench.length >= 7) return;
    setSlots((current) => {
      const next = { ...current };
      delete next[slotId];
      return next;
    });
    setBench((current) => [...current, playerId]);
    setActive(null);
  }

  if (!visible) return null;

  return (
    <View style={styles.squadOverlay}>
      <View style={styles.squadBuilderPanel}>
        <View style={styles.squadBuilderHeader}>
          <View style={styles.squadBuilderHeaderCopy}>
            <Text style={styles.modalKicker}>COMMUNITY SQUAD BUILDER</Text>
            <Text style={styles.squadBuilderTitle}>בנה את הקבוצה לפוסט</Text>
            <Text style={styles.squadBuilderHint}>הקבוצה הזו שייכת לפוסט בלבד. היא לא נוגעת בקבוצה האישית שלך.</Text>
          </View>
          <Pressable style={styles.modalClose} onPress={onClose}><Ionicons name="close" size={19} color="#fff" /></Pressable>
        </View>

        <ScrollView style={styles.squadBuilderScroll} contentContainerStyle={styles.squadBuilderContent}>
          <Pressable style={styles.builderFormationButton} onPress={() => setShowFormations((value) => !value)}>
            <View style={styles.builderFormationCopy}>
              <Text style={styles.formationSelectLabel}>FORMATION</Text>
              <Text style={styles.builderFormationValue}>{formation.label}</Text>
            </View>
            <Ionicons name={showFormations ? 'chevron-up' : 'chevron-down'} size={18} color="#F3CF63" />
          </Pressable>

          {showFormations ? (
            <View style={styles.builderFormationMenu}>
              <ScrollView style={{ maxHeight: 220 }} contentContainerStyle={styles.builderFormationGrid}>
                {FORMATIONS.map((item) => (
                  <Pressable key={item.id} onPress={() => switchFormation(item.id)} style={[styles.builderFormationItem, item.id === formationId && styles.builderFormationItemActive]}>
                    <Text style={[styles.builderFormationItemText, item.id === formationId && styles.builderFormationItemTextActive]}>{item.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <SquadPitch
            formation={formation}
            placed={placed}
            playerChem={{}}
            activeSlot={active}
            onSlot={(slotId) => {
              setAddingBench(false);
              setQuery('');
              if (benchHold) { benchToPitch(benchHold, slotId); return; }
              if (active && slots[active] && active !== slotId) { movePlayer(active, slotId); return; }
              setBenchHold(null);
              setActive(slotId);
            }}
          />

          {active ? (
            <View style={styles.builderSelectionBox}>
              <Text style={styles.builderSelectionText}>{slots[active] ? 'שחקן נבחר. אפשר להעביר, לפנות או להעביר לספסל.' : 'העמדה נבחרה. חפש שחקן והוסף אותו.'}</Text>
              {slots[active] ? (
                <View style={styles.builderActions}>
                  <Pressable style={styles.builderGhost} onPress={() => pitchToBench(active)}><Text style={styles.builderGhostText}>העבר לספסל</Text></Pressable>
                  <Pressable style={styles.builderGhost} onPress={() => clearSlot(active)}><Text style={styles.builderGhostText}>פנה עמדה</Text></Pressable>
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={styles.builderBenchHeader}>
            <Text style={styles.builderBenchTitle}>מחליפים · {bench.length}/7</Text>
            <Pressable style={styles.builderAddBench} disabled={bench.length >= 7} onPress={() => { setAddingBench(true); setActive(null); setBenchHold(null); setQuery(''); }}>
              <Ionicons name="add" size={15} color="#fff" />
              <Text style={styles.builderAddBenchText}>הוסף מחליף</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.builderBenchRow}>
            {bench.map((id) => {
              const player = PLAYERS.find((item) => item.id === id);
              if (!player) return null;
              const held = benchHold === id;
              return (
                <Pressable key={id} onPress={() => {
                  if (active && slots[active]) { benchToPitch(id, active); return; }
                  setBenchHold(held ? null : id);
                  setActive(null);
                }} style={[styles.builderBenchCard, held && styles.builderBenchCardActive]}>
                  <PortraitCard player={player} width={78} variant="pitch" />
                </Pressable>
              );
            })}
            {!bench.length ? <Text style={styles.builderNoBench}>אין עדיין מחליפים.</Text> : null}
          </ScrollView>

          {(active || addingBench) ? (
            <View style={styles.builderSearchPanel}>
              <Text style={styles.builderSearchLabel}>{addingBench ? 'בחירת מחליף' : 'שחקן לעמדה'}</Text>
              <TextInput value={query} onChangeText={setQuery} autoFocus placeholder="חפש לפי שם שחקן או מועדון" placeholderTextColor="#6D7883" style={styles.builderSearchInput} />
              {results.map((player) => (
                <Pressable key={player.id} onPress={() => pickPlayer(player)} style={styles.builderSearchResult}>
                  <Text style={styles.builderSearchRating}>{player.rating}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.builderSearchName}>{player.name}</Text>
                    <Text style={styles.builderSearchMeta}>{player.position} · {player.club}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Pressable style={styles.builderSave} onPress={() => {
            if (!Object.keys(slots).length) {
              Alert.alert('הקבוצה ריקה', 'הוסף לפחות שחקן אחד לפני השמירה.');
              return;
            }
            onSave({ formation: formationId, slots, bench });
          }}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
            <Text style={styles.builderSaveText}>שמור בתוך הטקטיקה</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

function TekkzCard({ selected }: { selected?: boolean }) {
  return (
    <View style={[styles.tekkzCard, selected && styles.tekkzCardSelected]}>
      <View style={styles.tekkzCardImageWrap}>
        <Image source={{ uri: TEKKZ_IMAGE_URL }} resizeMode="cover" style={styles.tekkzCardImage} />
        <LinearGradient colors={['transparent', 'rgba(4,7,10,.93)']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFillObject} />
        <View style={styles.tekkzCardImageText}>
          <Text style={styles.tekkzCardKicker}>FC27 PRO PLAYER</Text>
          <Text style={styles.tekkzCardName}>TEKKZ</Text>
        </View>
      </View>
      <View style={styles.tekkzCardBody}>
        <View style={styles.tekkzCardTop}>
          <View style={styles.verifyBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#6ADD9C" />
            <Text style={styles.verifyBadgeText}>VERIFIED PRO SOURCE</Text>
          </View>
          <Text style={styles.proBadgeText}>DH TEKKZ · FC27</Text>
        </View>
        <Text style={styles.tekkzCardTitle}>ה־Champions setup של TEKKZ</Text>
        <Text style={styles.tekkzCardSub}>4-4-1-1 (2) · Short Passing · High · Line Height 65</Text>
        <View style={styles.tekkzFactRow}>
          <View style={styles.tekkzFact}><Text style={styles.tekkzFactValue}>4-4-1-1 (2)</Text><Text style={styles.tekkzFactLabel}>FORMATION</Text></View>
          <View style={styles.tekkzFact}><Text style={styles.tekkzFactValue}>Short Passing</Text><Text style={styles.tekkzFactLabel}>BUILD UP</Text></View>
          <View style={styles.tekkzFact}><Text style={styles.tekkzFactValue}>High · 65</Text><Text style={styles.tekkzFactLabel}>DEFENSIVE LINE</Text></View>
        </View>
        <View style={styles.tekkzChallenge}>
          <View style={styles.tekkzChallengeIcon}><Ionicons name="flame" size={18} color="#F3CF62" /></View>
          <View style={styles.tekkzChallengeCopy}>
            <Text style={styles.tekkzChallengeKicker}>LATEST CHALLENGE</Text>
            <Text style={styles.tekkzChallengeTitle}>15-0 · BRONZE SQUAD</Text>
            <Text style={styles.tekkzChallengeText}>הסרטון/אתגר שסיפקת לפרופיל של TEKKZ: 15-0 עם קבוצת ברונזה.</Text>
          </View>
        </View>
        <Text style={styles.sourceNote}>מקור הטקטיקה: FUTSettings · קוד GJgwMwH%QEao</Text>
        <View style={styles.tekkzMiniMeta}>
          <View style={styles.tekkzMiniMetaItem}><Ionicons name="git-network-outline" size={14} color="#818B95" /><Text style={styles.tekkzMiniMetaText}>TACTICS</Text></View>
          <View style={styles.tekkzMiniMetaItem}><Ionicons name="flame-outline" size={14} color="#818B95" /><Text style={styles.tekkzMiniMetaText}>15-0 CHALLENGE</Text></View>
          <View style={styles.tekkzMiniMetaItem}><Ionicons name="person-circle-outline" size={14} color="#818B95" /><Text style={styles.tekkzMiniMetaText}>PRO PROFILE</Text></View>
        </View>
      </View>
    </View>
  );
}


function PlatformPill({
  value,
  selected,
  onPress,
}: {
  value: 'xbox' | 'ps5';
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.platformPill, selected && styles.platformPillActive]}>
      <Image
        source={value === 'xbox' ? require('@/assets/images/logo-xbox.png') : require('@/assets/images/logo-playstation.png')}
        resizeMode="contain"
        style={styles.platformLogo}
      />
      <Text style={[styles.platformPillText, selected && styles.platformPillTextActive]}>
        {value === 'xbox' ? 'Xbox' : 'PlayStation'}
      </Text>
    </Pressable>
  );
}

function TokenIcon({ size = 22 }: { size?: number }) {
  return (
    <Image source={{ uri: 'data:image/webp;base64,UklGRhwOAABXRUJQVlA4WAoAAAAQAAAAXwAAXwAAQUxQSAoCAAABgGNr25oI+6l8F5zjErYAFWSrgQrWQMZtF4xVOCS/kP9/RquIUCRJSgNSqeZsAF+QsqfprNBpNp2yobbZYq3TVbVTK4LQdFZiPT9YXqu6DHxPQrNpRKUfszcvHxudfrzcxGjfdSGdK8SVUGJ3h6NODzsJDeNCIZd2F9XHccXAGlCpMK5Hgato9qirJCg8zqTATfS5VSrJCttPB0FGH1kMMhatPArUyGIQjMoZa1hlNH+VI6vB63xUyaUtYf78bX+0r/u3uR9RtrDIXCyZSm4GzAEVrcSmxZxQ8bJhzldyA6ykxl2FoWSENSxcJqIerCIjrFVQFxfVqv7j5sjQzaNfzVwELT6PFP1cREwSiMIkgKBMaaJCGGZSMvnp+5Gl79O6uMDjnNkDndEDnckjncGDnagFkSe6oCa7fD9cI2Ud9vNy7r9skLJ58Uu6HJtqcmyqybGpmpNT0VmusbJediLpXm+wsrnuilTeuwHLjZdXSDAok2CwIZNg0JNJMDj4/xf+vsHf9/j7Nv/cwZ+bX+Dc599b8Pcu/r2Rf+/F39v57w7+uwn/7uO/W/Hvbn7fAN/34Pdt8H0nft8M3/fj9y3xfVd83xjf9+b37fFzB/zcBD/3wc+t8HM3/NwQP/ekz23xc2f83Jw+96f/W6D/u6D/G+H8ewmvVQ11/15A/3ZKdW+gqlcvCWGpkgJWUDgg7AsAAFApAJ0BKmAAYAA+PRaJQyIhIRqqBvwgA8S2AE6coKmPA/8H/Q/Q7rb9s/Af5K8oqcjuy5Sfox6I/037Av6jf6j+S9azzE/sP6y/+o9WH+q9QD/M/6rrNfQQ8uT9u/hb/b/0qqw7za/D5KreJqU9u+J3fb8jtQL8i/nfmc/MdqSAD8//uH+0/Mz3450KrvQA8Tn6c9BP0l7Bn6wf8zsm+ky7bbwMfGynMHMTlpKv5lEfajoZovdpc3Gnv2uuKWJidxg9WhBFxaxaYrrp/90OK/QeDohOfm257XGUJ26Gwx6C51iyBjOxjv900BG+03eYpuKx4TNNIjHtmLw39RY/pAE7JwqWmhyL/+WH21tYIZB4bsX3KoudLTOhRWjwsansgjJED7IymMa6GBOXfJeh74+qnpsQuTPmiRX086DnbEikO5yhRR6pw0PRotgG5yyX2QKMQAD+/rGm0QJ/BZa5VR5gfzyD6v+b9QSzQH+WI5ybs174oPOfb78MNx/Esy76w+Z6fC7Y9f6Dc5IQWlRhY5ZRaxi3xgez0VAGfzV7DtyrA/rJadG7Oldr+GagHn9AvywYOkex6JU+DOFUEbkGAkbjLRCrLjx2/Y46ueZJEHxrwtkhwOqTm14fGDGPaJdbMtIgJYUv7SHksQK1nBoWbVw+jsAKo3eRhW4ce3Fisk5KElUx0yNprexWoBc3+BLwhB/6otEqR0nJiAU8zUXnID575j7J6USJ47B+d2PXD8e5kvBwG1uA/o9o/PMdErc8t/IkzyVxin7WMZ5ZXiwmYd++vH59dbyLJpVETGAOvkwx4nlUDv9WI5YE3uIT9LMgb4WKZQ/pn7FHvKrlbGcEhIPyRLgyHQI02iWBpOo2rh/uEN3V7Ryx9ZO95xQ7wZFdDS0eWIf5/ejfjevUKjAv70iNtT0X55cZ6b/bK4pWk/caX+yAZNve1Q7tGqe97PW7W4A51RrCY4RtLD201+aJ3Ru1xsj6ZRko9cNX83poL136Sx/bagETyybuOkHwlPLbesmKC8YbU7CKMwgh0t/eQBpolLpLCXVEKhl3G/1TfNSLPWGXcfQ5vn/dLtQHeHBXuL5o773v/YLLAFNneqLwvSbPhWEQcXxCAlXayD8mXBN4ijk0dT7plMH/W9AYWkLKgxLuCJqOsXHnFhwyO05cnv+h47Yjbro6+jkjstMbLSAL335CfW+Hn6e94rZ9AzrEZclKsjxvJUXnJc1si3eS7mH5O3SZOz/XxgIUryr75/KwINRbebb96UxLjkMSqNQfvgMJMUW4hAkdkDuxf+fJY3uIYdGRm0EskxEYu3o0wM/mFsJ0+oFdE5z+7xAFb/MZYLg83fm6IAt6GYqfBk7qh5qeMaLgN2lKJA8cj9B5HZaW3ElWDsSykp1S2h+rjEC4tJJ8nUX4Z6lNkTFtrufcg1GUMquxhvjw/E1ObINnR8NXrqKsKhSnKci2M0qtXUnEg5Fk6tAsyTQHYa5rNKsEL9F+1C+NsZ1Z4wEgrKVbCW7kv0yIakWePZ3Ougmgx3vkpvM0nA46pQfi11aAEwh3NUpqOSpNYz7wM5+9CqiOiYDp46fH0c1Gxs/MtcX68u20lXjy33VmFKryfa+Intkm+uYu+lPBvAsL5/o8oamOnx4L/uHuKch9dKBZi0ie37qnZZ8AxHlMdN++x+tb1kNOIrpyCX7jP7O33H1vY361Q1s8zHD77KeNEWKH28deYYd0sG1UN9YlMejtVbQ6Mw47My99exUmBJfYqYY9M74D5X6YtKOuD/+lmARn37WXxrmaI+jwEL+4mLNLIVIFm7x90ZlYi4zCz/UIOGFrfRcR3nI/3/+QixnL9/ciV37zUD3fNbclzjTb4t0jtSnEPWL1lZlgykjyyOVr/4/i/BGokJcb8Or+Jx0ntx6MxT2ctAiln+6uYFb92nxKY2wIThBC7h6VbCvYst3CqeygjSNJ6xV880lFHi/vLdpOXQnPpsOZNUhHbk2Z8pjmVeJO4ce/ei/r4f0RPbs9ESbZ8g2+dy35wZq+3u8aN0KEiFWx2sXLeB4Nq+/+/t3ixQ/7xjm4F7SnY1+NZ1w0+8XGKRJuRFKKy+KFTKLq8ZYzP688TKTVc+TEnTJ14puzJ3uPgvJFKz9RnlQ0Wj8BKXcAHeTQbtTvi//CPXu0aA9NvNJBlEMbmBPtlxpF0Y7n/H7n1N4HS8mrQ2bTeH1xoKCfxgt79oQNutO+7ro2wf4CntRn4Cu3PUqrTSsxglSOjVmGsyPIC5itNbxAiNeJc6uo1U5X/FCDhc0QBHwXg46XVQxP+8qrMc/6bpykohLhSZaQYDLcOWKVogTHwhEtO44Cef/h3difmQW7StxVx+90pD+5JMONzu9JEfS+jVzgFFhd4+6NGGPJR2Rhfoh18qFVbQ/vsdzp/qLs/uKYeBHC5zMvY5QmIPCOrRWeuX52zXJSLlymmKVfW7rrhKKvXMQf4oA347k7DMHufXUiOo8uNPtiGz5epG07W2dtD+1tZWNDmKYsw6QI3hCYw1nCsSDf6ucxgvgMHXl5wHlOHymojSkKpPzdxBnStS7IaxO5pyk7i19tb5tr9jKclM/TxOfYoIixVzhODLBfBirqyluMN1MjR9O+Jtxgx9gbw6QqMykRHIDjY5ETWqWzsf/dfiZChmGeud9cAhreqnEYp1+XsVT7mg5yi00v+7E9z++uKdk+JMk8MX/yzY1a0wYfb7o1eF9oNhh2HCnXjgdIdIHrGmzZ+BxtmYqYBLzT3/v9RsAr7UPllkcSPqBZHkmLIxBpjMg/z047YDIDKAwZqM3xZjCo/v/nw2w5aq7GVxEVVpW8f2bq6y038zmLeDBhm+Y9LaHj6lHVtr07I5aFFZregBmxjl7RQwaIzqgEM4jKhEnG+ZGO++sBNBHMMQ+EOhpBqh1BKlvVS7JUHJh8EOluDkrDp43HDb8Vec95jzYYqJTKARXSLiNAYypGEro8eZu+zsrubbyGXUFluOQSkVobwnNn49X22OevvWt6P/xF0RkkD0ky1wGmDHb5Dy/9HwTuqU//SGfieaXkU/KBdXk/YtFclyogbqJbhj3ybQ7f49erUsr49W8xQLdRcgbLpLVnex9pmfs0DGDvtwk2bZqrNN8f8MadGWrwZkLRSCQOjb6vb32NMIUMlWJBK7dMbpGy5cI1VbakjsDSZw+NeHtsdJTmfjLRDjCdNfmYMH9k5WaXehi7KJdCkc4co3Ix9OIZViJT84XF4hM8wsBfdblW9YoBw1x2NLntaS/ot9hzu/mrIgk2LethWpRWM8mA3rRECfdxD31ePWtNaGieEIDXkCy5y86grJTbNichtMW3CSiqwJ8hH8WyMf/D3u9InB1dLr44j149UursN9A0TjbG9kzK2A9Nf9ZC0l9iFlHJ3ZBiFhy6o15yY5NmqbGtXsH3RW0sVcRdFahF/7/57uCN8eMLwkLqeQoJn3KX1hI9btr9QKJk5P+mM3u505E5z0lcvWm8B2uCKBg0YzNUKGHChRbhycv7fGHzcX7eMwB3r1NafPofqsYxPfuwjd3jn0p073E83DQZvU3hGecoVont+MXmJWKtvNyk4z4YSbRZDHTg18gQqWuRKLcSZN7wZD9CZrxdekc9GkvDPtVCoPqU7XmTnaAvyj5d/ZoV4lrjvsH/CueWRMhSzpHAgp8gRqT8VPPjrN9/NP3YhcDqrs+8NrO+RtH2aOXF8EoGuKRWXw0vIaH7n6L+AmuPBoXUAitEbXNVLI+Ii2E7RXt1T2/Ru/q3khO+1veWzglEV1iUiijs5pMimExSxiYGHnGXeZAc1AZFXCE0MlikeGfQncYYh0L34bOKFzX8uvbDi8bUtAoBd4Xy8kITN1wKs9dIXYWKE7FA0fz/msV++thIGS+Uuf7JrEpE9mBamVFJ5hXKHupqz9RZwQ6Zi0DCAIusXEjrNmeqmu5tIYYGrGyVQAFyQGqDi0ZrICaT4SAeml23AegOPcg6pmjW82zMlDHkywU9RUrrJxOy6pqPLBAAdtKyaBBNTSS/AcRAsnVvEugO3ZjFlzcaeTqONBguAAEaI3Lx4AA=' }} resizeMode="contain" style={{ width: size, height: size }} />
  );
}

function RewardStoreCard({ item }: { item: TokenReward }) {
  const isPack = item.visual != null;
  const kind = isPack ? 'pack' : item.kind ?? (item.title === 'Frontline Flair' ? 'evolution' : 'cosmetic');
  return (
    <View style={styles.storeCard}>
      <View style={styles.storeVisual}>
        {isPack ? (
          <SbcRewardPack visual={item.visual!} size={106} label={item.packLabel} />
        ) : (
          <View style={styles.utilityRewardVisual}>
            <View style={styles.utilityRewardCircle}>
              <Ionicons name={item.kind === 'evolution' ? 'sparkles-outline' : (item.icon || 'gift-outline')} size={32} color="#F4CF64" />
            </View>
            <Text style={styles.utilityRewardKind}>{item.kind === 'evolution' ? 'EVOLUTION' : 'COSMETIC'}</Text>
          </View>
        )}
      </View>
      <View style={styles.storeBody}>
        <View style={styles.storeTypePill}><Text style={styles.storeTypeText}>{kind === 'pack' ? 'PACK' : kind === 'evolution' ? 'EVOLUTION' : 'COSMETIC'}</Text></View>
        <Text style={styles.storeCardTitle}>{item.title}</Text>
        <Text style={styles.storeDetails}>{item.details}</Text>
        {kind === 'pack' ? <Text style={styles.storeTradeable}>{item.tradeable ? 'TRADEABLE' : 'UNTRADEABLE'}</Text> : null}
      </View>
      <View style={styles.storeCostBox}><TokenIcon size={29} /><Text style={styles.storeCost}>{item.tokens}</Text></View>
    </View>
  );
}

function EmptyCommunity() {
  return (
    <Panel style={styles.emptyPanel}>
      <View style={styles.emptyIcon}>
        <Ionicons name="people-outline" size={25} color="#68737D" />
      </View>
      <Text style={styles.emptyTitle}>שחקני הקהילה</Text>
      <Text style={styles.emptyText}>כרגע אין שחקני קהילה או טקטיקות שהועלו ואושרו.</Text>
      <Text style={styles.emptyHint}>כששחקן יעלה תוכן ויאושר, הוא יופיע כאן.</Text>
    </Panel>
  );
}


export default function ChampionsScreen() {
  const app = useApp();
  const { width } = useWindowDimensions();
  const mobile = width < 900;

  const [section, setSection] = useState<SectionId>('tekkz');
  const [platform, setPlatform] = useState<'xbox' | 'ps5'>('xbox');

  // Personal run data belongs only to the signed-in account.
  const [run, setRun] = useState<ChampionsRun>({ matchesPlayed: 0, wins: 0, losses: 0, cqp: 0, rank: null });
  const [selectedWins, setSelectedWins] = useState(0);
  const [editingRun, setEditingRun] = useState(false);
  const [draftWins, setDraftWins] = useState('0');
  const [draftLosses, setDraftLosses] = useState('0');
  const [draftMatches, setDraftMatches] = useState('0');
  const [draftCqp, setDraftCqp] = useState('0');

  const [community, setCommunity] = useState<CommunityItem[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [formation, setFormation] = useState('4-4-1-1 (2)');
  const [composerFormation, setComposerFormation] = useState('');
  const [saving, setSaving] = useState(false);
  const [composerImages, setComposerImages] = useState<string[]>([]);
  const [communitySquad, setCommunitySquad] = useState<ProfileSquad | null>(null);
  const [squadBuilderOpen, setSquadBuilderOpen] = useState(false);
  const [composerFormationPickerOpen, setComposerFormationPickerOpen] = useState(false);
  const [controllerSettings, setControllerSettings] = useState<Partial<Record<ControllerSettingKey, string>>>({});
  const [myContent, setMyContent] = useState<CommunityItem[]>([]);
  const [buildUp, setBuildUp] = useState<(typeof BUILD_UP_STYLES)[number]>('Balanced');
  const [defensive, setDefensive] = useState<(typeof DEFENSIVE_APPROACHES)[number]>('Balanced');
  const [lineHeight, setLineHeight] = useState('60');
  const [formationPickerOpen, setFormationPickerOpen] = useState(false);

  const canView = true;

  async function loadLiveData() {
    if (!app.user?.id) return;
    const supabase = getSupabase();

    const [runResult, communityResult, myContentResult, profileResult] = await Promise.all([
      supabase.from('champions_runs').select('matches_played,wins,losses,cqp,rank,updated_at').eq('user_id', app.user.id).maybeSingle(),
      supabase.from('champions_content').select('id,user_id,kind,title,body,formation,platform,settings,image_uris,featured,status,created_at').eq('status', 'approved').order('created_at', { ascending: false }).limit(30),
      supabase.from('champions_content').select('id,user_id,kind,title,body,formation,platform,settings,image_uris,featured,status,created_at').eq('user_id', app.user.id).order('created_at', { ascending: false }).limit(30),
      supabase.from('champions_profiles').select('controller_platform,controller_settings').eq('user_id', app.user.id).maybeSingle(),
    ]);

    if (!runResult.error && runResult.data) {
      const next: ChampionsRun = {
        matchesPlayed: Number(runResult.data.matches_played),
        wins: Number(runResult.data.wins),
        losses: Number(runResult.data.losses),
        cqp: Number(runResult.data.cqp),
        rank: runResult.data.rank == null ? null : Number(runResult.data.rank),
        updatedAt: runResult.data.updated_at,
      };
      setRun(next);
      setSelectedWins(next.wins);
      setDraftWins(String(next.wins));
      setDraftLosses(String(next.losses));
      setDraftMatches(String(next.matchesPlayed));
      setDraftCqp(String(next.cqp));
    } else {
      const empty = { matchesPlayed: 0, wins: 0, losses: 0, cqp: 0, rank: null };
      setRun(empty);
      setSelectedWins(0);
      setDraftWins('0');
      setDraftLosses('0');
      setDraftMatches('0');
      setDraftCqp('0');
    }

    if (!communityResult.error) {
      setCommunity((communityResult.data ?? []) as CommunityItem[]);
    if (!myContentResult.error) setMyContent((myContentResult.data ?? []) as CommunityItem[]);
    if (!profileResult.error && profileResult.data) {
      const profile = profileResult.data as any;
      setControllerSettings((profile.controller_settings ?? {}) as Partial<Record<ControllerSettingKey, string>>);
      if (profile.controller_platform === 'xbox' || profile.controller_platform === 'ps5') setPlatform(profile.controller_platform);
    }
    }
  }

  useEffect(() => {
    if (canView) void loadLiveData();
  }, [app.user?.id, canView]);

  async function saveRun() {
    if (!app.user?.id) return;

    const wins = Math.max(0, Math.min(15, Number(draftWins) || 0));
    const losses = Math.max(0, Math.min(15, Number(draftLosses) || 0));
    const requestedMatches = Math.max(0, Math.min(15, Number(draftMatches) || 0));
    const matchesPlayed = Math.max(wins + losses, requestedMatches);
    const cqp = Math.max(0, Number(draftCqp) || 0);

    if (matchesPlayed > 15 || wins + losses > 15) {
      Alert.alert('נתונים לא תקינים', 'WINS + LOSSES חייבים להיות עד 15.');
      return;
    }

    setSaving(true);
    const savedAt = new Date().toISOString();

    const { error } = await getSupabase().from('champions_runs').upsert({
      user_id: app.user.id,
      matches_played: matchesPlayed,
      wins,
      losses,
      cqp,
      rank: run.rank,
      updated_at: savedAt,
    });

    setSaving(false);

    if (error) {
      Alert.alert('השמירה נכשלה', 'לא הצלחנו לשמור את נתוני ה־Champions שלך.');
      return;
    }

    setRun({ matchesPlayed, wins, losses, cqp, rank: run.rank, updatedAt: savedAt });
    setEditingRun(false);
  }

  async function pickComposerImages() {
    try { setComposerImages(await pickImages(3)); } catch (error) { Alert.alert('העלאת תמונה', error instanceof Error ? error.message : 'לא הצלחנו לבחור תמונה.'); }
  }

  function openSquadBuilder() {
    if (!composerFormation) {
      Alert.alert('בחר מערך קודם', 'בחר קודם את המערך של הטקטיקה.');
      return;
    }
    setSquadBuilderOpen(true);
  }

  function saveCommunitySquad(next: ProfileSquad) {
    setCommunitySquad(next);
    setSquadBuilderOpen(false);
  }

  async function saveControllerSettings() {
    if (!app.user?.id) {
      Alert.alert('צריך להתחבר', 'התחבר כדי לשמור ולשתף את ההגדרות.');
      return;
    }
    const filled = CONTROLLER_SETTINGS.filter((item) => controllerSettings[item.key]?.trim()).length;
    if (filled < 6) {
      Alert.alert('חסרות הגדרות', 'בחר לפחות 6 מתוך 10 ההגדרות. כרגע נבחרו ' + filled + '.');
      return;
    }
    setSaving(true);
    try {
      const supabase = getSupabase();
      const now = new Date().toISOString();
      const { error: profileError } = await supabase.from('champions_profiles').upsert({
        user_id: app.user.id,
        custom_image_uri: null,
        use_avatar: true,
        squad_image_uris: [],
        controller_image_uris: [],
        controller_platform: platform,
        controller_settings: controllerSettings,
        formation,
        build_up_style: buildUp,
        defensive_approach: defensive,
        line_height: Math.max(0, Math.min(100, Number(lineHeight) || 60)),
        roles: {},
        about: '',
        updated_at: now,
      });
      if (profileError) throw profileError;

      const summary = CONTROLLER_SETTINGS.filter((item) => controllerSettings[item.key])
        .map((item) => item.label + ': ' + controllerSettings[item.key]).join(' · ');
      const { error: postError } = await supabase.from('champions_content').insert({
        user_id: app.user.id,
        kind: 'guide',
        title: 'הגדרות שלט · ' + (platform === 'xbox' ? 'Xbox' : 'PlayStation 5'),
        body: summary,
        formation: null,
        platform,
        settings: { category: 'controller', controllerPlatform: platform, controllerSettings },
        image_uris: [],
        status: 'pending',
        featured: false,
      });
      if (postError) throw postError;
      await loadLiveData();
      Alert.alert('נשמר', 'ההגדרות נשמרו בעמוד שלך ונשלחו לבדיקה לפני פרסום בקהילה.');
    } catch (error) {
      Alert.alert('השמירה נכשלה', error instanceof Error ? error.message : 'נסה שוב.');
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    if (!app.user?.id) {
      Alert.alert('צריך להתחבר', 'כדי להעלות תוכן צריך להתחבר.');
      return;
    }

    if (!composerFormation || title.trim().length < 2 || body.trim().length < 2) {
      Alert.alert('חסר תוכן', composerFormation ? 'מלא כותרת והסבר קצר.' : 'בחר מערך לפני שליחת הטקטיקה.');
      return;
    }

    setSaving(true);
    const { error } = await getSupabase().from('champions_content').insert({
      user_id: app.user.id,
      kind: 'tactic',
      title: title.trim(),
      body: body.trim(),
      formation: composerFormation.trim() || null,
      platform,
      settings: {
        buildUp,
        defensive,
        lineHeight,
        squad: communitySquad ?? null,
      },
      image_uris: composerImages,
      status: 'pending',
      featured: false,
    });
    setSaving(false);

    if (error) {
      Alert.alert('העלאה נכשלה', 'נסה שוב.');
      return;
    }

    setTitle('');
    setBody('');
    setComposerFormation('');
    setComposerImages([]);
    setCommunitySquad(null);
    setSquadBuilderOpen(false);
    setShowComposer(false);
    await loadLiveData();
    Alert.alert('נשלח לבדיקה', 'הטקטיקה תופיע בקהילת Champions רק לאחר אישור.');
  }

  const selectedReward = rewardForWins(selectedWins);
  const personalReward = rewardForWins(run.wins);
  const form = run.wins - run.losses;
  const availableRewards = useMemo(
    () => TOKEN_STORE.filter((item) => item.tokens <= selectedReward.tokens),
    [selectedReward.tokens],
  );

  const content = useMemo(() => {
    if (section === 'tekkz') {
      return (
        <View style={styles.contentStack}>
          <SectionHeading icon="star-outline" eyebrow="TEKKZ PRO" title="הפרופיל של TEKKZ"
            subtitle="כאן נמצאים רק הנתונים של TEKKZ. המאזן, ה־CQP וה־Progress שלך נמצאים ב״העמוד שלי״." />
          <TekkzCard selected />
          <Panel style={styles.tekkzDetailsPanel}>
            <View style={[styles.tekkzDetailsGrid, mobile && styles.columnOnMobile]}>
              <View style={styles.tekkzDetailsCopy}>
                <Text style={styles.tekkzDetailsKicker}>TACTICAL DNA</Text>
                <Text style={styles.tekkzDetailsTitle}>4-4-1-1 (2)</Text>
                <Text style={styles.tekkzDetailsSub}>Short Passing · High · Line Height 65</Text>
                <Text style={styles.sourceNote}>FUTSettings · GJgwMwH%QEao</Text>
              </View>
              <View style={styles.tekkzDetailsPills}>
                <View style={styles.detailPill}><Text style={styles.detailPillValue}>Short Passing</Text><Text style={styles.detailPillLabel}>BUILD UP</Text></View>
                <View style={styles.detailPill}><Text style={styles.detailPillValue}>High</Text><Text style={styles.detailPillLabel}>DEFENSIVE APPROACH</Text></View>
                <View style={styles.detailPill}><Text style={styles.detailPillValue}>65</Text><Text style={styles.detailPillLabel}>LINE HEIGHT</Text></View>
              </View>
            </View>
          </Panel>
        </View>
      );
    }

    if (section === 'rewards') {
      return (
        <View style={styles.contentStack}>
          <SectionHeading icon="gift-outline" eyebrow="CHAMPIONS REWARDS" title="הפרסים לפי מספר הניצחונות"
            subtitle="בחר מספר ניצחונות. הבחירה היא תצוגה בלבד ולא משנה את ה־run האישי. יוצגו Coins, CQP, Tokens וההצעות שאתה יכול לקנות." />
          <View style={styles.rewardLogoStrip}>
            <View style={styles.rewardLogoText}>
              <Text style={styles.rewardLogoEyebrow}>EA SPORTS FC 27</Text>
              <Text style={styles.rewardLogoTitle}>FUT CHAMPIONS</Text>
              <Text style={styles.rewardLogoSub}>CHAMPIONS TOKENS</Text>
            </View>
            <View style={styles.rewardLogoFrame}>
              <Image source={{ uri: FUT_CHAMPIONS_LOGO_URL }} resizeMode="contain" style={styles.rewardLogoImage} />
            </View>
          </View>
          <Panel style={styles.rewardSelectorPanel}>
            <View style={[styles.rewardSelectorTop, mobile && styles.columnOnMobile]}>
              <View>
                <Text style={styles.rewardSelectorKicker}>SELECT RESULT</Text>
                <Text style={styles.rewardSelectorTitle}>{selectedWins} WINS · {selectedReward.rank}</Text>
              </View>
              <View style={styles.rewardTokensPill}>
                <TokenIcon size={28} />
                <Text style={styles.rewardTokensValue}>{selectedReward.tokens}</Text>
                <Text style={styles.rewardTokensLabel}>CHAMPIONS TOKENS</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.winSelector}>
              {Array.from({ length: 16 }, (_, wins) => (
                <Pressable key={wins} onPress={() => setSelectedWins(wins)} style={[styles.winChip, selectedWins === wins && styles.winChipActive]}>
                  <Text style={[styles.winChipValue, selectedWins === wins && styles.winChipValueActive]}>{wins}</Text>
                  <Text style={[styles.winChipLabel, selectedWins === wins && styles.winChipLabelActive]}>WINS</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={[styles.rewardInfoGrid, mobile && styles.columnOnMobile]}>
              <MetricCard label="REWARD RANK" value={selectedReward.rank} tone="gold" note={selectedWins + ' wins'} />
              <MetricCard label="COINS" value={formatCoins(selectedReward.coins)} tone="gold" note="Direct FUT Coins" />
              <MetricCard label="CHAMPIONS TOKENS" value={String(selectedReward.tokens)} tone="red" note="Spend in Token Store" />
              <MetricCard label="CQP EARNED" value={String(selectedReward.cqp)} tone="green" note="From this Finals run" />
            </View>
          </Panel>
          <Panel>
            <View style={[styles.storeHeader, mobile && styles.columnOnMobile]}>
              <View style={styles.storeHeaderCopy}>
                <Text style={[styles.storeKicker, { color: '#FF4E5C' }]}>CHAMPIONS TOKENS</Text>
                <Text style={styles.storeKicker}>CHAMPIONS TOKEN STORE</Text>
                <Text style={styles.storeTitleBig}>מה אפשר לקנות עם {selectedReward.tokens} Tokens</Text>
                <Text style={styles.storeSub}>3 כרטיסים בשורה במחשב, עם Pack Art אמיתי. מוצגים רק פריטים עד כמות ה־Tokens שבחרת.</Text>
              </View>
              <View style={styles.bigTokenBalance}>
                <TokenIcon size={46} />
                <Text style={styles.bigTokenValue}>{selectedReward.tokens}</Text>
                <Text style={styles.bigTokenLabel}>AVAILABLE</Text>
              </View>
            </View>
            {availableRewards.length ? (
              <View style={[styles.storeGrid, mobile && styles.storeGridMobile]}>
                {availableRewards.map((item) => <RewardStoreCard key={item.title + String(item.tokens)} item={item} />)}
              </View>
            ) : (
              <View style={styles.storeEmptyBox}>
                <TokenIcon size={36} />
                <Text style={styles.storeEmpty}>אין מספיק Champions Tokens להצעה הראשונה בחנות.</Text>
              </View>
            )}
          </Panel>
        </View>
      );
    }

    if (section === 'controller') {
      const filled = CONTROLLER_SETTINGS.filter((item) => controllerSettings[item.key]).length;
      return (
        <View style={styles.contentStack}>
          <SectionHeading icon="game-controller-outline" eyebrow="CONTROLLER SHARE" title="הגדרות שלט"
            subtitle="בחר Sony PlayStation 5 או Xbox ומלא לפחות 6 מתוך 10 הגדרות. אין כאן העלאת תמונה." />
          <Panel>
            <View style={styles.platformRow}>
              <PlatformPill value="ps5" selected={platform === 'ps5'} onPress={() => setPlatform('ps5')} />
              <PlatformPill value="xbox" selected={platform === 'xbox'} onPress={() => setPlatform('xbox')} />
            </View>
            <View style={styles.controllerShareHeader}>
              <View style={styles.controllerShareCopy}>
                <Text style={styles.controllerShareTitle}>{platform === 'xbox' ? 'Xbox Controller' : 'PlayStation 5 Controller'}</Text>
                <Text style={styles.controllerShareSub}>בחר ערכים מתוך הגדרות FC27. ההגדרות נשמרות בעמוד ה־Champions ומשותפות לקהילה רק אחרי אישור.</Text>
              </View>
              <Image source={platform === 'xbox' ? require('@/assets/images/platform-xbox.png') : require('@/assets/images/platform-ps5.png')} resizeMode="contain" style={styles.controllerShareImage} />
            </View>
            <View style={styles.controllerProgress}>
              <Text style={styles.controllerProgressValue}>{filled}/10</Text>
              <Text style={styles.controllerProgressText}>מולאו · מינימום 6</Text>
            </View>
            <View style={styles.controllerSettingsGrid}>
              {CONTROLLER_SETTINGS.map((item) => (
                <View key={item.key} style={styles.controllerField}>
                  <Text style={styles.controllerFieldLabel}>{item.label}</Text>
                  <View style={styles.controllerOptions}>
                    {item.options.map((value) => {
                      const active = controllerSettings[item.key] === value;
                      return (
                        <Pressable key={value} onPress={() => setControllerSettings((current) => ({ ...current, [item.key]: value }))} style={[styles.controllerOption, active && styles.controllerOptionActive]}>
                          <Text style={[styles.controllerOptionText, active && styles.controllerOptionTextActive]}>{value}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
            <Pressable disabled={filled < 6 || saving} style={[styles.controllerShareButton, filled < 6 && styles.controllerShareButtonDisabled]} onPress={() => void saveControllerSettings()}>
              <Ionicons name="share-social-outline" size={18} color="#fff" />
              <Text style={styles.controllerShareButtonText}>{filled < 6 ? 'בחר לפחות ' + (6 - filled) + ' הגדרות נוספות' : (saving ? 'שומר…' : 'שמור ושתף את הגדרות השלט')}</Text>
            </Pressable>
          </Panel>
        </View>
      );
    }

    if (section === 'community') {
      return (
        <View style={styles.contentStack}>
          <SectionHeading icon="people-outline" eyebrow="COMMUNITY HUB" title="שחקני הקהילה"
            subtitle="טקטיקות והגדרות שלט שאושרו. התוכן שאתה מעלה נשאר בעמוד שלך עד אישור." />
          <View style={styles.communityHeader}>
            <Text style={styles.communityCount}>{String(community.length)} פריטים מאושרים</Text>
            {app.user ? (
              <Pressable style={styles.publishButton} onPress={() => { setComposerFormation(''); setCommunitySquad(null); setShowComposer(true); }}>
                <Text style={styles.publishButtonText}>העלה טקטיקה</Text>
              </Pressable>
            ) : null}
          </View>
          {community.length ? community.map((item) => {
            const controller = item.settings?.category === 'controller';
            return (
              <Panel key={item.id}>
                <Text style={styles.communityItemTitle}>{item.title}</Text>
                <Text style={styles.communityItemMeta}>{controller ? 'הגדרות שלט' : (item.formation || 'ללא מערך')} · {item.platform === 'xbox' ? 'Xbox' : item.platform === 'ps5' ? 'PlayStation 5' : item.platform}</Text>
                <Text style={styles.communityItemBody}>{item.body}</Text>
                {controller ? (
                  <View style={styles.communityControllerGrid}>
                    {Object.entries(item.settings?.controllerSettings ?? {}).map(([key, value]) => {
                      const definition = CONTROLLER_SETTINGS.find((entry) => entry.key === key);
                      return definition ? <View key={key} style={styles.communityControllerChip}><Text style={styles.communityControllerValue}>{String(value)}</Text><Text style={styles.communityControllerLabel}>{definition.label}</Text></View> : null;
                    })}
                  </View>
                ) : null}
                {item.settings?.squad ? (
                  <View style={styles.communitySharedSquad}>
                    <Text style={styles.communitySharedSquadTitle}>הסגל ששויך לטקטיקה</Text>
                    <Text style={styles.communitySharedSquadText}>{item.settings.squad.formation} · {Object.keys(item.settings.squad.slots ?? {}).length} בהרכב · {(item.settings.squad.bench ?? []).length} מחליפים</Text>
                  </View>
                ) : null}
                {item.image_uris?.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.communityImages}>{item.image_uris.map((uri) => <Image key={uri} source={{ uri }} style={styles.communityImage} resizeMode="cover" />)}</ScrollView> : null}
              </Panel>
            );
          }) : <EmptyCommunity />}
        </View>
      );
    }

    if (section === 'tactics') {
      const selectedFormationData = FORMATIONS.find((item) => item.label === formation) ?? FORMATIONS[0];
      return (
        <View style={styles.contentStack}>
          <SectionHeading icon="git-network-outline" eyebrow="TACTICS LAB" title="טקטיקות והרכבים"
            subtitle="בחר מערך מתוך חלון מסודר. המגרש מתחלף מיד לפי המערך שבחרת." />
          <Panel>
            <View style={[styles.tacticsHero, mobile && styles.oneCol]}>
              <View style={styles.tacticsPitchWrap}><MiniPitch formation={formation} /></View>
              <View style={styles.tacticsControls}>
                <Text style={styles.tacticsKicker}>ACTIVE FORMATION</Text>
                <Text style={styles.tacticsBigTitle}>{selectedFormationData.label}</Text>
                <Text style={styles.tacticsBody}>אין יותר רשימה אופקית. לוחצים על בחירת מערך ונפתח חלון נקי עם כל המערכים, בלי לגעת בכותרת או בהסבר.</Text>
                <Pressable style={styles.formationSelectCard} onPress={() => setComposerFormationPickerOpen(true)}>
                  <View style={styles.formationSelectCopy}>
                    <Text style={styles.formationSelectLabel}>FORMATION</Text>
                    <Text style={styles.formationSelectValue}>{selectedFormationData.label}</Text>
                  </View>
                  <Ionicons name="chevron-down" size={18} color="#F4CF64" />
                </Pressable>
                <Text style={styles.tacticsControlLabel}>BUILD-UP STYLE</Text>
                <View style={styles.selectorRow}>{BUILD_UP_STYLES.map((item) => <Pressable key={item} onPress={() => setBuildUp(item)} style={[styles.selectorChip, buildUp === item && styles.selectorChipActive]}><Text style={styles.selectorChipText}>{item}</Text></Pressable>)}</View>
                <Text style={styles.tacticsControlLabel}>DEFENSIVE APPROACH</Text>
                <View style={styles.selectorRow}>{DEFENSIVE_APPROACHES.map((item) => <Pressable key={item} onPress={() => setDefensive(item)} style={[styles.selectorChip, defensive === item && styles.selectorChipActive]}><Text style={styles.selectorChipText}>{item}</Text></Pressable>)}</View>
                <Text style={styles.tacticsControlLabel}>LINE HEIGHT · {lineHeight}</Text>
                <View style={styles.selectorRow}>{['40','50','60','70','80'].map((item) => <Pressable key={item} onPress={() => setLineHeight(item)} style={[styles.selectorChip, lineHeight === item && styles.selectorChipActive]}><Text style={styles.selectorChipText}>{item}</Text></Pressable>)}</View>
              </View>
            </View>
          </Panel>
        </View>
      );
    }

    return (
      <View style={styles.contentStack}>
        <SectionHeading
          icon="trophy-outline"
          eyebrow="MY CHAMPIONS"
          title="העמוד שלי"
          subtitle="כל משתמש מקבל run משלו. הנתונים נשמרים לחשבון ולא נשארים רנדומליים בין כניסות."
        />

        <Panel>
          <View style={styles.personalHeader}>
            <View>
              <Text style={styles.personalTitle}>{app.user?.displayName || 'השחקן שלי'}</Text>
              <Text style={styles.personalSub}>
                {run.matchesPlayed} / 15 משחקים · Form {form >= 0 ? '+' : ''}{form} · CQP {formatCoins(run.cqp)}
              </Text>
            </View>
            <Pressable style={styles.editButton} onPress={() => setEditingRun((value) => !value)}>
              <Ionicons name="create-outline" size={15} color="#fff" />
              <Text style={styles.editButtonText}>{editingRun ? 'סגור' : 'עדכן נתונים'}</Text>
            </Pressable>
          </View>

          {editingRun ? (
            <View style={styles.editGrid}>
              <View style={styles.inputBlock}><Text style={styles.inputLabel}>WINS</Text><TextInput value={draftWins} onChangeText={setDraftWins} keyboardType="numeric" style={styles.numberInput} /></View>
              <View style={styles.inputBlock}><Text style={styles.inputLabel}>LOSSES</Text><TextInput value={draftLosses} onChangeText={setDraftLosses} keyboardType="numeric" style={styles.numberInput} /></View>
              <View style={styles.inputBlock}><Text style={styles.inputLabel}>MATCHES</Text><TextInput value={draftMatches} onChangeText={setDraftMatches} keyboardType="numeric" style={styles.numberInput} /></View>
              <View style={styles.inputBlock}><Text style={styles.inputLabel}>CQP</Text><TextInput value={draftCqp} onChangeText={setDraftCqp} keyboardType="numeric" style={styles.numberInput} /></View>
              <Pressable style={styles.saveRunButton} onPress={() => void saveRun()} disabled={saving}>
                <Text style={styles.saveRunButtonText}>{saving ? 'שומר…' : 'שמור את ה־Champions שלי'}</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.liveStats}>
            <MetricCard label="FINAL STATUS" value={run.matchesPlayed >= 15 ? 'READY' : 'LIVE'} tone="green" note={run.matchesPlayed >= 15 ? 'Finals complete' : 'Live run'} />
            <MetricCard label="CQP PROGRESS" value={formatCoins(run.cqp)} tone="gold" note="נתון חי של החשבון" />
            <MetricCard label="המאזן שלי" value={String(run.losses) + ' - ' + String(run.wins)} tone="red" note={String(run.losses) + ' הפסדים · ' + String(run.wins) + ' ניצחונות'} />
          </View>
        </Panel>

        <View style={styles.myContentPanel}>
          <Panel>
            <SectionHeading icon="albums-outline" eyebrow="MY CHAMPIONS CONTENT" title="מה שהעליתי" subtitle="כל טקטיקה והגדרות שלט שלך מופיעים כאן מיד כ־Pending, ולאחר אישור כ־Approved." />
            {myContent.length ? myContent.map((item) => {
              const controller = item.settings?.category === 'controller';
              return (
                <View key={item.id} style={styles.myUploadedCard}>
                  <View style={styles.myUploadedTop}>
                    <Text style={styles.myUploadedTitle}>{item.title}</Text>
                    <View style={[styles.statusBadge, item.status === 'approved' ? styles.statusApproved : item.status === 'rejected' ? styles.statusRejected : styles.statusPending]}>
                      <Text style={styles.statusBadgeText}>{item.status === 'approved' ? 'מאושר' : item.status === 'rejected' ? 'נדחה' : 'ממתין לאישור'}</Text>
                    </View>
                  </View>
                  <Text style={styles.myUploadedMeta}>{controller ? 'הגדרות שלט' : (item.formation || 'ללא מערך')} · {item.platform === 'xbox' ? 'Xbox' : item.platform === 'ps5' ? 'PlayStation 5' : item.platform}</Text>
                  <Text style={styles.myUploadedBody}>{item.body}</Text>
                  {controller ? (
                    <View style={styles.communityControllerGrid}>
                      {Object.entries(item.settings?.controllerSettings ?? {}).map(([key, value]) => {
                        const definition = CONTROLLER_SETTINGS.find((entry) => entry.key === key);
                        return definition ? <View key={key} style={styles.communityControllerChip}><Text style={styles.communityControllerValue}>{String(value)}</Text><Text style={styles.communityControllerLabel}>{definition.label}</Text></View> : null;
                      })}
                    </View>
                  ) : null}
                  {item.settings?.squad ? <Text style={styles.myUploadedSquad}>הסגל ששויך לפוסט: {item.settings.squad.formation} · {Object.keys(item.settings.squad.slots ?? {}).length} בהרכב · {(item.settings.squad.bench ?? []).length} מחליפים</Text> : null}
                  {item.image_uris?.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.communityImages}>{item.image_uris.map((uri) => <Image key={uri} source={{ uri }} style={styles.communityImage} resizeMode="cover" />)}</ScrollView> : null}
                </View>
              );
            }) : (
              <View style={styles.myEmptyContent}><Ionicons name="albums-outline" size={28} color="#68737D" /><Text style={styles.myEmptyContentTitle}>עדיין לא העלית תוכן</Text><Text style={styles.myEmptyContentText}>כאן תופיע הטקטיקה שהעלית, הסגל ששייכת אליה והגדרות השלט שלך.</Text></View>
            )}
          </Panel>
        </View>

        <View style={[styles.twoCol, mobile && styles.oneCol]}>
          <Panel>
            <SectionHeading icon="star-outline" eyebrow="FEATURED PRO" title="TEKKZ" subtitle="TEKKZ הוא ברירת המחדל עד שיש תוכן קהילתי מאושר." />
            <TekkzCard compact />
          </Panel>
          <Panel>
            <SectionHeading icon="gift-outline" eyebrow="REWARD SNAPSHOT" title="הפרס של הריצה" subtitle={String(run.wins) + ' wins · ' + String(personalReward.tokens) + ' Champions Tokens'} />
          
            <View style={styles.rewardMiniGrid}>
              <View style={styles.rewardMini}><Text style={styles.rewardMiniValue}>{formatCoins(personalReward.coins)}</Text><Text style={styles.rewardMiniLabel}>COINS</Text></View>
              <View style={styles.rewardMini}><Text style={styles.rewardMiniValue}>{personalReward.tokens}</Text><Text style={styles.rewardMiniLabel}>TOKENS</Text></View>
              <View style={styles.rewardMini}><Text style={styles.rewardMiniValue}>{formatCoins(run.cqp)}</Text><Text style={styles.rewardMiniLabel}>MY CQP</Text></View>
            </View>
          </Panel>
        </View>
      </View>
    );
  }, [
    app.user?.displayName,
    app.user?.id,
    community,
    draftCqp,
    draftLosses,
    draftMatches,
    draftWins,
    editingRun,
    form,
    mobile,
    personalReward,
    platform,
    run,
    saving,
    section,
    selectedReward,
    selectedWins,
    formation,
    buildUp,
    defensive,
    lineHeight,
    formationPickerOpen,
    composerFormation,
    composerImages,
    communitySquad,
    controllerSettings,
    myContent,
    squadBuilderOpen,

    composerFormationPickerOpen,  ]);

  if (!canView) {
    return (
      <Screen scene="champions" showNav>
        <Stack.Screen options={{ title: 'FUT Champions' }} />
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonIcon}>🏆</Text>
          <Text style={styles.comingSoonTitle}>FUT Champions</Text>
          <Text style={styles.comingSoonStatus}>בקרוב</Text>
          <Text style={styles.comingSoonText}>מרכז FUT Champions החדש נמצא בהכנה.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scene="champions" showNav refreshing={saving} onRefresh={loadLiveData} maxWidth={1700}>
      <Stack.Screen options={{ title: 'FUT Champions' }} />

      <View style={styles.pageRoot}>
        <Image source={require('@/assets/images/champions-bg.jpg')} resizeMode="cover" style={styles.backgroundImage} pointerEvents="none" />
        <View style={styles.backgroundSoftener} pointerEvents="none" />
      <View style={styles.mainLayout}>
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>FUT CHAMPIONS</Text>
          {NAV.map((item, index) => (
            <Pressable key={item.id} onPress={() => setSection(item.id)} style={[styles.sidebarItem, section === item.id && styles.sidebarItemActive]}>
              <Text style={styles.sidebarIndex}>{String(index + 1).padStart(2, '0')}</Text>
              <Text style={[styles.sidebarLabel, section === item.id && styles.sidebarLabelActive]}>{item.label}</Text>
              <Ionicons name={item.icon} size={18} color={section === item.id ? '#F5F7FA' : '#88939E'} />
            </Pressable>
          ))}
        </View>

        <View style={styles.main}>
          <View style={styles.sectionBar}>
            <View style={styles.sectionBarTitleWrap}>
              <Text style={styles.sectionBarEyebrow}>FC27 · FUT CHAMPIONS</Text>
              <Text style={styles.sectionBarTitle}>{NAV.find((item) => item.id === section)?.label}</Text>
            </View>
            <View style={styles.sectionBarTabs}>
              {NAV.map((item) => (
                <Pressable key={item.id} onPress={() => setSection(item.id)} style={[styles.sectionTab, section === item.id && styles.sectionTabActive]}>
                  <Ionicons name={item.icon} size={15} color={section === item.id ? '#fff' : '#89949F'} />
                  <Text style={[styles.sectionTabText, section === item.id && styles.sectionTabTextActive]}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.contentArea}>{content}</View>
        </View>
      </View>

      </View>

      {showComposer ? (
        <View style={styles.modalBackdrop}>
          <Panel style={styles.composer}>
            <View style={styles.composerHeader}>
              <Text style={styles.composerTitle}>העלה טקטיקה לקהילה</Text>
              <Pressable onPress={() => setShowComposer(false)}><Ionicons name="close" size={21} color="#fff" /></Pressable>
            </View>
            <TextInput value={title} onChangeText={setTitle} placeholder="כותרת" placeholderTextColor="#6f7984" style={styles.textInput} />
            <Pressable style={styles.formationSelectCard} onPress={() => setComposerFormationPickerOpen(true)}>
  <View style={styles.formationSelectCopy}>
    <Text style={styles.formationSelectLabel}>FORMATION</Text>
    <Text style={styles.formationSelectValue}>{composerFormation || 'בחר מערך'}</Text>
  </View>
  <Ionicons name="chevron-down" size={18} color="#F4CF64" />
</Pressable>
            <TextInput value={body} onChangeText={setBody} placeholder="הסבר קצר על הטקטיקה" placeholderTextColor="#6f7984" multiline style={[styles.textInput, styles.textArea]} />
                        <View style={styles.communitySquadBlock}>
              <Text style={styles.communitySquadTitle}>הקבוצה של הפוסט</Text>
              <Text style={styles.communitySquadHint}>בנה קבוצה אמיתית מהשחקנים של האתר: 11 בהרכב ועד 7 מחליפים. לא צילום מסך.</Text>
              <Pressable style={styles.uploadButton} onPress={() => openSquadBuilder()}>
                <Ionicons name="football-outline" size={17} color="#fff" />
                <Text style={styles.uploadButtonText}>{communitySquad ? 'עריכת הקבוצה לפוסט' : 'בניית הקבוצה לפוסט'}</Text>
              </Pressable>
              {app.user?.squad ? (
                <Text style={styles.communitySquadSaved}>
                  {app.user.squad.formation} · {Object.keys(app.user.squad.slots).length} בהרכב · {app.user.squad.bench.length} מחליפים
                </Text>
              ) : null}
            </View>

<Pressable style={styles.uploadButton} onPress={() => void pickComposerImages()}><Ionicons name="image-outline" size={17} color="#fff" /><Text style={styles.uploadButtonText}>{composerImages.length ? `${composerImages.length} תמונות נבחרו` : 'העלה צילום של הטקטיקה / הקבוצה'}</Text></Pressable>
            <View style={styles.platformRow}>
              <PlatformPill value="xbox" selected={platform === 'xbox'} onPress={() => setPlatform('xbox')} />
              <PlatformPill value="ps5" selected={platform === 'ps5'} onPress={() => setPlatform('ps5')} />
            </View>
            <Pressable style={styles.publishConfirm} onPress={() => void publish()} disabled={saving}>
              <Text style={styles.publishConfirmText}>{saving ? 'שומר…' : 'שלח לבדיקה'}</Text>
            </Pressable>
          </Panel>
        </View>
      ) : null}

      <FormationPickerModal visible={formationPickerOpen} selected={formation} onClose={() => setFormationPickerOpen(false)} onSelect={setFormation} />
      <FormationPickerModal visible={composerFormationPickerOpen} selected={composerFormation} onClose={() => setComposerFormationPickerOpen(false)} onSelect={setComposerFormation} />
      <CommunitySquadBuilder visible={squadBuilderOpen} formationLabel={composerFormation} initial={communitySquad} onClose={() => setSquadBuilderOpen(false)} onSave={saveCommunitySquad} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageRoot: { position: 'relative', minHeight: 980, overflow: 'hidden', paddingHorizontal: 22, paddingVertical: 18 },
  backgroundImage: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, width: '100%', height: '100%', opacity: 1 },
  backgroundSoftener: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,.08)' },
  mainLayout: { flexDirection: 'row-reverse', alignItems: 'stretch', gap: 17 },
  sidebar: { width: 245, backgroundColor: 'rgba(5,8,12,.56)', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,.06)', paddingTop: 22, paddingHorizontal: 12, minHeight: 900, direction: 'rtl' },
  sidebarTitle: { color: '#79858F', fontSize: 11, fontWeight: '900', letterSpacing: 1.6, textAlign: 'center', marginBottom: 15 },
  sidebarItem: { minHeight: 52, borderRadius: 13, paddingHorizontal: 11, marginBottom: 9, backgroundColor: 'rgba(9,12,17,.50)', borderWidth: 1, borderColor: 'rgba(255,255,255,.03)', flexDirection: 'row', alignItems: 'center', gap: 9 },
  sidebarItemActive: { backgroundColor: 'rgba(221,23,45,.72)', borderColor: 'rgba(255,86,103,.82)', shadowColor: '#E43043', shadowOpacity: .22, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  sidebarIndex: { color: '#65717D', fontSize: 9, fontWeight: '800', width: 19 },
  sidebarLabel: { flex: 1, color: '#9AA6B1', fontSize: 12, fontWeight: '800', textAlign: 'right' },
  sidebarLabelActive: { color: '#fff' },
  main: { flex: 1, minWidth: 0, direction: 'rtl' },
  sectionBar: { gap: 12, marginBottom: 12 },
  sectionBarTitleWrap: { alignItems: 'flex-end', paddingHorizontal: 4 },
  sectionBarEyebrow: { color: '#D7B653', fontSize: 8, fontWeight: '900', letterSpacing: 1.5, textAlign: 'right' },
  sectionBarTitle: { color: '#F6F7F9', fontSize: 25, fontWeight: '900', textAlign: 'right', marginTop: 2 },
  sectionBarTabs: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 7 },
  sectionTab: { minHeight: 42, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,.09)', backgroundColor: 'rgba(5,8,12,.54)', paddingHorizontal: 11, flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  sectionTabActive: { backgroundColor: 'rgba(216,47,64,.62)', borderColor: 'rgba(255,99,112,.68)' },
  sectionTabText: { color: '#808B95', fontSize: 9, fontWeight: '900' },
  sectionTabTextActive: { color: '#fff' },
  heroLegacy: { minHeight: 400, margin: 24, marginBottom: 18, borderRadius: 23, borderWidth: 1, borderColor: 'rgba(237,55,72,.55)', overflow: 'hidden', position: 'relative', shadowColor: '#000', shadowOpacity: .30, shadowRadius: 22, shadowOffset: { width: 0, height: 12 } },
  heroGlowOne: { position: 'absolute', width: 500, height: 500, borderRadius: 250, right: -160, top: -190, backgroundColor: 'rgba(238,37,56,.15)' },
  heroGlowTwo: { position: 'absolute', width: 360, height: 360, borderRadius: 180, left: -160, bottom: -190, backgroundColor: 'rgba(214,33,53,.11)' },
  heroTop: { padding: 28, flexDirection: 'row', alignItems: 'center', gap: 20, direction: 'ltr', minHeight: 266 },
  heroStats: { width: 555, flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  metricCard: { flex: 1, minHeight: 101, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(255,255,255,.10)', backgroundColor: 'rgba(4,8,12,.55)', padding: 15, justifyContent: 'center' },
  metricLabel: { color: '#6D7883', fontSize: 10, fontWeight: '900', textAlign: 'right' },
  metricValue: { color: '#F2CC64', fontSize: 24, fontWeight: '900', textAlign: 'right', marginTop: 11 },
  metricGreen: { color: '#63E59F' },
  metricRed: { color: '#FF6673' },
  metricNote: { color: '#86919C', fontSize: 9, fontWeight: '700', lineHeight: 14, textAlign: 'right', marginTop: 2 },
  metricBar: { height: 6, borderRadius: 4, backgroundColor: '#1C2430', marginTop: 14, overflow: 'hidden' },
  metricBarFill: { height: '100%', width: '55%', backgroundColor: '#F2C95F' },
  metricBarRed: { backgroundColor: '#E33C4A', width: '30%' },
  metricBarGreen: { backgroundColor: '#62E29B', width: '80%' },

  heroTitleWrap: { flex: 1, alignItems: 'flex-end', justifyContent: 'center', minWidth: 260 },
  heroEyebrow: { color: '#E0A5AA', fontSize: 10, fontWeight: '900', letterSpacing: 2.3, textAlign: 'right' },
  heroTitle: { color: '#FFF7EB', fontSize: 62, lineHeight: 62, fontWeight: '900', letterSpacing: 1.2, textAlign: 'right', textShadowColor: 'rgba(255,59,76,.23)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 13 },
  heroSubtitle: { color: '#EBC9CC', fontSize: 16, fontWeight: '800', textAlign: 'right' },
  heroInfoRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 22, marginTop: 19 },
  heroInfoBig: { color: '#F6F7F8', fontSize: 21, fontWeight: '900', textAlign: 'right' },
  heroInfoSmall: { color: '#7A858F', fontSize: 8, fontWeight: '900', letterSpacing: 1.1, textAlign: 'right', marginTop: 1 },
  heroCrest: { width: 112, height: 132, borderRadius: 28, borderWidth: 1, borderColor: 'rgba(239,194,83,.62)', backgroundColor: 'rgba(40,8,14,.72)', alignItems: 'center', justifyContent: 'center', gap: 4 },
  heroCrestText: { color: '#F8D36B', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  tabBar: { minHeight: 70, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.10)', flexDirection: 'row', gap: 5, paddingHorizontal: 9, direction: 'rtl' },
  heroTab: { flex: 1, minHeight: 58, marginTop: 6, borderRadius: 11, borderWidth: 1, borderColor: 'rgba(255,255,255,.07)', backgroundColor: 'rgba(6,10,15,.72)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, paddingHorizontal: 4 },
  heroTabActive: { backgroundColor: '#E13C49', borderColor: '#FF6570', shadowColor: '#E13C49', shadowOpacity: .18, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  heroTabText: { color: '#8D99A4', fontSize: 10, fontWeight: '900', textAlign: 'center' },
  heroTabTextActive: { color: '#fff' },
  contentArea: { paddingHorizontal: 24, paddingBottom: 48 },
  contentStack: { gap: 13 },
  smallMetaStrip: { height: 42, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 24, direction: 'rtl' },
  metaMuted: { color: '#65717C', fontSize: 10, fontWeight: '800' },

  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 10, direction: 'rtl' },
  sectionHeadingIcon: { width: 35, height: 35, borderRadius: 11, backgroundColor: 'rgba(224,56,72,.10)', borderWidth: 1, borderColor: 'rgba(224,56,72,.20)', alignItems: 'center', justifyContent: 'center' },
  sectionHeadingText: { flex: 1 },
  sectionEyebrow: { color: '#C78B43', fontSize: 8, fontWeight: '900', letterSpacing: 1.5, textAlign: 'right' },
  sectionTitle: { color: '#EEF1F4', fontSize: 18, fontWeight: '900', textAlign: 'right' },
  sectionSubtitle: { color: '#75808B', fontSize: 10, fontWeight: '700', marginTop: 2, textAlign: 'right' },

  centerRow: { flexDirection: 'row-reverse', gap: 14, alignItems: 'stretch' },
  centerRowMobile: { flexDirection: 'column' },
  rankPanel: { flex: 0.88, minHeight: 250, padding: 19, flexDirection: 'row-reverse', alignItems: 'center', gap: 17 },
  rankRing: { width: 132, height: 132, borderRadius: 66, borderWidth: 8, borderColor: '#F0C85E', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10151D' },
  rankRingLabel: { color: '#BCA76A', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 3 },
  rankRingValue: { color: '#F8E18B', fontSize: 39, fontWeight: '900' },
  rankCopy: { flex: 1, alignItems: 'flex-end', gap: 4 },
  rankSeason: { color: '#8D98A3', fontSize: 9, fontWeight: '800' },
  rankTitle: { color: '#F2F4F7', fontSize: 25, fontWeight: '900', textAlign: 'right', marginTop: 3 },
  rankStatus: { color: '#7B8692', fontSize: 11, lineHeight: 18, textAlign: 'right', maxWidth: 340 },
  nextTargetLabel: { color: '#D9B653', fontSize: 9, fontWeight: '900', letterSpacing: 1.1, marginTop: 13 },
  nextTargetValue: { color: '#CBD2D8', fontSize: 11, fontWeight: '800', textAlign: 'right' },
  longBar: { width: '100%', height: 8, borderRadius: 5, backgroundColor: '#1C2430', overflow: 'hidden', marginTop: 8 },
  longBarFill: { height: '100%', width: '28%', backgroundColor: '#E63242' },

  progressPanel: { flex: 1.34, minHeight: 250, padding: 19 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', direction: 'rtl' },
  progressEyebrow: { color: '#E1BD58', fontSize: 8, fontWeight: '900', letterSpacing: 1.5, textAlign: 'right' },
  progressTitle: { color: '#EEF1F3', fontSize: 27, fontWeight: '900', textAlign: 'right', marginTop: 3 },
  progressSub: { color: '#6D7883', fontSize: 10, fontWeight: '700', textAlign: 'right', marginTop: 1 },
  progressIcon: { width: 39, height: 39, borderRadius: 13, backgroundColor: 'rgba(234,195,85,.08)', borderWidth: 1, borderColor: 'rgba(234,195,85,.25)', alignItems: 'center', justifyContent: 'center' },
  progressStats: { flexDirection: 'row-reverse', gap: 10, marginTop: 16 },
  progressTile: { flex: 1, minHeight: 100, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,.07)', backgroundColor: 'rgba(8,12,18,.72)', padding: 12 },
  tileLabel: { color: '#6D7884', fontSize: 9, fontWeight: '900', textAlign: 'right' },
  tileValue: { color: '#F4CF64', fontSize: 28, fontWeight: '900', textAlign: 'right', marginTop: 10 },
  tileNote: { color: '#7D8894', fontSize: 9, fontWeight: '700', textAlign: 'right', marginTop: 2 },
  progressBottomRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 9, marginTop: 13 },
  progressTarget: { color: '#89949F', fontSize: 9, fontWeight: '800' },
  progressBarLarge: { flex: 1, height: 8, borderRadius: 5, backgroundColor: '#1A2430', overflow: 'hidden' },
  progressBarLargeFill: { width: '75%', height: '100%', backgroundColor: '#E43B4A' },

  contentGrid: { flexDirection: 'row-reverse', gap: 13 },
  tacticPreview: { flex: 1 },
  controllerHomePanel: { flex: 1 },
  tacticInside: { flexDirection: 'row-reverse', gap: 13, alignItems: 'stretch', marginTop: 7 },
  tacticInfo: { flex: 1, justifyContent: 'center' },
  controllerHomeBody: { flexDirection: 'row-reverse', gap: 13, alignItems: 'center', marginTop: 10 },
  controllerCircle: { width: 94, height: 94, borderRadius: 47, borderWidth: 1, borderColor: 'rgba(255,255,255,.10)', backgroundColor: '#0B1118', alignItems: 'center', justifyContent: 'center' },
  controllerHomeRows: { flex: 1 },

  pitch: { flex: 1, minHeight: 500, backgroundColor: '#103622', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(135,202,160,.38)', overflow: 'hidden', position: 'relative', shadowColor: '#000', shadowOpacity: .30, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
  pitchCompact: { width: 128, flex: 0, minHeight: 145, borderRadius: 13 },
  pitchMidline: { position: 'absolute', left: 9, right: 9, top: '50%', height: 1, backgroundColor: 'rgba(255,255,255,.20)' },
  pitchBoxTop: { position: 'absolute', left: '25%', right: '25%', top: '7%', height: '20%', borderWidth: 1, borderColor: 'rgba(255,255,255,.17)', borderBottomWidth: 0 },
  pitchBoxBottom: { position: 'absolute', left: '25%', right: '25%', bottom: '7%', height: '20%', borderWidth: 1, borderColor: 'rgba(255,255,255,.17)', borderTopWidth: 0 },
  pitchDot: { position: 'absolute', width: 17, height: 17, borderRadius: 9, marginLeft: -8, marginTop: -8, backgroundColor: '#E5C75C', borderWidth: 2, borderColor: '#FFF2A4' },
  pitchDotCompact: { width: 11, height: 11, borderRadius: 6, marginLeft: -5, marginTop: -5 },
  pitchBadge: { position: 'absolute', left: 9, bottom: 9, borderRadius: 9, backgroundColor: 'rgba(6,12,10,.73)', paddingHorizontal: 8, paddingVertical: 5 },
  pitchBadgeText: { color: '#D7EBDE', fontSize: 9, fontWeight: '900' },

  formationScroller: { marginTop: 8 },
  formationRow: { flexDirection: 'row', gap: 7, paddingVertical: 4 },
  formationChip: { borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,.09)', backgroundColor: 'rgba(5,8,12,.62)', paddingHorizontal: 10, paddingVertical: 8 },
  formationChipActive: { backgroundColor: 'rgba(221,35,53,.78)', borderColor: '#FF6570' },
  formationChipText: { color: '#8C97A1', fontSize: 9, fontWeight: '900' },
  formationChipTextActive: { color: '#fff' },
  selectorRow: { flexDirection: 'row-reverse', gap: 7, marginTop: 9, flexWrap: 'wrap' },
  selectorChip: { borderRadius: 9, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', backgroundColor: 'rgba(5,8,12,.6)', paddingHorizontal: 10, paddingVertical: 7 },
  selectorChipActive: { borderColor: '#E53A4A', backgroundColor: 'rgba(229,58,74,.18)' },
  selectorChipText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  uploadButton: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,.10)', backgroundColor: 'rgba(226,45,61,.16)', paddingHorizontal: 13, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 },
  uploadButtonText: { color: '#F3F5F7', fontSize: 10, fontWeight: '900' },
  panelLegacy: { position: 'relative', overflow: 'hidden', backgroundColor: '#0A0F15', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', padding: 17, gap: 12 },
  settingRow: { minHeight: 35, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,.05)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', direction: 'ltr', gap: 9 },
  settingLabel: { color: '#6E7984', fontSize: 10, fontWeight: '800', textAlign: 'right', flex: 1 },
  settingValue: { color: '#DCE2E7', fontSize: 11, fontWeight: '900', textAlign: 'right' },  tekkzCardCompact: { minHeight: 0 },
  cardTopLine: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  sourceBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: 'rgba(104,224,155,.20)', backgroundColor: 'rgba(104,224,155,.05)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  sourceBadgeText: { color: '#79D59F', fontSize: 8, fontWeight: '900' },  playerCardBody: { flexDirection: 'row-reverse', gap: 12, alignItems: 'stretch' },
  playerPortrait: { width: 112, minHeight: 122, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,.09)', backgroundColor: '#151A22', overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  playerHead: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#D8B39C', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,.18)', marginBottom: -2 },
  playerInitial: { color: '#30231F', fontSize: 27, fontWeight: '900' },
  playerShirt: { width: 92, height: 49, borderRadius: 23, backgroundColor: '#181D26', borderTopWidth: 2, borderTopColor: '#303746', alignItems: 'center', justifyContent: 'center' },
  playerNumber: { color: 'rgba(239,242,247,.26)', fontSize: 31, fontWeight: '900' },
  playerCardCopy: { flex: 1, justifyContent: 'center', alignItems: 'flex-end' },
  nameRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  playerName: { color: '#F3F5F7', fontSize: 22, fontWeight: '900', textAlign: 'right' },
  playerCountry: { fontSize: 16 },
  playerRole: { color: '#7E8994', fontSize: 10, fontWeight: '700', marginTop: 2, textAlign: 'right' },
  playerFormation: { color: '#F1CB63', fontSize: 15, fontWeight: '900', marginTop: 8, textAlign: 'right' },
  playerSetup: { color: '#A3ACB6', fontSize: 10, fontWeight: '700', marginTop: 3, textAlign: 'right' },
  cardMetaRow: { minHeight: 42, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,.06)', flexDirection: 'row-reverse', alignItems: 'stretch' },
  cardMetaItem: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 4, borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,.05)' },
  cardMetaText: { color: '#8D98A3', fontSize: 9, fontWeight: '800' },

  tekkzDetailGrid: { flexDirection: 'row-reverse', gap: 13 },
  tekkzDetailMain: { flex: 1.3 },
  tekkzPitchPanel: { width: 360 },
  detailTopRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start' },
  detailKicker: { color: '#C99547', fontSize: 8, fontWeight: '900', letterSpacing: 1.4, textAlign: 'right' },
  detailName: { color: '#F4F6F8', fontSize: 27, fontWeight: '900', textAlign: 'right', marginTop: 2 },
  detailSub: { color: '#717C87', fontSize: 10, fontWeight: '800', textAlign: 'right', marginTop: 2 },
  goldPill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(104,224,155,.20)', backgroundColor: 'rgba(104,224,155,.05)', paddingHorizontal: 9, paddingVertical: 6 },
  goldPillText: { color: '#86D7A9', fontSize: 9, fontWeight: '900' },
  detailFacts: { flexDirection: 'row-reverse', gap: 9, marginTop: 13 },
  detailFact: { flex: 1, borderRadius: 13, backgroundColor: 'rgba(5,9,14,.74)', borderWidth: 1, borderColor: 'rgba(255,255,255,.06)', padding: 12 },
  detailFactValue: { color: '#F4F5F7', fontSize: 13, fontWeight: '900', textAlign: 'right' },
  detailFactLabel: { color: '#6A7580', fontSize: 8, fontWeight: '900', textAlign: 'right', marginTop: 4 },
  roleGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 7, marginTop: 11 },
  roleChip: { flexGrow: 1, minWidth: 145, borderRadius: 11, borderWidth: 1, borderColor: 'rgba(255,255,255,.06)', backgroundColor: 'rgba(5,9,14,.72)', paddingHorizontal: 9, paddingVertical: 8 },
  rolePosition: { color: '#E95A63', fontSize: 8, fontWeight: '900', textAlign: 'right' },
  roleText: { color: '#D5DADF', fontSize: 9, fontWeight: '800', textAlign: 'right', marginTop: 2 },

  sourceNote: { color: '#5E6974', fontSize: 9, fontWeight: '700', textAlign: 'right', marginTop: 2 },
  rewardGrid: { flexDirection: 'row-reverse', gap: 13 },
  rewardTitle: { color: '#F2F4F6', fontSize: 15, fontWeight: '900', textAlign: 'right' },
  rewardBody: { color: '#798590', fontSize: 10, fontWeight: '700', textAlign: 'right' },

  emptyPanel: { minHeight: 190, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { width: 48, height: 48, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', backgroundColor: 'rgba(255,255,255,.02)', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#EDEFF2', fontSize: 18, fontWeight: '900', marginTop: 7, textAlign: 'center' },
  emptyText: { color: '#77838E', fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 2 },
  emptyHint: { color: '#545F69', fontSize: 9, fontWeight: '700', textAlign: 'center', marginTop: 3 },

  tacticGrid: { flexDirection: 'row-reverse', gap: 13 },
  tacticPanel: { flex: 1 },
  tacticTitle: { color: '#EEF1F4', fontSize: 18, fontWeight: '900', textAlign: 'right' },
  tacticSub: { color: '#72808A', fontSize: 10, fontWeight: '700', textAlign: 'right', marginBottom: 9 },
  tacticRow: { minHeight: 39, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,.05)' },
  tacticLabel: { color: '#6B7681', fontSize: 9, fontWeight: '800' },
  tacticValue: { color: '#DFE4E8', fontSize: 10, fontWeight: '900', textAlign: 'right' },

  controllerGrid: { flexDirection: 'row-reverse', gap: 13 },
  controllerPanel: { width: 360, alignItems: 'center', justifyContent: 'center', minHeight: 330 },
  controllerPreview: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  controllerGlyph: { fontSize: 65 },
  controllerName: { color: '#D9DEE4', fontSize: 12, fontWeight: '900', textAlign: 'center' },
  controllerSettings: { flex: 1, minHeight: 330 },

  comingSoon: { flex: 1, minHeight: 700, alignItems: 'center', justifyContent: 'center', gap: 7 },
  comingSoonIcon: { fontSize: 40 },
  comingSoonTitle: { color: '#F2F4F7', fontSize: 27, fontWeight: '900' },
  comingSoonStatus: { color: '#F04A56', fontSize: 18, fontWeight: '900' },
  comingSoonText: { color: '#85919C', fontSize: 13, fontWeight: '700' },
  panel: { position: 'relative', overflow: 'hidden', backgroundColor: 'rgba(9,13,19,.58)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', padding: 17, gap: 12 },
  hero: { minHeight: 400, margin: 24, marginBottom: 18, borderRadius: 23, borderWidth: 1, borderColor: 'rgba(237,55,72,.55)', overflow: 'hidden', position: 'relative', shadowColor: '#000', shadowOpacity: .30, shadowRadius: 22, shadowOffset: { width: 0, height: 12 } },  winChip: { width: 48, height: 48, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', backgroundColor: '#0A1017', alignItems: 'center', justifyContent: 'center' },  winChipValue: { color: '#DCE2E7', fontSize: 15, fontWeight: '900' },  winChipLabel: { color: '#67737E', fontSize: 7, fontWeight: '900' },  rewardSummaryGrid: { flexDirection: 'row-reverse', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  selectorTitle: { color: '#F0F3F6', fontSize: 15, fontWeight: '900', textAlign: 'right' },
  storeHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  storeHeaderEyebrow: { color: '#D7B351', fontSize: 8, fontWeight: '900', letterSpacing: 1.4, textAlign: 'right' },
  storeHeaderTitle: { color: '#F2F4F6', fontSize: 20, fontWeight: '900', textAlign: 'right' },
  storeHeaderSub: { color: '#78848F', fontSize: 10, fontWeight: '700', textAlign: 'right', marginTop: 2 },
  tokenBadge: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: '#E8BF4E', backgroundColor: '#0D1419', alignItems: 'center', justifyContent: 'center' },
  tokenBadgeValue: { color: '#F4D26B', fontSize: 24, fontWeight: '900' },
  tokenBadgeLabel: { color: '#7F8993', fontSize: 7, fontWeight: '900' },  storeVisual: { width: 82, alignItems: 'center', justifyContent: 'center' },
  storeCopy: { flex: 1, alignItems: 'flex-end' },
  storeTitle: { color: '#EFF2F5', fontSize: 13, fontWeight: '900', textAlign: 'right' },  storeTradeable: { color: '#7FBE98', fontSize: 8, fontWeight: '900', marginTop: 4 },  storeCostValue: { color: '#F2CF62', fontSize: 20, fontWeight: '900' },
  storeCostLabel: { color: '#727D87', fontSize: 7, fontWeight: '900' },
  storeEmpty: { color: '#6F7B86', fontSize: 11, fontWeight: '800', textAlign: 'right', paddingVertical: 18 },
  platformRow: { flexDirection: 'row-reverse', gap: 8, marginBottom: 12 },
  platformPill: { minHeight: 42, paddingHorizontal: 13, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', backgroundColor: '#0A1017', flexDirection: 'row-reverse', alignItems: 'center', gap: 7 },
  platformPillActive: { borderColor: 'rgba(234,195,85,.62)', backgroundColor: 'rgba(234,195,85,.08)' },
  platformLogo: { width: 22, height: 22 },
  platformPillText: { color: '#7F8A95', fontSize: 11, fontWeight: '900' },
  platformPillTextActive: { color: '#F4D26B' },
  controllerHero: { flexDirection: 'row-reverse', alignItems: 'center', gap: 16, paddingVertical: 8 },
  controllerImage: { width: 160, height: 112 },
  controllerCopy: { flex: 1, alignItems: 'flex-end' },
  controllerTitle: { color: '#EFF2F5', fontSize: 20, fontWeight: '900', textAlign: 'right' },
  controllerSub: { color: '#78848F', fontSize: 10, fontWeight: '700', marginTop: 2, textAlign: 'right' },
  communityHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  communityCount: { color: '#78848F', fontSize: 10, fontWeight: '800' },
  publishButton: { backgroundColor: '#D92F3B', borderRadius: 11, paddingHorizontal: 12, paddingVertical: 9 },
  publishButtonText: { color: '#fff', fontWeight: '900', fontSize: 10 },
  communityItemTitle: { color: '#F1F4F7', fontSize: 16, fontWeight: '900', textAlign: 'right' },
  communityItemMeta: { color: '#6F7B86', fontSize: 9, fontWeight: '800', textAlign: 'right', marginTop: 3 },
  communityItemBody: { color: '#9AA5AF', fontSize: 11, lineHeight: 18, textAlign: 'right', marginTop: 7 },
  personalHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  personalTitle: { color: '#F1F4F7', fontSize: 23, fontWeight: '900', textAlign: 'right' },
  personalSub: { color: '#77838E', fontSize: 10, fontWeight: '800', marginTop: 3, textAlign: 'right' },
  editButton: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, backgroundColor: '#D9303F', borderRadius: 11, paddingHorizontal: 11, paddingVertical: 8 },
  editButtonText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  editGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  inputBlock: { minWidth: 150, flex: 1, gap: 5 },
  inputLabel: { color: '#788490', fontSize: 8, fontWeight: '900', textAlign: 'right' },
  numberInput: { minHeight: 42, borderRadius: 11, borderWidth: 1, borderColor: 'rgba(255,255,255,.10)', backgroundColor: '#0A1017', color: '#fff', paddingHorizontal: 12, textAlign: 'right', fontWeight: '900' },
  saveRunButton: { minHeight: 42, width: '100%', borderRadius: 11, backgroundColor: '#D9303F', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  saveRunButtonText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  liveStats: { flexDirection: 'row-reverse', gap: 10, marginTop: 14 },
  twoCol: { flexDirection: 'row-reverse', gap: 13 },
  oneCol: { flexDirection: 'column' },
  rewardMiniGrid: { flexDirection: 'row-reverse', gap: 9 },
  rewardMini: { flex: 1, minHeight: 78, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,.06)', backgroundColor: '#0B1016', alignItems: 'center', justifyContent: 'center' },
  rewardMiniValue: { color: '#F4CF64', fontSize: 18, fontWeight: '900' },
  rewardMiniLabel: { color: '#6C7782', fontSize: 8, fontWeight: '900', marginTop: 2 },
  tacticsHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  heroCrestImage: { width: 82, height: 96 },
  textInput: { minHeight: 44, borderRadius: 11, borderWidth: 1, borderColor: 'rgba(255,255,255,.10)', backgroundColor: '#0A1017', color: '#fff', paddingHorizontal: 12, fontSize: 13, textAlign: 'right' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  publishConfirm: { minHeight: 46, borderRadius: 11, backgroundColor: '#D92F3B', alignItems: 'center', justifyContent: 'center' },
  publishConfirmText: { color: '#fff', fontSize: 12, fontWeight: '900' },

  pitchTitle: { color: '#E9EDF1', fontSize: 15, fontWeight: '900', textAlign: 'right' },
  pitchSub: { color: '#F1CB63', fontSize: 11, fontWeight: '900', textAlign: 'right', marginTop: 2 },
  modalBackdrop: ({ position: 'fixed' as any, left: 0, top: 0, width: '100vw' as any, height: '100vh' as any, zIndex: 2147483647, elevation: 2147483647, backgroundColor: 'rgba(0,0,0,.88)', padding: 18, justifyContent: 'center', alignItems: 'center', direction: 'rtl' } as any),
  composer: { maxWidth: 620, width: '100%', alignSelf: 'center', borderColor: '#D12D39', zIndex: 2147483648, elevation: 2147483648 },
  composerHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  composerTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },

  tekkzCard: { borderRadius: 22, borderWidth: 1, borderColor: 'rgba(239,58,71,.48)', backgroundColor: 'rgba(4,7,11,.64)', overflow: 'hidden', flexDirection: 'row-reverse', minHeight: 430 },
  tekkzCardSelected: { borderColor: 'rgba(244,207,100,.48)' },
  tekkzCardImageWrap: { width: '37%', minWidth: 270, minHeight: 430, position: 'relative', backgroundColor: '#10151B', overflow: 'hidden' },
  tekkzCardImage: { width: '100%', height: '100%' },
  tekkzCardImageText: { position: 'absolute', left: 18, right: 18, bottom: 15 },
  tekkzCardKicker: { color: '#EEC764', fontSize: 7, fontWeight: '900', letterSpacing: 1.5 },
  tekkzCardName: { color: '#fff', fontSize: 42, fontWeight: '900', letterSpacing: 1.3 },
  tekkzCardBody: { flex: 1, padding: 25, gap: 10, justifyContent: 'center', alignItems: 'flex-end' },
  tekkzCardTop: { width: '100%', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  verifyBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(105,217,154,.24)', backgroundColor: 'rgba(105,217,154,.06)', paddingHorizontal: 9, paddingVertical: 6 },
  verifyBadgeText: { color: '#7FD8A4', fontSize: 7, fontWeight: '900', letterSpacing: .8 },
  proBadgeText: { color: '#DAB95D', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  tekkzCardTitle: { color: '#F4F6F8', fontSize: 30, fontWeight: '900', textAlign: 'right' },
  tekkzCardSub: { color: '#A7B0B9', fontSize: 11, fontWeight: '800', textAlign: 'right', lineHeight: 18 },
  tekkzFactRow: { width: '100%', flexDirection: 'row-reverse', gap: 8 },
  tekkzFact: { flex: 1, minHeight: 72, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,.07)', backgroundColor: 'rgba(5,8,12,.60)', padding: 10 },
  tekkzFactValue: { color: '#F1F4F6', fontSize: 12, fontWeight: '900', textAlign: 'right' },
  tekkzFactLabel: { color: '#69747F', fontSize: 7, fontWeight: '900', textAlign: 'right', marginTop: 4, letterSpacing: .7 },
  tekkzChallenge: { width: '100%', borderRadius: 15, borderWidth: 1, borderColor: 'rgba(244,207,100,.20)', backgroundColor: 'rgba(26,19,9,.52)', padding: 12, flexDirection: 'row-reverse', gap: 10, alignItems: 'center' },
  tekkzChallengeIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(244,207,100,.09)', alignItems: 'center', justifyContent: 'center' },
  tekkzChallengeCopy: { flex: 1, alignItems: 'flex-end' },
  tekkzChallengeKicker: { color: '#9E8958', fontSize: 7, fontWeight: '900', letterSpacing: 1.1, textAlign: 'right' },
  tekkzChallengeTitle: { color: '#F4CF64', fontSize: 16, fontWeight: '900', textAlign: 'right', marginTop: 1 },
  tekkzChallengeText: { color: '#8E98A1', fontSize: 9, fontWeight: '700', lineHeight: 15, textAlign: 'right', marginTop: 2 },
  tekkzMiniMeta: { width: '100%', minHeight: 39, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,.06)', flexDirection: 'row-reverse' },
  tekkzMiniMetaItem: { flex: 1, flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: 4 },
  tekkzMiniMetaText: { color: '#75808B', fontSize: 7, fontWeight: '900' },
  tekkzDetailsPanel: { minHeight: 150 },
  tekkzDetailsGrid: { flexDirection: 'row-reverse', gap: 13, alignItems: 'stretch' },
  tekkzDetailsCopy: { flex: 1, alignItems: 'flex-end', justifyContent: 'center' },
  tekkzDetailsKicker: { color: '#D6B55D', fontSize: 8, fontWeight: '900', letterSpacing: 1.4, textAlign: 'right' },
  tekkzDetailsTitle: { color: '#F2F4F6', fontSize: 24, fontWeight: '900', textAlign: 'right' },
  tekkzDetailsSub: { color: '#929DA7', fontSize: 10, fontWeight: '800', textAlign: 'right', marginTop: 3 },
  tekkzDetailsPills: { flex: 1.5, flexDirection: 'row-reverse', gap: 8 },
  detailPill: { flex: 1, minHeight: 80, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,.07)', backgroundColor: 'rgba(5,8,12,.58)', padding: 11, justifyContent: 'center' },
  detailPillValue: { color: '#EAEFF2', fontSize: 11, fontWeight: '900', textAlign: 'right' },
  detailPillLabel: { color: '#69747F', fontSize: 7, fontWeight: '900', textAlign: 'right', marginTop: 4 },
  rewardSelectorPanel: { minHeight: 285 },
  rewardSelectorTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  rewardSelectorKicker: { color: '#AC874D', fontSize: 8, fontWeight: '900', letterSpacing: 1.3, textAlign: 'right' },
  rewardSelectorTitle: { color: '#F4F6F8', fontSize: 26, fontWeight: '900', textAlign: 'right', marginTop: 3 },
  rewardTokensPill: { minHeight: 54, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(244,207,100,.26)', backgroundColor: 'rgba(29,20,8,.58)', paddingHorizontal: 12, flexDirection: 'row-reverse', alignItems: 'center', gap: 7 },
  rewardTokensValue: { color: '#F4CF64', fontSize: 21, fontWeight: '900' },
  rewardTokensLabel: { color: '#7F858D', fontSize: 7, fontWeight: '900', letterSpacing: .8 },
  winSelector: { flexDirection: 'row-reverse', gap: 7, paddingVertical: 14 },  winChipActive: { backgroundColor: '#D72F40', borderColor: '#FF6A73', shadowColor: '#E43B4B', shadowOpacity: .23, shadowRadius: 10 },  winChipValueActive: { color: '#fff' },  winChipLabelActive: { color: '#FFDDE0' },
  rewardInfoGrid: { flexDirection: 'row-reverse', gap: 10 },
  storeHeaderCopy: { flex: 1, alignItems: 'flex-end' },
  storeKicker: { color: '#F0C85E', fontSize: 8, fontWeight: '900', letterSpacing: 1.4, textAlign: 'right' },
  storeTitleBig: { color: '#F4F6F8', fontSize: 22, fontWeight: '900', textAlign: 'right', marginTop: 2 },
  storeSub: { color: '#7E8994', fontSize: 10, fontWeight: '700', lineHeight: 16, textAlign: 'right', marginTop: 3, maxWidth: 760 },
  bigTokenBalance: { width: 116, height: 116, borderRadius: 23, borderWidth: 1, borderColor: 'rgba(244,207,100,.24)', backgroundColor: 'rgba(24,17,8,.56)', alignItems: 'center', justifyContent: 'center', gap: 2 },
  bigTokenValue: { color: '#F4CF64', fontSize: 29, fontWeight: '900' },
  bigTokenLabel: { color: '#7D858D', fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  storeGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 13 },
  storeGridMobile: { flexDirection: 'column' },
  storeCard: { width: '32.3%', minHeight: 315, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,.09)', backgroundColor: 'rgba(5,8,12,.74)', overflow: 'hidden', padding: 11, gap: 9 },  storeBody: { flex: 1, alignItems: 'flex-end' },
  storeTypePill: { borderRadius: 999, borderWidth: 1, borderColor: 'rgba(244,207,100,.15)', backgroundColor: 'rgba(244,207,100,.05)', paddingHorizontal: 7, paddingVertical: 4 },
  storeTypeText: { color: '#BCA86B', fontSize: 6, fontWeight: '900', letterSpacing: 1 },
  storeCardTitle: { color: '#EFF2F5', fontSize: 13, fontWeight: '900', textAlign: 'right', lineHeight: 17, marginTop: 6 },
  storeDetails: { color: '#78848F', fontSize: 9, fontWeight: '700', lineHeight: 14, textAlign: 'right', marginTop: 3 },  storeCostBox: { minHeight: 43, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.06)', flexDirection: 'row-reverse', alignItems: 'center', gap: 7, justifyContent: 'flex-end', paddingTop: 8 },
  storeCost: { color: '#F4CF64', fontSize: 21, fontWeight: '900' },
  tokenIcon: { backgroundColor: '#E9C153', borderWidth: 2, borderColor: '#FFF0A4', alignItems: 'center', justifyContent: 'center' },
  utilityRewardVisual: { alignItems: 'center', justifyContent: 'center', gap: 7 },
  utilityRewardCircle: { width: 76, height: 76, borderRadius: 38, borderWidth: 1, borderColor: 'rgba(244,207,100,.34)', backgroundColor: 'rgba(244,207,100,.08)', alignItems: 'center', justifyContent: 'center' },
  utilityRewardKind: { color: '#807A67', fontSize: 7, fontWeight: '900', letterSpacing: 1.1 },

  columnOnMobile: { flexDirection: 'column' },
  storeEmptyBox: { minHeight: 210, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: 'rgba(4,7,11,.50)', gap: 10 },
  pitchCircle: { position: 'absolute', left: '50%', top: '50%', width: 58, height: 58, marginLeft: -29, marginTop: -29, borderRadius: 29, borderWidth: 1, borderColor: 'rgba(255,255,255,.18)' },
  pitchGoalTop: { position: 'absolute', left: '39%', right: '39%', top: '3%', height: '5%', borderWidth: 1, borderColor: 'rgba(255,255,255,.15)', borderBottomWidth: 0 },
  pitchGoalBottom: { position: 'absolute', left: '39%', right: '39%', bottom: '3%', height: '5%', borderWidth: 1, borderColor: 'rgba(255,255,255,.15)', borderTopWidth: 0 },
  tacticsHero: { flexDirection: 'row-reverse', gap: 16, alignItems: 'stretch' },
  tacticsPitchWrap: { flex: 1.15, minWidth: 340 },
  tacticsControls: { flex: .85, minWidth: 290, justifyContent: 'center', alignItems: 'flex-end', gap: 7 },
  tacticsKicker: { color: '#C89748', fontSize: 8, fontWeight: '900', letterSpacing: 1.4, textAlign: 'right' },
  tacticsBigTitle: { color: '#F5F7F9', fontSize: 31, fontWeight: '900', textAlign: 'right' },
  tacticsBody: { color: '#7A8691', fontSize: 10, lineHeight: 16, fontWeight: '700', textAlign: 'right', maxWidth: 470 },
  formationSelectCard: { width: '100%', minHeight: 57, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(242,200,89,.28)', backgroundColor: '#0A1017', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  formationSelectCopy: { flex: 1, alignItems: 'flex-end' },
  formationSelectLabel: { color: '#6F7A84', fontSize: 7, fontWeight: '900', letterSpacing: 1.1, textAlign: 'right' },
  formationSelectValue: { color: '#F3D36A', fontSize: 16, fontWeight: '900', textAlign: 'right', marginTop: 2 },
  tacticsControlLabel: { width: '100%', color: '#7D8993', fontSize: 8, fontWeight: '900', textAlign: 'right', marginTop: 6 },
  rewardLogoStrip: { minHeight: 145, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(223,46,62,.36)', backgroundColor: 'rgba(22,6,10,.72)', padding: 13, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 13 },
  rewardLogoText: { flex: 1, alignItems: 'flex-end' },
  rewardLogoEyebrow: { color: '#D1AD5A', fontSize: 8, fontWeight: '900', letterSpacing: 1.3, textAlign: 'right' },
  rewardLogoTitle: { color: '#FFF0F2', fontSize: 29, fontWeight: '900', textAlign: 'right', marginTop: 2 },
  rewardLogoSub: { color: '#FF4D5A', fontSize: 9, fontWeight: '900', letterSpacing: 1, textAlign: 'right', marginTop: 3 },
  rewardLogoFrame: { width: 128, height: 128, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(241,198,88,.25)', backgroundColor: 'rgba(55,8,15,.42)', alignItems: 'center', justifyContent: 'center' },
  rewardLogoImage: { width: 115, height: 115 },
  communitySquadBlock: { borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,.07)', backgroundColor: 'rgba(7,11,16,.66)', padding: 11, gap: 5, marginTop: 8 },
  communitySquadTitle: { color: '#E8EDF1', fontSize: 13, fontWeight: '900', textAlign: 'right' },
  communitySquadHint: { color: '#717D88', fontSize: 8, lineHeight: 13, fontWeight: '700', textAlign: 'right' },
  communitySquadSaved: { color: '#E3C765', fontSize: 8, fontWeight: '900', textAlign: 'right' },
  formationPicker: { width: 'min(900px, 95%)', maxHeight: '84%', borderRadius: 20, borderWidth: 1, borderColor: '#E04151', backgroundColor: '#090D13', padding: 16, shadowColor: '#000', shadowOpacity: .70, shadowRadius: 32, shadowOffset: { width: 0, height: 18 }, zIndex: 2147483648, elevation: 2147483648 },
  formationPickerMobile: { width: '96%', padding: 13 },
  modalHeaderCopy: { flex: 1, alignItems: 'flex-end' },
  modalClose: { width: 35, height: 35, borderRadius: 11, backgroundColor: '#141A23', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', alignItems: 'center', justifyContent: 'center' },
  formationGridScroll: { marginTop: 12 },
  formationGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, paddingBottom: 8 },
  formationOption: { minHeight: 47, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', backgroundColor: '#0D131B', paddingHorizontal: 11, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  formationPickerOptionDesktop: { width: '31.8%' },
  formationOptionText: { color: '#F4F6F8', fontSize: 10, fontWeight: '900' },
  formationOptionTextActive: { color: '#FFFFFF' },
  selectorChipText: { color: '#F0F3F6', fontSize: 9, fontWeight: '900' },
  modalHeader: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 10 },
  modalKicker: { color: '#D2AA57', fontSize: 8, fontWeight: '900', letterSpacing: 1.3, textAlign: 'right' },
  modalTitle: { color: '#F5F7F9', fontSize: 22, fontWeight: '900', textAlign: 'right', marginTop: 2 },
  modalHint: { color: '#74808B', fontSize: 9, lineHeight: 14, fontWeight: '700', textAlign: 'right', marginTop: 4 },
  formationPickerOptionMobile: { width: '48.2%' },
  communitySquadBlock: { borderRadius: 14, borderWidth: 1, borderColor: 'rgba(221,48,65,.20)', backgroundColor: 'rgba(8,12,17,.58)', padding: 11, gap: 5, marginTop: 4 },
  communitySquadTitle: { color: '#E9EDF1', fontSize: 12, fontWeight: '900', textAlign: 'right' },
  communitySquadHint: { color: '#727E89', fontSize: 8, lineHeight: 13, fontWeight: '700', textAlign: 'right' },
  communitySquadSaved: { color: '#E6C969', fontSize: 8, fontWeight: '900', textAlign: 'right' },

  squadOverlay: ({ position: 'fixed' as any, left: 0, top: 0, width: '100vw' as any, height: '100vh' as any, zIndex: 2147483647, elevation: 2147483647, backgroundColor: 'rgba(0,0,0,.92)', padding: 14, justifyContent: 'center', alignItems: 'center', direction: 'rtl' } as any),
  squadBuilderPanel: { width: 'min(1180px, 96%)', maxHeight: '95%', borderRadius: 22, borderWidth: 1, borderColor: '#D83A4B', backgroundColor: '#07100D', padding: 14, zIndex: 2147483648, elevation: 2147483648, shadowColor: '#000', shadowOpacity: .82, shadowRadius: 34, shadowOffset: { width: 0, height: 18 } },
  squadBuilderHeader: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 10 },
  squadBuilderHeaderCopy: { flex: 1, alignItems: 'flex-end' },
  squadBuilderTitle: { color: '#F5F7FA', fontSize: 24, fontWeight: '900', textAlign: 'right' },
  squadBuilderHint: { color: '#75818C', fontSize: 9, lineHeight: 14, fontWeight: '700', textAlign: 'right', marginTop: 3 },
  squadBuilderScroll: { marginTop: 10 },
  squadBuilderContent: { gap: 9, paddingBottom: 12 },
  builderFormationButton: { minHeight: 56, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(241,199,88,.40)', backgroundColor: '#10191A', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
  builderFormationCopy: { flex: 1, alignItems: 'flex-end' },
  builderFormationValue: { color: '#F4D36B', fontSize: 17, fontWeight: '900', textAlign: 'right', marginTop: 2 },
  builderFormationMenu: { borderRadius: 13, borderWidth: 1, borderColor: 'rgba(222,58,78,.30)', backgroundColor: '#0B1114', padding: 8 },
  builderFormationGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 7 },
  builderFormationItem: { width: '31.7%', minHeight: 41, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,.07)', backgroundColor: '#11191D', alignItems: 'center', justifyContent: 'center' },
  builderFormationItemActive: { backgroundColor: 'rgba(214,44,62,.18)', borderColor: '#E24A59' },
  builderFormationItemText: { color: '#F0F4F5', fontSize: 9, fontWeight: '900' },
  builderFormationItemTextActive: { color: '#fff' },
  builderSelectionBox: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(90,211,157,.20)', backgroundColor: 'rgba(10,38,27,.55)', padding: 10, gap: 7 },
  builderSelectionText: { color: '#C6D2CB', fontSize: 9, lineHeight: 15, fontWeight: '700', textAlign: 'right' },
  builderActions: { flexDirection: 'row-reverse', gap: 7 },
  builderGhost: { minHeight: 34, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', backgroundColor: '#0D1512', paddingHorizontal: 10, justifyContent: 'center' },
  builderGhostText: { color: '#C0CAC4', fontSize: 8, fontWeight: '900' },
  builderBenchHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  builderBenchTitle: { color: '#DEE6E1', fontSize: 11, fontWeight: '900' },
  builderAddBench: { minHeight: 35, borderRadius: 10, backgroundColor: '#C92E41', paddingHorizontal: 10, flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  builderAddBenchText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  builderBenchRow: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  builderBenchCard: { borderRadius: 11, borderWidth: 2, borderColor: 'transparent' },
  builderBenchCardActive: { borderColor: '#E6C861' },
  builderNoBench: { color: '#6E7A74', fontSize: 9, paddingVertical: 10 },
  builderSearchPanel: { borderRadius: 13, borderWidth: 1, borderColor: 'rgba(232,195,84,.18)', backgroundColor: '#0B1210', padding: 10, gap: 7 },
  builderSearchLabel: { color: '#D9BD60', fontSize: 8, fontWeight: '900', textAlign: 'right' },
  builderSearchInput: { minHeight: 43, borderRadius: 11, borderWidth: 1, borderColor: 'rgba(255,255,255,.09)', backgroundColor: '#10181A', color: '#fff', paddingHorizontal: 11, textAlign: 'right' },
  builderSearchResult: { minHeight: 50, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,.07)', backgroundColor: '#111A17', paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  builderSearchRating: { color: '#F0CF66', fontSize: 18, fontWeight: '900', width: 34, textAlign: 'center' },
  builderSearchName: { color: '#F0F4F6', fontSize: 10, fontWeight: '900', textAlign: 'right' },
  builderSearchMeta: { color: '#7C8882', fontSize: 8, fontWeight: '800', textAlign: 'right', marginTop: 1 },
  builderSave: { minHeight: 46, borderRadius: 12, backgroundColor: '#D53043', alignItems: 'center', justifyContent: 'center', flexDirection: 'row-reverse', gap: 6, marginTop: 3 },
  builderSaveText: { color: '#fff', fontSize: 11, fontWeight: '900' },

  controllerShareHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 13, marginTop: 10 },
  controllerShareCopy: { flex: 1, alignItems: 'flex-end' },
  controllerShareTitle: { color: '#EFF3F5', fontSize: 19, fontWeight: '900', textAlign: 'right' },
  controllerShareSub: { color: '#75808B', fontSize: 9, lineHeight: 15, fontWeight: '700', textAlign: 'right', marginTop: 3 },
  controllerShareImage: { width: 150, height: 100 },
  controllerProgress: { minHeight: 57, marginTop: 10, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(222,67,84,.23)', backgroundColor: 'rgba(214,47,66,.08)', paddingHorizontal: 12, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  controllerProgressValue: { color: '#FF6874', fontSize: 20, fontWeight: '900' },
  controllerProgressText: { color: '#B8C1C8', fontSize: 9, fontWeight: '800' },
  controllerSettingsGrid: { gap: 9, marginTop: 11 },
  controllerField: { borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,.07)', backgroundColor: '#0A1116', padding: 10 },
  controllerFieldLabel: { color: '#D1D8DD', fontSize: 10, fontWeight: '900', textAlign: 'right' },
  controllerOptions: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6, marginTop: 7 },
  controllerOption: { minHeight: 34, borderRadius: 9, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', backgroundColor: '#111821', paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center' },
  controllerOptionActive: { backgroundColor: 'rgba(214,45,62,.22)', borderColor: '#E14A59' },
  controllerOptionText: { color: '#E0E5E8', fontSize: 8, fontWeight: '900' },
  controllerOptionTextActive: { color: '#fff' },
  controllerShareButton: { minHeight: 48, borderRadius: 12, backgroundColor: '#D62F42', alignItems: 'center', justifyContent: 'center', flexDirection: 'row-reverse', gap: 7, marginTop: 12 },
  controllerShareButtonDisabled: { backgroundColor: '#4A2328' },

  communityControllerGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 7, marginTop: 10 },
  communityControllerChip: { minWidth: 190, flexGrow: 1, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(216,47,66,.14)', backgroundColor: 'rgba(216,47,66,.05)', padding: 9 },
  communityControllerValue: { color: '#F0D26A', fontSize: 9, fontWeight: '900', textAlign: 'right' },
  communityControllerLabel: { color: '#727E89', fontSize: 7, fontWeight: '800', textAlign: 'right', marginTop: 2 },
  communitySharedSquad: { marginTop: 9, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(235,201,98,.14)', backgroundColor: 'rgba(235,201,98,.05)', padding: 9 },
  communitySharedSquadTitle: { color: '#DABC62', fontSize: 8, fontWeight: '900', textAlign: 'right' },
  communitySharedSquadText: { color: '#87918C', fontSize: 8, fontWeight: '800', textAlign: 'right', marginTop: 2 },
  myContentPanel: { marginTop: 1 },
  myUploadedCard: { borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,.07)', backgroundColor: '#0B1117', padding: 11, marginTop: 8 },
  myUploadedTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  myUploadedTitle: { flex: 1, color: '#EEF2F5', fontSize: 13, fontWeight: '900', textAlign: 'right' },
  statusBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1 },
  statusPending: { borderColor: 'rgba(238,198,88,.24)', backgroundColor: 'rgba(238,198,88,.06)' },
  statusApproved: { borderColor: 'rgba(97,215,152,.24)', backgroundColor: 'rgba(97,215,152,.06)' },
  statusRejected: { borderColor: 'rgba(225,61,79,.26)', backgroundColor: 'rgba(225,61,79,.06)' },
  statusBadgeText: { color: '#E7D374', fontSize: 7, fontWeight: '900' },
  myUploadedMeta: { color: '#7F8A95', fontSize: 8, fontWeight: '800', textAlign: 'right', marginTop: 4 },
  myUploadedBody: { color: '#A0AAB2', fontSize: 9, lineHeight: 15, fontWeight: '700', textAlign: 'right', marginTop: 5 },
  myUploadedSquad: { color: '#D6B962', fontSize: 8, fontWeight: '900', textAlign: 'right', marginTop: 6 },
  myEmptyContent: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 7 },
  myEmptyContentTitle: { color: '#E9EDF1', fontSize: 15, fontWeight: '900' },
  myEmptyContentText: { color: '#737E89', fontSize: 9, lineHeight: 15, fontWeight: '700', textAlign: 'center', maxWidth: 520 },

});

