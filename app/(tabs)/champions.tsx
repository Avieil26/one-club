import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

import { Screen, colors } from '@/components/ui';
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

const PLAYER_POSITIONS = [
  ['ST', '50%', '8%'],
  ['CAM', '50%', '31%'],
  ['LM', '22%', '29%'],
  ['RM', '78%', '29%'],
  ['CM', '38%', '50%'],
  ['CM', '62%', '50%'],
  ['LB', '12%', '72%'],
  ['CB', '37%', '72%'],
  ['CB', '63%', '72%'],
  ['RB', '88%', '72%'],
  ['GK', '50%', '91%'],
] as const;

function Panel({ children, style }: { children: ReactNode; style?: object }) {
  return (
    <View style={[styles.panel, style]}>
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(18,8,11,.97)', 'rgba(5,8,13,.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {children}
    </View>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.sectionTitle}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={18} color="#FF4B55" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitleText}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function SourceTag({ text }: { text: string }) {
  return (
    <View style={styles.sourceTag}>
      <Ionicons name="checkmark-circle-outline" size={14} color="#69E39A" />
      <Text style={styles.sourceTagText}>{text}</Text>
    </View>
  );
}

function Pitch({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.pitch, compact && styles.pitchCompact]}>
      <View style={styles.pitchLineCenter} />
      <View style={styles.pitchCenterCircle} />
      {PLAYER_POSITIONS.map(([label, left, top], index) => (
        <View
          key={`${label}-${index}`}
          style={[
            styles.playerDot,
            compact && styles.playerDotCompact,
            { left: left as any, top: top as any },
          ]}
        >
          <Text style={[styles.playerText, compact && styles.playerTextCompact]}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

function Stat({
  value,
  label,
  accent = '#FFF',
}: {
  value: string;
  label: string;
  accent?: string;
}) {
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
  const desktop = width >= 1050;
  const [tab, setTab] = useState<MainTab>('hub');
  const [items, setItems] = useState<CommunityItem[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [composerKind, setComposerKind] = useState<ContentKind>('tactic');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [formation, setFormation] = useState('4-2-3-1');
  const [platform, setPlatform] = useState<PlatformId>('ps5');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function loadCommunity() {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('champions_content')
      .select('id,user_id,kind,title,body,formation,platform,settings,image_uris,featured,created_at')
      .order('created_at', { ascending: false })
      .limit(30);
    if (!error) setItems((data ?? []) as CommunityItem[]);
  }

  useEffect(() => {
    void loadCommunity();
  }, []);

  const community = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        user: app.profiles.find((profile) => profile.id === item.user_id)?.displayName ?? 'שחקן',
      })),
    [items, app.profiles],
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
      Alert.alert('צריך להתחבר', 'כדי לפרסם טקטיקה צריך להתחבר למשתמש.');
      return;
    }

    if (title.trim().length < 2 || body.trim().length < 2) {
      Alert.alert('חסר תוכן', 'מלאו כותרת והסבר קצר.');
      return;
    }

    setBusy(true);
    try {
      const images = imageUris.length ? await uploadProofs(app.user.id, imageUris, 'champions') : [];
      const { error } = await getSupabase()
        .from('champions_content')
        .insert({
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
      Alert.alert('נשלח לבדיקה', 'התוכן נשמר ויופיע לקהילה לאחר אישור.');
      await loadCommunity();
    } catch (error) {
      Alert.alert('הפרסום נכשל', error instanceof Error ? error.message : 'נסו שוב.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen scene="champions" refreshing={busy} onRefresh={loadCommunity} maxWidth={desktop ? 1480 : 1120}>
      <Stack.Screen options={{ title: 'FUT Champions' }} />

      <LinearGradient
        colors={['rgba(82,5,13,.95)', 'rgba(20,5,10,.98)', 'rgba(5,8,13,.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroTextureA} />
        <View style={styles.heroTextureB} />

        <View style={[styles.heroTop, desktop && { flexDirection: 'row-reverse' }]}>
          <View style={styles.proBlock}>
            <View style={styles.proBadge}>
              <Ionicons name="trophy" size={21} color="#FFD36A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroKicker}>FEATURED PRO PLAYER</Text>
              <Text style={styles.heroTitle}>{TEKKZ.name}</Text>
              <Text style={styles.heroSubtitle}>EA FC 27 · FUT Champions · {TEKKZ.badge}</Text>
              <Text style={styles.heroSource}>{TEKKZ.sourceLabel}</Text>
            </View>
          </View>

          <View style={styles.personalRecord}>
            <View style={styles.personalHead}>
              <View>
                <Text style={styles.personalEyebrow}>המאזן שלי</Text>
                <Text style={styles.personalHint}>הנתונים יישארו לפי התוצאות האמיתיות שלך</Text>
              </View>
              <View style={styles.liveDot} />
            </View>
            <View style={styles.personalStats}>
              <Stat value="0 - 0" label="W / L" />
              <Stat value="15" label="MATCHES" />
              <Stat value="—" label="RANK" accent="#FFD36A" />
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '0%' }]} />
            </View>
            <View style={styles.personalMeta}>
              <Text style={styles.metaText}>טרם התחלת את ה־Finals</Text>
              <Text style={styles.metaText}>0 / 15</Text>
            </View>
          </View>

          <View style={styles.rewardPreview}>
            <Text style={styles.rewardPreviewKicker}>הפרסים שלי</Text>
            <Text style={styles.rewardPreviewValue}>לפי המאזן בפועל</Text>
            <Text style={styles.rewardPreviewSub}>הדירוג והפרסים יחושבו מהתוצאה שלך</Text>
            <View style={styles.rewardIcons}>
              <View style={styles.rewardIcon}><Ionicons name="cash-outline" size={20} color="#F5CF66" /></View>
              <View style={styles.rewardIcon}><Ionicons name="shield-outline" size={20} color="#FF666F" /></View>
              <View style={styles.rewardIcon}><Ionicons name="gift-outline" size={20} color="#D9E2EA" /></View>
            </View>
          </View>
        </View>

        <View style={styles.subTabs}>
          <Pressable onPress={() => setTab('hub')} style={[styles.subTab, tab === 'hub' && styles.subTabOn]}>
            <Ionicons name="grid-outline" size={17} color={tab === 'hub' ? '#fff' : '#A8B0B8'} />
            <Text style={[styles.subTabText, tab === 'hub' && styles.subTabTextOn]}>מרכז Champions</Text>
          </Pressable>
          <Pressable onPress={() => setTab('community')} style={[styles.subTab, tab === 'community' && styles.subTabOn]}>
            <Ionicons name="people-outline" size={17} color={tab === 'community' ? '#fff' : '#A8B0B8'} />
            <Text style={[styles.subTabText, tab === 'community' && styles.subTabTextOn]}>שחקני הקהילה</Text>
          </Pressable>
        </View>
      </LinearGradient>

      {tab === 'hub' ? (
        <>
          <View style={[styles.actionRail, desktop && { flexDirection: 'row-reverse' }]}>
            {[
              ['git-network-outline', 'Tactics', 'מערך והוראות'],
              ['settings-outline', 'Game Settings', 'הגדרות משחק'],
              ['game-controller-outline', 'Controller Settings', 'הגדרות שלט'],
              ['bulb-outline', 'Tips & Tricks', 'טיפים'],
              ['copy-outline', 'Tactic Code', 'קוד טקטיקה'],
            ].map(([icon, titleLabel, sub]) => (
              <Pressable key={titleLabel} style={styles.actionCard}>
                <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={22} color="#BFD0DF" />
                <Text style={styles.actionTitle}>{titleLabel}</Text>
                <Text style={styles.actionSub}>{sub}</Text>
              </Pressable>
            ))}
          </View>

          <View style={[styles.mainGrid, desktop && { flexDirection: 'row-reverse' }]}>
            <Panel style={[styles.tacticPanel, desktop && { flex: 1.12 }]}>
              <SectionTitle icon="git-network-outline" title="הטקטיקה של Tekkz" subtitle="הפרטים שמופיעים כאן מסומנים כמקור ציבורי ולא כנתוני משתמש." />
              <SourceTag text="Tekkz · Publicly Published · EA FC 27" />

              <View style={styles.tacticBody}>
                <View style={{ flex: 1.05 }}>
                  <Text style={styles.formationTitle}>{TEKKZ.formation}</Text>
                  <Text style={styles.formationSub}>Main Tactic · {TEKKZ.platform}</Text>
                  <Pitch />
                  <View style={styles.tacticRows}>
                    <SettingRow label="Build Up Style" value={TEKKZ.buildUp} />
                    <SettingRow label="Defensive Approach" value={TEKKZ.defensive} />
                    <SettingRow label="Line Height" value={TEKKZ.depth} />
                  </View>
                </View>

                <View style={styles.rolesColumn}>
                  <Text style={styles.rolesTitle}>Player Roles & Focus</Text>
                  <ScrollView style={{ maxHeight: 355 }} nestedScrollEnabled>
                    {TEKKZ.roles.map(([position, role, focus]) => (
                      <View key={position} style={styles.roleRow}>
                        <View style={styles.rolePosition}><Text style={styles.rolePositionText}>{position}</Text></View>
                        <Text style={styles.roleName}>{role}</Text>
                        <Text style={styles.roleFocus}>{focus}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.codeBox}>
                <View>
                  <Text style={styles.codeLabel}>TACTIC CODE</Text>
                  <Text style={styles.codeValue}>{TEKKZ.code}</Text>
                </View>
                <Pressable style={styles.copyButton}>
                  <Ionicons name="copy-outline" size={16} color="#fff" />
                  <Text style={styles.copyButtonText}>Copy</Text>
                </Pressable>
              </View>
            </Panel>

            <View style={[styles.sideColumn, desktop && { flex: 0.78 }]}>
              <Panel>
                <SectionTitle icon="game-controller-outline" title="Controller Settings" subtitle="נשמור כאן רק נתונים שפורסמו ואומתו ל־FC 27." />
                <View style={styles.unverifiedBox}>
                  <Ionicons name="shield-checkmark-outline" size={28} color="#D3A94E" />
                  <Text style={styles.unverifiedTitle}>Not Published / Not Verified</Text>
                  <Text style={styles.unverifiedBody}>
                    לא מצאנו כרגע מקור ציבורי מספיק אמין שמפרסם את הגדרות השלט של Tekkz ל־FC 27, ולכן אנחנו לא ממציאים אותן.
                  </Text>
                </View>
                <View style={styles.platformPills}>
                  <View style={styles.platformPillOn}><Text style={styles.platformPillText}>PlayStation</Text></View>
                  <View style={styles.platformPill}><Text style={styles.platformPillTextMuted}>Xbox</Text></View>
                  <View style={styles.platformPill}><Text style={styles.platformPillTextMuted}>PC</Text></View>
                </View>
              </Panel>

              <Panel>
                <SectionTitle icon="gift-outline" title="פרסים" subtitle="הנתונים יחושבו מתוך המאזן של המשתמש ובמסגרת ה־Champions הפעילה." />
                <View style={styles.rewardList}>
                  <View style={styles.rewardLine}><Text style={styles.rewardLineLabel}>Coins</Text><Text style={styles.rewardLineValue}>—</Text></View>
                  <View style={styles.rewardLine}><Text style={styles.rewardLineLabel}>Champions Tokens</Text><Text style={styles.rewardLineValue}>—</Text></View>
                  <View style={styles.rewardLine}><Text style={styles.rewardLineLabel}>CQP</Text><Text style={styles.rewardLineValue}>—</Text></View>
                </View>
                <Text style={styles.officialNote}>המשחק קובע את הפרס לפי הביצועים באירוע הנוכחי. המקור הקובע הוא ה־in-game rewards.</Text>
              </Panel>
            </View>
          </View>

          <Panel>
            <SectionTitle icon="people-outline" title="מה חדש בקהילה" subtitle={community.length ? 'תוכן אמיתי שנשלח על ידי שחקנים.' : 'עדיין אין תוכן קהילתי שפורסם.'} />
            {community.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {community.slice(0, 6).map((item) => (
                  <View key={item.id} style={styles.communityPreview}>
                    <View style={styles.communityPreviewTop}>
                      <View style={styles.miniPitchWrap}><Pitch compact /></View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.communityPreviewTitle}>{item.title}</Text>
                        <Text style={styles.communityPreviewMeta}>{item.user} · {item.platform === 'ps5' ? 'PS5' : item.platform === 'xbox' ? 'Xbox' : 'PC'}</Text>
                      </View>
                    </View>
                    <Text numberOfLines={3} style={styles.communityPreviewBody}>{item.body}</Text>
                    <Text style={styles.communityPreviewSource}>Community Submission</Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={28} color="#68737F" />
                <Text style={styles.emptyTitle}>עדיין אין פרופילי Champions בקהילה</Text>
                <Text style={styles.emptyBody}>הכרטיסיות יתמלאו כששחקנים יפרסמו את המערכים, ההגדרות והטיפים שלהם.</Text>
              </View>
            )}
          </Panel>
        </>
      ) : (
        <>
          <Panel>
            <View style={[styles.communityHeader, desktop && { flexDirection: 'row-reverse' }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.communityTitleBig}>שחקני הקהילה</Text>
                <Text style={styles.communitySubtitle}>כל כרטיס יהפוך בהמשך לפרופיל Champions שבועי עם מאזן, מערך, טיפים והגדרות.</Text>
              </View>
              <Pressable onPress={() => { setComposerKind('tactic'); setShowComposer(true); }} style={styles.publishTopButton}>
                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                <Text style={styles.publishTopText}>פרסום Setup</Text>
              </Pressable>
            </View>
          </Panel>

          {community.length ? (
            <View style={styles.communityGrid}>
              {community.map((item) => (
                <Pressable key={item.id} style={styles.playerCard}>
                  <View style={styles.playerCardGlow} />
                  <View style={styles.playerCardTop}>
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person-outline" size={28} color="#C6D0DA" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.playerCardName}>{item.user}</Text>
                      <Text style={styles.playerCardMeta}>EA FC 27 · {item.platform === 'ps5' ? 'PS5' : item.platform === 'xbox' ? 'Xbox' : 'PC'}</Text>
                      <Text style={styles.playerCardSource}>Community Submission</Text>
                    </View>
                    <Ionicons name="chevron-back" size={18} color="#7F8B96" />
                  </View>

                  <View style={styles.playerCardRecord}>
                    <View><Text style={styles.recordTiny}>MAKER</Text><Text style={styles.recordBig}>{item.formation ?? '—'}</Text></View>
                    <View><Text style={styles.recordTiny}>W / L</Text><Text style={styles.recordBig}>—</Text></View>
                    <View><Text style={styles.recordTiny}>WEEK</Text><Text style={styles.recordBig}>—</Text></View>
                  </View>

                  <View style={styles.cardDivider} />
                  <View style={styles.cardMetaRow}>
                    <View><Text style={styles.cardMetaLabel}>Tactics</Text><Text style={styles.cardMetaValue}>{item.formation ?? 'לא פורסם'}</Text></View>
                    <View><Text style={styles.cardMetaLabel}>Tips</Text><Text style={styles.cardMetaValue}>{item.kind === 'tip' ? 'פורסם' : '—'}</Text></View>
                    <View><Text style={styles.cardMetaLabel}>Controller</Text><Text style={styles.cardMetaValue}>—</Text></View>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCommunityLarge}>
              <Ionicons name="people-circle-outline" size={54} color="#58616C" />
              <Text style={styles.emptyTitle}>אין עדיין שחקנים להצגה</Text>
              <Text style={styles.emptyBody}>הכרטיסיות יופיעו כאן רק אחרי שמשתמשים יעלו את ה־Setup שלהם.</Text>
              <Pressable onPress={() => { setComposerKind('tactic'); setShowComposer(true); }} style={styles.publishTopButton}>
                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                <Text style={styles.publishTopText}>היה הראשון לפרסם</Text>
              </Pressable>
            </View>
          )}
        </>
      )}      {showComposer ? (
        <View style={styles.modalBackdrop}>
          <Panel style={styles.composer}>
            <View style={styles.composerHeader}>
              <Text style={styles.composerTitle}>פרסום Setup ל־Champions</Text>
              <Pressable onPress={() => setShowComposer(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </Pressable>
            </View>

            <View style={styles.composerTypes}>
              {(['tactic', 'tip', 'guide'] as ContentKind[]).map((kind) => (
                <Pressable key={kind} onPress={() => setComposerKind(kind)} style={[styles.typeChip, composerKind === kind && styles.typeChipOn]}>
                  <Text style={styles.typeChipText}>{kind === 'tactic' ? 'טקטיקה' : kind === 'tip' ? 'טיפ' : 'מדריך'}</Text>
                </Pressable>
              ))}
            </View>

            <TextInput value={title} onChangeText={setTitle} placeholder="כותרת" placeholderTextColor="#6A7480" style={styles.input} />
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="הסבר קצר, ברור ושימושי"
              placeholderTextColor="#6A7480"
              multiline
              style={[styles.input, { minHeight: 110, textAlignVertical: 'top' }]}
            />

            {composerKind === 'tactic' ? (
              <>
                <Text style={styles.formLabel}>Formation</Text>
                <View style={styles.composerTypes}>
                  {['4-2-3-1', '4-4-1-1', '4-3-1-2', '4-2-2-2'].map((value) => (
                    <Pressable key={value} onPress={() => setFormation(value)} style={[styles.typeChip, formation === value && styles.typeChipOn]}>
                      <Text style={styles.typeChipText}>{value}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.formLabel}>Platform</Text>
                <View style={styles.composerTypes}>
                  {(['ps5', 'xbox', 'pc'] as PlatformId[]).map((value) => (
                    <Pressable key={value} onPress={() => setPlatform(value)} style={[styles.typeChip, platform === value && styles.typeChipOn]}>
                      <Text style={styles.typeChipText}>{value === 'ps5' ? 'PlayStation' : value === 'xbox' ? 'Xbox' : 'PC'}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}

            <Pressable onPress={chooseImage} style={styles.uploadButton}>
              <Ionicons name="image-outline" size={18} color="#FF6B73" />
              <Text style={styles.uploadText}>{imageUris.length ? 'צילום נבחר' : 'הוספת צילום מסך'}</Text>
            </Pressable>

            <Pressable disabled={busy} onPress={publish} style={[styles.publishButton, busy && { opacity: 0.55 }]}>
              <Text style={styles.publishText}>{busy ? 'מפרסם...' : 'שליחה לבדיקה'}</Text>
            </Pressable>
          </Panel>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 62, 74, .58)',
    paddingTop: 8,
  },
  heroTextureA: {
    position: 'absolute',
    width: 900,
    height: 180,
    top: 90,
    left: -170,
    backgroundColor: 'rgba(255, 51, 68, .12)',
    transform: [{ rotate: '-11deg' }],
  },
  heroTextureB: {
    position: 'absolute',
    width: 880,
    height: 130,
    bottom: 70,
    right: -180,
    backgroundColor: 'rgba(160, 15, 30, .16)',
    transform: [{ rotate: '-11deg' }],
  },
  heroTop: {
    padding: 18,
    gap: 14,
  },
  proBlock: {
    flex: 1.08,
    minWidth: 260,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.10)',
    backgroundColor: 'rgba(4,6,10,.60)',
    borderRadius: 16,
    padding: 15,
  },
  proBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#A97A31',
    backgroundColor: 'rgba(14,6,8,.86)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroKicker: { color: '#FF9CA2', fontSize: 10, fontWeight: '900', letterSpacing: 1.7, textAlign: 'right' },
  heroTitle: { color: '#FFF8EF', fontSize: 36, fontWeight: '900', letterSpacing: .8, textAlign: 'right' },
  heroSubtitle: { color: '#CDD5DE', fontSize: 13, fontWeight: '700', textAlign: 'right', marginTop: 2 },
  heroSource: { color: '#79E5A4', fontSize: 10, fontWeight: '700', textAlign: 'right', marginTop: 8 },
  personalRecord: {
    flex: 1.02,
    minWidth: 320,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.11)',
    backgroundColor: 'rgba(3,5,9,.78)',
    borderRadius: 16,
    padding: 16,
  },
  personalHead: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  personalEyebrow: { color: '#F4F7F2', fontSize: 18, fontWeight: '900', textAlign: 'right' },
  personalHint: { color: '#747F8A', fontSize: 10, fontWeight: '700', textAlign: 'right', marginTop: 3 },
  liveDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#F03640', shadowColor: '#F03640', shadowOpacity: .55, shadowRadius: 8 },
  personalStats: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 14 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '900', textAlign: 'center' },
  statLabel: { color: '#6E7985', fontSize: 9, fontWeight: '900', marginTop: 2, textAlign: 'center' },
  progressTrack: { height: 7, borderRadius: 5, backgroundColor: '#1B2026', overflow: 'hidden', marginTop: 13 },
  progressFill: { height: '100%', backgroundColor: '#F23542', borderRadius: 5 },
  personalMeta: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 7 },
  metaText: { color: '#8D98A3', fontSize: 10, fontWeight: '700' },
  rewardPreview: {
    flex: .64,
    minWidth: 230,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.10)',
    backgroundColor: 'rgba(6,7,10,.78)',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
  },
  rewardPreviewKicker: { color: '#DDE5EC', fontSize: 12, fontWeight: '900', textAlign: 'right' },
  rewardPreviewValue: { color: '#F6C95D', fontSize: 17, fontWeight: '900', textAlign: 'right', marginTop: 10 },
  rewardPreviewSub: { color: '#75808B', fontSize: 10, fontWeight: '700', lineHeight: 16, textAlign: 'right', marginTop: 4 },
  rewardIcons: { flexDirection: 'row-reverse', gap: 8, marginTop: 12 },
  rewardIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)' },
  subTabs: { flexDirection: 'row-reverse', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.10)', paddingHorizontal: 12 },
  subTab: { minWidth: 170, flexDirection: 'row-reverse', gap: 8, alignItems: 'center', justifyContent: 'center', minHeight: 52, paddingHorizontal: 16, borderRadius: 12, marginVertical: 8 },
  subTabOn: { backgroundColor: '#E93241', borderWidth: 1, borderColor: '#FF6A72' },
  subTabText: { color: '#A8B0B8', fontSize: 13, fontWeight: '900' },
  subTabTextOn: { color: '#fff' },
  actionRail: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: { flex: 1, minWidth: 165, minHeight: 84, backgroundColor: 'rgba(7,11,16,.92)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,.10)', padding: 12, justifyContent: 'center', alignItems: 'center', gap: 4 },
  actionTitle: { color: '#E9EEF3', fontSize: 12, fontWeight: '900' },
  actionSub: { color: '#707B86', fontSize: 10, fontWeight: '700' },
  mainGrid: { gap: 12 },
  sideColumn: { gap: 12, minWidth: 320 },
  panel: { position: 'relative', backgroundColor: '#070B10', borderRadius: 17, borderWidth: 1, borderColor: 'rgba(255,255,255,.09)', padding: 16, overflow: 'hidden', gap: 13 },
  sectionTitle: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  sectionIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(242,53,66,.10)', borderWidth: 1, borderColor: 'rgba(242,53,66,.22)', alignItems: 'center', justifyContent: 'center' },
  sectionTitleText: { color: '#F2F4F6', fontSize: 18, fontWeight: '900', textAlign: 'right' },
  sectionSubtitle: { color: '#77828D', fontSize: 11, fontWeight: '700', textAlign: 'right', marginTop: 2 },
  sourceTag: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(103,228,154,.07)', borderWidth: 1, borderColor: 'rgba(103,228,154,.18)', borderRadius: 14, paddingHorizontal: 9, paddingVertical: 6 },
  sourceTagText: { color: '#77E5A7', fontSize: 10, fontWeight: '800' },
  tacticPanel: { minWidth: 640 },
  tacticBody: { flexDirection: 'row-reverse', gap: 16 },
  formationTitle: { color: '#F5F7F9', fontSize: 25, fontWeight: '900', textAlign: 'right' },
  formationSub: { color: '#78838D', fontSize: 10, fontWeight: '700', textAlign: 'right', marginBottom: 10 },
  pitch: { height: 320, width: '100%', backgroundColor: '#12331F', borderRadius: 14, borderWidth: 1, borderColor: '#42724E', position: 'relative', overflow: 'hidden' },
  pitchCompact: { height: 112, width: 155, borderRadius: 9, borderColor: '#356343' },
  pitchLineCenter: { position: 'absolute', left: 0, right: 0, top: '50%', height: 1, backgroundColor: 'rgba(255,255,255,.23)' },
  pitchCenterCircle: { position: 'absolute', width: 80, height: 80, borderRadius: 40, left: '50%', top: '50%', marginLeft: -40, marginTop: -40, borderWidth: 1, borderColor: 'rgba(255,255,255,.22)' },
  playerDot: { position: 'absolute', width: 34, height: 34, borderRadius: 17, marginLeft: -17, marginTop: -17, backgroundColor: '#D02E3E', borderWidth: 2, borderColor: '#F6D57F', alignItems: 'center', justifyContent: 'center' },
  playerDotCompact: { width: 18, height: 18, borderRadius: 9, marginLeft: -9, marginTop: -9, borderWidth: 1 },
  playerText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  playerTextCompact: { fontSize: 5 },
  tacticRows: { marginTop: 12, gap: 1 },
  settingRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,.06)' },
  settingLabel: { color: '#7D8893', fontSize: 11, fontWeight: '700', flex: 1, textAlign: 'right' },
  settingValue: { color: '#EDF1F4', fontSize: 12, fontWeight: '900', textAlign: 'right' },
  rolesColumn: { flex: .96, minWidth: 285, paddingTop: 4 },
  rolesTitle: { color: '#B8C4CF', fontSize: 12, fontWeight: '900', textAlign: 'right', marginBottom: 8 },
  roleRow: { minHeight: 38, flexDirection: 'row-reverse', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,.055)' },
  rolePosition: { width: 38, height: 24, borderRadius: 7, backgroundColor: '#101A24', alignItems: 'center', justifyContent: 'center' },
  rolePositionText: { color: '#DDE6EE', fontSize: 9, fontWeight: '900' },
  roleName: { flex: 1, color: '#EAEFF3', fontSize: 10, fontWeight: '800', textAlign: 'right' },
  roleFocus: { color: '#FF6B74', fontSize: 9, fontWeight: '900' },
  codeBox: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(227,179,65,.22)', backgroundColor: 'rgba(227,179,65,.045)', padding: 12 },
  codeLabel: { color: '#9D8A58', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  codeValue: { color: '#F7D66F', fontSize: 14, fontWeight: '900', marginTop: 3 },
  copyButton: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 9, backgroundColor: '#D92F3B', paddingHorizontal: 11, paddingVertical: 8 },
  copyButtonText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  unverifiedBox: { borderRadius: 13, backgroundColor: 'rgba(209,168,72,.05)', borderWidth: 1, borderColor: 'rgba(209,168,72,.20)', padding: 13, alignItems: 'center', gap: 8 },
  unverifiedTitle: { color: '#F0D077', fontSize: 12, fontWeight: '900', textAlign: 'center' },
  unverifiedBody: { color: '#9AA5AF', fontSize: 11, lineHeight: 17, fontWeight: '700', textAlign: 'right' },
  platformPills: { flexDirection: 'row-reverse', gap: 7, justifyContent: 'center' },
  platformPill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: '#0E141B', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)' },
  platformPillOn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: '#DFF2E6', borderWidth: 1, borderColor: '#80D19E' },
  platformPillText: { color: '#0B1510', fontSize: 10, fontWeight: '900' },
  platformPillTextMuted: { color: '#8E9AA4', fontSize: 10, fontWeight: '800' },
  rewardList: { gap: 3 },
  rewardLine: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,.06)' },
  rewardLineLabel: { color: '#8D98A2', fontSize: 11, fontWeight: '800' },
  rewardLineValue: { color: '#EFF2F4', fontSize: 12, fontWeight: '900' },
  officialNote: { color: '#68737E', fontSize: 10, lineHeight: 16, textAlign: 'right', fontWeight: '700', marginTop: 5 },
  communityPreview: { width: 325, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', backgroundColor: '#090F16', padding: 12, gap: 9 },
  communityPreviewTop: { flexDirection: 'row-reverse', gap: 10, alignItems: 'center' },
  miniPitchWrap: { width: 155, height: 112, overflow: 'hidden', borderRadius: 9 },
  communityPreviewTitle: { color: '#EEF2F5', fontSize: 14, fontWeight: '900', textAlign: 'right' },
  communityPreviewMeta: { color: '#8C97A1', fontSize: 10, fontWeight: '800', textAlign: 'right', marginTop: 3 },
  communityPreviewBody: { color: '#A0AAB4', fontSize: 11, lineHeight: 17, textAlign: 'right' },
  communityPreviewSource: { color: '#61707B', fontSize: 9, fontWeight: '800', textAlign: 'right' },
  emptyState: { minHeight: 145, alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,.06)', backgroundColor: 'rgba(6,10,14,.65)', padding: 20 },
  emptyTitle: { color: '#D7DEE4', fontSize: 14, fontWeight: '900', textAlign: 'center' },
  emptyBody: { color: '#75808B', fontSize: 11, lineHeight: 17, textAlign: 'center', maxWidth: 620 },
  communityHeader: { gap: 12, alignItems: 'center' },
  communityTitleBig: { color: '#F3F5F7', fontSize: 28, fontWeight: '900', textAlign: 'right' },
  communitySubtitle: { color: '#7B8690', fontSize: 11, lineHeight: 17, fontWeight: '700', textAlign: 'right', marginTop: 3 },
  publishTopButton: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#D92F3B', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  publishTopText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  communityGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 },
  playerCard: { flex: 1, minWidth: 315, maxWidth: 460, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,.10)', backgroundColor: '#080D13', padding: 14, overflow: 'hidden' },
  playerCardGlow: { position: 'absolute', width: 230, height: 230, top: -120, right: -80, borderRadius: 115, backgroundColor: 'rgba(221,47,63,.10)' },
  playerCardTop: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  avatarPlaceholder: { width: 66, height: 66, borderRadius: 18, backgroundColor: '#111923', borderWidth: 1, borderColor: 'rgba(255,255,255,.09)', alignItems: 'center', justifyContent: 'center' },
  playerCardName: { color: '#EEF2F5', fontSize: 17, fontWeight: '900', textAlign: 'right' },
  playerCardMeta: { color: '#84909B', fontSize: 10, fontWeight: '800', textAlign: 'right', marginTop: 2 },
  playerCardSource: { color: '#6DE19A', fontSize: 9, fontWeight: '800', textAlign: 'right', marginTop: 5 },
  playerCardRecord: { marginTop: 14, flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,.06)' },
  recordTiny: { color: '#697580', fontSize: 8, fontWeight: '900', textAlign: 'right', letterSpacing: 1 },
  recordBig: { color: '#EEF2F4', fontSize: 18, fontWeight: '900', textAlign: 'right', marginTop: 3 },
  cardDivider: { height: 7 },
  cardMetaRow: { flexDirection: 'row-reverse', gap: 12 },
  cardMetaLabel: { color: '#68747F', fontSize: 9, fontWeight: '800', textAlign: 'right' },
  cardMetaValue: { color: '#DDE5EB', fontSize: 10, fontWeight: '900', textAlign: 'right', marginTop: 2 },
  emptyCommunityLarge: { minHeight: 320, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 28, backgroundColor: '#080D13', borderRadius: 17, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)' },
  modalBackdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,.78)', padding: 18, justifyContent: 'center', zIndex: 50 },
  composer: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  composerHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  composerTitle: { color: '#F5F7F9', fontSize: 20, fontWeight: '900', textAlign: 'right' },
  composerTypes: { flexDirection: 'row-reverse', gap: 8, flexWrap: 'wrap' },
  typeChip: { borderWidth: 1, borderColor: 'rgba(255,255,255,.10)', borderRadius: 18, paddingHorizontal: 13, paddingVertical: 8, backgroundColor: '#0A1118' },
  typeChipOn: { backgroundColor: '#64131C', borderColor: '#E43C49' },
  typeChipText: { color: '#DCE4EA', fontSize: 11, fontWeight: '900' },
  input: { borderWidth: 1, borderColor: 'rgba(255,255,255,.10)', backgroundColor: '#070C12', color: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, textAlign: 'right', fontSize: 13 },
  formLabel: { color: '#8B96A1', fontSize: 10, fontWeight: '900', textAlign: 'right', marginTop: 2 },
  uploadButton: { borderWidth: 1, borderColor: 'rgba(255,75,85,.30)', backgroundColor: 'rgba(255,50,65,.05)', borderRadius: 10, padding: 11, alignItems: 'center', justifyContent: 'center', flexDirection: 'row-reverse', gap: 7 },
  uploadText: { color: '#FF777E', fontSize: 11, fontWeight: '900' },
  publishButton: { backgroundColor: '#E3333F', borderRadius: 11, padding: 13, alignItems: 'center', justifyContent: 'center' },
  publishText: { color: '#fff', fontSize: 13, fontWeight: '900' },
});
