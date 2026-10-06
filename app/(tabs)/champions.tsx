import { useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Screen } from '@/components/ui';

type Player = {
  id: string;
  name: string;
  country: string;
  platform: 'PS5' | 'Xbox';
  record: string;
  winRate: string;
  formation: string;
  role: string;
  accent: string;
  number: string;
  cqp: string;
  note: string;
  settings: [string, string][];
};

const PLAYERS: Player[] = [
  { id: 'tekkz', name: 'TEKKZ', country: '🇬🇧', platform: 'PS5', record: '11 - 4', winRate: '78%', formation: '4-4-1-1 (2)', role: 'Pro Player', accent: '#E13B42', number: '7', cqp: '1,000 / 1,000', note: 'Short Passing · High · 65', settings: [['Build Up Style','Balanced'],['Defensive Approach','Balanced'],['Width','50'],['Depth','58'],['Player Switching','Right Stick'],['Analog Sprint','Off']] },
  { id: 'wlq', name: 'WLQ', country: '🇬🇧', platform: 'PS5', record: '10 - 3', winRate: '77%', formation: '4-2-3-1', role: 'Pro Player', accent: '#C43F4F', number: '10', cqp: '910 / 1,000', note: 'Balanced · High · 70', settings: [['Build Up Style','Balanced'],['Defensive Approach','Balanced'],['Width','52'],['Depth','60'],['Player Switching','Right Stick'],['Analog Sprint','Off']] },
  { id: 'jambo', name: 'Jambo', country: '🇷🇺', platform: 'Xbox', record: '9 - 4', winRate: '69%', formation: '4-3-2-2', role: 'Pro Player', accent: '#8E4958', number: '8', cqp: '840 / 1,000', note: 'Direct Passing · High · 65', settings: [['Build Up Style','Fast Build Up'],['Defensive Approach','Balanced'],['Width','50'],['Depth','55'],['Player Switching','Right Stick'],['Analog Sprint','On']] },
  { id: 'dullenmike', name: 'DullenMIKE', country: '🇺🇸', platform: 'PS5', record: '8 - 5', winRate: '62%', formation: '4-1-2-1-2', role: 'Pro Player', accent: '#B24B5A', number: '11', cqp: '820 / 1,000', note: 'מרכז צפוף ויציאה מהירה לאגפים.', settings: [['Build Up Style','Fast Build Up'],['Defensive Approach','Balanced'],['Width','45'],['Depth','52'],['Player Switching','Right Stick'],['Analog Sprint','On']] },
  { id: 'tsj', name: 'TSJ', country: '🇫🇷', platform: 'Xbox', record: '7 - 3', winRate: '70%', formation: '4-3-3 (4)', role: 'Pro Player', accent: '#7D4C6B', number: '10', cqp: '760 / 1,000', note: 'איזון בין הקווים ומשחק אגפים.', settings: [['Build Up Style','Balanced'],['Defensive Approach','Press After Possession'],['Width','55'],['Depth','50'],['Player Switching','Classic'],['Analog Sprint','Off']] },
  { id: 'futwiz', name: 'FUTWIZ', country: '🇬🇧', platform: 'PS5', record: '6 - 2', winRate: '75%', formation: '4-4-2', role: 'Pro Player', accent: '#5F586B', number: '9', cqp: '690 / 1,000', note: 'יציבות במרכז ומינימום סיכון.', settings: [['Build Up Style','Balanced'],['Defensive Approach','Balanced'],['Width','48'],['Depth','46'],['Player Switching','Right Stick'],['Analog Sprint','Off']] },
];

const TIPS = [
  ['01','אל תמהר לשנות מערך','הישאר עם המבנה שמייצר לך מצבים לפני שאתה משנה הוראות.'],
  ['02','שמור שחקן אחד מאחור','במעברים מהירים ההגנה שלך נשארת מאוזנת.'],
  ['03','שחק לפי קצב היריב','לפעמים ניצחון ב-Champions מגיע מניהול קצב ולא מעוד התקפה.'],
];

