import { LIVE_SBC_TRANSLATIONS } from '@/lib/sbcLive20261020';
import { plannedUiTranslations } from '@/lib/plannedUiTranslations';
import type { AppLocale } from '@/lib/language';

const SBC_ENGLISH: Record<string, string> = {
  "5× שחקני זהב 80+": "5× 80+ Gold Players",
  "3× שחקני זהב 79+": "3× 79+ Gold Players",
  "חבילת זהב מיני": "Mini Gold Pack",
  "חבילת שחקנים מעורבת קטנה": "Small Mixed Players Pack",
  "חבילת שחקני זהב קטנה": "Small Gold Players Pack",
  "חבילת אלקטראם גדולה": "Large Electrum Pack",
  "כרטיס Destined for Glory": "Destined for Glory card",
  "חבילת זהב קטנה": "Small Gold Pack",
  "חבילת TOTW 1–3": "TOTW 1–3 Pack",
  "כרטיס Squad Foundations": "Squad Foundations card",
  "חבילת זהב ענקית": "Giant Gold Pack",
  "חבילת שחקני אלקטרום קטנה": "Small Electrum Players Pack",
  "חבילת זהב": "Gold Pack",
  "חבילת שחקני אלקטרום": "Electrum Players Pack",
  "בחירת כרטיס 83+ OTW": "83+ OTW Player Pick",
  "כרטיס 83+ · קשר אחורי": "83+ card · Defensive midfielder",
  "שחקן זהב 83+": "83+ Gold Player",
  "בחירת 2× שחקני 79+": "2× 79+ Player Pick",
  "חבילות פתיחה": "Starter packs",
  "2× שחקני זהב 78+": "2× 78+ Gold Players",
  "שחקן זהב 75+": "75+ Gold Player",
  "שחקן נדיר 75+": "75+ Rare Player",
  "×2 חבילת שחקני כסף": "2× Silver Players Packs",
  "חבילת זהב גדולה": "Large Gold Pack",
  "תרגול": "Practice",
  "פרס שחקן SBC: Claudia Pina 89 LW. שחקנית החודש של Liga F לחודש ספטמבר.": "SBC player reward: Claudia Pina 89 LW. Liga F Player of the Month for September.",
  "שדרוג פעיל: חבילה עם 5 שחקני זהב בדירוג 80 ומעלה.": "Active upgrade: a pack with 5 gold players rated 80 or higher.",
  "שדרוג פעיל: חבילה עם 3 שחקני זהב בדירוג 79 ומעלה.": "Active upgrade: a pack with 3 gold players rated 79 or higher.",
  "פרס שחקן SBC: Maghnes Akliouche 85 CAM. נתוני קלף: 84 PAC, 83 SHO, 86 PAS, 89 DRI, 55 DEF, 70 PHY.": "SBC player reward: Maghnes Akliouche 85 CAM. Card attributes: 84 PAC, 83 SHO, 86 PAS, 89 DRI, 55 DEF, 70 PHY.",
  "פרס שחקן SBC: Tarciane 84 CB. נתוני קלף: 80 PAC, 45 SHO, 74 PAS, 70 DRI, 84 DEF, 87 PHY.": "SBC player reward: Tarciane 84 CB. Card attributes: 80 PAC, 45 SHO, 74 PAS, 70 DRI, 84 DEF, 87 PHY.",
  "פרס שחקן SBC: Raphinha 89 ST. נתוני קלף: 92 PAC, 87 SHO, 86 PAS, 88 DRI, 55 DEF, 77 PHY.": "SBC player reward: Raphinha 89 ST. Card attributes: 92 PAC, 87 SHO, 86 PAS, 88 DRI, 55 DEF, 77 PHY.",
  "פרס שחקן SBC: Pascal Groß 84 CDM. נתוני קלף: 76 PAC, 79 SHO, 88 PAS, 83 DRI, 77 DEF, 79 PHY.": "SBC player reward: Pascal Groß 84 CDM. Card attributes: 76 PAC, 79 SHO, 88 PAS, 83 DRI, 77 DEF, 79 PHY.",
  "פרס שחקן SBC: Michael Olise 91 RW. נתוני קלף: 84 PAC, 83 SHO, 90 PAS, 92 DRI, 48 DEF, 70 PHY.": "SBC player reward: Michael Olise 91 RW. Card attributes: 84 PAC, 83 SHO, 90 PAS, 92 DRI, 48 DEF, 70 PHY.",
  "פרס שחקן SBC: Donyell Malen 85 ST. נתוני קלף: 87 PAC, 85 SHO, 75 PAS, 86 DRI, 39 DEF, 70 PHY.": "SBC player reward: Donyell Malen 85 ST. Card attributes: 87 PAC, 85 SHO, 75 PAS, 86 DRI, 39 DEF, 70 PHY.",
  "פרס שחקן SBC: Davide Frattesi 84 CM. נתוני קלף: 84 PAC, 81 SHO, 81 PAS, 84 DRI, 77 DEF, 78 PHY.": "SBC player reward: Davide Frattesi 84 CM. Card attributes: 84 PAC, 81 SHO, 81 PAS, 84 DRI, 77 DEF, 78 PHY.",
  "לפחות שחקן אחד מאיטליה או מבלגיה, לפחות 3 מועדונים, לפחות 3 שחקני כסף, וכימיה 14. הפרס: חבילת זהב מיני.": "At least 1 player from Italy or Belgium, at least 3 clubs, at least 3 silver players, and 14 chemistry. Reward: Mini Gold Pack.",
  "לפחות שחקן אחד מנורווגיה או מפורטוגל, לפחות 3 מאותו מועדון, עד 5 ליגות, לפחות 2 זהב, כל הכרטיסים מכסף ומעלה, וכימיה 18. הפרס: חבילת שחקנים מעורבת קטנה.": "At least 1 player from Norway or Portugal, at least 3 from the same club, at most 5 leagues, at least 2 gold players, all cards silver or higher, and 18 chemistry. Reward: Small Mixed Players Pack.",
  "לפחות 2 מהולנד או מגרמניה, עד 2 מאותו מועדון, לפחות 4 מאותה ליגה, לפחות 2 זהב, כל הכרטיסים מכסף ומעלה, וכימיה 22. הפרס: חבילת שחקני זהב קטנה.": "At least 2 players from the Netherlands or Germany, at most 2 from the same club, at least 4 from the same league, at least 2 gold players, all cards silver or higher, and 22 chemistry. Reward: Small Gold Players Pack.",
  "לפחות 2 מאנגליה או מספרד, לפחות 4 מאותה מדינה, עד 3 מאותו מועדון, עד 5 ליגות, דירוג קבוצה 75, וכימיה 26. הפרס: חבילת אלקטראם גדולה.": "At least 2 players from England or Spain, at least 4 from the same nation, at most 3 from the same club, at most 5 leagues, a squad rating of 75, and 26 chemistry. Reward: Large Electrum Pack.",
  "Streamlined: 25,000 נקודות פריט עבור כרטיס Destined for Glory של רנאטו וייגה.": "Streamlined: 25,000 item points for a Renato Veiga Destined for Glory card.",
  "Streamlined: 75,000 נקודות פריט עבור כרטיס Destined for Glory של אנטוניו נוסה.": "Streamlined: 75,000 item points for an Antonio Nusa Destined for Glory card.",
  "אתגר הפתיחה של Destined for Glory. הפרס שפורסם: חבילת זהב קטנה.": "The opening Destined for Glory challenge. Published reward: Small Gold Pack.",
  "מגישים פריטים ומקבלים חבילה עם שחקן TOTW מהסבבים 1–3.": "Submit items to receive a pack with a TOTW player from weeks 1–3.",
  "Streamlined: 4,000 נקודות פריט. הפרס: כרטיס Squad Foundations של כריסטיאן אספינוזה.": "Streamlined: 4,000 item points. Reward: a Cristian Espinoza Squad Foundations card.",
  "חוגגים את מעברו של יאן דיומנדה לריאל מדריד. עד 4 מאותה ליגה, לפחות 3 מאותו מועדון, עד 4 מועדונים, לפחות 2 מדינות, כל הכרטיסים זהב, וכימיה 12.": "Celebrate Yan Diomande’s move to Real Madrid. At most 4 players from the same league, at least 3 from the same club, at most 4 clubs, at least 2 nations, all cards gold, and 12 chemistry.",
  "אתגר מסורתי מהסבב של 17 בספטמבר 2026. לפחות שחקן אחד מסקוטלנד, לפחות שני מועדונים, לפחות כרטיס כסף אחד, וכימיה 14. הפרס שפורסם: חבילת זהב קטנה.": "A classic challenge from the September 17, 2026 round. At least 1 Scottish player, at least 2 clubs, at least 1 silver card, and 14 chemistry. Published reward: Small Gold Pack.",
  "לפחות 2 מליגה פורטוגל, לפחות 2 מפורטוגל, עד 6 ליגות, לפחות זהב אחד, כל הכרטיסים מכסף ומעלה, וכימיה 18.": "At least 2 players from the Portuguese league, at least 2 Portuguese players, at most 6 leagues, at least 1 gold player, all cards silver or higher, and 18 chemistry.",
  "לפחות שחקן אחד מפריז סן ז׳רמן או אולימפיק מרסיי, לפחות 2 מצרפת, עד 5 מאותה ליגה, לפחות זהב אחד, כל הכרטיסים מכסף ומעלה, וכימיה 22.": "At least 1 player from Paris Saint-Germain or Olympique Marseille, at least 2 French players, at most 5 from the same league, at least 1 gold player, all cards silver or higher, and 22 chemistry.",
  "לפחות 2 מריאל מדריד או אתלטיקו מדריד, לפחות 2 מלה ליגה, לפחות 4 מאותה מדינה, עד 3 מאותו מועדון, דירוג קבוצה 75, וכימיה 26.": "At least 2 players from Real Madrid or Atlético Madrid, at least 2 from La Liga, at least 4 from the same nation, at most 3 from the same club, a squad rating of 75, and 26 chemistry.",
  "בחירה בין רודריגו מורה לבין פדרו גונזאלבש (Pote). Streamlined ב־20,000 נקודות פריט — בלי כימיה ובלי עמדות. אפשר כפילויות ולהגיש חלק ולחזור.": "Choose between Rodrigo Mora and Pedro Gonçalves (Pote). Streamlined: 20,000 item points, with no chemistry or position requirements. Duplicates and partial submissions are allowed.",
  "Streamlined: 20,000 נקודות עבור כרטיס 83 של איוב בואדי. בלי כימיה ובלי עמדות. אפשר כפילויות, ואפשר להגיש חלק ולחזור אחר כך.": "Streamlined: 20,000 points for an 83-rated Ayyoub Bouaddi card. No chemistry or position requirements. Duplicates and partial submissions are allowed.",
  "Streamlined: מגישים פריטים עד שמגיעים לניקוד היעד ומקבלים חבילה עם שחקן זהב נדיר בדירוג 83 ומעלה.": "Streamlined: submit items to reach the target score and receive a pack with a rare gold player rated 83 or higher.",
  "Streamlined: מגישים פריטים ומקבלים חבילה עם שני שחקני זהב בדירוג 79 ומעלה (Three of the Best Player Pick).": "Streamlined: submit items to receive two gold players rated 79 or higher (Three of the Best Player Pick).",
  "אתגרי פתיחה קבועים להיכרות עם מערכת ה-SBC והשדרוגים. בלי תאריך סיום.": "Permanent introductory challenges for SBCs and upgrades. No expiry date.",
  "מחליפים פריטי זהב בחבילת 2× שחקני זהב 78+. חוזר ללא הגבלה.": "Exchange gold items for a pack with 2 gold players rated 78 or higher. Repeatable without limit.",
  "מחליפים פריטי ארד/כסף בחבילת שחקן זהב 75+. חוזר ללא הגבלה.": "Exchange bronze/silver items for a gold player rated 75 or higher. Repeatable without limit.",
  "כל הכרטיסים זהב. אין דרישת כימיה. הפרס: חבילת שחקני זהב קטנה.": "All cards must be gold. No chemistry requirement. Reward: Small Gold Players Pack.",
  "כל הכרטיסים כסף, בלי זהב ובלי ארד. הפרס: שחקן נדיר 75+.": "All cards must be silver, with no gold or bronze cards. Reward: a rare player rated 75 or higher.",
  "כל הכרטיסים ארד. הפרס: שתי חבילות שחקני כסף.": "All cards must be bronze. Reward: two Silver Players Packs.",
  "סדרת אתגרי פאזל קבועים של ליגה ומדינה. הפרס הסופי: חבילת זהב גדולה + מטבעות.": "A permanent series of league-and-nation puzzle challenges. Final reward: a Large Gold Pack and coins.",
  "זה לא אתגר רשמי של EA. כך עובדת דרישת מדינות ב-SBC מסורתי: 11 שחקנים, לפחות 10 לאומים שונים, וכימיה 18.": "This is not an official EA challenge. Practice a classic SBC nation requirement: 11 players, at least 10 different nationalities, and 18 chemistry."
};

