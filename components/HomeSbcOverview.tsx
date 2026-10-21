import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { SbcRewardVisual } from '@/components/SbcRewardVisual';
import { colors, Muted } from '@/components/ui';
import { useApp } from '@/lib/store';
import { useLanguage } from '@/lib/language';
import { openSbcChallenges } from '@/lib/selectors';
import { sbcFace } from '@/lib/sbcTileTheme';
import { endsSoon } from '@/lib/sbcBrowse';
import type { SbcChallenge } from '@/lib/types';

export function HomeSbcOverview() {
 const app = useApp(); const { language, t } = useLanguage(); const rtl = language === 'he';
 const router = useRouter(); const wide = useWindowDimensions().width >= 900;
 const [now, setNow] = useState(Date.now);
 useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, []);
 const open = openSbcChallenges(app.sbcChallenges, now);
 const ending = open.filter(c => endsSoon(c, now)).sort((a,b) => Date.parse(a.endsAt!) - Date.parse(b.endsAt!));
 const secondary = ending.length ? ending.slice(0,2) : open.slice(3,5);
 const mine = app.user ? app.submissions.filter(s => s.userId === app.user?.id) : [];
 const row = (challenge: SbcChallenge) => {
  const face = sbcFace(challenge); const hours = challenge.endsAt ? Math.max(1, Math.ceil((Date.parse(challenge.endsAt)-now)/3600000)) : null;
  return <Pressable key={challenge.id} accessibilityRole="button" accessibilityLabel={language==='he'?face.he:face.en} onPress={()=>router.push(`/sbc/${challenge.id}`)} style={{ flexDirection:rtl?'row-reverse':'row',gap:13,alignItems:'center',paddingVertical:10,borderBottomWidth:1,borderBottomColor:'#273642' }}>
   <SbcRewardVisual challenge={challenge} width={72} />
   <View style={{flex:1,minWidth:0,gap:8}}><Text style={{color:'#A6BAC6',fontSize:10,fontWeight:'800',letterSpacing:1,textAlign:rtl?'right':'left'}}>{face.category}</Text><Text numberOfLines={2} style={{color:colors.text,fontSize:17,fontWeight:'800',textAlign:rtl?'right':'left'}}>{language==='he'?face.he:face.en}</Text><Text style={{color:endsSoon(challenge,now)?'#FFB59C':'#88D5D9',fontSize:12,textAlign:rtl?'right':'left'}}>{hours && hours<=24?t(`נותרו כ־${hours} שעות`,`About ${hours} hours left`):t('דרישות ופתרונות','Requirements & solutions')}</Text></View>
  </Pressable>;
 };
 return <View style={{direction:'ltr',flexDirection:wide?(rtl?'row-reverse':'row'):'column',gap:18}}>
  <View style={{flex:1,minWidth:0,backgroundColor:'rgba(5,12,20,0.96)',borderTopWidth:2,borderTopColor:'#E9C36A',padding:17,borderRadius:5,gap:6}}>
   <Text accessibilityRole="header" style={{color:colors.text,fontSize:23,fontWeight:'900',textAlign:rtl?'right':'left'}}>{t('חדש ב־SBC','New in SBCs')}</Text>
   {open.slice(0,3).map(row)}
   {!open.length?<Muted>{t('אין כרגע אתגרים פעילים.','No active challenges right now.')}</Muted>:null}
   <Pressable accessibilityRole="button" onPress={()=>router.push('/sbc')} style={{minHeight:44,justifyContent:'center'}}><Text style={{color:'#E9C36A',fontWeight:'800',textAlign:rtl?'right':'left'}}>{t('לכל האתגרים','All challenges')}</Text></Pressable>
  </View>
  <View style={{flex:1,minWidth:0,gap:18}}>
   <View style={{backgroundColor:'rgba(5,12,20,0.96)',borderTopWidth:2,borderTopColor:'#ED997E',padding:17,borderRadius:5,gap:8}}>
    <Text accessibilityRole="header" style={{color:colors.text,fontSize:23,fontWeight:'900',textAlign:rtl?'right':'left'}}>{ending.length?t('לפני שנגמר הזמן','Before time runs out'):t('עוד אתגרים פעילים','More active challenges')}</Text>
    {secondary.map(row)}
    {!secondary.length?<Muted>{t('בחרו מוד כדי להתחיל לשחק.','Choose a game mode to get started.')}</Muted>:null}
   </View>
   <Pressable accessibilityRole="button" onPress={()=>router.push(app.user?'/career?tab=challenges':'/grounds')} style={{backgroundColor:'rgba(5,12,20,0.96)',borderWidth:1,borderColor:'#30424C',padding:19,borderRadius:5,gap:10}}>
    <Text style={{color:'#7ED0C8',fontSize:11,fontWeight:'900',textAlign:rtl?'right':'left'}}>{app.user?t('ההתקדמות שלך','YOUR PROGRESS'):t('משחקים יחד','PLAY TOGETHER')}</Text>
    <Text style={{color:colors.text,fontSize:21,fontWeight:'800',textAlign:rtl?'right':'left'}}>{app.user?t('האתגר הבא בקריירה','Your next Career challenge'):t('מצאו שחקנים למפגש הבא','Find players for your next session')}</Text>
    <Muted>{app.user && mine.length?t(`${mine.filter(s=>s.status==='approved').length} הגשות אושרו · ${mine.filter(s=>s.status==='pending').length} ממתינות לבדיקה`,`${mine.filter(s=>s.status==='approved').length} approved submissions · ${mine.filter(s=>s.status==='pending').length} awaiting review`):t('בחרו מטרה, שחקו ושתפו את ההתקדמות עם הקהילה.','Choose a goal, play and share your progress with the community.')}</Muted>
   </Pressable>
  </View>
 </View>;
}