function PlayerPortrait({ player, large = false }: { player: Player; large?: boolean }) {
  return (
    <LinearGradient colors={['#1A1B22','#0D1118','#251017']} style={[styles.portrait, large && styles.portraitLarge, { borderColor: player.accent + '66' }]}>
      <View style={[styles.portraitGlow, { backgroundColor: player.accent + '26' }]} />
      <View style={styles.portraitHead}><Text style={[styles.portraitInitial, large && styles.portraitInitialLarge]}>{player.name.slice(0,1)}</Text></View>
      <View style={styles.portraitShoulders}><Text style={styles.portraitNumber}>{player.number}</Text></View>
      <View style={styles.portraitTag}><Text style={styles.portraitTagText}>PRO</Text></View>
    </LinearGradient>
  );
}

function MiniPitch({ formation }: { formation: string }) {
  const dots = [['50%','10%'],['24%','27%'],['76%','27%'],['50%','38%'],['34%','53%'],['66%','53%'],['13%','72%'],['38%','70%'],['62%','70%'],['87%','72%'],['50%','91%']];
  return (
    <View style={styles.miniPitch}>
      <View style={styles.pitchHalf} />
      {dots.map(([left, top], index) => <View key={index} style={[styles.pitchDot, { left: left as `${number}%`, top: top as `${number}%` }]} />)}
      <View style={styles.pitchLabel}><Text style={styles.pitchLabelText}>{formation}</Text></View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

export default function ChampionsScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 1100;
  const [section, setSection] = useState<'center' | 'community'>('community');
  const [selectedId, setSelectedId] = useState('tekkz');
  const [platform, setPlatform] = useState<'ALL' | 'PS5' | 'Xbox'>('ALL');
  const visiblePlayers = useMemo(() => platform === 'ALL' ? PLAYERS : PLAYERS.filter((p) => p.platform === platform), [platform]);
  const selected = PLAYERS.find((p) => p.id === selectedId) ?? PLAYERS[0];

  return (
    <Screen scene="ultimate" maxWidth={1500}>
      <Stack.Screen options={{ title: 'FUT Champions' }} />
      <View style={styles.page}>
        <LinearGradient colors={['#18070B','#351019','#090D12']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.hero}>
          <View style={styles.heroNoise} />
          <View style={styles.heroTop}>
            <View style={styles.crest}><Ionicons name="trophy" size={34} color="#F8D36A" /><Text style={styles.crestMini}>FUT</Text></View>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>COMPETE  ·  IMPROVE  ·  WIN</Text>
              <Text style={styles.heroTitle}>FUT CHAMPIONS</Text>
              <Text style={styles.heroSubtitle}>המסע שלך. התוצאות שלך. הפרסים שלך.</Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}><Ionicons name="trophy-outline" size={16} color="#F5C95C" /><Text style={styles.heroStatText}>15 משחקים</Text></View>
                <View style={styles.heroStat}><Ionicons name="flash-outline" size={16} color="#F5C95C" /><Text style={styles.heroStatText}>פרסים מעולים</Text></View>
                <View style={styles.heroStat}><Ionicons name="git-network-outline" size={16} color="#F5C95C" /><Text style={styles.heroStatText}>טקטיקות מוכחות</Text></View>
              </View>
            </View>
            <View style={styles.season}>
              <Text style={styles.seasonLabel}>העונה הנוכחית</Text>
              <Text style={styles.seasonTime}>מסתיימת בעוד 6 ימים</Text>
              <View style={styles.seasonRow}><View><Text style={styles.seasonValue}>9 - 6</Text><Text style={styles.seasonCaption}>W / L</Text></View><View><Text style={styles.seasonValue}>60%</Text><Text style={styles.seasonCaption}>WIN RATE</Text></View></View>
              <View style={styles.seasonBar}><View style={styles.seasonFill} /></View><Text style={styles.seasonProgress}>CQP 750 / 1,000</Text>
            </View>
          </View>
          <View style={styles.tabBar}>
            <Pressable onPress={() => setSection('center')} style={[styles.topTab, section === 'center' && styles.topTabOn]}><Ionicons name="trophy-outline" size={17} color={section === 'center' ? '#fff' : '#9FA8B3'} /><Text style={[styles.topTabText, section === 'center' && styles.topTabTextOn]}>מרכז Champions</Text></Pressable>
            <Pressable onPress={() => setSection('community')} style={[styles.topTab, section === 'community' && styles.topTabOn]}><Ionicons name="people-outline" size={17} color={section === 'community' ? '#fff' : '#9FA8B3'} /><Text style={[styles.topTabText, section === 'community' && styles.topTabTextOn]}>שחקני הקהילה</Text></Pressable>
          </View>
        </LinearGradient>

        {section === 'community' ? (
          <>
            <View style={styles.toolbar}>
              <View style={styles.searchFake}><Ionicons name="search-outline" size={18} color="#77818C" /><Text style={styles.searchText}>חפש שחקנים, שמות משתמשים...</Text></View>
              <View style={styles.filters}>
                {(['ALL','PS5','Xbox'] as const).map((item) => <Pressable key={item} onPress={() => setPlatform(item)} style={[styles.filter, platform === item && styles.filterOn]}><Text style={[styles.filterText, platform === item && styles.filterTextOn]}>{item === 'ALL' ? 'כל הפלטפורמות' : item}</Text></Pressable>)}
                <View style={styles.sort}><Ionicons name="swap-vertical-outline" size={15} color="#88929E" /><Text style={styles.sortText}>הכי חדשים</Text></View>
              </View>
            </View>
            <View style={styles.sectionHeading}>
              <View><Text style={styles.sectionHeadingTitle}>שחקני הקהילה</Text><Text style={styles.sectionHeadingSub}>פרופילים מקצועיים, מאזן, מערך והגדרות משחק</Text></View>
              <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE DATA PREVIEW</Text></View>
            </View>

            <ScrollView horizontal={!desktop} showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.playerGrid, desktop && styles.playerGridDesktop]}>
              {visiblePlayers.map((player) => (
                <Pressable key={player.id} onPress={() => setSelectedId(player.id)} style={[styles.playerCard, selectedId === player.id && styles.playerCardSelected, desktop && { width: '32.2%' }]}>
                  <LinearGradient colors={['#11161D','#090D13']} style={styles.playerCardInner}>
                    <View style={styles.cardTopRow}>
                      <View style={[styles.platformBadge,{borderColor:player.accent+'66'}]}><Text style={styles.platformBadgeText}>{player.platform}</Text></View>
                      <Text style={styles.proLabel}>PRO</Text>
                    </View>
                    <View style={styles.cardMainRow}>
                      <PlayerPortrait player={player} />
                      <View style={styles.cardMiddle}>
                        <View style={styles.cardNameRow}><View><Text style={styles.playerName}>{player.name}</Text><Text style={styles.playerRole}>EA FC 27 | Pro Player</Text></View><Text style={styles.country}>{player.country}</Text></View>
                        <Text style={styles.cardRecord}>{player.record}</Text>
                        <Text style={styles.cardFormation}>{player.formation}</Text>
                        <Text style={styles.cardPreset}>{player.note}</Text>
                      </View>
                      <View style={styles.cardPitchWrap}><MiniPitch formation={player.formation} /></View>
                    </View>
                    <View style={styles.cardMetaRow}>
                      <View style={styles.cardMetaItem}><Ionicons name="game-controller-outline" size={15} color="#B7C0C9"/><Text style={styles.cardMetaText}>הגדרות שלט</Text></View>
                      <View style={styles.cardMetaItem}><Ionicons name="bulb-outline" size={15} color="#B7C0C9"/><Text style={styles.cardMetaText}>טיפים</Text><Text style={styles.cardMetaCount}>{player.id === 'tekkz' ? '3' : '5'}</Text></View>
                      <View style={styles.cardMetaItem}><Ionicons name="document-text-outline" size={15} color="#B7C0C9"/><Text style={styles.cardMetaText}>קוד טקטיקה</Text></View>
                      <View style={styles.arrowCircle}><Ionicons name="chevron-back" size={17} color="#fff" /></View>
                    </View>
                    <View style={styles.sourceRow}><Text style={styles.sourceText}>מקור: {player.name} | Publicly Published</Text><Text style={styles.updatedText}>עודכן: 3 ימים</Text></View>
                  </LinearGradient>
                </Pressable>
              ))}
            </ScrollView>

            <View style={[styles.detailWrap, desktop && styles.detailWrapDesktop]}>
              <View style={[styles.detailMain, desktop && {flex:1.35}]}>
                <LinearGradient colors={['#12171E','#0A0F15']} style={styles.detailCard}>
                  <View style={styles.detailHeader}><View><Text style={styles.detailKicker}>הגדרות השחקן</Text><Text style={styles.detailName}>{selected.name} <Text style={styles.detailCountry}>{selected.country}</Text></Text><Text style={styles.detailSub}>{selected.platform} · {selected.formation} · {selected.record}</Text></View><View style={styles.selectedBadge}><Ionicons name="checkmark-circle" size={17} color="#65DC9A" /><Text style={styles.selectedBadgeText}>נבחר</Text></View></View>
                  <View style={styles.detailBody}>
                    <PlayerPortrait player={selected} large />
                    <View style={styles.detailStats}><View style={styles.cqpBox}><Text style={styles.cqpLabel}>CQP</Text><Text style={styles.cqpValue}>{selected.cqp}</Text><View style={styles.cqpBar}><View style={styles.cqpFill} /></View></View><View style={styles.statTiles}><View style={styles.statTile}><Text style={styles.statTileValue}>{selected.record}</Text><Text style={styles.statTileLabel}>מאזן</Text></View><View style={styles.statTile}><Text style={styles.statTileValue}>{selected.winRate}</Text><Text style={styles.statTileLabel}>Win Rate</Text></View><View style={styles.statTile}><Text style={styles.statTileValue}>{selected.formation}</Text><Text style={styles.statTileLabel}>Formation</Text></View></View></View>
                    <View style={styles.settingsBox}><View style={styles.settingsHeader}><Ionicons name="settings-outline" size={18} color="#F0C95E" /><Text style={styles.settingsTitle}>הגדרות של {selected.name}</Text></View>{selected.settings.map(([name,value]) => <View key={name} style={styles.settingRow}><Text style={styles.settingValue}>{value}</Text><Text style={styles.settingName}>{name}</Text></View>)}</View>
                  </View>
                </LinearGradient>
              </View>
              <View style={[styles.pitchCard, desktop && {width:360}]}>
                <View style={styles.pitchHeader}><Text style={styles.pitchTitle}>הטקטיקה של {selected.name}</Text><Text style={styles.pitchFormation}>{selected.formation}</Text></View>
                <MiniPitch formation={selected.formation} />
                <View style={styles.pitchMeta}><Text style={styles.pitchMetaLabel}>תפקידי מפתח</Text><Text style={styles.pitchMetaValue}>ST · CAM · CDM · CB</Text></View>
                <Pressable style={styles.primaryBtn} onPress={() => {}}><Ionicons name="eye-outline" size={17} color="#fff" /><Text style={styles.primaryBtnText}>צפה בטקטיקה המלאה</Text></Pressable>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.centerGrid}>
            <LinearGradient colors={['#151B23','#0B1016']} style={styles.centerCard}><Text style={styles.centerKicker}>FUT CHAMPIONS CENTER</Text><Text style={styles.centerTitle}>הטורניר שלך מתחיל כאן</Text><Text style={styles.centerText}>מעקב אחר 15 משחקים, דירוג, CQP ופרסים — הכל במקום אחד.</Text><View style={styles.centerStats}><Metric label="משחקים" value="15" /><Metric label="ניצחונות" value="9" /><Metric label="נותרו" value="6" /></View><View style={styles.goalBar}><View style={styles.goalFill} /></View><Text style={styles.goalText}>9 / 15 משחקים הושלמו</Text></LinearGradient>
            <View style={styles.tipPanel}><Text style={styles.tipPanelTitle}>טיפים מקצועיים</Text>{TIPS.map(([no,title,body]) => <View key={no} style={styles.tipRow}><Text style={styles.tipNo}>{no}</Text><View style={{flex:1}}><Text style={styles.tipTitle}>{title}</Text><Text style={styles.tipBody}>{body}</Text></View></View>)}</View>
          </View>
        )}

        <View style={styles.footer}><Text style={styles.footerTitle}>PREVIEW BUILD · FUT CHAMPIONS</Text><Text style={styles.footerText}>המסך משתמש כרגע בנתוני דמו בלבד. Google Login ו-Supabase Auth אינם מחוברים אליו.</Text></View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page:{gap:16,paddingBottom:28}, hero:{borderRadius:24,borderWidth:1,borderColor:'rgba(230,70,82,.38)',overflow:'hidden',minHeight:340}, heroNoise:{position:'absolute',width:560,height:560,borderRadius:280,right:-180,top:-170,backgroundColor:'rgba(244,48,63,.11)'}, heroTop:{padding:26,flexDirection:'row-reverse',alignItems:'center',gap:22}, crest:{width:92,height:108,borderRadius:26,borderWidth:1,borderColor:'rgba(238,191,81,.65)',backgroundColor:'rgba(20,8,11,.78)',alignItems:'center',justifyContent:'center',gap:4}, crestMini:{color:'#F7D878',fontSize:12,fontWeight:'900',letterSpacing:2}, heroCopy:{flex:1,alignItems:'flex-end',gap:5}, eyebrow:{color:'#E2A6AA',fontSize:11,fontWeight:'900',letterSpacing:2}, heroTitle:{color:'#FFF7EA',fontSize:44,lineHeight:49,fontWeight:'900',letterSpacing:1.2,textAlign:'right'}, heroSubtitle:{color:'#E7C5C8',fontSize:16,fontWeight:'700',textAlign:'right'}, heroStats:{flexDirection:'row-reverse',gap:16,marginTop:10,flexWrap:'wrap'}, heroStat:{flexDirection:'row-reverse',gap:6,alignItems:'center'}, heroStatText:{color:'#B1B9C2',fontSize:12}, season:{width:250,borderRadius:18,borderWidth:1,borderColor:'rgba(255,255,255,.11)',backgroundColor:'rgba(4,8,12,.76)',padding:17}, seasonLabel:{color:'#E4E7EC',fontSize:13,fontWeight:'800',textAlign:'right'}, seasonTime:{color:'#E65B63',fontSize:12,fontWeight:'800',textAlign:'right',marginTop:2}, seasonRow:{flexDirection:'row-reverse',justifyContent:'space-between',marginTop:14}, seasonValue:{color:'#fff',fontSize:25,fontWeight:'900',textAlign:'right'}, seasonCaption:{color:'#707A86',fontSize:10,fontWeight:'800',textAlign:'right'}, seasonBar:{height:6,borderRadius:4,backgroundColor:'#23161A',overflow:'hidden',marginTop:14}, seasonFill:{width:'75%',height:'100%',borderRadius:4,backgroundColor:'#E33D49'}, seasonProgress:{color:'#8A939E',fontSize:11,fontWeight:'700',textAlign:'right',marginTop:6}, tabBar:{flexDirection:'row-reverse',borderTopWidth:1,borderTopColor:'rgba(255,255,255,.10)',marginTop:4}, topTab:{flex:1,minHeight:58,justifyContent:'center',alignItems:'center',flexDirection:'row-reverse',gap:8,borderLeftWidth:1,borderLeftColor:'rgba(255,255,255,.07)'}, topTabOn:{backgroundColor:'#E13A45'}, topTabText:{color:'#9FA8B2',fontSize:14,fontWeight:'800'}, topTabTextOn:{color:'#fff'}, toolbar:{flexDirection:'row-reverse',alignItems:'center',gap:10,flexWrap:'wrap',justifyContent:'space-between'}, searchFake:{minHeight:46,flex:1,minWidth:250,borderRadius:14,borderWidth:1,borderColor:'rgba(255,255,255,.09)',backgroundColor:'#0F141B',flexDirection:'row-reverse',alignItems:'center',gap:8,paddingHorizontal:14}, searchText:{color:'#6F7883',fontSize:13,textAlign:'right',flex:1}, filters:{flexDirection:'row-reverse',alignItems:'center',gap:7,flexWrap:'wrap'}, filter:{minHeight:42,paddingHorizontal:13,borderRadius:12,borderWidth:1,borderColor:'rgba(255,255,255,.08)',backgroundColor:'#0F141B',justifyContent:'center'}, filterOn:{borderColor:'rgba(225,58,69,.65)',backgroundColor:'rgba(225,58,69,.13)'}, filterText:{color:'#818B95',fontSize:12,fontWeight:'800'}, filterTextOn:{color:'#FFD7D9'}, sort:{minHeight:42,paddingHorizontal:12,borderRadius:12,borderWidth:1,borderColor:'rgba(255,255,255,.08)',backgroundColor:'#0F141B',flexDirection:'row-reverse',alignItems:'center',gap:5}, sortText:{color:'#8B95A0',fontSize:12,fontWeight:'700'}, sectionHeading:{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'flex-end',gap:12}, sectionHeadingTitle:{color:'#F4F6F8',fontSize:22,fontWeight:'900',textAlign:'right'}, sectionHeadingSub:{color:'#6F7A86',fontSize:12,fontWeight:'600',textAlign:'right',marginTop:3}, livePill:{flexDirection:'row-reverse',alignItems:'center',gap:7,borderWidth:1,borderColor:'rgba(101,220,154,.25)',borderRadius:999,paddingHorizontal:11,paddingVertical:7,backgroundColor:'rgba(101,220,154,.06)'}, liveDot:{width:7,height:7,borderRadius:4,backgroundColor:'#65DC9A'}, liveText:{color:'#8BD5A9',fontSize:10,fontWeight:'900',letterSpacing:1}, playerGrid:{gap:12,paddingVertical:2}, playerGridDesktop:{flexDirection:'row-reverse',flexWrap:'wrap'}, playerCard:{width:300,borderRadius:20,overflow:'hidden',borderWidth:1,borderColor:'rgba(255,255,255,.08)',backgroundColor:'#0C1117'}, playerCardSelected:{borderColor:'rgba(225,58,69,.72)',shadowColor:'#E13A45',shadowOpacity:.22,shadowRadius:14,shadowOffset:{width:0,height:6}}, playerCardInner:{padding:12,gap:10,minHeight:350}, cardTopRow:{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center'}, platformBadge:{borderWidth:1,borderRadius:9,paddingHorizontal:8,paddingVertical:5,backgroundColor:'rgba(255,255,255,.03)'}, platformBadgeText:{color:'#C2C9D0',fontSize:10,fontWeight:'900'}, proLabel:{color:'#C76A70',fontSize:9,fontWeight:'900',letterSpacing:1.2}, portrait:{height:112,width:112,borderRadius:14,borderWidth:1,overflow:'hidden',position:'relative',alignItems:'center',justifyContent:'flex-end'}, portraitLarge:{height:235,width:172}, portraitGlow:{position:'absolute',width:190,height:190,borderRadius:95,top:-70,right:-55}, portraitHead:{width:86,height:86,borderRadius:43,backgroundColor:'rgba(221,182,160,.92)',alignItems:'center',justifyContent:'center',borderWidth:4,borderColor:'rgba(255,255,255,.22)'}, portraitInitial:{color:'#2E2020',fontSize:34,fontWeight:'900'}, portraitInitialLarge:{fontSize:44}, portraitShoulders:{width:150,height:72,marginTop:-6,borderRadius:30,backgroundColor:'#171B23',borderTopWidth:2,borderTopColor:'rgba(255,255,255,.11)',alignItems:'center',justifyContent:'center'}, portraitNumber:{color:'rgba(230,235,242,.22)',fontSize:48,fontWeight:'900'}, portraitTag:{position:'absolute',left:9,top:9,borderRadius:7,paddingHorizontal:7,paddingVertical:4,backgroundColor:'#E13A45'}, portraitTagText:{color:'#fff',fontSize:9,fontWeight:'900',letterSpacing:1}, cardMainRow:{flexDirection:'row-reverse',gap:10,alignItems:'stretch'},cardMiddle:{flex:1,minWidth:0,justifyContent:'space-between'},cardPitchWrap:{width:108},cardNameRow:{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center',gap:6},cardRecord:{color:'#F5F7F9',fontSize:19,fontWeight:'900',textAlign:'right',marginTop:4},cardFormation:{color:'#AAB4BE',fontSize:11,fontWeight:'800',textAlign:'right',marginTop:1},cardPreset:{color:'#77828D',fontSize:9,lineHeight:13,textAlign:'right',marginTop:4},cardMetaRow:{flexDirection:'row-reverse',alignItems:'center',borderTopWidth:1,borderTopColor:'rgba(255,255,255,.07)',borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,.07)',minHeight:43},cardMetaItem:{flex:1,flexDirection:'row-reverse',alignItems:'center',justifyContent:'center',gap:4,borderLeftWidth:1,borderLeftColor:'rgba(255,255,255,.06)',minHeight:34},cardMetaText:{color:'#9EA8B3',fontSize:9,fontWeight:'800'},cardMetaCount:{color:'#6F7984',fontSize:9},sourceRow:{flexDirection:'row-reverse',justifyContent:'space-between',gap:8,paddingTop:2},sourceText:{color:'#626D78',fontSize:8,textAlign:'right'},updatedText:{color:'#626D78',fontSize:8,textAlign:'left'}, nameRow:{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center',gap:10}, playerName:{color:'#F6F8FB',fontSize:20,fontWeight:'900',textAlign:'right'}, playerRole:{color:'#747E89',fontSize:10,fontWeight:'700',marginTop:2,textAlign:'right'}, country:{fontSize:18}, recordRow:{flexDirection:'row-reverse',justifyContent:'space-between',gap:8}, metric:{flex:1}, metricValue:{color:'#F6F8FB',fontSize:15,fontWeight:'900',textAlign:'right'}, metricLabel:{color:'#68737E',fontSize:9,fontWeight:'800',textAlign:'right',marginTop:2}, cardBottom:{flexDirection:'row-reverse',alignItems:'center',gap:10,borderTopWidth:1,borderTopColor:'rgba(255,255,255,.07)',paddingTop:10}, cardBottomLabel:{color:'#D6DCE2',fontSize:10,fontWeight:'800',textAlign:'right'}, cardBottomValue:{color:'#68727C',fontSize:9,lineHeight:14,marginTop:2,textAlign:'right'}, arrowCircle:{width:32,height:32,borderRadius:16,backgroundColor:'#1B222C',alignItems:'center',justifyContent:'center'}, detailWrap:{gap:12}, detailWrapDesktop:{flexDirection:'row-reverse',alignItems:'stretch'}, detailMain:{minWidth:0}, detailCard:{borderRadius:20,borderWidth:1,borderColor:'rgba(255,255,255,.08)',padding:18,gap:16}, detailHeader:{flexDirection:'row-reverse',alignItems:'center',justifyContent:'space-between',gap:16}, detailKicker:{color:'#8B95A0',fontSize:10,fontWeight:'800',textAlign:'right'}, detailName:{color:'#F7F8FA',fontSize:24,fontWeight:'900',textAlign:'right',marginTop:2}, detailCountry:{fontSize:16}, detailSub:{color:'#6B7580',fontSize:11,fontWeight:'700',textAlign:'right',marginTop:2}, selectedBadge:{flexDirection:'row-reverse',alignItems:'center',gap:6,backgroundColor:'rgba(101,220,154,.08)',borderWidth:1,borderColor:'rgba(101,220,154,.24)',borderRadius:10,paddingHorizontal:9,paddingVertical:7}, selectedBadgeText:{color:'#90D5AA',fontSize:10,fontWeight:'900'}, detailBody:{gap:14}, detailStats:{gap:10,flex:1}, cqpBox:{borderRadius:14,backgroundColor:'#0A0F14',borderWidth:1,borderColor:'rgba(255,255,255,.06)',padding:12}, cqpLabel:{color:'#BFC7CF',fontSize:10,fontWeight:'900',textAlign:'right'}, cqpValue:{color:'#F3CF61',fontSize:22,fontWeight:'900',textAlign:'right',marginTop:2}, cqpBar:{height:5,borderRadius:4,backgroundColor:'#2A2418',overflow:'hidden',marginTop:9}, cqpFill:{width:'100%',height:'100%',backgroundColor:'#E8BD48'}, statTiles:{flexDirection:'row-reverse',gap:9}, statTile:{flex:1,borderRadius:12,borderWidth:1,borderColor:'rgba(255,255,255,.06)',backgroundColor:'#0B1016',paddingVertical:10,paddingHorizontal:8}, statTileValue:{color:'#F5F7F9',fontSize:14,fontWeight:'900',textAlign:'right'}, statTileLabel:{color:'#68727C',fontSize:8,fontWeight:'800',textAlign:'right',marginTop:2}, settingsBox:{borderRadius:16,borderWidth:1,borderColor:'rgba(255,255,255,.07)',backgroundColor:'#0A0F14',padding:13}, settingsHeader:{flexDirection:'row-reverse',gap:7,alignItems:'center',marginBottom:5}, settingsTitle:{color:'#DCE2E7',fontSize:13,fontWeight:'900',textAlign:'right'}, settingRow:{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center',paddingVertical:8,borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,.045)'}, settingName:{color:'#6E7883',fontSize:10,fontWeight:'700',textAlign:'right'}, settingValue:{color:'#DCE2E7',fontSize:11,fontWeight:'900',textAlign:'right'}, pitchCard:{width:'100%',borderRadius:20,borderWidth:1,borderColor:'rgba(255,255,255,.08)',backgroundColor:'#0B1016',padding:17,gap:12}, pitchHeader:{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center',gap:10}, pitchTitle:{color:'#E9EDF1',fontSize:14,fontWeight:'900',textAlign:'right'}, pitchFormation:{color:'#F0C95E',fontSize:11,fontWeight:'900'}, miniPitch:{height:245,borderRadius:16,overflow:'hidden',position:'relative',backgroundColor:'#12352A',borderWidth:1,borderColor:'rgba(143,208,168,.24)'}, pitchHalf:{position:'absolute',left:0,right:0,top:'50%',height:1,backgroundColor:'rgba(255,255,255,.23)'}, pitchDot:{position:'absolute',width:15,height:15,borderRadius:8,marginLeft:-7,marginTop:-7,backgroundColor:'#E6C65A',borderWidth:2,borderColor:'#FFF3A2'}, pitchLabel:{position:'absolute',bottom:8,left:8,borderRadius:9,backgroundColor:'rgba(4,11,8,.68)',paddingHorizontal:8,paddingVertical:5}, pitchLabelText:{color:'#CFEAD8',fontSize:9,fontWeight:'800'}, pitchMeta:{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center',gap:12}, pitchMetaLabel:{color:'#68737E',fontSize:10,fontWeight:'800'}, pitchMetaValue:{color:'#DDE3E7',fontSize:10,fontWeight:'900'}, primaryBtn:{height:44,borderRadius:12,backgroundColor:'#E13A45',alignItems:'center',justifyContent:'center',flexDirection:'row-reverse',gap:8}, primaryBtnText:{color:'#fff',fontSize:12,fontWeight:'900'}, centerGrid:{flexDirection:'row-reverse',gap:12,flexWrap:'wrap'}, centerCard:{flexGrow:1,minWidth:300,borderRadius:20,borderWidth:1,borderColor:'rgba(255,255,255,.08)',padding:22,gap:10}, centerKicker:{color:'#D85C64',fontSize:10,fontWeight:'900',letterSpacing:1.5,textAlign:'right'}, centerTitle:{color:'#F7F8FA',fontSize:26,fontWeight:'900',textAlign:'right'}, centerText:{color:'#7E8894',fontSize:13,lineHeight:20,textAlign:'right'}, centerStats:{flexDirection:'row-reverse',gap:22,marginTop:12,justifyContent:'flex-start'}, goalBar:{height:7,borderRadius:5,overflow:'hidden',backgroundColor:'#25171A',marginTop:8}, goalFill:{width:'60%',height:'100%',backgroundColor:'#E13A45'}, goalText:{color:'#8D969F',fontSize:10,fontWeight:'800',textAlign:'right'}, tipPanel:{width:360,flexGrow:1,borderRadius:20,borderWidth:1,borderColor:'rgba(255,255,255,.08)',backgroundColor:'#0A0F14',padding:18,gap:10}, tipPanelTitle:{color:'#EDEFF2',fontSize:18,fontWeight:'900',textAlign:'right',marginBottom:2}, tipRow:{flexDirection:'row-reverse',gap:10,paddingVertical:11,borderTopWidth:1,borderTopColor:'rgba(255,255,255,.06)'}, tipNo:{color:'#E13A45',fontSize:11,fontWeight:'900'}, tipTitle:{color:'#DAE0E5',fontSize:12,fontWeight:'900',textAlign:'right'}, tipBody:{color:'#717B86',fontSize:10,lineHeight:15,marginTop:2,textAlign:'right'}, footer:{paddingTop:10,alignItems:'center',gap:3}, footerTitle:{color:'#5B6671',fontSize:9,fontWeight:'900',letterSpacing:1.5}, footerText:{color:'#46515C',fontSize:10,textAlign:'center'}
});
