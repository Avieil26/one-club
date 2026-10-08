import { Text, View } from 'react-native';

import { Screen } from '@/components/ui';
import { careerFont } from '@/lib/careerCardTheme';

const UPDATES = [
  { date: '8 באוקטובר 2026', tag: 'פרופילים', title: 'פרופילים ציבוריים', body: 'עכשיו אפשר לפתוח פרופיל של שחקן אחר ולראות תמונה, Level, XP, Reputation, עוקבים והקבוצה שלו.' },
  { date: '8 באוקטובר 2026', tag: 'משחקונים', title: 'טבלת החודש', body: 'לכל משחקון יש טבלת שיאים חודשית אחת. השיא הטוב ביותר נשמר, ובתחילת חודש נפתחת טבלה חדשה בלי למחוק את ההיסטוריה.' },
  { date: '8 באוקטובר 2026', tag: 'Champions', title: 'Champions Leaderboard', body: 'טבלת Champions חודשית לפי CQP וניצחונות מאפשרת לראות מי מוביל החודש.' },
  { date: '8 באוקטובר 2026', tag: 'עזרה', title: 'מרכז שאלות ותשובות', body: 'ריכזנו את הדברים החשובים על פרופילים, Champions, SBC, קריירה, משחקונים והגראונדס במקום אחד.' },
];

export default function UpdatesScreen() {
  return (
    <Screen scene="home" maxWidth={900}>
      <Text style={styles.eyebrow}>1 CLUB UPDATES</Text>
      <Text style={styles.title}>מה חדש</Text>
      <Text style={styles.lead}>שינויים ותוספות שחשוב להכיר.</Text>
      <View style={{ gap: 10, marginTop: 4 }}>
        {UPDATES.map((item) => (
          <View key={item.title} style={styles.card}>
            <View style={styles.top}><Text style={styles.date}>{item.date}</Text><Text style={styles.tag}>{item.tag}</Text></View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = {
  eyebrow: { color: '#E8C46A', fontFamily: careerFont, fontSize: 12, fontWeight: '900' as const, letterSpacing: 1.3, textAlign: 'right' as const },
  title: { color: '#F6F1E4', fontFamily: careerFont, fontSize: 38, fontWeight: '900' as const, textAlign: 'right' as const, marginTop: 3 },
  lead: { color: 'rgba(246,241,228,0.68)', fontFamily: careerFont, fontSize: 14, lineHeight: 22, textAlign: 'right' as const, marginBottom: 4 },
  card: { borderRadius: 18, padding: 16, backgroundColor: 'rgba(12,16,21,0.92)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 7 },
  top: { flexDirection: 'row-reverse' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, gap: 10 },
  date: { color: 'rgba(246,241,228,0.48)', fontFamily: careerFont, fontSize: 11, fontWeight: '800' as const },
  tag: { color: '#E8C46A', fontFamily: careerFont, fontSize: 10, fontWeight: '900' as const, letterSpacing: 1 },
  cardTitle: { color: '#F6F1E4', fontFamily: careerFont, fontSize: 22, fontWeight: '900' as const, textAlign: 'right' as const },
  body: { color: 'rgba(246,241,228,0.72)', fontFamily: careerFont, fontSize: 14, lineHeight: 22, textAlign: 'right' as const },
};