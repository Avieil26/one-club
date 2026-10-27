import type { CareerChallenge } from '@/lib/types';
import type { AppLocale } from '@/lib/language';
import { plannedUiTranslations } from '@/lib/plannedUiTranslations';

const ENGLISH: Record<string, string> = {
  "אליפות עם לידס": "Win the league with Leeds",
  "יוצרים שחקן ומתחילים בלידס יונייטד. בעונה הראשונה זוכים באליפות הליגה שבה הקבוצה מתחילה. אסור לעבור מועדון באמצע העונה. רמת קושי מינימלית: World Class.": "Create a player and start at Leeds United. Win their starting league in the first season. Do not change clubs during the season. Minimum difficulty: World Class.",
  "צילום של טבלת הליגה עם לידס במקום הראשון, צילום של מסך השחקן עם הסמל של לידס, וצילום של מסך ההגדרות עם World Class ומעלה.": "Show Leeds in first place in the league table, your player screen with the Leeds badge, and the difficulty settings at World Class or higher.",
  "עלייה בלי רכש מבוגר": "Promotion with young signings",
  "מתחילים בקבוצה מהצ׳מפיונשיפ. עד סוף העונה עולים לפרמייר ליג. עד חלון ינואר אסור לקנות שחקן מעל גיל 23. השאלות מותרות. רמת קושי מינימלית: World Class.": "Start with a Championship club and earn promotion to the Premier League by the end of the season. Before the January window, do not buy players over 23. Loans are allowed. Minimum difficulty: World Class.",
  "צילום של טבלת סוף העונה עם קו העלייה, וצילום של הסגל שבו רואים את הגילאים.": "Show the final league table with the promotion places and your squad with player ages visible.",
  "רק שחקני אקדמיה עד ינואר": "Academy players until January",
  "מתחילים בקבוצת ליגה שנייה. עד חלון ינואר אסור לקנות שחקן מעל גיל 21, וצריך להעפיל בפלייאוף או לסיים בחצי העליון.": "Start with a second-division club. Before the January window, do not buy players over 21. Reach the playoffs or finish in the top half.",
  "צילום של טבלת הליגה וצילום של סגל שבו רואים את הגילאים.": "Show the league table and your squad with player ages visible.",
  "שער בכורה בליגה": "Score your first league goal",
  "יוצרים שחקן צעיר וצריכים לכבוש את שער הליגה הראשון לפני סוף אוקטובר.": "Create a young player and score your first league goal before the end of October.",
  "צילום של השער או של סטטיסטיקת השחקן עם לפחות שער אחד.": "Show the goal or your player statistics with at least one goal.",
  "לידס": "Leeds",
  "עלייה": "Promotion",
  "אקדמיה": "Academy",
  "שער": "Goal",
  "שחקן": "Player",
  "מאמן": "Manager"
};

export function careerText(text: string, language: AppLocale): string {
  if (language === 'he') return text;
  const english = ENGLISH[text];
  if (!english) return text; // User-generated challenge content stays in its original language.
  return language === 'en' ? english : plannedUiTranslations[language][english] ?? english;
}

export function careerChallengeCopy(challenge: CareerChallenge, language: AppLocale) {
  return {
    title: careerText(challenge.title, language),
    rules: careerText(challenge.rules, language),
    proofRequirements: careerText(challenge.proofRequirements, language),
  };
}
