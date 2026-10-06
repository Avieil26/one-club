import { useMemo, useState, type ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Screen } from '@/components/ui';
import { useApp } from '@/lib/store';

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

const TOP_LINKS = [
  ['בית', '/'],
  ['קריירה', '/career'],
  ['אולטימייט', '/ultimate'],
  ['FUT Champions', '/champions'],
  ['SBC', '/sbc'],
  ['משחקונים', '/games'],
  ['לוח', '/board'],
] as const;

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
  const router = useRouter();
  const { width } = useWindowDimensions();
  const mobile = width < 900;
  const [section, setSection] = useState<SectionId>('center');

  const canView = app.user?.isAdmin === true;

  const selectSection = (id: SectionId) => setSection(id);

  const content = useMemo(() => {
    if (section === 'community') {
      return (
        <View style={styles.contentStack}>
          <SectionHeading icon="people-outline" eyebrow="COMMUNITY HUB" title="שחקני הקהילה" subtitle="תוכן אמיתי של שחקני FC27 יופיע כאן לאחר אישור." />
          <EmptyCommunity />
        </View>
      );
    }

    if (section === 'rewards') {
      return (
        <View style={styles.contentStack}>
          <SectionHeading icon="gift-outline" eyebrow="REWARD TRACK" title="מסלול הפרסים" subtitle="הסוגים מוצגים כאן; הכמויות המדויקות יופיעו לפי האירוע והדירוג." />
          <View style={styles.rewardGrid}>
            {[
              ['Champions Player Item', 'פריט שחקן Champions', 'diamond', '#D8AA4A'],
              ['Player Pick', 'בחירת שחקן', 'star', '#F4D16A'],
              ['Champions Tokens', 'טוקנים ל־Champions', 'pricetag-outline', '#70C7FF'],
            ].map(([title, body, icon, tone]) => (
              <Panel key={title} style={styles.rewardCard}>
                <Ionicons name={icon as IconName} size={28} color={tone} />
                <Text style={styles.rewardTitle}>{title}</Text>
                <Text style={styles.rewardBody}>{body}</Text>
              </Panel>
            ))}
          </View>
        </View>
      );
    }

    if (section === 'tekkz') {
      return (
        <View style={styles.contentStack}>
          <SectionHeading icon="star-outline" eyebrow="TEKKZ PRO" title="TEKKZ · נתוני FC27" subtitle="הצגה של נתוני setup שנבדקו ממקור חיצוני, בלי Record / CQP / Rank לא מאומתים." />
          <View style={styles.tekkzDetailGrid}>
            <Panel style={styles.tekkzDetailMain}>
              <View style={styles.detailTopRow}>
                <View>
                  <Text style={styles.detailKicker}>VERIFIED SETUP</Text>
                  <Text style={styles.detailName}>TEKKZ 🇬🇧</Text>
                  <Text style={styles.detailSub}>PS5 · 4-4-1-1 (2) · Pro Player</Text>
                </View>
                <View style={styles.goldPill}>
                  <Ionicons name="checkmark-circle" size={15} color="#70E5A1" />
                  <Text style={styles.goldPillText}>FUTSettings</Text>
                </View>
              </View>
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
              <Text style={styles.sourceNote}>מקור חיצוני: FUTSettings · EA SPORTS FC 27</Text>
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

    if (section === 'tactics') {
      return (
        <View style={styles.contentStack}>
          <SectionHeading icon="git-network-outline" eyebrow="TACTICS LIBRARY" title="טקטיקות והרכבים" subtitle="מערכים, תפקידי שחקנים ונתוני setup שניתנים לאימות." />
          <View style={styles.tacticGrid}>
            <Panel style={styles.tacticPanel}>
              <Text style={styles.tacticTitle}>TEKKZ · 4-4-1-1 (2)</Text>
              <Text style={styles.tacticSub}>Short Passing · High · Line Height 65</Text>
              <MiniPitch formation="4-4-1-1 (2)" />
            </Panel>
            <Panel style={styles.tacticPanel}>
              <Text style={styles.tacticTitle}>תפקידי מפתח</Text>
              {TEKKZ_ROLES.slice(5).map(([position, role], index) => (
                <View key={position + index} style={styles.tacticRow}>
                  <Text style={styles.tacticValue}>{role}</Text>
                  <Text style={styles.tacticLabel}>{position}</Text>
                </View>
              ))}
            </Panel>
          </View>
        </View>
      );
    }

    if (section === 'controller') {
      return (
        <View style={styles.contentStack}>
          <SectionHeading icon="game-controller-outline" eyebrow="CONTROLLER LAB" title="הגדרות שלט" subtitle="הגדרות תחרותיות כלליות; נתוני שלט ספציפיים ל־TEKKZ יוצגו רק אחרי אימות." />
          <View style={styles.controllerGrid}>
            <Panel style={styles.controllerPanel}>
              <View style={styles.controllerPreview}>
                <Text style={styles.controllerGlyph}>🎮</Text>
                <Text style={styles.controllerName}>PlayStation 5 · DualSense</Text>
              </View>
            </Panel>
            <Panel style={styles.controllerSettings}>
              {CONTROLLER_ROWS.map(([label, value]) => (
                <View key={label} style={styles.settingRow}>
                  <Text style={styles.settingValue}>{value}</Text>
                  <Text style={styles.settingLabel}>{label}</Text>
                </View>
              ))}
            </Panel>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.contentStack}>
        <View style={styles.smallMetaStrip}>
          <Text style={styles.metaMuted}>Standalone Preview</Text>
          <Text style={styles.metaMuted}>CQP — / 1,000</Text>
          <Text style={styles.metaMuted}>MATCH FINALS 15</Text>
          <Text style={styles.metaMuted}>Season 1</Text>
        </View>

        <View style={[styles.centerRow, mobile && styles.centerRowMobile]}>
          <Panel style={styles.rankPanel}>
            <View style={styles.rankRing}>
              <Text style={styles.rankRingLabel}>RANK</Text>
              <Text style={styles.rankRingValue}>—</Text>
            </View>
            <View style={styles.rankCopy}>
              <Text style={styles.rankSeason}>SEASON 1 · הסטטוס שלך</Text>
              <Text style={styles.rankTitle}>נתונים אישיים</Text>
              <Text style={styles.rankStatus}>יופיעו כאן לאחר שיחוברו לנתוני המשחק.</Text>
              <Text style={styles.nextTargetLabel}>NEXT TARGET</Text>
              <Text style={styles.nextTargetValue}>נתוני דירוג · CQP לפי חשבון</Text>
              <View style={styles.longBar}><View style={styles.longBarFill} /></View>
            </View>
          </Panel>

          <Panel style={styles.progressPanel}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressEyebrow}>CHAMPIONS PROGRESS</Text>
                <Text style={styles.progressTitle}>המסלול שלך לדרגה הבאה</Text>
                <Text style={styles.progressSub}>15 משחקי Finals · Form, Rank ו־CQP במקום אחד.</Text>
              </View>
              <View style={styles.progressIcon}><Ionicons name="trophy-outline" size={21} color="#F6CC5E" /></View>
            </View>

            <View style={styles.progressStats}>
              <View style={styles.progressTile}>
                <Text style={styles.tileLabel}>CQP</Text>
                <Text style={styles.tileValue}>—</Text>
                <Text style={styles.tileNote}>/ 1,000</Text>
              </View>
              <View style={styles.progressTile}>
                <Text style={styles.tileLabel}>FORM</Text>
                <Text style={styles.tileValue}>—</Text>
                <Text style={styles.tileNote}>נתוני משחק</Text>
              </View>
              <View style={styles.progressTile}>
                <Text style={styles.tileLabel}>המאזן שלך</Text>
                <Text style={styles.tileValue}>—</Text>
                <Text style={styles.tileNote}>ניצחונות / הפסדים</Text>
              </View>
            </View>

            <View style={styles.progressBottomRow}>
              <Text style={styles.progressTarget}>CQP לפי חשבון</Text>
              <View style={styles.progressBarLarge}><View style={styles.progressBarLargeFill} /></View>
              <Text style={styles.progressTarget}>15 Finals</Text>
            </View>
          </Panel>
        </View>

        <View style={styles.contentGrid}>
          <Panel style={styles.tacticPreview}>
            <SectionHeading icon="git-network-outline" title="הטקטיקה שלך" subtitle="מבנה לדוגמה · נתונים אישיים יוזנו בעתיד." />
            <View style={styles.tacticInside}>
              <MiniPitch formation="4-2-3-1" />
              <View style={styles.tacticInfo}>
                {[
                  ['Build Up Style', 'Balanced'],
                  ['Defensive Approach', 'Balanced'],
                  ['Width', '50'],
                  ['Depth', '50'],
                ].map(([name, value]) => (
                  <View key={name} style={styles.settingRow}>
                    <Text style={styles.settingValue}>{value}</Text>
                    <Text style={styles.settingLabel}>{name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Panel>

          <Panel style={styles.controllerHomePanel}>
            <SectionHeading icon="game-controller-outline" title="Controller Lab" subtitle="הגדרות תחרותיות למשחק נקי ויציב." />
            <View style={styles.controllerHomeBody}>
              <View style={styles.controllerCircle}><Text style={styles.controllerGlyph}>🎮</Text></View>
              <View style={styles.controllerHomeRows}>
                {CONTROLLER_ROWS.slice(0, 4).map(([name, value]) => (
                  <View key={name} style={styles.settingRow}>
                    <Text style={styles.settingValue}>{value}</Text>
                    <Text style={styles.settingLabel}>{name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Panel>
        </View>

        <Panel>
          <SectionHeading icon="star-outline" eyebrow="PRO SETUP" title="TEKKZ Pro" subtitle="מערך והגדרות שפורסמו ונבדקו ממקור חיצוני." />
          <TekkzCard selected />
          <Text style={styles.sourceNote}>TEKKZ · 4-4-1-1 (2) · Short Passing · High · Line Height 65 · FUTSettings</Text>
        </Panel>

        <EmptyCommunity />
      </View>
    );
  }, [mobile, section]);

  if (!canView) {
    return (
      <Screen scene="champions" showNav={false}>
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
    <Screen scene="champions" showNav={false} maxWidth={2000}>
      <Stack.Screen options={{ title: 'FUT Champions' }} />

      <View style={styles.chrome}>
        <View style={styles.topbar}>
          <View style={styles.topbarActions}>
            <Pressable style={styles.userChip} onPress={() => router.push('/profile' as any)}>
              <View style={styles.userAvatar}><Text style={styles.userAvatarText}>{(app.user?.displayName || 'U').slice(0, 1)}</Text></View>
              <Text style={styles.userName}>{app.user?.displayName || 'User'}</Text>
            </Pressable>
            <Pressable style={styles.actionBubble}><Ionicons name="notifications-outline" size={18} color="#C1CAD2" /></Pressable>
            <Pressable style={styles.actionBubble}><Ionicons name="search-outline" size={18} color="#C1CAD2" /></Pressable>
          </View>

          <View style={styles.topbarLinks}>
            {TOP_LINKS.map(([label, href]) => (
              <Pressable key={href} onPress={() => router.push(href as any)} style={styles.topbarLink}>
                <Text style={[styles.topbarLinkText, label === 'FUT Champions' && styles.topbarLinkActive]}>{label}</Text>
                {label === 'FUT Champions' ? <View style={styles.topbarUnderline} /> : null}
              </Pressable>
            ))}
          </View>

          <View style={styles.topbarBrand}>
            <Image source={require('@/assets/images/brand-1club.png')} style={styles.brandLogo} />
            <View>
              <Text style={styles.brandTitle}>FC27 ISRAEL</Text>
              <Text style={styles.brandSub}>ULTIMATE HUB</Text>
            </View>
          </View>
        </View>

        <View style={styles.mainLayout}>
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>FUT CHAMPIONS</Text>
            {NAV.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => selectSection(item.id)}
                style={[styles.sidebarItem, section === item.id && styles.sidebarItemActive]}
              >
                <Text style={styles.sidebarIndex}>{String(index + 1).padStart(2, '0')}</Text>
                <Text style={[styles.sidebarLabel, section === item.id && styles.sidebarLabelActive]}>{item.label}</Text>
                <Ionicons name={item.icon} size={18} color={section === item.id ? '#F5F7FA' : '#88939E'} />
              </Pressable>
            ))}
            <View style={styles.sidebarTagline}>
              <Text style={styles.sidebarTaglineTop}>PLAY</Text>
              <Text style={styles.sidebarTaglineMiddle}>IMPROVE</Text>
              <Text style={styles.sidebarTaglineBottom}>WIN</Text>
              <View style={styles.eaBadge}><Text style={styles.eaBadgeText}>EA</Text><Text style={styles.eaBadgeSports}>SPORTS</Text></View>
            </View>
          </View>

          <View style={styles.main}>
            <LinearGradient
              colors={['rgba(112,5,17,.97)', 'rgba(27,5,10,.98)', 'rgba(7,10,15,.98)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <View style={styles.heroGlowOne} />
              <View style={styles.heroGlowTwo} />

              <View style={styles.heroTop}>
                <View style={styles.heroStats}>
                  <MetricCard label="FINAL STATUS" value="READY" tone="green" note="Preview content" />
                  <MetricCard label="CQP PROGRESS" value="—" tone="gold" note="מתוך 1,000 · נתונים אישיים" />
                  <MetricCard label="המאזן שלי" value="—" tone="red" note="נתוני W/L יופיעו כאן" />
                </View>

                <View style={styles.heroTitleWrap}>
                  <Text style={styles.heroEyebrow}>COMPETE · IMPROVE · WIN</Text>
                  <Text style={styles.heroTitle}>FUT CHAMPIONS</Text>
                  <Text style={styles.heroSubtitle}>המסע שלך. התוצאות שלך. הפרסים שלך.</Text>
                  <View style={styles.heroInfoRow}>
                    <View><Text style={styles.heroInfoBig}>DUAL</Text><Text style={styles.heroInfoSmall}>CONTROLLER LAB</Text></View>
                    <View><Text style={styles.heroInfoBig}>PRO</Text><Text style={styles.heroInfoSmall}>TACTICS LIBRARY</Text></View>
                    <View><Text style={styles.heroInfoBig}>CQP</Text><Text style={styles.heroInfoSmall}>QUALIFICATION</Text></View>
                    <View><Text style={styles.heroInfoBig}>15</Text><Text style={styles.heroInfoSmall}>MATCH FINALS</Text></View>
                  </View>
                </View>

                <View style={styles.heroCrest}>
                  <Ionicons name="trophy" size={34} color="#F6D36A" />
                  <Text style={styles.heroCrestText}>FUT</Text>
                </View>
              </View>

              <View style={styles.tabBar}>
                {NAV.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => selectSection(item.id)}
                    style={[styles.heroTab, section === item.id && styles.heroTabActive]}
                  >
                    <Ionicons name={item.icon} size={15} color={section === item.id ? '#fff' : '#8D99A4'} />
                    <Text style={[styles.heroTabText, section === item.id && styles.heroTabTextActive]}>{item.short}</Text>
                  </Pressable>
                ))}
              </View>
            </LinearGradient>

            <View style={styles.contentArea}>{content}</View>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chrome: { gap: 0, marginTop: -28, marginHorizontal: -24, width: 'calc(100% + 48px)' as any },
  topbar: {
    minHeight: 70,
    backgroundColor: 'rgba(5,8,12,.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    gap: 18,
    direction: 'ltr',
  },
  topbarBrand: { flexDirection: 'row', alignItems: 'center', gap: 9, minWidth: 210 },
  brandLogo: { width: 38, height: 38, borderRadius: 11, borderWidth: 1, borderColor: 'rgba(255,255,255,.18)' },
  brandTitle: { color: '#F7F5EF', fontSize: 18, fontWeight: '900', lineHeight: 18 },
  brandSub: { color: '#838E99', fontSize: 9, fontWeight: '900', letterSpacing: 2, marginTop: 2 },
  topbarLinks: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20 },
  topbarLink: { minHeight: 68, justifyContent: 'center', alignItems: 'center', position: 'relative', paddingHorizontal: 5 },
  topbarLinkText: { color: '#7E8994', fontSize: 12, fontWeight: '700' },
  topbarLinkActive: { color: '#F3F5F8' },
  topbarUnderline: { position: 'absolute', bottom: 0, height: 2, width: 110, backgroundColor: '#F1BE4C', borderRadius: 2 },
  topbarActions: { minWidth: 220, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8, direction: 'ltr' },
  actionBubble: { width: 42, height: 42, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,.10)', backgroundColor: '#0F171F', alignItems: 'center', justifyContent: 'center' },
  userChip: { height: 44, paddingHorizontal: 9, paddingLeft: 8, borderRadius: 22, backgroundColor: '#0F171F', borderWidth: 1, borderColor: 'rgba(255,255,255,.10)', flexDirection: 'row', alignItems: 'center', gap: 8 },
  userAvatar: { width: 31, height: 31, borderRadius: 16, backgroundColor: '#273241', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#9AA6B1' },
  userAvatarText: { color: '#F2D8B4', fontWeight: '900', fontSize: 12 },
  userName: { color: '#DDE2E8', fontSize: 12, fontWeight: '800' },
  mainLayout: { flexDirection: 'row', alignItems: 'stretch', direction: 'ltr' },
  sidebar: { width: 230, backgroundColor: 'rgba(5,8,12,.72)', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,.06)', paddingTop: 22, paddingHorizontal: 12, minHeight: 900, direction: 'rtl' },
  sidebarTitle: { color: '#79858F', fontSize: 11, fontWeight: '900', letterSpacing: 1.6, textAlign: 'center', marginBottom: 15 },
  sidebarItem: { minHeight: 52, borderRadius: 13, paddingHorizontal: 11, marginBottom: 9, backgroundColor: 'rgba(9,12,17,.50)', borderWidth: 1, borderColor: 'rgba(255,255,255,.03)', flexDirection: 'row', alignItems: 'center', gap: 9 },
  sidebarItemActive: { backgroundColor: 'rgba(221,23,45,.72)', borderColor: 'rgba(255,86,103,.82)', shadowColor: '#E43043', shadowOpacity: .22, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  sidebarIndex: { color: '#65717D', fontSize: 9, fontWeight: '800', width: 19 },
  sidebarLabel: { flex: 1, color: '#9AA6B1', fontSize: 12, fontWeight: '800', textAlign: 'right' },
  sidebarLabelActive: { color: '#fff' },
  sidebarTagline: { marginTop: 'auto' as any, alignItems: 'center', paddingTop: 86, paddingBottom: 28 },
  sidebarTaglineTop: { color: '#F46670', fontSize: 26, fontStyle: 'italic', fontWeight: '900', lineHeight: 25 },
  sidebarTaglineMiddle: { color: '#FAF8F2', fontSize: 26, fontStyle: 'italic', fontWeight: '900', lineHeight: 25 },
  sidebarTaglineBottom: { color: '#FAF8F2', fontSize: 26, fontStyle: 'italic', fontWeight: '900', lineHeight: 25 },
  eaBadge: { marginTop: 17, width: 51, height: 51, borderRadius: 26, backgroundColor: '#F3F5F7', alignItems: 'center', justifyContent: 'center' },
  eaBadgeText: { color: '#1B2026', fontSize: 13, fontWeight: '900', lineHeight: 12 },
  eaBadgeSports: { color: '#1B2026', fontSize: 7, fontWeight: '900' },

  main: { flex: 1, minWidth: 0, direction: 'rtl' },
  hero: { minHeight: 400, margin: 24, marginBottom: 18, borderRadius: 23, borderWidth: 1, borderColor: 'rgba(237,55,72,.55)', overflow: 'hidden', position: 'relative', shadowColor: '#000', shadowOpacity: .30, shadowRadius: 22, shadowOffset: { width: 0, height: 12 } },
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
  progressBarLargeFill: { width: '55%', height: '100%', backgroundColor: '#E43B4A' },

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

  panel: { position: 'relative', overflow: 'hidden', backgroundColor: '#0A0F15', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', padding: 17, gap: 12 },
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
});