/** Translate built-in copy exactly; preserve community-authored text. */
export function sbcText(text: string, language: AppLocale): string {
  if (language === 'he') return text;
  const english = LIVE_SBC_TRANSLATIONS[text] ?? SBC_ENGLISH[text];
  if (!english) return text; // Preserve community-authored text.
  return language === 'en' ? english : plannedUiTranslations[language][english] ?? english;
}

/** Generated rule labels belong to the app; community text is never translated. */
export function sbcCheckText(label: string, language: 'he' | 'en'): string {
 if (language === 'he') return label;
 return label
  .replace(/(\d+) שחקנים/g, '$1 players')
  .replace(/ללא שחקנים כפולים/g, 'No duplicate players')
  .replace(/מבאיירן מינכן/g, 'from Bayern Munich')
  .replace(/מיובנטוס/g, 'from Juventus')
  .replace(/מברצלונה/g, 'from FC Barcelona')
  .replace(/ממנצ׳סטר יונייטד/g, 'from Manchester United')
  .replace(/מפריז סן ז׳רמן/g, 'from Paris Saint-Germain')
  .replace(/מנאפולי/g, 'from Napoli')
  .replace(/מצ׳לסי/g, 'from Chelsea')
  .replace(/ריאל מדריד/g, 'Real Madrid')
  .replace(/נאפולי/g, 'Napoli')
  .replace(/רומא/g, 'Roma')
  .replace(/צ׳לסי/g, 'Chelsea')
  .replace(/טוטנהאם/g, 'Tottenham Hotspur')
  .replace(/ או /g, ' or ')
  .replace(/בדיוק/g, 'Exactly')
  .replace(/כימיה/g, 'Chemistry')
  .replace(/דירוג קבוצה/g, 'Squad rating')
  .replace(/דירוג קלף/g, 'Item rating')
  .replace(/עכשיו/g, 'current')
  .replace(/לפחות/g, 'At least')
  .replace(/עד /g, 'Max. ')
  .replace(/מדינות/g, 'nations')
  .replace(/מועדונים/g, 'clubs')
  .replace(/ליגות/g, 'leagues')
  .replace(/מאותו מועדון/g, 'from one club')
  .replace(/מאותה ליגה/g, 'from one league')
  .replace(/מאותה מדינה/g, 'from one nation')
  .replace(/כל הכרטיסים מ/g, 'All cards: ')
  .replace(/כל הכרטיסים /g, 'All cards: ')
  .replace(/ומעלה/g, 'or higher')
  .replace(/זהב/g, 'gold')
  .replace(/כסף/g, 'silver')
  .replace(/ארד/g, 'bronze');
}
