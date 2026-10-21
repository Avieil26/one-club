import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { Button, Card, colors, Muted, Screen, Title } from '@/components/ui';
import { useApp } from '@/lib/store';
import { useLanguage } from '@/lib/language';
import { getSupabase } from '@/lib/supabase';

type Cohort = {cohort_day:string;users:number;eligible_d1:number;returned_d1:number;eligible_d7:number;returned_d7:number};
type Report = {cohorts:Cohort[];daily:{active_day:string;users:number}[];started_day:string|null};
function percent(returned:number, eligible:number) { return eligible ? `${Math.round(100*returned/eligible)}% (${returned}/${eligible})` : '—'; }
export default function RetentionScreen() {
 const { user } = useApp(); const { t, language } = useLanguage(); const rtl = language==='he';
 const [report,setReport]=useState<Report|null>(null); const [error,setError]=useState(false); const [revision,setRevision]=useState(0);
 useEffect(()=>{
  if(!user?.isAdmin)return;
  let alive=true;
  void getSupabase().rpc('retention_summary').then(({data,error})=>{if(alive){setError(Boolean(error));if(!error)setReport(data as Report);}});
  return()=>{alive=false;};
 },[user?.isAdmin,revision]);
 return <Screen scene="board" maxWidth={900}>
  <Stack.Screen options={{title:t('שימוש וחזרה','Usage & returns')}} />
  <Title>{t('שימוש וחזרה','Usage & returns')}</Title>
  {!user?.isAdmin?<Muted>{t('העמוד פתוח למנהל בלבד.','This page is for the administrator only.')}</Muted>:<>
   <Muted>{t('הדוח כולל רק חשבונות שאפשרו מדידה. חשבון המנהל אינו נספר. הימים לפי שעון ישראל.','Only accounts that opted in are counted. Administrator activity is excluded. Dates use Israel time.')}</Muted>
   <Muted>{t('יום 1 ויום 7 נמדדים מהיום הראשון שנצפה במדידה, ולא מתאריך הרשמה היסטורי. אחוז מחושב מרגע שמגיע יום החזרה הנדרש; הנתונים של היום הנוכחי עדיין חלקיים.','Day 1 and Day 7 are measured from the first observed active day, not a historical signup date. Rates start when the required return day is reached; the current day is still partial.')}</Muted>
   <Button label={t('רענון נתונים','Refresh data')} variant="ghost" onPress={()=>setRevision(v=>v+1)} />
   {error?<Muted>{t('לא הצלחנו לטעון את הדוח. נסו שוב.','Could not load the report. Please try again.')}</Muted>:null}
   {!report&&!error?<Muted>{t('טוען…','Loading…')}</Muted>:null}
   {report&&!report.daily.length?<Card><Title>{t('המדידה מוכנה','Measurement is ready')}</Title><Muted>{t('עדיין אין ימי שימוש שנמדדו בהסכמה. אין כרגע בסיס לחישוב שיעור חזרה.','No opted-in active days have been recorded yet. There is no basis for a return rate yet.')}</Muted></Card>:null}
   {report?.daily.length?<Card><Title>{t('משתמשים בכל יום','Daily users')}</Title>{report.daily.map(day=><View key={day.active_day} style={{flexDirection:rtl?'row-reverse':'row',justifyContent:'space-between',gap:12,paddingVertical:8}}><Text style={{color:colors.text}}>{day.active_day}</Text><Text style={{color:colors.gold,fontWeight:'800'}}>{day.users}</Text></View>)}</Card>:null}
   {report?.cohorts.map(cohort=><Card key={cohort.cohort_day}><Title>{cohort.cohort_day}</Title><Muted>{cohort.users} {t('משתמשים ביום הראשון','users on the first day')}</Muted><Muted>{t('חזרה ביום 1: ','Day 1 return: ')}{percent(cohort.returned_d1,cohort.eligible_d1)}</Muted><Muted>{t('חזרה ביום 7: ','Day 7 return: ')}{percent(cohort.returned_d7,cohort.eligible_d7)}</Muted></Card>)}
  </>}
 </Screen>;
}
