import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Animated, Pressable, Text, View } from 'react-native';

import { Screen } from '@/components/ui';
import { careerFont } from '@/lib/careerCardTheme';

type Category = { title: string; questions: string[] };

const CATEGORIES: Category[] = [
  { title: '👤 חשבון ופרופיל', questions: ['איך נרשמים לאתר?', 'מה זה XP, Level ו־Reputation?', 'איך מקבלים XP ותגים?', 'איך בונים ומציגים את הקבוצה שלי בפרופיל?'] },
  { title: '🏆 FUT Champions', questions: ['מה זה FUT Champions באתר?', 'איך מדווחים על תוצאות ה־Champions שלי?', 'מה זה CQP ואיך מקבלים אותו?', 'איך עובדים הדירוגים והפרסים של FUT Champions?', 'מה הם Champions Tokens ואיך משתמשים בהם?', 'איך מעלים טקטיקה או הגדרות שלט לקהילה?', 'למה התוכן שהעליתי מופיע כ־Pending ומתי הוא מאושר?'] },
  { title: '🧩 SBC', questions: ['איך מוצאים ומשתמשים בפתרונות SBC?', 'מה ההבדל בין פתרון שעבד לבין פתרון שלא עבד?', 'איך מעלים פתרון SBC משלי?', 'מה עושה מחשבון ה־SBC?'] },
  { title: '🌟 קריירה', questions: ['איך עובד מוד הקריירה ואיך מגישים הוכחה לאתגר?', 'מה קורה אחרי שההגשה שלי מאושרת?'] },
  { title: '🎮 משחקונים', questions: ['אילו משחקונים קיימים ואיך הניקוד בהם עובד?'] },
  { title: '🟢 הגראונדס והקהילה', questions: ['איך מחפשים שחקנים ומפרסמים מודעה בגראונדס?', 'איך עוקבים, שולחים הודעה ומתקשרים עם שחקנים אחרים?'] },
];

const ANSWERS: Record<string, string> = {
  'איך נרשמים לאתר?': 'בוחרים הרשמה, מזינים את הפרטים הדרושים ומאשרים את החשבון. אפשר גם להתחבר דרך Google כשהאפשרות זמינה.',
  'מה זה XP, Level ו־Reputation?': 'XP מתקבל מפעילות בקהילה ומקדם את ה־Level. Reputation היא נקודת מוניטין נפרדת שמצטברת מאינטראקציות ואישורים.',
  'איך מקבלים XP ותגים?': 'פעילות קהילתית כמו פתרונות, אישורים, פרסום ותמיכה בתוכן יכולה לקדם את ה־XP והתגים שלך.',
  'איך בונים ומציגים את הקבוצה שלי בפרופיל?': 'נכנסים לפרופיל, בוחרים בניית הקבוצה וממקמים שחקנים ומחליפים. אחרי השמירה הסגל מוצג גם בפרופיל הציבורי.',
  'מה זה FUT Champions באתר?': 'זה מרכז התחרות של 1 Club: מעקב תוצאות, CQP, פרסים, Tokens ותוכן קהילתי של טקטיקות והגדרות.',
  'איך מדווחים על תוצאות ה־Champions שלי?': 'נכנסים לעמוד Champions, מעדכנים את מאזן הריצה ושומרים. הנתונים נשמרים בפרופיל Champions שלך.',
  'מה זה CQP ואיך מקבלים אותו?': 'CQP הוא מדד התקדמות ייעודי ל־Champions. הוא עולה לפי תוצאות הריצה והתוכן המאושר שמקושר למוד.',
  'איך עובדים הדירוגים והפרסים של FUT Champions?': 'הדירוג נקבע לפי מספר הניצחונות בריצה, וכל דרגה מציגה את הפרס והכמות המתאימה של Tokens ו־CQP.',
  'מה הם Champions Tokens ואיך משתמשים בהם?': 'Tokens הם מטבע התקדמות פנימי של מוד Champions שאפשר להחליף בפרסים שמופיעים ב־Token Store.',
  'איך מעלים טקטיקה או הגדרות שלט לקהילה?': 'בעמוד Champions בוחרים טקטיקה, מערך והגדרות, מוסיפים הסבר ותמונה ושולחים לבדיקה.',
  'למה התוכן שהעליתי מופיע כ־Pending ומתי הוא מאושר?': 'תוכן קהילתי חדש נכנס לבדיקה. רק לאחר אישור הוא מופיע כתוכן ציבורי בקהילה.',
  'איך מוצאים ומשתמשים בפתרונות SBC?': 'נכנסים ל־SBC, פותחים את האתגר ובוחרים פתרון מהקהילה. אפשר לפתוח את הפתרון המלא או להשתמש במחשבון כשצריך.',
  'מה ההבדל בין פתרון שעבד לבין פתרון שלא עבד?': 'אפשר לסמן אם פתרון הצליח אצלך או לא. כך הקהילה רואה אילו פתרונות אמינים יותר.',
  'איך מעלים פתרון SBC משלי?': 'פותחים את האתגר, בוחרים העלאת פתרון, מוסיפים הסבר וצילום או סגל ושולחים.',
  'מה עושה מחשבון ה־SBC?': 'המחשבון עוזר לבדוק ולהרכיב פתרון לפי דרישות האתגר במקום לעבור ידנית על כל הקלפים.',
  'איך עובד מוד הקריירה ואיך מגישים הוכחה לאתגר?': 'בוחרים אתגר פתוח, עוברים על הכללים, מבצעים אותו במשחק ומעלים את ההוכחה שנדרשה.',
  'מה קורה אחרי שההגשה שלי מאושרת?': 'ההגשה הופכת לחלק מהתוכן הקהילתי המאושר ויכולה להוסיף XP, אישורים ותגים לפי פעילות המוד.',
  'אילו משחקונים קיימים ואיך הניקוד בהם עובד?': 'יש כרגע ארבעה משחקונים. אחרי סיום משחק, השיא הטוב ביותר שלך יכול להישמר בטבלת החודש המתאימה.',
  'איך מחפשים שחקנים ומפרסמים מודעה בגראונדס?': 'בוחרים פלטפורמה וסוג חיפוש בגראונדס, ואז אפשר לפתוח מודעה חדשה עם הפרטים של השחקן והמשחק.',
  'איך עוקבים, שולחים הודעה ומתקשרים עם שחקנים אחרים?': 'נכנסים לפרופיל הציבורי של שחקן, ומשם אפשר לעקוב אחריו או לפתוח שיחת הודעות בתוך 1 Club.',
};

function FaqItem({ question, answer, expanded, onPress }: { question: string; answer: string; expanded: boolean; onPress: () => void }) {
  const progress = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(progress, { toValue: expanded ? 1 : 0, duration: 220, useNativeDriver: false }).start();
  }, [expanded, progress]);
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.question}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
          <Text style={[styles.questionText, { flex: 1 }]}>{question}</Text>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#E8C46A" />
        </View>
        <Animated.View style={{ maxHeight: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 140] }), opacity: progress, overflow: 'hidden' }}>
          <Text style={styles.answer}>{answer}</Text>
        </Animated.View>
      </View>
    </Pressable>
  );
}

