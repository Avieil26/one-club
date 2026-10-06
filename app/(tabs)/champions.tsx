import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

import { Screen } from '@/components/ui';
import { getSupabase, uploadProofs } from '@/lib/supabase';
import { useApp } from '@/lib/store';
import { pickImages } from '@/lib/images';
import type { PlatformId } from '@/lib/types';

type MainTab = 'hub' | 'community';
type ContentKind = 'tactic' | 'tip' | 'guide';

type CommunityItem = {
  id: string;
  user_id: string;
  kind: ContentKind;
  title: string;
  body: string;
  formation: string | null;
  platform: PlatformId;
  settings: Record<string, string>;
  image_uris: string[];
  featured: boolean;
  created_at: string;
};

const TEKKZ = {
  name: 'Tekkz',
  badge: 'Esports Pro',
  platform: 'PlayStation',
  sourceLabel: 'מקור ציבורי • DhTekKz / Publicly Published',
  formation: '4-4-1-1 (2)',
  buildUp: 'Short Passing',
  defensive: 'High',
  depth: '65',
  code: 'GJgwMwH%QEao',
  roles: [
    ['GK', 'Goalkeeper', 'Defend'],
    ['RB', 'Fullback', 'Balanced'],
    ['RCB', 'Defender', 'Defend'],
    ['LCB', 'Defender', 'Defend'],
    ['LB', 'Fullback', 'Balanced'],
    ['RM', 'Inside Forward', 'Balanced'],
    ['RCM', 'Deep-Lying Playmaker', 'Build-Up'],
    ['LCM', 'Deep-Lying Playmaker', 'Build-Up'],
    ['LM', 'Inside Forward', 'Balanced'],
    ['CAM', 'Playmaker', 'Balanced'],
    ['ST', 'Advanced Forward', 'Attack'],
  ],
};

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View style={{ flex: 1, minHeight: 500, backgroundColor: '#070609', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <View style={styles.runtimeError}>
        <Ionicons name="alert-circle-outline" size={52} color="#FF6871" />
        <Text style={styles.runtimeErrorTitle}>FUT Champions לא נטען</Text>
        <Text style={styles.runtimeErrorBody}>{error.message || 'שגיאת מערכת לא מזוהה'}</Text>
        <Pressable onPress={retry} style={styles.retryButton}>
          <Text style={styles.retryText}>נסה שוב</Text>
        </Pressable>
      </View>
    </View>
  );
}

const PITCH_POSITIONS = [
  ['ST', 50, 10],
  ['CAM', 50, 30],
  ['LM', 22, 30],
  ['RM', 78, 30],
  ['CM', 38, 50],
  ['CM', 62, 50],
  ['LB', 13, 72],
  ['CB', 38, 72],
  ['CB', 62, 72],
  ['RB', 87, 72],
  ['GK', 50, 90],
] as const;

