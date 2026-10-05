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

type Kind = 'champions' | 'rewards' | 'tactics' | 'tips';
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

const rewards = [
  { rank: 'דירוג 1–2', tone: '#D72A32', icon: 'diamond', coins: '125,000', tokens: '2' },
  { rank: 'דירוג 3–4', tone: '#D0A13A', icon: 'star', coins: '100,000', tokens: '2' },
  { rank: 'דירוג 5–6', tone: '#9AA2AB', icon: 'medal', coins: '75,000', tokens: '1' },
];

const settingsRows = [
  ['Competitive Preset', 'On'],
  ['Auto Shots', 'Off'],
  ['Shot Assistance', 'Semi'],
  ['Through Pass Assistance', 'Assisted'],
  ['Player Switching', 'Right Stick'],
  ['Analog Sprint', 'Off'],
];

const communityFallback = [
  { id: 'f1', title: 'לחץ גבוה אחרי איבוד', body: 'עובד מצוין כשהיריב בונה לאט. שמרו את ה-CAM קרוב לחלוץ.', formation: '4-2-3-1', platform: 'xbox' as PlatformId, user: 'ZizouFC', votes: 342 },
  { id: 'f2', title: '4-3-1-2 מאוזן', body: 'מערך יציב למשחקי Champions ארוכים. לא לפתוח את הקווים מוקדם מדי.', formation: '4-3-1-2', platform: 'xbox' as PlatformId, user: 'TikiTakaKing', votes: 298 },
  { id: 'f3', title: '4-4-1-1 לסגירת משחק', body: 'אחרי יתרון של שער: הורידו עומק ושמרו את ה-CM באמצע.', formation: '4-4-1-1', platform: 'ps5' as PlatformId, user: 'FutChris', votes: 241 },
];

function Controller({ platform }: { platform: PlatformId }) {
  return (
    <View style={styles.controller}>
      <Ionicons name="game-controller-outline" size={74} color="#F1F4F6" />
      <Text style={styles.controllerLabel}>{platform === 'xbox' ? 'Xbox' : platform === 'ps5' ? 'PlayStation' : 'PC'}</Text>
    </View>
  );
}

function Panel({ children, style }: { children: ReactNode; style?: object }) {
  return (
    <View style={[styles.panel, style]}>
      <LinearGradient colors={['rgba(26,9,12,.96)', 'rgba(5,9,14,.98)']} style={StyleSheet.absoluteFillObject} />
      {children}
    </View>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionTitle}>
      <View style={styles.sectionIcon}><Ionicons name={icon} size={19} color="#FF4B55" /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitleText}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

