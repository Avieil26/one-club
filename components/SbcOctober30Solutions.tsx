import candidates from '@/assets/data/sbc20261030SolutionsPending.json';
import { Linking, Pressable, Text, View } from 'react-native';
import { useLanguage } from '@/lib/language';

export function SbcOctober30Solutions({challengeId}:{challengeId:string}) {
 const {language}=useLanguage();
 const data=candidates.find(row=>row.challengeId===challengeId);
 if(!data) return null;
 const he=language==='he';
 const lines='players' in data && Array.isArray(data.players)
  ? data.players.map(p => `${p.rating} · ${p.name}`)
  : 'ratingComposition' in data && Array.isArray(data.ratingComposition)
  ? data.ratingComposition.map(r => `${r.quantity} × OVR ${r.rating}`)
  : [];
 return <View style={{borderRadius:12,borderWidth:1,borderColor:'#5C4D7C',backgroundColor:'#160F26',padding:16,gap:10}}>
  <Text style={{fontWeight:'900',color:'#F7C27E',fontSize:17,textAlign:he?'right':'left'}}>
   {he?'פתרון מוצע ממקור חיצוני':'Suggested external solution'}
  </Text>
  <Text style={{fontSize:12,color:'#DED6EB',textAlign:he?'right':'left'}}>
   {he?'זהו הרכב שפורסם במקור חיצוני; לא עבר אימות כימיה/מזהי קלפים מלא באפליקציה.':'A published source example, not fully validated against the app roster and chemistry engine.'}
  </Text>
  {lines.map((line,i)=><Text key={i} style={{color:'#F5E9DD',fontSize:13,textAlign:he?'right':'left'}}>{line}</Text>)}
  <Pressable onPress={()=>{ if(data.source.startsWith('https://')) void Linking.openURL(data.source); }} accessibilityRole="link" style={{padding:10,borderRadius:8,borderWidth:1,borderColor:'#ED9B50'}}>
   <Text style={{fontWeight:'800',color:'#F9C17C',textAlign:'center'}}>{he?'פתח את מקור הפתרון':'Open solution source'}</Text>
  </Pressable>
 </View>;
}