function Panel({ children, style }: { children: ReactNode; style?: object }) {
  return (
    <View style={[styles.panel, style]}>
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(18,8,11,0.98)', 'rgba(5,8,13,0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {children}
    </View>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionTitle}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={18} color="#FF4B55" />
      </View>
      <View style={styles.sectionTextWrap}>
        <Text style={styles.sectionTitleText}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function Pitch({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.pitch, compact && styles.pitchCompact]}>
      <View style={styles.pitchCenterLine} />
      <View style={styles.pitchCircle} />
      {PITCH_POSITIONS.map(([label, left, top], index) => (
        <View
          key={`${label}-${index}`}
          style={[
            styles.playerDot,
            compact && styles.playerDotCompact,
            { left: `${left}%`, top: `${top}%` },
          ]}
        >
          <Text style={[styles.playerDotText, compact && styles.playerDotTextCompact]}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

function Stat({ value, label, accent = '#F4F7F2' }: { value: string; label: string; accent?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

export default function ChampionsScreen() {
  const app = useApp();
  const { width } = useWindowDimensions();
  const desktop = width >= 1100;
  const [tab, setTab] = useState<MainTab>('hub');
  const [community, setCommunity] = useState<CommunityItem[]>([]);
  const [communityLoading, setCommunityLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [composerKind, setComposerKind] = useState<ContentKind>('tactic');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [formation, setFormation] = useState('4-2-3-1');
  const [platform, setPlatform] = useState<PlatformId>('ps5');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const userName = app.user?.displayName ?? 'השחקן שלי';
  const publishedCount = app.user ? app.futPosts.filter((post) => post.userId === app.user?.id).length : 0;

  async function loadCommunity() {
    setCommunityLoading(true);
    try {
      const { data, error } = await getSupabase()
        .from('champions_content')
        .select('id,user_id,kind,title,body,formation,platform,settings,image_uris,featured,created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(30);

      if (!error) {
        setCommunity((data ?? []) as CommunityItem[]);
      } else {
        setCommunity([]);
      }
    } catch {
      setCommunity([]);
    } finally {
      setCommunityLoading(false);
    }
  }

  useEffect(() => {
    void loadCommunity();
  }, []);

  const communityWithNames = useMemo(
    () =>
      community.map((item) => ({
        ...item,
        userName: app.profiles.find((profile) => profile.id === item.user_id)?.displayName ?? 'שחקן',
      })),
    [community, app.profiles],
  );

  async function chooseImage() {
    try {
      const picked = await pickImages(1);
      if (picked.length) setImageUris(picked);
    } catch (error) {
      Alert.alert('רגע', error instanceof Error ? error.message : 'בחירת התמונה נכשלה');
    }
  }

  async function publish() {
    if (!app.user) {
      Alert.alert('צריך להתחבר', 'כדי לפרסם Setup צריך להתחבר למשתמש.');
      return;
    }
    if (title.trim().length < 2 || body.trim().length < 2) {
      Alert.alert('חסר תוכן', 'מלאו כותרת והסבר קצר.');
      return;
    }

    setBusy(true);
    try {
      const images = imageUris.length ? await uploadProofs(app.user.id, imageUris, 'champions') : [];
      const { error } = await getSupabase().from('champions_content').insert({
        user_id: app.user.id,
        kind: composerKind,
        title: title.trim(),
        body: body.trim(),
        formation: composerKind === 'tactic' ? formation : null,
        platform,
        settings: {},
        image_uris: images,
        status: 'pending',
        featured: false,
      });
      if (error) throw error;

      setTitle('');
      setBody('');
      setImageUris([]);
      setShowComposer(false);
      await loadCommunity();
      Alert.alert('נשלח לבדיקה', 'ה־Setup נשמר ויופיע לאחר אישור.');
    } catch (error) {
      Alert.alert('הפרסום נכשל', error instanceof Error ? error.message : 'נסו שוב.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen scene="champions" refreshing={communityLoading || busy} onRefresh={loadCommunity} maxWidth={desktop ? 1480 : 1120}>
      <Stack.Screen options={{ title: 'FUT Champions' }} />

      <LinearGradient
        colors={['rgba(88,5,14,0.98)', 'rgba(25,5,11,0.98)', 'rgba(5,8,13,0.99)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View pointerEvents="none" style={styles.heroStripeOne} />
        <View pointerEvents="none" style={styles.heroStripeTwo} />

        <View style={[styles.heroRow, desktop && styles.heroRowDesktop]}>
          <Panel style={styles.featuredCard}>
            <View style={styles.playerBadge}>
              <Ionicons name="trophy" size={24} color="#F6D26A" />
            </View>
            <Text style={styles.featuredKicker}>FEATURED PRO PLAYER</Text>
            <Text style={styles.featuredName}>{TEKKZ.name}</Text>
            <Text style={styles.featuredMeta}>EA FC 27 · FUT Champions · {TEKKZ.badge}</Text>
            <Text style={styles.verifiedText}>{TEKKZ.sourceLabel}</Text>
          </Panel>

          <Panel style={styles.myRecordCard}>
            <View style={styles.myHeader}>
              <View>
                <Text style={styles.myTitle}>המאזן שלי</Text>
                <Text style={styles.mySub}>{userName} · נתוני Champions אמיתיים בלבד</Text>
              </View>
              <View style={styles.liveDot} />
            </View>
            <View style={styles.statsRow}>
              <Stat value="0 - 0" label="W / L" />
              <Stat value="15" label="MATCHES" />
              <Stat value="—" label="RANK" accent="#F6D26A" />
            </View>
            <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>טרם נרשמו תוצאות</Text>
              <Text style={styles.metaText}>0 / 15</Text>
            </View>
          </Panel>

          <Panel style={styles.rewardCard}>
            <Text style={styles.rewardKicker}>הפרסים שלי</Text>
            <Text style={styles.rewardTitle}>מחושבים מתוך התוצאה</Text>
            <Text style={styles.rewardSub}>אין כאן מספרים מומצאים. התוצאה וה־Rank יקבעו את הפרסים.</Text>
            <View style={styles.rewardIcons}>
              <View style={styles.rewardIcon}><Ionicons name="cash-outline" size={19} color="#F6D26A" /></View>
              <View style={styles.rewardIcon}><Ionicons name="shield-outline" size={19} color="#FF5C67" /></View>
              <View style={styles.rewardIcon}><Ionicons name="gift-outline" size={19} color="#D6DFE8" /></View>
            </View>
          </Panel>
        </View>

        <View style={styles.subTabs}>
          <Pressable onPress={() => setTab('hub')} style={[styles.subTab, tab === 'hub' && styles.subTabActive]}>
            <Ionicons name="grid-outline" size={16} color={tab === 'hub' ? '#fff' : '#929CA6'} />
            <Text style={[styles.subTabText, tab === 'hub' && styles.subTabTextActive]}>מרכז Champions</Text>
          </Pressable>
          <Pressable onPress={() => setTab('community')} style={[styles.subTab, tab === 'community' && styles.subTabActive]}>
            <Ionicons name="people-outline" size={16} color={tab === 'community' ? '#fff' : '#929CA6'} />
            <Text style={[styles.subTabText, tab === 'community' && styles.subTabTextActive]}>שחקני הקהילה</Text>
          </Pressable>
        </View>
      </LinearGradient>

      {tab === 'hub' ? (
        <>
          <View style={styles.quickRow}>
            {[
              ['git-network-outline', 'Tactics', 'מערך והוראות'],
              ['settings-outline', 'Game Settings', 'הגדרות משחק'],
              ['game-controller-outline', 'Controller Settings', 'הגדרות שלט'],
              ['bulb-outline', 'Tips & Tricks', 'טיפים'],
              ['copy-outline', 'Tactic Code', 'קוד טקטיקה'],
            ].map(([icon, label, sub]) => (
              <Pressable key={label} style={styles.quickCard} onPress={() => Alert.alert(label, sub)}>
                <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={21} color="#C7D3DE" />
                <Text style={styles.quickLabel}>{label}</Text>
                <Text style={styles.quickSub}>{sub}</Text>
              </Pressable>
            ))}
          </View>

          <View style={[styles.contentRow, desktop && styles.contentRowDesktop]}>
            <Panel style={styles.tacticCard}>
              <SectionTitle icon="git-network-outline" title="הטקטיקה של Tekkz" subtitle="מקור ציבורי. לא נתוני משתמש." />
              <Text style={styles.sourcePill}>Tekkz · Publicly Published · EA FC 27</Text>

              <View style={styles.tacticColumns}>
                <View style={styles.pitchColumn}>
                  <Text style={styles.formation}>{TEKKZ.formation}</Text>
                  <Text style={styles.formationSub}>Main Tactic · {TEKKZ.platform}</Text>
                  <Pitch />
                  <SettingRow label="Build Up Style" value={TEKKZ.buildUp} />
                  <SettingRow label="Defensive Approach" value={TEKKZ.defensive} />
                  <SettingRow label="Line Height" value={TEKKZ.depth} />
                </View>

                <View style={styles.rolesColumn}>
                  <Text style={styles.rolesTitle}>Player Roles & Focus</Text>
                  {TEKKZ.roles.map(([position, role, focus], index) => (
                    <View key={`${position}-${index}`} style={styles.roleRow}>
                      <View style={styles.rolePosition}><Text style={styles.rolePositionText}>{position}</Text></View>
                      <Text style={styles.roleName}>{role}</Text>
                      <Text style={styles.roleFocus}>{focus}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.codeRow}>
                <View>
                  <Text style={styles.codeLabel}>TACTIC CODE</Text>
                  <Text style={styles.codeValue}>{TEKKZ.code}</Text>
                </View>
                <Pressable style={styles.copyButton} onPress={() => Alert.alert('Tactic Code', TEKKZ.code)}>
                  <Ionicons name="copy-outline" size={15} color="#fff" />
                  <Text style={styles.copyText}>Copy</Text>
                </Pressable>
              </View>
            </Panel>

            <View style={styles.sideColumn}>
              <Panel>
                <SectionTitle icon="game-controller-outline" title="Controller Settings" subtitle="מציגים רק מידע ציבורי מאומת." />
                <View style={styles.verifyBox}>
                  <Ionicons name="shield-checkmark-outline" size={26} color="#E3B94F" />
                  <Text style={styles.verifyTitle}>Not Published / Not Verified</Text>
                  <Text style={styles.verifyBody}>אין כרגע מקור ציבורי מספיק אמין להגדרות השלט של Tekkz ל־FC 27. לכן אנחנו לא ממציאים ערכים.</Text>
                </View>
                <View style={styles.platformRow}>
                  <Text style={styles.platformOn}>PlayStation</Text>
                  <Text style={styles.platformOff}>Xbox</Text>
                  <Text style={styles.platformOff}>PC</Text>
                </View>
              </Panel>

              <Panel>
                <SectionTitle icon="gift-outline" title="Rewards" subtitle="הערכים יתמלאו מתוך תוצאת המשתמש." />
                <SettingRow label="Coins" value="—" />
                <SettingRow label="Champions Tokens" value="—" />
                <SettingRow label="CQP" value="—" />
              </Panel>
            </View>
          </View>

          <Panel>
            <SectionTitle icon="people-outline" title="מה חדש בקהילה" subtitle={communityLoading ? 'טוען...' : community.length ? 'תוכן אמיתי שאושר.' : 'עדיין אין תוכן.'} />
            {communityLoading ? (
              <View style={styles.emptyState}><Text style={styles.emptyBody}>טוענים את תוכן הקהילה…</Text></View>
            ) : community.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
                {communityWithNames.slice(0, 6).map((item) => (
                  <View key={item.id} style={styles.communityPreview}>
                    <Pitch compact />
                    <Text style={styles.communityTitle}>{item.title}</Text>
                    <Text style={styles.communityMeta}>{item.userName} · {item.platform === 'ps5' ? 'PS5' : item.platform === 'xbox' ? 'Xbox' : 'PC'}</Text>
                    <Text numberOfLines={3} style={styles.communityBody}>{item.body}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={28} color="#64707B" />
                <Text style={styles.emptyTitle}>עדיין אין פרופילי Champions בקהילה</Text>
                <Text style={styles.emptyBody}>כששחקנים יפרסמו Setup מאושר, הוא יופיע כאן.</Text>
              </View>
            )}
          </Panel>
        </>
      ) : (
        <>
          <Panel>
            <View style={styles.communityHead}>
              <View style={styles.communityHeadText}>
                <Text style={styles.bigTitle}>שחקני הקהילה</Text>
                <Text style={styles.bigSub}>Setup, Formation, W / L, Tips ו־Controller Settings במקום אחד.</Text>
              </View>
              <Pressable onPress={() => setShowComposer(true)} style={styles.publishButton}>
                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                <Text style={styles.publishText}>פרסום Setup</Text>
              </Pressable>
            </View>
          </Panel>

          {communityLoading ? (
            <View style={styles.emptyCommunity}><Text style={styles.emptyBody}>טוענים את שחקני הקהילה…</Text></View>
          ) : community.length ? (
            <View style={styles.communityGrid}>
              {communityWithNames.map((item) => (
                <Pressable key={item.id} onPress={() => Alert.alert('Community Player', `${item.userName} · ${item.formation ?? 'Formation not published'}`)} style={styles.playerCard}>
                  <View style={styles.cardTop}>
                    <View style={styles.avatar}>
                      <Ionicons name="person-outline" size={27} color="#C6D1DB" />
                    </View>
                    <View style={styles.cardTopText}>
                      <Text style={styles.playerName}>{item.userName}</Text>
                      <Text style={styles.playerMeta}>EA FC 27 · {item.platform === 'ps5' ? 'PS5' : item.platform === 'xbox' ? 'Xbox' : 'PC'}</Text>
                      <Text style={styles.playerSource}>Community Submission</Text>
                    </View>
                    <Ionicons name="chevron-back" size={17} color="#73808C" />
                  </View>
                  <View style={styles.cardStats}>
                    <View><Text style={styles.cardLabel}>FORMATION</Text><Text style={styles.cardValue}>{item.formation ?? '—'}</Text></View>
                    <View><Text style={styles.cardLabel}>W / L</Text><Text style={styles.cardValue}>—</Text></View>
                    <View><Text style={styles.cardLabel}>WEEK</Text><Text style={styles.cardValue}>—</Text></View>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCommunity}>
              <Ionicons name="people-circle-outline" size={52} color="#58626D" />
              <Text style={styles.emptyTitle}>אין עדיין שחקנים להצגה</Text>
              <Text style={styles.emptyBody}>הפרופילים יופיעו כאן אחרי פרסום Setup מאושר.</Text>
              <Pressable onPress={() => setShowComposer(true)} style={styles.publishButton}>
                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                <Text style={styles.publishText}>היה הראשון לפרסם</Text>
              </Pressable>
            </View>
          )}
        </>
      )}

      {showComposer ? (
        <View style={styles.modalBackdrop}>
          <Panel style={styles.composer}>
            <View style={styles.composerHeader}>
              <Text style={styles.composerTitle}>פרסום Setup ל־Champions</Text>
              <Pressable onPress={() => setShowComposer(false)}>
                <Ionicons name="close" size={23} color="#fff" />
              </Pressable>
            </View>

            <View style={styles.chipRow}>
              {(['tactic', 'tip', 'guide'] as ContentKind[]).map((kind) => (
                <Pressable key={kind} onPress={() => setComposerKind(kind)} style={[styles.chip, composerKind === kind && styles.chipActive]}>
                  <Text style={styles.chipText}>{kind === 'tactic' ? 'טקטיקה' : kind === 'tip' ? 'טיפ' : 'מדריך'}</Text>
                </Pressable>
              ))}
            </View>

            <TextInput value={title} onChangeText={setTitle} placeholder="כותרת" placeholderTextColor="#6E7883" style={styles.input} />
            <TextInput value={body} onChangeText={setBody} placeholder="הסבר קצר ושימושי" placeholderTextColor="#6E7883" multiline style={[styles.input, { minHeight: 110, textAlignVertical: 'top' }]} />

            {composerKind === 'tactic' ? (
              <>
                <Text style={styles.formLabel}>Formation</Text>
                <View style={styles.chipRow}>
                  {['4-2-3-1', '4-4-1-1', '4-3-1-2', '4-2-2-2'].map((value) => (
                    <Pressable key={value} onPress={() => setFormation(value)} style={[styles.chip, formation === value && styles.chipActive]}>
                      <Text style={styles.chipText}>{value}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.formLabel}>Platform</Text>
                <View style={styles.chipRow}>
                  {(['ps5', 'xbox', 'pc'] as PlatformId[]).map((value) => (
                    <Pressable key={value} onPress={() => setPlatform(value)} style={[styles.chip, platform === value && styles.chipActive]}>
                      <Text style={styles.chipText}>{value === 'ps5' ? 'PlayStation' : value === 'xbox' ? 'Xbox' : 'PC'}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}

            <Pressable onPress={chooseImage} style={styles.uploadButton}>
              <Ionicons name="image-outline" size={17} color="#FF6871" />
              <Text style={styles.uploadText}>{imageUris.length ? 'צילום נבחר' : 'הוספת צילום מסך'}</Text>
            </Pressable>
            <Pressable disabled={busy} onPress={publish} style={[styles.publishButton, busy && styles.disabled]}>
              <Text style={styles.publishText}>{busy ? 'מפרסם…' : 'שליחה לבדיקה'}</Text>
            </Pressable>
          </Panel>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,73,84,.58)' },
  heroStripeOne: { position: 'absolute', left: -120, top: 100, width: 760, height: 120, backgroundColor: 'rgba(255,45,58,.10)', transform: [{ rotate: '-12deg' }] },
  heroStripeTwo: { position: 'absolute', right: -150, bottom: 75, width: 760, height: 115, backgroundColor: 'rgba(180,10,25,.12)', transform: [{ rotate: '-12deg' }] },
  heroRow: { gap: 12, padding: 14 },
  heroRowDesktop: { flexDirection: 'row-reverse' },
  featuredCard: { flex: 1.02, minWidth: 250, justifyContent: 'center', minHeight: 160 },
  playerBadge: { width: 58, height: 58, borderRadius: 16, borderWidth: 1, borderColor: '#A98034', backgroundColor: 'rgba(7,5,8,.9)', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', marginBottom: 10 },
  featuredKicker: { color: '#FF9EA4', fontSize: 10, fontWeight: '900', letterSpacing: 1.6, textAlign: 'right' },
  featuredName: { color: '#FFF7EE', fontSize: 34, fontWeight: '900', textAlign: 'right' },
  featuredMeta: { color: '#D0D8E0', fontSize: 12, fontWeight: '700', textAlign: 'right', marginTop: 2 },
  verifiedText: { color: '#74E1A2', fontSize: 9, fontWeight: '800', textAlign: 'right', marginTop: 8 },
  myRecordCard: { flex: 1.06, minWidth: 330, minHeight: 160 },
  myHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  myTitle: { color: '#F3F5F7', fontSize: 18, fontWeight: '900', textAlign: 'right' },
  mySub: { color: '#78848F', fontSize: 10, fontWeight: '700', textAlign: 'right', marginTop: 2 },
  liveDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#F23C48' },
  statsRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 15 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '900' },
  statLabel: { color: '#6D7883', fontSize: 9, fontWeight: '900', marginTop: 2 },
  progressTrack: { height: 7, borderRadius: 4, backgroundColor: '#1A2026', overflow: 'hidden', marginTop: 12 },
  progressFill: { width: '0%', height: '100%', backgroundColor: '#EE3A47' },
  metaRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 6 },
  metaText: { color: '#858F99', fontSize: 9, fontWeight: '800' },
  rewardCard: { flex: .68, minWidth: 220, minHeight: 160 },
  rewardKicker: { color: '#DDE5EC', fontSize: 11, fontWeight: '900', textAlign: 'right' },
  rewardTitle: { color: '#F5CF66', fontSize: 17, fontWeight: '900', textAlign: 'right', marginTop: 10 },
  rewardSub: { color: '#77828D', fontSize: 10, lineHeight: 16, fontWeight: '700', textAlign: 'right', marginTop: 4 },
  rewardIcons: { flexDirection: 'row-reverse', gap: 7, marginTop: 12 },
  rewardIcon: { width: 33, height: 33, borderRadius: 9, backgroundColor: 'rgba(255,255,255,.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', alignItems: 'center', justifyContent: 'center' },
  subTabs: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.10)', flexDirection: 'row-reverse', paddingHorizontal: 10 },
  subTab: { minHeight: 49, minWidth: 170, marginVertical: 7, borderRadius: 11, gap: 8, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 15 },
  subTabActive: { backgroundColor: '#E43745', borderWidth: 1, borderColor: '#FF6C73' },
  subTabText: { color: '#929CA6', fontSize: 12, fontWeight: '900' },
  subTabTextActive: { color: '#fff' },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: { flex: 1, minWidth: 165, minHeight: 82, backgroundColor: '#080E15', borderWidth: 1, borderColor: 'rgba(255,255,255,.09)', borderRadius: 13, alignItems: 'center', justifyContent: 'center', padding: 10 },
  quickLabel: { color: '#E8EEF3', fontSize: 11, fontWeight: '900', marginTop: 4 },
  quickSub: { color: '#6D7884', fontSize: 9, fontWeight: '700', marginTop: 2 },
  panel: { position: 'relative', backgroundColor: '#070B10', borderRadius: 17, borderWidth: 1, borderColor: 'rgba(255,255,255,.09)', padding: 15, gap: 12, overflow: 'hidden' },
  sectionTitle: { flexDirection: 'row-reverse', alignItems: 'center', gap: 9 },
  sectionIcon: { width: 35, height: 35, borderRadius: 10, backgroundColor: 'rgba(242,53,66,.11)', borderWidth: 1, borderColor: 'rgba(242,53,66,.23)', alignItems: 'center', justifyContent: 'center' },
  sectionTextWrap: { flex: 1 },
  sectionTitleText: { color: '#F2F5F7', fontSize: 17, fontWeight: '900', textAlign: 'right' },
  sectionSubtitle: { color: '#77828D', fontSize: 10, fontWeight: '700', textAlign: 'right', marginTop: 2 },
  sourcePill: { alignSelf: 'flex-end', color: '#72E1A1', fontSize: 9, fontWeight: '900', backgroundColor: 'rgba(103,228,154,.07)', borderWidth: 1, borderColor: 'rgba(103,228,154,.18)', borderRadius: 13, paddingHorizontal: 9, paddingVertical: 6 },
  contentRow: { gap: 12 },
  contentRowDesktop: { flexDirection: 'row-reverse' },
  tacticColumns: { flexDirection: 'row-reverse', gap: 14 },
  pitchColumn: { flex: 1.05, minWidth: 320 },
  rolesColumn: { flex: .95, minWidth: 285 },
  formation: { color: '#F3F5F7', fontSize: 24, fontWeight: '900', textAlign: 'right' },
  formationSub: { color: '#77828D', fontSize: 10, fontWeight: '800', textAlign: 'right', marginBottom: 9 },
  pitch: { width: '100%', height: 300, borderRadius: 14, borderWidth: 1, borderColor: '#477652', backgroundColor: '#133620', position: 'relative', overflow: 'hidden' },
  pitchCompact: { height: 115, width: 165, alignSelf: 'flex-end' },
  pitchCenterLine: { position: 'absolute', left: 0, right: 0, top: '50%', height: 1, backgroundColor: 'rgba(255,255,255,.24)' },
  pitchCircle: { position: 'absolute', width: 80, height: 80, borderRadius: 40, left: '50%', top: '50%', marginLeft: -40, marginTop: -40, borderWidth: 1, borderColor: 'rgba(255,255,255,.22)' },
  playerDot: { position: 'absolute', width: 34, height: 34, borderRadius: 17, marginLeft: -17, marginTop: -17, backgroundColor: '#D22F40', borderWidth: 2, borderColor: '#F5D67B', alignItems: 'center', justifyContent: 'center' },
  playerDotCompact: { width: 19, height: 19, borderRadius: 10, marginLeft: -10, marginTop: -10, borderWidth: 1 },
  playerDotText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  playerDotTextCompact: { fontSize: 5 },
  tacticCard: { flex: 1.2, minWidth: 0 },
  settingRow: { paddingVertical: 9, flexDirection: 'row-reverse', justifyContent: 'space-between', gap: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,.06)' },
  settingLabel: { color: '#78838E', fontSize: 10, fontWeight: '800', textAlign: 'right', flex: 1 },
  settingValue: { color: '#EDF1F4', fontSize: 11, fontWeight: '900', textAlign: 'right' },
  rolesTitle: { color: '#B8C3CC', fontSize: 11, fontWeight: '900', textAlign: 'right', marginBottom: 6 },
  roleRow: { minHeight: 35, flexDirection: 'row-reverse', alignItems: 'center', gap: 7, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,.05)' },
  rolePosition: { width: 36, height: 23, borderRadius: 7, backgroundColor: '#111A24', alignItems: 'center', justifyContent: 'center' },
  rolePositionText: { color: '#DDE6EE', fontSize: 8, fontWeight: '900' },
  roleName: { flex: 1, color: '#E8EDF2', fontSize: 9, fontWeight: '800', textAlign: 'right' },
  roleFocus: { color: '#FF6A73', fontSize: 8, fontWeight: '900' },
  codeRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', padding: 11, borderRadius: 11, borderWidth: 1, borderColor: 'rgba(227,179,65,.2)', backgroundColor: 'rgba(227,179,65,.045)' },
  codeLabel: { color: '#9F8B55', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  codeValue: { color: '#F5D66F', fontSize: 13, fontWeight: '900', marginTop: 2 },
  copyButton: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#D52F3D', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8 },
  copyText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  sideColumn: { flex: .8, minWidth: 320, gap: 12 },
  verifyBox: { backgroundColor: 'rgba(209,168,72,.05)', borderWidth: 1, borderColor: 'rgba(209,168,72,.20)', borderRadius: 12, padding: 12, alignItems: 'center', gap: 7 },
  verifyTitle: { color: '#F0D077', fontSize: 11, fontWeight: '900', textAlign: 'center' },
  verifyBody: { color: '#9BA6B0', fontSize: 10, lineHeight: 16, fontWeight: '700', textAlign: 'right' },
  platformRow: { flexDirection: 'row', gap: 7, justifyContent: 'center' },
  platformOn: { color: '#0C1510', backgroundColor: '#DFF2E6', borderRadius: 15, borderWidth: 1, borderColor: '#7FD09E', paddingHorizontal: 11, paddingVertical: 7, fontSize: 9, fontWeight: '900', overflow: 'hidden' },
  platformOff: { color: '#8A96A0', backgroundColor: '#0E141A', borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', paddingHorizontal: 11, paddingVertical: 7, fontSize: 9, fontWeight: '800', overflow: 'hidden' },
  horizontalCards: { gap: 10, paddingRight: 2 },
  communityPreview: { width: 300, backgroundColor: '#090F15', borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', padding: 11, gap: 8 },
  communityTitle: { color: '#EAF0F4', fontSize: 13, fontWeight: '900', textAlign: 'right' },
  communityMeta: { color: '#818D98', fontSize: 9, fontWeight: '800', textAlign: 'right' },
  communityBody: { color: '#A0AAB3', fontSize: 10, lineHeight: 16, textAlign: 'right' },
  emptyState: { minHeight: 130, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,.06)', backgroundColor: 'rgba(7,11,16,.55)', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 18 },
  emptyTitle: { color: '#D8E0E6', fontSize: 13, fontWeight: '900', textAlign: 'center' },
  emptyBody: { color: '#737E89', fontSize: 10, lineHeight: 16, textAlign: 'center', maxWidth: 600 },
  communityHead: { flexDirection: 'row-reverse', gap: 12, alignItems: 'center' },
  communityHeadText: { flex: 1 },
  bigTitle: { color: '#F2F5F7', fontSize: 27, fontWeight: '900', textAlign: 'right' },
  bigSub: { color: '#7A8590', fontSize: 10, lineHeight: 16, textAlign: 'right', marginTop: 2 },
  publishButton: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: '#D82F3C', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 10 },
  publishText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  communityGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 11 },
  playerCard: { flex: 1, minWidth: 310, maxWidth: 450, backgroundColor: '#080E14', borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,.09)', padding: 13 },
  cardTop: { flexDirection: 'row-reverse', alignItems: 'center', gap: 9 },
  avatar: { width: 62, height: 62, borderRadius: 16, backgroundColor: '#101821', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', alignItems: 'center', justifyContent: 'center' },
  cardTopText: { flex: 1 },
  playerName: { color: '#EDF2F5', fontSize: 16, fontWeight: '900', textAlign: 'right' },
  playerMeta: { color: '#84909B', fontSize: 9, fontWeight: '800', textAlign: 'right', marginTop: 2 },
  playerSource: { color: '#70DF9D', fontSize: 8, fontWeight: '800', textAlign: 'right', marginTop: 4 },
  cardStats: { marginTop: 13, paddingTop: 11, borderTopWidth: 1, borderColor: 'rgba(255,255,255,.06)', flexDirection: 'row-reverse', justifyContent: 'space-between' },
  cardLabel: { color: '#6C7782', fontSize: 8, fontWeight: '900', textAlign: 'right' },
  cardValue: { color: '#EDF2F4', fontSize: 15, fontWeight: '900', textAlign: 'right', marginTop: 3 },
  emptyCommunity: { minHeight: 300, alignItems: 'center', justifyContent: 'center', gap: 7, padding: 28, backgroundColor: '#080E14', borderRadius: 17, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 80, backgroundColor: 'rgba(0,0,0,.78)', padding: 16, justifyContent: 'center' },
  composer: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  composerHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  composerTitle: { color: '#F2F5F7', fontSize: 19, fontWeight: '900', textAlign: 'right' },
  chipRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 7 },
  chip: { backgroundColor: '#0A1118', borderWidth: 1, borderColor: 'rgba(255,255,255,.10)', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 7 },
  chipActive: { backgroundColor: '#64131C', borderColor: '#E33B47' },
  chipText: { color: '#DDE5EA', fontSize: 10, fontWeight: '900' },
  input: { backgroundColor: '#070C12', borderWidth: 1, borderColor: 'rgba(255,255,255,.10)', borderRadius: 10, color: '#fff', paddingHorizontal: 11, paddingVertical: 10, fontSize: 12, textAlign: 'right' },
  formLabel: { color: '#8B96A1', fontSize: 9, fontWeight: '900', textAlign: 'right' },
  uploadButton: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,75,85,.28)', backgroundColor: 'rgba(255,50,65,.05)', padding: 10 },
  uploadText: { color: '#FF747B', fontSize: 10, fontWeight: '900' },
  disabled: { opacity: .55 },
  runtimeError: { minHeight: 420, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#080E14', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,73,84,.25)', padding: 28 },
  runtimeErrorTitle: { color: '#F3F5F7', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  runtimeErrorBody: { color: '#AAB4BE', fontSize: 12, lineHeight: 18, textAlign: 'center', maxWidth: 760 },
  retryButton: { backgroundColor: '#D82F3C', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 11, marginTop: 8 },
  retryText: { color: '#fff', fontSize: 12, fontWeight: '900' },
});