export default function ChampionsScreen() {
  const app = useApp();
  const { width } = useWindowDimensions();
  const desktop = width >= 1050;
  const [tab, setTab] = useState<Kind>('champions');
  const [platform, setPlatform] = useState<PlatformId>('xbox');
  const [items, setItems] = useState<CommunityItem[]>([]);
  const [voted, setVoted] = useState<string[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [composerKind, setComposerKind] = useState<ContentKind>('tactic');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [formation, setFormation] = useState('4-2-3-1');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function loadCommunity() {
    const supabase = getSupabase();
    const [{ data, error }, { data: votes }] = await Promise.all([
      supabase.from('champions_content').select('id,user_id,kind,title,body,formation,platform,settings,image_uris,featured,created_at').order('created_at', { ascending: false }).limit(30),
      app.user ? supabase.from('champions_votes').select('content_id').eq('user_id', app.user.id) : Promise.resolve({ data: [] as { content_id: string }[] }),
    ]);
    if (!error) setItems((data ?? []) as CommunityItem[]);
    setVoted((votes ?? []).map((v) => v.content_id));
  }

  useEffect(() => { void loadCommunity(); }, [app.user?.id]);

  const community = useMemo(() => {
    const remote = items.map((item) => ({
      ...item,
      user: app.profiles.find((p) => p.id === item.user_id)?.displayName ?? 'שחקן',
      votes: 0,
    }));
    return [...remote, ...communityFallback.filter((f) => !remote.some((r) => r.title === f.title))];
  }, [items, app.profiles]);

  async function vote(id: string) {
    if (!app.user) {
      Alert.alert('צריך להתחבר', 'כדי להצביע צריך להתחבר למשתמש.');
      return;
    }
    if (voted.includes(id)) return;
    const { error } = await getSupabase().from('champions_votes').insert({ content_id: id, user_id: app.user.id, value: 1 });
    if (error) { Alert.alert('רגע', 'ההצבעה לא נשמרה.'); return; }
    setVoted((current) => [...current, id]);
  }

  async function chooseImage() {
    try {
      const picked = await pickImages(1);
      if (picked.length) setImageUris(picked);
    } catch (e) { Alert.alert('רגע', e instanceof Error ? e.message : 'בחירת התמונה נכשלה'); }
  }

  async function publish() {
    if (!app.user) { Alert.alert('צריך להתחבר', 'כדי לפרסם טקטיקה צריך להתחבר.'); return; }
    if (title.trim().length < 2 || body.trim().length < 2) { Alert.alert('חסר תוכן', 'מלאו כותרת והסבר קצר.'); return; }
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
        settings: composerKind === 'tactic' ? { 'Competitive Preset': 'On', 'Auto Shots': 'Off', 'Shot Assistance': 'Semi' } : {},
        image_uris: images,
        status: 'pending',
        featured: false,
      });
      if (error) throw error;
      setTitle(''); setBody(''); setImageUris([]); setShowComposer(false);
      Alert.alert('נשלח לבדיקה', 'הטקטיקה נשמרה ותופיע לקהילה אחרי אישור.');
      await loadCommunity();
    } catch (e) {
      Alert.alert('הפרסום נכשל', e instanceof Error ? e.message : 'נסו שוב.');
    } finally { setBusy(false); }
  }

  const header = (
    <LinearGradient colors={['#22060A', '#690C12', '#14070A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <View style={styles.heroGlow} />
      <View style={[styles.heroGrid, desktop && { paddingHorizontal: 32 }]}>
        <View style={styles.heroCopy}>
          <View style={styles.crest}><Ionicons name="trophy" size={38} color="#FFD36A" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>COMPETE  ·  EARN  ·  REDEEM</Text>
            <Text style={styles.heroTitle}>FUT CHAMPIONS</Text>
            <Text style={styles.heroHebrew}>הטורניר שלך. הקצב שלך. הפרסים שלך.</Text>
          </View>
        </View>
        <View style={styles.recordCard}>
          <Text style={styles.recordKicker}>העונה הנוכחית · מסתיימת בעוד 12 ימים</Text>
          <View style={styles.recordRow}>
            <View><Text style={styles.recordValue}>11 - 4</Text><Text style={styles.recordLabel}>W / L</Text></View>
            <View><Text style={styles.recordValue}>15</Text><Text style={styles.recordLabel}>MATCH FINALS</Text></View>
            <View style={styles.rankCircle}><Text style={styles.rankNo}>1</Text><Text style={styles.rankLabel}>דירוג</Text></View>
          </View>
          <View style={styles.progressLine}><View style={styles.progressFill} /></View>
          <View style={styles.progressMeta}><Text style={styles.progressText}>התקדמות CQP</Text><Text style={styles.progressText}>750 / 1000</Text></View>
        </View>
      </View>
      <View style={styles.heroTabs}>
        {[
          ['champions', 'הצ׳מפיונס', 'trophy'],
          ['rewards', 'פרסים', 'gift-outline'],
          ['tactics', 'טקטיקות', 'git-network-outline'],
          ['tips', 'טיפים', 'bulb-outline'],
        ].map(([id, label, icon]) => (
          <Pressable key={id} onPress={() => setTab(id as Kind)} style={[styles.heroTab, tab === id && styles.heroTabOn]}>
            <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={tab === id ? '#fff' : '#AAB0B8'} />
            <Text style={[styles.heroTabText, tab === id && styles.heroTabTextOn]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </LinearGradient>
  );

  return (
    <Screen scene="ultimate" refreshing={busy} onRefresh={loadCommunity} maxWidth={desktop ? 1420 : 1120}>
      <Stack.Screen options={{ title: 'FUT Champions' }} />
      {header}

      {tab === 'champions' ? (
        <>
          <View style={[styles.grid, desktop && { flexDirection: 'row' }]}>
            <Panel style={[styles.progressPanel, desktop && { flex: 1.05 }]}>
              <SectionTitle icon="trophy-outline" title="התקדמות לצ׳מפיונס" subtitle="15 משחקים. כל משחק משנה את הסיום." />
              <View style={styles.matchTrack}>
                {Array.from({ length: 15 }).map((_, i) => (
                  <View key={i} style={[styles.matchDot, i < 11 ? styles.winDot : styles.lossDot]}>
                    <Text style={styles.matchDotText}>{i < 11 ? 'W' : 'L'}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.bigStats}>
                <View><Text style={styles.bigStat}>11</Text><Text style={styles.statCaption}>ניצחונות</Text></View>
                <View><Text style={styles.bigStat}>4</Text><Text style={styles.statCaption}>הפסדים</Text></View>
                <View><Text style={styles.bigStatGreen}>+3</Text><Text style={styles.statCaption}>מומנטום</Text></View>
              </View>
              <View style={styles.milestone}>
                <View><Text style={styles.milestoneLabel}>היעד הבא</Text><Text style={styles.milestoneValue}>12 ניצחונות</Text></View>
                <View style={styles.miniProgress}><View style={{ width: '74%', height: '100%', backgroundColor: '#F03640', borderRadius: 5 }} /></View>
                <Text style={styles.cqp}>CQP  +125</Text>
              </View>
              <View style={styles.qualify}><Ionicons name="flash-outline" size={20} color="#FF4752" /><Text style={styles.qualifyText}>מסלול הכניסה: Rivals + Squad Battles</Text><Text style={styles.qualifyMuted}>אין דרישת Division 6</Text></View>
            </Panel>

            <Panel style={[styles.rewardsPanel, desktop && { flex: .95 }]}>
              <SectionTitle icon="gift-outline" title="פרסים" subtitle="התגמול משתנה לפי הדירוג הסופי שלך." />
              <View style={styles.rewardGrid}>
                {rewards.map((reward) => (
                  <View key={reward.rank} style={[styles.rewardCard, { borderColor: reward.tone + '88' }]}>
                    <Ionicons name={reward.icon as keyof typeof Ionicons.glyphMap} size={34} color={reward.tone} />
                    <Text style={styles.rewardRank}>{reward.rank}</Text>
                    <Text style={styles.rewardItem}>Champions Player Item</Text>
                    <Text style={styles.rewardItem}>Player Pick (1 of 3)</Text>
                    <Text style={styles.rewardCoins}>{reward.coins} Coins</Text>
                    <View style={styles.token}><Text>+ {reward.tokens} Champions Tokens</Text></View>
                  </View>
                ))}
              </View>
            </Panel>
          </View>

          <View style={[styles.grid, desktop && { flexDirection: 'row' }]}>
            <Panel style={[styles.tacticPanel, desktop && { flex: 1 }]}>
              <SectionTitle icon="git-network-outline" title="הטקטיקה שלי" subtitle="4-2-3-1 · מאוזן · לחץ אחרי איבוד" />
              <View style={styles.tacticBody}>
                <View style={styles.pitch}>
                  {['ST','CAM','LW','RW','CM','CM','LB','CB','CB','RB','GK'].map((p, i) => (
                    <View key={i} style={[styles.playerDot, { left: ['50%','50%','22%','78%','38%','62%','12%','37%','63%','88%','50%'][i] as any, top: ['8%','31%','29%','29%','50%','50%','72%','72%','72%','72%','91%'][i] as any }]}>
                      <Text style={styles.playerText}>{p}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.tacticSettings}>
                  {['Build Up Style|Balanced','Defensive Approach|Balanced','Width|50','Depth|50'].map((row) => {
                    const [a,b]=row.split('|'); return <View key={a} style={styles.settingRow}><Text style={styles.settingName}>{a}</Text><Text style={styles.settingValue}>{b}</Text></View>;
                  })}
                </View>
              </View>
            </Panel>

            <Panel style={[styles.settingsPanel, desktop && { flex: 1 }]}>
              <SectionTitle icon="settings-outline" title="ההגדרות שלי" subtitle="הגדרות תחרותיות למשחק יציב ונקי." />
              <View style={styles.platformSwitch}>
                {(['xbox','ps5'] as PlatformId[]).map((p) => (
                  <Pressable key={p} onPress={() => setPlatform(p)} style={[styles.platformButton, platform === p && styles.platformButtonOn]}>
                    <Ionicons name="game-controller-outline" size={17} color={platform === p ? '#101216' : '#AAB0B8'} />
                    <Text style={[styles.platformText, platform === p && styles.platformTextOn]}>{p === 'xbox' ? 'Xbox' : 'PlayStation'}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.controllerSettings}>
                <Controller platform={platform} />
                <View style={{ flex: 1 }}>
                  {settingsRows.map(([a,b]) => <View key={a} style={styles.settingRow}><Text style={styles.settingName}>{a}</Text><Text style={styles.settingValue}>{b}</Text></View>)}
                </View>
              </View>
              <Pressable onPress={() => { setComposerKind('tactic'); setShowComposer(true); }} style={styles.shareButton}>
                <Ionicons name="share-outline" size={18} color="#fff" /><Text style={styles.shareButtonText}>שתף את ההגדרות שלי</Text>
              </Pressable>
            </Panel>
          </View>

          <Panel>
            <SectionTitle icon="people-outline" title="הטקטיקות המובילות בקהילה" subtitle="הכי שימושיות והכי מדורגות השבוע." />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 2 }}>
              {community.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.communityCard}>
                  <View style={styles.miniPitch}><Text style={styles.miniFormation}>{item.formation ?? 'TIP'}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.communityTitle}>{item.title}</Text>
                    <Text style={styles.communityMeta}>{item.formation ?? 'טיפ'} · {item.user}</Text>
                    <Text numberOfLines={2} style={styles.communityBody}>{item.body}</Text>
                  </View>
                  <Pressable onPress={() => vote(item.id)} style={[styles.vote, voted.includes(item.id) && styles.voteOn]}>
                    <Ionicons name="thumbs-up-outline" size={15} color={voted.includes(item.id) ? '#67E59A' : '#AAB0B8'} />
                    <Text style={styles.voteText}>{voted.includes(item.id) ? 'אהבתי' : 'מועיל'}</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </Panel>
        </>
      ) : null}

      {tab === 'rewards' ? (
        <Panel>
          <SectionTitle icon="gift-outline" title="מסלול הפרסים" subtitle="היעדים החשובים לפי התוצאה שלך." />
          <View style={styles.rewardGrid}>{rewards.map((r) => <View key={r.rank} style={[styles.rewardCard, { borderColor: r.tone + '88' }]}><Ionicons name={r.icon as any} size={42} color={r.tone}/><Text style={styles.rewardRank}>{r.rank}</Text><Text style={styles.rewardItem}>Champions Player Item</Text><Text style={styles.rewardCoins}>{r.coins} Coins</Text><Text style={styles.token}>{r.tokens} Champions Tokens</Text></View>)}</View>
        </Panel>
      ) : null}

      {tab === 'tactics' ? (
        <>
          <Panel>
            <SectionTitle icon="git-network-outline" title="טקטיקות Champions" subtitle="מערכים, הוראות והגדרות שהקהילה באמת משתמשת בהן." />
            <View style={styles.tacticCatalog}>
              {community.filter((x) => x.formation).map((item) => (
                <View key={item.id} style={styles.catalogRow}>
                  <View style={styles.miniPitch}><Text style={styles.miniFormation}>{item.formation}</Text></View>
                  <View style={{ flex: 1 }}><Text style={styles.communityTitle}>{item.title}</Text><Text style={styles.communityMeta}>{item.user} · {item.platform === 'xbox' ? 'Xbox' : 'PlayStation'}</Text><Text style={styles.communityBody}>{item.body}</Text></View>
                  <Pressable onPress={() => vote(item.id)} style={styles.vote}><Ionicons name="thumbs-up-outline" size={15} color="#AAB0B8"/><Text style={styles.voteText}>מועיל</Text></Pressable>
                </View>
              ))}
            </View>
            <Pressable onPress={() => { setComposerKind('tactic'); setShowComposer(true); }} style={styles.bigCta}><Ionicons name="add-circle-outline" size={22} color="#fff"/><Text style={styles.bigCtaText}>פרסום טקטיקה</Text></Pressable>
          </Panel>
        </>
      ) : null}

      {tab === 'tips' ? (
        <>
          <Panel>
            <SectionTitle icon="bulb-outline" title="טיפים ל־Champions" subtitle="דברים קטנים שמחזירים ניצחונות לאורך 15 משחקים." />
            {[
              ['01','אל תמהרו להחליף מערך', 'אם אתה מפסיד שער מוקדם, אל תשנה הכל. קודם תזהה איפה נפתח הפער.'],
              ['02','שמור את ה־CM באמצע', 'ב־4-2-3-1 שני הקשרים הם הביטוח שלך. אל תוציא את שניהם ללחץ.'],
              ['03','החלפות בדקה 60–70', 'שמור לפחות חילוף אחד לשלב שבו היריב מתחיל להתעייף.'],
              ['04','שחק את המשחק שלך', 'Champions הוא מרתון. לא כל יריב צריך לקבל את אותו קצב ואותה גישה.'],
            ].map(([n,t,b]) => <View key={n} style={styles.tipRow}><Text style={styles.tipNo}>{n}</Text><View style={{flex:1}}><Text style={styles.tipTitle}>{t}</Text><Text style={styles.tipBody}>{b}</Text></View></View>)}
            <Pressable onPress={() => { setComposerKind('tip'); setShowComposer(true); }} style={styles.bigCta}><Ionicons name="create-outline" size={22} color="#fff"/><Text style={styles.bigCtaText}>שתף טיפ מהניסיון שלך</Text></Pressable>
          </Panel>
        </>
      ) : null}

      {showComposer ? (
        <View style={styles.modalBackdrop}>
          <Panel style={styles.composer}>
            <View style={styles.composerHeader}><Text style={styles.composerTitle}>{composerKind === 'tactic' ? 'פרסום טקטיקה' : 'פרסום טיפ'}</Text><Pressable onPress={() => setShowComposer(false)}><Ionicons name="close" size={24} color="#fff"/></Pressable></View>
            <View style={styles.composerTypes}>{(['tactic','tip'] as ContentKind[]).map(k => <Pressable key={k} onPress={() => setComposerKind(k)} style={[styles.typeChip, composerKind===k && styles.typeChipOn]}><Text style={styles.typeChipText}>{k==='tactic'?'טקטיקה':'טיפ'}</Text></Pressable>)}</View>
            <TextInput value={title} onChangeText={setTitle} placeholder="כותרת" placeholderTextColor="#68727C" style={styles.input}/>
            <TextInput value={body} onChangeText={setBody} placeholder="הסבר קצר, ברור ושימושי" placeholderTextColor="#68727C" multiline style={[styles.input, {minHeight:110,textAlignVertical:'top'}]}/>
            {composerKind==='tactic' ? <View style={styles.composerTypes}>{['4-2-3-1','4-3-1-2','4-4-1-1','4-2-2-2'].map(f=><Pressable key={f} onPress={()=>setFormation(f)} style={[styles.typeChip,formation===f&&styles.typeChipOn]}><Text style={styles.typeChipText}>{f}</Text></Pressable>)}</View> : null}
            <Pressable onPress={chooseImage} style={styles.uploadButton}><Ionicons name="image-outline" size={19} color="#FF5A63"/><Text style={styles.uploadText}>{imageUris.length ? 'צילום נבחר' : 'הוספת צילום מסך'}</Text></Pressable>
            <Pressable disabled={busy} onPress={publish} style={[styles.publishButton,busy&&{opacity:.55}]}><Text style={styles.publishText}>{busy?'מפרסם...':'שליחה לבדיקה'}</Text></Pressable>
          </Panel>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero:{borderRadius:18,overflow:'hidden',borderWidth:1,borderColor:'rgba(255,65,75,.55)',minHeight:310,position:'relative'},
  heroGlow:{position:'absolute',width:460,height:460,borderRadius:230,backgroundColor:'rgba(255,0,25,.13)',right:-150,top:-180},
  heroGrid:{padding:20,gap:18},
  heroCopy:{flexDirection:'row-reverse',alignItems:'center',gap:16},
  crest:{width:84,height:84,borderRadius:22,borderWidth:1,borderColor:'#B98735',backgroundColor:'rgba(20,5,7,.72)',alignItems:'center',justifyContent:'center'},
  kicker:{color:'#FFB5B8',fontSize:11,fontWeight:'900',letterSpacing:2,textAlign:'right'},
  heroTitle:{color:'#FFF8EE',fontSize:desktopFont(52),fontWeight:'900',letterSpacing:1,textAlign:'right',marginTop:3},
  heroHebrew:{color:'#E9B8BA',fontSize:16,fontWeight:'700',textAlign:'right'},
  recordCard:{borderWidth:1,borderColor:'rgba(255,255,255,.14)',backgroundColor:'rgba(3,7,11,.66)',borderRadius:16,padding:18},
  recordKicker:{color:'#D9DEE5',fontSize:12,fontWeight:'700',textAlign:'right'},
  recordRow:{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center',marginTop:12},
  recordValue:{color:'#FFF',fontSize:30,fontWeight:'900',textAlign:'center'},
  recordLabel:{color:'#7F8A95',fontSize:10,fontWeight:'800',textAlign:'center'},
  rankCircle:{width:76,height:76,borderRadius:38,borderWidth:2,borderColor:'#D7A844',alignItems:'center',justifyContent:'center'},
  rankNo:{color:'#FFE07B',fontSize:25,fontWeight:'900'},rankLabel:{color:'#C8CDD3',fontSize:10,fontWeight:'800'},
  progressLine:{height:6,borderRadius:5,backgroundColor:'#24171A',marginTop:16,overflow:'hidden'},progressFill:{width:'75%',height:'100%',backgroundColor:'#FF3C48',borderRadius:5},
  progressMeta:{flexDirection:'row-reverse',justifyContent:'space-between',marginTop:6},progressText:{color:'#A9B1BA',fontSize:11,fontWeight:'700'},
  heroTabs:{flexDirection:'row-reverse',borderTopWidth:1,borderTopColor:'rgba(255,255,255,.12)',marginTop:4},
  heroTab:{flex:1,minHeight:54,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8,borderRightWidth:1,borderRightColor:'rgba(255,255,255,.08)'},
  heroTabOn:{backgroundColor:'#F22F3A'},heroTabText:{color:'#AEB5BD',fontWeight:'800',fontSize:14},heroTabTextOn:{color:'#fff'},
  grid:{gap:14},panel:{backgroundColor:'#080D13',borderRadius:16,borderWidth:1,borderColor:'rgba(255,255,255,.10)',padding:18,overflow:'hidden',gap:16},
  sectionTitle:{flexDirection:'row-reverse',alignItems:'center',gap:10},sectionIcon:{width:36,height:36,borderRadius:10,backgroundColor:'rgba(237,45,58,.10)',alignItems:'center',justifyContent:'center'},sectionTitleText:{color:'#F4F6F8',fontSize:19,fontWeight:'900',textAlign:'right'},sectionSubtitle:{color:'#7F8993',fontSize:12,fontWeight:'600',textAlign:'right',marginTop:2},
  matchTrack:{flexDirection:'row',justifyContent:'space-between',gap:5},matchDot:{width:28,height:28,borderRadius:14,alignItems:'center',justifyContent:'center',borderWidth:1},winDot:{borderColor:'#1FB66C',backgroundColor:'rgba(31,182,108,.18)'},lossDot:{borderColor:'#D52F3B',backgroundColor:'rgba(213,47,59,.18)'},matchDotText:{color:'#E9EEF2',fontSize:10,fontWeight:'900'},
  bigStats:{flexDirection:'row-reverse',justifyContent:'space-around',paddingVertical:14,borderTopWidth:1,borderBottomWidth:1,borderColor:'rgba(255,255,255,.07)'},bigStat:{color:'#fff',fontSize:32,fontWeight:'900',textAlign:'center'},bigStatGreen:{color:'#55E18E',fontSize:32,fontWeight:'900',textAlign:'center'},statCaption:{color:'#7D8790',fontSize:11,fontWeight:'700',textAlign:'center'},
  milestone:{gap:8},milestoneLabel:{color:'#7F8993',fontSize:11,textAlign:'right'},milestoneValue:{color:'#F3F5F7',fontSize:15,fontWeight:'900',textAlign:'right'},miniProgress:{height:6,borderRadius:5;backgroundColor:'#1A232B',overflow:'hidden'},cqp:{color:'#F5C65B',fontWeight:'900',fontSize:12,textAlign:'right'},
  qualify:{flexDirection:'row-reverse',alignItems:'center',gap:8,flexWrap:'wrap',borderTopWidth:1,borderTopColor:'rgba(255,255,255,.07)',paddingTop:12},qualifyText:{color:'#C9D0D6',fontSize:12,fontWeight:'800'},qualifyMuted:{color:'#D33D47',fontSize:11,fontWeight:'800'},
  rewardGrid:{flexDirection:'row-reverse',gap:10,flexWrap:'wrap'},rewardCard:{flex:1,minWidth:155,borderWidth:1,borderRadius:14,padding:14,backgroundColor:'rgba(10,14,20,.9)',gap:6},rewardRank:{color:'#FFF',fontWeight:'900',fontSize:14,textAlign:'right'},rewardItem:{color:'#AEB6BE',fontSize:10,fontWeight:'700',textAlign:'right'},rewardCoins:{color:'#F7CF68',fontSize:13,fontWeight:'900',textAlign:'right'},token:{color:'#FF7279',fontSize:10,fontWeight:'900',textAlign:'right'},
  tacticBody:{flexDirection:'row-reverse',gap:18},pitch:{height:250,flex:1,backgroundColor:'#153B26',borderRadius:12,borderWidth:1,borderColor:'#3A8456',position:'relative',overflow:'hidden',minWidth:260},playerDot:{position:'absolute',width:36,height:36,borderRadius:18,marginLeft:-18,marginTop:-18,backgroundColor:'#C72836',borderWidth:2,borderColor:'#FFD67B',alignItems:'center',justifyContent:'center'},playerText:{color:'#fff',fontSize:8,fontWeight:'900'},tacticSettings:{flex:1,justifyContent:'center',gap:9},settingRow:{flexDirection:'row-reverse',justifyContent:'space-between',gap:12,paddingVertical:8,borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,.06)'},settingName:{color:'#8E98A2',fontSize:11,fontWeight:'700',textAlign:'right',flex:1},settingValue:{color:'#EEF1F4',fontSize:12,fontWeight:'900',textAlign:'right'},
  platformSwitch:{flexDirection:'row',alignSelf:'flex-end',backgroundColor:'#121820',padding:3,borderRadius:20},platformButton:{flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:14,paddingVertical:8,borderRadius:18},platformButtonOn:{backgroundColor:'#63D48C'},platformText:{color:'#AAB0B8',fontSize:11,fontWeight:'800'},platformTextOn:{color:'#0C1410'},
  controllerSettings:{flexDirection:'row-reverse',gap:14,alignItems:'center'},controller:{width:120,alignItems:'center',justifyContent:'center',gap:5},controllerLabel:{color:'#AAB0B8',fontSize:11,fontWeight:'800'},
  shareButton:{borderWidth:1,borderColor:'#D12D39',backgroundColor:'#6E1118',borderRadius:10,padding:11,alignItems:'center',justifyContent:'center',flexDirection:'row-reverse',gap:7},shareButtonText:{color:'#fff',fontWeight:'900',fontSize:13},
  communityCard:{width:310,borderWidth:1,borderColor:'rgba(255,255,255,.09)',backgroundColor:'#0A1118',borderRadius:13,padding:12,gap:8},miniPitch:{width:78,height:58,borderRadius:8,backgroundColor:'#174C2A',borderWidth:1,borderColor:'#4C9361',alignItems:'center',justifyContent:'center'},miniFormation:{color:'#F7D46B',fontSize:11,fontWeight:'900'},communityTitle:{color:'#F0F3F5',fontSize:14,fontWeight:'900',textAlign:'right'},communityMeta:{color:'#68737E',fontSize:10,fontWeight:'700',textAlign:'right'},communityBody:{color:'#AEB6BE',fontSize:11,lineHeight:17,textAlign:'right',marginTop:4},vote:{alignSelf:'flex-start',borderWidth:1,borderColor:'rgba(255,255,255,.10)',borderRadius:8,paddingHorizontal:9,paddingVertical:6,flexDirection:'row-reverse',alignItems:'center',gap:5},voteOn:{borderColor:'rgba(103,229,154,.35)',backgroundColor:'rgba(103,229,154,.08)'},voteText:{color:'#AEB6BE',fontSize:10,fontWeight:'800'},
  tacticCatalog:{gap:10},catalogRow:{flexDirection:'row-reverse',alignItems:'center',gap:12,borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,.07)',paddingVertical:10},bigCta:{backgroundColor:'#D92F3B',borderRadius:11,padding:13,alignItems:'center',justifyContent:'center',flexDirection:'row-reverse',gap:8,marginTop:4},bigCtaText:{color:'#fff',fontWeight:'900',fontSize:14},
  tipRow:{flexDirection:'row-reverse',gap:14,paddingVertical:16,borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,.07)'},tipNo:{color:'#D83B45',fontSize:13,fontWeight:'900',width:34},tipTitle:{color:'#F3F5F7',fontSize:15,fontWeight:'900',textAlign:'right'},tipBody:{color:'#929DA7',fontSize:12,lineHeight:19,textAlign:'right',marginTop:4},
  modalBackdrop:{position:'absolute',left:0,right:0,top:0,bottom:0,backgroundColor:'rgba(0,0,0,.72)',padding:18,justifyContent:'center',zIndex:50},composer:{maxWidth:620,width:'100%',alignSelf:'center',borderColor:'#D12D39'},composerHeader:{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center'},composerTitle:{color:'#fff',fontSize:20,fontWeight:'900'},composerTypes:{flexDirection:'row-reverse',gap:8,flexWrap:'wrap'},typeChip:{borderWidth:1,borderColor:'rgba(255,255,255,.12)',borderRadius:18,paddingHorizontal:13,paddingVertical:8},typeChipOn:{borderColor:'#D83B45',backgroundColor:'#5D1118'},typeChipText:{color:'#DDE2E6',fontWeight:'800',fontSize:12},input:{borderWidth:1,borderColor:'rgba(255,255,255,.12)',backgroundColor:'#070C12',borderRadius:10,color:'#fff',paddingHorizontal:13,paddingVertical:12,textAlign:'right',fontSize:14},uploadButton:{borderWidth:1,borderColor:'rgba(255,75,85,.3)',backgroundColor:'rgba(255,50,65,.06)',borderRadius:10,padding:12,alignItems:'center',justifyContent:'center',flexDirection:'row-reverse',gap:7},uploadText:{color:'#FF737B',fontWeight:'800'},publishButton:{backgroundColor:'#E3333F',borderRadius:11,padding:14,alignItems:'center'},publishText:{color:'#fff',fontWeight:'900',fontSize:14},
});

function desktopFont(base: number) {
  return base;
}

