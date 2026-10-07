import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

import { Screen } from '@/components/ui';
import { SbcRewardPack, type PackVisual } from '@/components/SbcRewardPack';
import { getSupabase } from '@/lib/supabase';
import { useApp } from '@/lib/store';
import type { PlatformId } from '@/lib/types';

type IconName = keyof typeof Ionicons.glyphMap;
type SectionId = 'center' | 'community' | 'rewards' | 'tekkz' | 'tactics' | 'controller';

type TekkzRole = [string, string];

const NAV: { id: SectionId; label: string; short: string; icon: IconName }[] = [
  { id: 'center', label: 'מרכז Champions', short: 'Champions מרכז', icon: 'trophy-outline' },
  { id: 'community', label: 'שחקני הקהילה', short: 'שחקני הקהילה', icon: 'people-outline' },
  { id: 'rewards', label: 'פרסים', short: 'פרסים', icon: 'gift-outline' },
  { id: 'tekkz', label: 'TEKKZ Pro', short: 'TEKKZ Pro', icon: 'star-outline' },
  { id: 'tactics', label: 'טקטיקות והרכבים', short: 'טקטיקות', icon: 'git-network-outline' },
  { id: 'controller', label: 'הגדרות שלט', short: 'שלטים', icon: 'game-controller-outline' },
];

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
  settings: Record<string, string>;
  image_uris: string[];
  featured: boolean;
  created_at: string;
};

type RewardTier = {
  wins: number;
  rank: string;
  coins: number;
  tokens: number;
};

type TokenReward = {
  title: string;
  details: string;
  tokens: number;
  visual: PackVisual;
  packLabel?: string;
  tradeable?: boolean;
};

const REWARD_TIERS: RewardTier[] = [
  { wins: 0, rank: 'לא מדורג', coins: 0, tokens: 0 },
  { wins: 1, rank: 'Contender V', coins: 0, tokens: 15 },
  { wins: 2, rank: 'Contender IV', coins: 0, tokens: 20 },
  { wins: 3, rank: 'Contender III', coins: 0, tokens: 30 },
  { wins: 4, rank: 'Contender II', coins: 0, tokens: 40 },
  { wins: 5, rank: 'Contender I', coins: 2500, tokens: 50 },
  { wins: 6, rank: 'Champions V', coins: 5000, tokens: 60 },
  { wins: 7, rank: 'Champions IV', coins: 10000, tokens: 75 },
  { wins: 8, rank: 'Champions III', coins: 15000, tokens: 90 },
  { wins: 9, rank: 'Champions II', coins: 25000, tokens: 110 },
  { wins: 10, rank: 'Champions I', coins: 35000, tokens: 135 },
  { wins: 11, rank: 'Elite V', coins: 50000, tokens: 165 },
  { wins: 12, rank: 'Elite IV', coins: 75000, tokens: 215 },
  { wins: 13, rank: 'Elite III', coins: 105000, tokens: 275 },
  { wins: 14, rank: 'Elite II', coins: 145000, tokens: 350 },
  { wins: 15, rank: 'Elite I', coins: 250000, tokens: 450 },
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
  { title: '1 of 5 FUT Champions TOTW 3 Player Pick', details: 'Choose 1 of 5 FUT Champions TOTW 3', tokens: 50, visual: 'pick', packLabel: 'TOTW', tradeable: false },
  { title: '2x 86+ Gold Players Pack', details: '2 Gold Player Items rated 86+', tokens: 75, visual: 'gold-jumbo', packLabel: '86+', tradeable: true },
  { title: '10x 83+ Gold Players Pack', details: '10 Gold Player Items rated 83+', tokens: 75, visual: 'gold', packLabel: '83+', tradeable: true },
  { title: '10x 84+ Gold Players Pack', details: '10 Gold Player Items rated 84+', tokens: 100, visual: 'gold', packLabel: '84+', tradeable: false },
  { title: '1 of 5 82+ FUT Champions TOTW 3 Player Pick', details: 'Choose 1 of 5 FUT Champions TOTW 3 rated 82+', tokens: 100, visual: 'pick', packLabel: 'TOTW', tradeable: true },
  { title: '5x 86+ Gold Players Pack', details: '5 Gold Player Items rated 86+', tokens: 125, visual: 'gold-jumbo', packLabel: '86+', tradeable: false },
  { title: '3x 88+ Gold Players Pack', details: '3 Gold Player Items rated 88+', tokens: 200, visual: 'gold-giant', packLabel: '88+', tradeable: true },
];

const PREVIEW_RUN: ChampionsRun = {
  matchesPlayed: 15,
  wins: 9,
  losses: 6,
  cqp: 750,
  rank: 4,
};

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
        colors={['rgba(13,14,20,.97)', 'rgba(7,9,14,.98)']}
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
  const positions = [
    ['50%', '10%'],
    ['24%', '28%'],
    ['76%', '28%'],
    ['50%', '39%'],
    ['34%', '53%'],
    ['66%', '53%'],
    ['13%', '72%'],
    ['38%', '71%'],
    ['62%', '71%'],
    ['87%', '72%'],
    ['50%', '91%'],
  ];

  return (
    <View style={[styles.pitch, compact && styles.pitchCompact]}>
      <View style={styles.pitchMidline} />
      <View style={styles.pitchBoxTop} />
      <View style={styles.pitchBoxBottom} />
      {positions.map(([left, top], index) => (
        <View
          key={index}
          style={[
            styles.pitchDot,
            compact && styles.pitchDotCompact,
            { left: left as any, top: top as any },
          ]}
        />
      ))}
      <View style={styles.pitchBadge}>
        <Text style={styles.pitchBadgeText}>{formation}</Text>
      </View>
    </View>
  );
}

function TekkzCard({ selected, compact = false }: { selected: boolean; compact?: boolean }) {
  return (
    <View style={[styles.tekkzCard, selected && styles.tekkzCardSelected, compact && styles.tekkzCardCompact]}>
      <View style={styles.cardTopLine}>
        <View style={styles.sourceBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#68E09B" />
          <Text style={styles.sourceBadgeText}>VERIFIED SOURCE</Text>
        </View>
        <Text style={styles.proBadgeText}>TEKKZ PRO</Text>
      </View>
      <View style={styles.playerCardBody}>
        <View style={styles.playerPortrait}>
          <View style={styles.playerHead}>
            <Text style={styles.playerInitial}>T</Text>
          </View>
          <View style={styles.playerShirt}>
            <Text style={styles.playerNumber}>7</Text>
          </View>
        </View>
        <View style={styles.playerCardCopy}>
          <View style={styles.nameRow}>
            <Text style={styles.playerName}>TEKKZ</Text>
            <Text style={styles.playerCountry}>🇬🇧</Text>
          </View>
          <Text style={styles.playerRole}>EA FC 27 · Pro Player</Text>
          <Text style={styles.playerFormation}>4-4-1-1 (2)</Text>
          <Text style={styles.playerSetup}>Short Passing · High · Line Height 65</Text>
        </View>
        <MiniPitch formation="4-4-1-1 (2)" compact />
      </View>
      <View style={styles.cardMetaRow}>
        <View style={styles.cardMetaItem}>
          <Ionicons name="game-controller-outline" size={15} color="#BBC3CB" />
          <Text style={styles.cardMetaText}>הגדרות שלט</Text>
        </View>
        <View style={styles.cardMetaItem}>
          <Ionicons name="git-network-outline" size={15} color="#BBC3CB" />
          <Text style={styles.cardMetaText}>טקטיקה</Text>
        </View>
        <View style={styles.cardMetaItem}>
          <Ionicons name="document-text-outline" size={15} color="#BBC3CB" />
          <Text style={styles.cardMetaText}>מקור חיצוני</Text>
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

function RewardStoreCard({ item }: { item: TokenReward }) {
  return (
    <View style={styles.storeCard}>
      <View style={styles.storeVisual}>
        <SbcRewardPack visual={item.visual} size={64} label={item.packLabel} />
      </View>
      <View style={styles.storeCopy}>
        <Text style={styles.storeTitle}>{item.title}</Text>
        <Text style={styles.storeDetails}>{item.details}</Text>
        <Text style={styles.storeTradeable}>{item.tradeable ? 'TRADEABLE' : 'UNTRADEABLE'}</Text>
      </View>
      <View style={styles.storeCost}>
        <Text style={styles.storeCostValue}>{item.tokens}</Text>
        <Text style={styles.storeCostLabel}>TOKENS</Text>
      </View>
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

  // The approved reference is only a Preview fallback. Once the user saves a run,
  // these values come from Supabase and persist for that account.
  const [run, setRun] = useState<ChampionsRun>(PREVIEW_RUN);
  const [editingRun, setEditingRun] = useState(false);
  const [draftWins, setDraftWins] = useState(String(PREVIEW_RUN.wins));
  const [draftLosses, setDraftLosses] = useState(String(PREVIEW_RUN.losses));
  const [draftMatches, setDraftMatches] = useState(String(PREVIEW_RUN.matchesPlayed));
  const [draftCqp, setDraftCqp] = useState(String(PREVIEW_RUN.cqp));

  const [community, setCommunity] = useState<CommunityItem[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [formation, setFormation] = useState('4-4-1-1 (2)');
  const [saving, setSaving] = useState(false);

  const canView = app.user?.isAdmin === true;

  async function loadLiveData() {
    if (!app.user?.id) return;
    const supabase = getSupabase();

    const [runResult, communityResult] = await Promise.all([
      supabase
        .from('champions_runs')
        .select('matches_played,wins,losses,cqp,rank,updated_at')
        .eq('user_id', app.user.id)
        .maybeSingle(),
      supabase
        .from('champions_content')
        .select('id,user_id,kind,title,body,formation,platform,settings,image_uris,featured,created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(30),
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
      setDraftWins(String(next.wins));
      setDraftLosses(String(next.losses));
      setDraftMatches(String(next.matchesPlayed));
      setDraftCqp(String(next.cqp));
    } else {
      setRun(PREVIEW_RUN);
    }

    if (!communityResult.error) {
      setCommunity((communityResult.data ?? []) as CommunityItem[]);
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

  async function publish() {
    if (!app.user?.id) {
      Alert.alert('צריך להתחבר', 'כדי להעלות תוכן צריך להתחבר.');
      return;
    }

    if (title.trim().length < 2 || body.trim().length < 2) {
      Alert.alert('חסר תוכן', 'מלא כותרת והסבר קצר.');
      return;
    }

    setSaving(true);
    const { error } = await getSupabase().from('champions_content').insert({
      user_id: app.user.id,
      kind: 'tactic',
      title: title.trim(),
      body: body.trim(),
      formation: formation.trim() || null,
      platform,
      settings: {},
      image_uris: [],
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
    setFormation('4-4-1-1 (2)');
    setShowComposer(false);
    Alert.alert('נשלח לבדיקה', 'הטקטיקה תופיע בקהילת Champions רק לאחר אישור.');
  }

  const reward = rewardForWins(run.wins);
  const form = run.wins - run.losses;
  const availableRewards = useMemo(
    () => TOKEN_STORE.filter((item) => item.tokens <= reward.tokens),
    [reward.tokens],
  );

  const content = useMemo(() => {
    if (section === 'tekkz') {
      return (
        <View style={styles.contentStack}>
          <SectionHeading
            icon="star-outline"
            eyebrow="TEKKZ PRO"
            title="TEKKZ · נתוני FC27"
            subtitle="ה־setup המאומת של TEKKZ הוא ברירת המחדל. אין כאן Record או CQP מומצאים."
          />
          <TekkzCard selected />
          <View style={[styles.tekkzDetailGrid, mobile && styles.oneCol]}>
            <Panel style={styles.tekkzDetailMain}>
              <View style={styles.detailFacts}>
                <View style={styles.detailFact}><Text style={styles.detailFactValue}>Short Passing</Text><Text style={styles.detailFactLabel}>BUILD UP STYLE</Text></View>
                <View style={styles.detailFact}><Text style={styles.detailFactValue}>High</Text><Text style={styles.detailFactLabel}>DEFENSIVE APPROACH</Text></View>
                <View style={styles.detailFact}><Text style={styles.detailFactValue}>65</Text><Text style={styles.detailFactLabel}>LINE HEIGHT</Text></View>
              </View>
              <View style={styles.roleGrid}>
                {TEKKZ_ROLES.map(([position, role], index) => (
                  <View key={position + index} style={styles.roleChip}>
                    <Text style={styles.rolePosition}>{position}</Text>
                    <Text style={styles.roleText}>{role}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.sourceNote}>מקור: FUTSettings · קוד GJgwMwH%QEao</Text>
            </Panel>
            <Panel style={styles.tekkzPitchPanel}>
              <Text style={styles.pitchTitle}>הטקטיקה של TEKKZ</Text>
              <Text style={styles.pitchSub}>4-4-1-1 (2)</Text>
              <MiniPitch formation="4-4-1-1 (2)" />
            </Panel>
          </View>
        </View>
      );
    }

    if (section === 'rewards') {
      return (
        <View style={styles.contentStack}>
          <SectionHeading
            icon="gift-outline"
            eyebrow="CHAMPIONS REWARDS"
            title="הפרסים לפי מספר הניצחונות"
            subtitle="בחר מספר ניצחונות כדי לראות את הפרס הרשמי, ואז מוצגות רק חבילות ה־Token Store שאתה יכול להרשות לעצמך."
          />
          <Panel>
            <Text style={styles.selectorTitle}>ניצחונות: {run.wins} / 15</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.winSelector}>
              {Array.from({ length: 16 }, (_, wins) => (
                <Pressable
                  key={wins}
                  onPress={() => setRun((current) => ({
                    ...current,
                    wins,
                    losses: Math.max(0, current.matchesPlayed - wins),
                  }))}
                  style={[styles.winChip, run.wins === wins && styles.winChipActive]}
                >
                  <Text style={[styles.winChipValue, run.wins === wins && styles.winChipValueActive]}>{wins}</Text>
                  <Text style={[styles.winChipLabel, run.wins === wins && styles.winChipLabelActive]}>W</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.rewardSummaryGrid}>
              <MetricCard label="REWARD RANK" value={reward.rank} tone="gold" note={String(run.wins) + ' wins'} />
              <MetricCard label="COINS" value={formatCoins(reward.coins)} tone="gold" note="Season 1 reward" />
              <MetricCard label="CHAMPIONS TOKENS" value={String(reward.tokens)} tone="red" note="Spend in Token Store" />
              <MetricCard label="MY CQP" value={formatCoins(run.cqp)} tone="green" note="הנקודות שנשמרו לחשבון" />
            </View>
          </Panel>

          <Panel>
            <View style={styles.storeHeader}>
              <View>
                <Text style={styles.storeHeaderEyebrow}>CHAMPIONS TOKEN STORE</Text>
                <Text style={styles.storeHeaderTitle}>רק החבילות שאתה יכול לקנות</Text>
                <Text style={styles.storeHeaderSub}>{reward.tokens} Tokens זמינים · הצעות יקרות יותר מוסתרות.</Text>
              </View>
              <View style={styles.tokenBadge}>
                <Text style={styles.tokenBadgeValue}>{reward.tokens}</Text>
                <Text style={styles.tokenBadgeLabel}>TOKENS</Text>
              </View>
            </View>
            {availableRewards.length ? (
              availableRewards.map((item) => <RewardStoreCard key={item.title + String(item.tokens)} item={item} />)
            ) : (
              <Text style={styles.storeEmpty}>אין עדיין מספיק Tokens לחבילה מהחנות.</Text>
            )}
          </Panel>
        </View>
      );
    }

    if (section === 'controller') {
      return (
        <View style={styles.contentStack}>
          <SectionHeading
            icon="game-controller-outline"
            eyebrow="CONTROLLER LAB"
            title="הגדרות שלט"
            subtitle="Xbox ו־PlayStation עם הלוגואים והנכסים שכבר קיימים באתר."
          />
          <Panel>
            <View style={styles.platformRow}>
              <PlatformPill value="xbox" selected={platform === 'xbox'} onPress={() => setPlatform('xbox')} />
              <PlatformPill value="ps5" selected={platform === 'ps5'} onPress={() => setPlatform('ps5')} />
            </View>
            <View style={styles.controllerHero}>
              <Image
                source={platform === 'xbox' ? require('@/assets/images/platform-xbox.png') : require('@/assets/images/platform-ps5.png')}
                resizeMode="contain"
                style={styles.controllerImage}
              />
              <View style={styles.controllerCopy}>
                <Text style={styles.controllerTitle}>{platform === 'xbox' ? 'Xbox Series X|S' : 'PlayStation 5 · DualSense'}</Text>
                <Text style={styles.controllerSub}>הגדרות תחרותיות ל־FC27 · {platform === 'xbox' ? 'Xbox' : 'PlayStation'}</Text>
              </View>
            </View>
            {CONTROLLER_ROWS.map(([label, value]) => (
              <View key={label} style={styles.settingRow}>
                <Text style={styles.settingValue}>{value}</Text>
                <Text style={styles.settingLabel}>{label}</Text>
              </View>
            ))}
          </Panel>
        </View>
      );
    }

    if (section === 'community') {
      return (
        <View style={styles.contentStack}>
          <SectionHeading
            icon="people-outline"
            eyebrow="COMMUNITY HUB"
            title="שחקני הקהילה"
            subtitle="רק טקטיקות שאושרו מופיעות כאן. בהתחלה האזור נשאר ריק."
          />
          <View style={styles.communityHeader}>
            <Text style={styles.communityCount}>{String(community.length)} פריטים מאושרים</Text>
            {app.user ? (
              <Pressable style={styles.publishButton} onPress={() => setShowComposer(true)}>
                <Text style={styles.publishButtonText}>העלה טקטיקה</Text>
              </Pressable>
            ) : null}
          </View>
          {community.length ? (
            community.map((item) => (
              <Panel key={item.id}>
                <Text style={styles.communityItemTitle}>{item.title}</Text>
                <Text style={styles.communityItemMeta}>
                  {item.formation || 'ללא מערך'} · {item.platform === 'xbox' ? 'Xbox' : item.platform === 'ps5' ? 'PlayStation' : item.platform}
                </Text>
                <Text style={styles.communityItemBody}>{item.body}</Text>
              </Panel>
            ))
          ) : <EmptyCommunity />}
        </View>
      );
    }

    if (section === 'tactics') {
      return (
        <View style={styles.contentStack}>
          <SectionHeading
            icon="git-network-outline"
            eyebrow="TACTICS LIBRARY"
            title="טקטיקות והרכבים"
            subtitle="רק setup שנבדק. בשלב הראשון מוצג TEKKZ, ומידע קהילתי מתווסף רק לאחר אישור."
          />
          <Panel>
            <View style={styles.tacticsHeader}>
              <View>
                <Text style={styles.tacticTitle}>TEKKZ · 4-4-1-1 (2)</Text>
                <Text style={styles.tacticSub}>Short Passing · High · Line Height 65</Text>
                <Text style={styles.sourceNote}>קוד: GJgwMwH%QEao · מקור: FUTSettings</Text>
              </View>
              <View style={styles.sourceBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#68E09B" />
                <Text style={styles.sourceBadgeText}>VERIFIED</Text>
              </View>
            </View>
            <MiniPitch formation="4-4-1-1 (2)" />
            <View style={styles.roleGrid}>
              {TEKKZ_ROLES.map(([position, role], index) => (
                <View key={position + index} style={styles.roleChip}>
                  <Text style={styles.rolePosition}>{position}</Text>
                  <Text style={styles.roleText}>{role}</Text>
                </View>
              ))}
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

        <View style={[styles.twoCol, mobile && styles.oneCol]}>
          <Panel>
            <SectionHeading icon="star-outline" eyebrow="FEATURED PRO" title="TEKKZ" subtitle="TEKKZ הוא ברירת המחדל עד שיש תוכן קהילתי מאושר." />
            <TekkzCard compact />
          </Panel>
          <Panel>
            <SectionHeading icon="gift-outline" eyebrow="REWARD SNAPSHOT" title="הפרס של הריצה" subtitle={String(run.wins) + ' wins · ' + String(reward.tokens) + ' Champions Tokens'} />
            <View style={styles.rewardMiniGrid}>
              <View style={styles.rewardMini}><Text style={styles.rewardMiniValue}>{formatCoins(reward.coins)}</Text><Text style={styles.rewardMiniLabel}>COINS</Text></View>
              <View style={styles.rewardMini}><Text style={styles.rewardMiniValue}>{reward.tokens}</Text><Text style={styles.rewardMiniLabel}>TOKENS</Text></View>
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
    platform,
    reward,
    run,
    saving,
    section,
  ]);

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
          <LinearGradient
            colors={['rgba(112,5,17,.62)', 'rgba(27,5,10,.73)', 'rgba(7,10,15,.86)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />
            <View style={styles.heroTop}>
              <View style={styles.heroStats}>
                <MetricCard label="FINAL STATUS" value={run.matchesPlayed >= 15 ? 'READY' : 'LIVE'} tone="green" note="Live account data" />
                <MetricCard label="CQP PROGRESS" value={formatCoins(run.cqp)} tone="gold" note="הנתון שלך" />
                <MetricCard label="המאזן שלי" value={String(run.losses) + ' - ' + String(run.wins)} tone="red" note={String(run.losses) + ' הפסדים · ' + String(run.wins) + ' ניצחונות'} />
              </View>
              <View style={styles.heroTitleWrap}>
                <Text style={styles.heroEyebrow}>COMPETE · IMPROVE · WIN</Text>
                <Text style={styles.heroTitle}>FUT CHAMPIONS</Text>
                <Text style={styles.heroSubtitle}>המסע שלך. התוצאות שלך. הפרסים שלך.</Text>
                <View style={styles.heroInfoRow}>
                  <View><Text style={styles.heroInfoBig}>DUAL</Text><Text style={styles.heroInfoSmall}>CONTROLLER LAB</Text></View>
                  <View><Text style={styles.heroInfoBig}>PRO</Text><Text style={styles.heroInfoSmall}>TEKKZ SETUP</Text></View>
                  <View><Text style={styles.heroInfoBig}>CQP</Text><Text style={styles.heroInfoSmall}>QUALIFICATION</Text></View>
                  <View><Text style={styles.heroInfoBig}>15</Text><Text style={styles.heroInfoSmall}>MATCH FINALS</Text></View>
                </View>
              </View>
              <View style={styles.heroCrest}>
                <Image source={require('@/assets/crests/championship.png')} resizeMode="contain" style={styles.heroCrestImage} />
              </View>
            </View>

            <View style={styles.tabBar}>
              {NAV.map((item) => (
                <Pressable key={item.id} onPress={() => setSection(item.id)} style={[styles.heroTab, section === item.id && styles.heroTabActive]}>
                  <Ionicons name={item.icon} size={15} color={section === item.id ? '#fff' : '#8D99A4'} />
                  <Text style={[styles.heroTabText, section === item.id && styles.heroTabTextActive]}>{item.short}</Text>
                </Pressable>
              ))}
            </View>
          </LinearGradient>

          <View style={styles.contentArea}>{content}</View>
        </View>
      </View>

      {showComposer ? (
        <View style={styles.modalBackdrop}>
          <Panel style={styles.composer}>
            <View style={styles.composerHeader}>
              <Text style={styles.composerTitle}>העלה טקטיקה משלך</Text>
              <Pressable onPress={() => setShowComposer(false)}><Ionicons name="close" size={21} color="#fff" /></Pressable>
            </View>
            <TextInput value={title} onChangeText={setTitle} placeholder="כותרת" placeholderTextColor="#6f7984" style={styles.textInput} />
            <TextInput value={formation} onChangeText={setFormation} placeholder="מערך" placeholderTextColor="#6f7984" style={styles.textInput} />
            <TextInput value={body} onChangeText={setBody} placeholder="הסבר קצר על הטקטיקה" placeholderTextColor="#6f7984" multiline style={[styles.textInput, styles.textArea]} />
            <View style={styles.platformRow}>
              <PlatformPill value="xbox" selected={platform === 'xbox'} onPress={() => setPlatform('xbox')} />
              <PlatformPill value="ps5" selected={platform === 'ps5'} onPress={() => setPlatform('ps5')} />
            </View>
            <Pressable style={styles.publishConfirm} onPress={() => void publish()} disabled={saving}>
              <Text style={styles.publishConfirmText}>{saving ? 'שומר…' : 'שלח לאישור'}</Text>
            </Pressable>
          </Panel>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  mainLayout: { flexDirection: 'row', alignItems: 'stretch', direction: 'ltr' },
  sidebar: { width: 230, backgroundColor: 'rgba(5,8,12,.72)', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,.06)', paddingTop: 22, paddingHorizontal: 12, minHeight: 900, direction: 'rtl' },
  sidebarTitle: { color: '#79858F', fontSize: 11, fontWeight: '900', letterSpacing: 1.6, textAlign: 'center', marginBottom: 15 },
  sidebarItem: { minHeight: 52, borderRadius: 13, paddingHorizontal: 11, marginBottom: 9, backgroundColor: 'rgba(9,12,17,.50)', borderWidth: 1, borderColor: 'rgba(255,255,255,.03)', flexDirection: 'row', alignItems: 'center', gap: 9 },
  sidebarItemActive: { backgroundColor: 'rgba(221,23,45,.72)', borderColor: 'rgba(255,86,103,.82)', shadowColor: '#E43043', shadowOpacity: .22, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  sidebarIndex: { color: '#65717D', fontSize: 9, fontWeight: '800', width: 19 },
  sidebarLabel: { flex: 1, color: '#9AA6B1', fontSize: 12, fontWeight: '800', textAlign: 'right' },
  sidebarLabelActive: { color: '#fff' },
  main: { flex: 1, minWidth: 0, direction: 'rtl' },
  heroLegacy: { minHeight: 400, margin: 24, marginBottom: 18, borderRadius: 23, borderWidth: 1, borderColor: 'rgba(237,55,72,.55)', overflow: 'hidden', position: 'relative', shadowColor: '#000', shadowOpacity: .30, shadowRadius: 22, shadowOffset: { width: 0, height: 12 } },
  heroGlowOne: { position: 'absolute', width: 500, height: 500, borderRadius: 250, right: -160, top: -190, backgroundColor: 'rgba(238,37,56,.15)' },
  heroGlowTwo: { position: 'absolute', width: 360, height: 360, borderRadius: 180, left: -160, bottom: -190, backgroundColor: 'rgba(214,33,53,.11)' },
  heroTop: { padding: 28, flexDirection: 'row', alignItems: 'center', gap: 20, direction: 'ltr', minHeight: 266 },
  heroStats: { width: 555, flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  metricCard: { flex: 1, minHeight: 166, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(255,255,255,.10)', backgroundColor: 'rgba(4,8,12,.55)', padding: 15, justifyContent: 'center' },
  metricLabel: { color: '#6D7883', fontSize: 10, fontWeight: '900', textAlign: 'right' },
  metricValue: { color: '#F2CC64', fontSize: 31, fontWeight: '900', textAlign: 'right', marginTop: 11 },
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

  pitch: { flex: 1, minHeight: 252, backgroundColor: '#103622', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(135,202,160,.32)', overflow: 'hidden', position: 'relative' },
  pitchCompact: { width: 128, flex: 0, minHeight: 145, borderRadius: 13 },
  pitchMidline: { position: 'absolute', left: 9, right: 9, top: '50%', height: 1, backgroundColor: 'rgba(255,255,255,.20)' },
  pitchBoxTop: { position: 'absolute', left: '25%', right: '25%', top: '7%', height: '20%', borderWidth: 1, borderColor: 'rgba(255,255,255,.17)', borderBottomWidth: 0 },
  pitchBoxBottom: { position: 'absolute', left: '25%', right: '25%', bottom: '7%', height: '20%', borderWidth: 1, borderColor: 'rgba(255,255,255,.17)', borderTopWidth: 0 },
  pitchDot: { position: 'absolute', width: 17, height: 17, borderRadius: 9, marginLeft: -8, marginTop: -8, backgroundColor: '#E5C75C', borderWidth: 2, borderColor: '#FFF2A4' },
  pitchDotCompact: { width: 11, height: 11, borderRadius: 6, marginLeft: -5, marginTop: -5 },
  pitchBadge: { position: 'absolute', left: 9, bottom: 9, borderRadius: 9, backgroundColor: 'rgba(6,12,10,.73)', paddingHorizontal: 8, paddingVertical: 5 },
  pitchBadgeText: { color: '#D7EBDE', fontSize: 9, fontWeight: '900' },

  panelLegacy: { position: 'relative', overflow: 'hidden', backgroundColor: '#0A0F15', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', padding: 17, gap: 12 },
  settingRow: { minHeight: 35, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,.05)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', direction: 'ltr', gap: 9 },
  settingLabel: { color: '#6E7984', fontSize: 10, fontWeight: '800', textAlign: 'right', flex: 1 },
  settingValue: { color: '#DCE2E7', fontSize: 11, fontWeight: '900', textAlign: 'right' },

  tekkzCard: { borderRadius: 18, borderWidth: 1, borderColor: 'rgba(225,58,69,.23)', backgroundColor: 'rgba(7,11,16,.86)', padding: 14, gap: 10 },
  tekkzCardSelected: { borderColor: 'rgba(225,58,69,.53)' },
  tekkzCardCompact: { minHeight: 0 },
  cardTopLine: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  sourceBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: 'rgba(104,224,155,.20)', backgroundColor: 'rgba(104,224,155,.05)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  sourceBadgeText: { color: '#79D59F', fontSize: 8, fontWeight: '900' },
  proBadgeText: { color: '#E3B25A', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  playerCardBody: { flexDirection: 'row-reverse', gap: 12, alignItems: 'stretch' },
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
  hero: { minHeight: 400, margin: 24, marginBottom: 18, borderRadius: 23, borderWidth: 1, borderColor: 'rgba(237,55,72,.55)', overflow: 'hidden', position: 'relative', shadowColor: '#000', shadowOpacity: .30, shadowRadius: 22, shadowOffset: { width: 0, height: 12 } },
  metricBarFill: { height: '100%', width: '75%', backgroundColor: '#F2C95F' },
  winSelector: { gap: 7, paddingVertical: 9, flexDirection: 'row-reverse' },
  winChip: { width: 48, height: 48, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', backgroundColor: '#0A1017', alignItems: 'center', justifyContent: 'center' },
  winChipActive: { backgroundColor: '#D93140', borderColor: '#FF6370' },
  winChipValue: { color: '#DCE2E7', fontSize: 15, fontWeight: '900' },
  winChipValueActive: { color: '#fff' },
  winChipLabel: { color: '#67737E', fontSize: 7, fontWeight: '900' },
  winChipLabelActive: { color: '#FECFD3' },
  rewardSummaryGrid: { flexDirection: 'row-reverse', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  selectorTitle: { color: '#F0F3F6', fontSize: 15, fontWeight: '900', textAlign: 'right' },
  storeHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  storeHeaderEyebrow: { color: '#D7B351', fontSize: 8, fontWeight: '900', letterSpacing: 1.4, textAlign: 'right' },
  storeHeaderTitle: { color: '#F2F4F6', fontSize: 20, fontWeight: '900', textAlign: 'right' },
  storeHeaderSub: { color: '#78848F', fontSize: 10, fontWeight: '700', textAlign: 'right', marginTop: 2 },
  tokenBadge: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: '#E8BF4E', backgroundColor: '#0D1419', alignItems: 'center', justifyContent: 'center' },
  tokenBadgeValue: { color: '#F4D26B', fontSize: 24, fontWeight: '900' },
  tokenBadgeLabel: { color: '#7F8993', fontSize: 7, fontWeight: '900' },
  storeCard: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.06)' },
  storeVisual: { width: 82, alignItems: 'center', justifyContent: 'center' },
  storeCopy: { flex: 1, alignItems: 'flex-end' },
  storeTitle: { color: '#EFF2F5', fontSize: 13, fontWeight: '900', textAlign: 'right' },
  storeDetails: { color: '#808B96', fontSize: 10, fontWeight: '700', textAlign: 'right', marginTop: 3 },
  storeTradeable: { color: '#7FBE98', fontSize: 8, fontWeight: '900', marginTop: 4 },
  storeCost: { minWidth: 70, alignItems: 'center', justifyContent: 'center' },
  storeCostValue: { color: '#F2CF62', fontSize: 20, fontWeight: '900' },
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
  tacticTitle: { color: '#EEF1F4', fontSize: 20, fontWeight: '900', textAlign: 'right' },
  tacticSub: { color: '#7A8690', fontSize: 10, fontWeight: '800', textAlign: 'right', marginTop: 3 },
  sourceBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: 'rgba(104,224,155,.20)', backgroundColor: 'rgba(104,224,155,.05)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  sourceBadgeText: { color: '#79D59F', fontSize: 8, fontWeight: '900' },
  heroCrestImage: { width: 82, height: 96 },
  textInput: { minHeight: 44, borderRadius: 11, borderWidth: 1, borderColor: 'rgba(255,255,255,.10)', backgroundColor: '#0A1017', color: '#fff', paddingHorizontal: 12, fontSize: 13, textAlign: 'right' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  publishConfirm: { minHeight: 46, borderRadius: 11, backgroundColor: '#D92F3B', alignItems: 'center', justifyContent: 'center' },
  publishConfirmText: { color: '#fff', fontSize: 12, fontWeight: '900' },

});

