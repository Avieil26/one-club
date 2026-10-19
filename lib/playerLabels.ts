const ENGLISH_LABELS: Record<string, string> = {
  // Nations
  'סקוטלנד': 'Scotland', 'פורטוגל': 'Portugal', 'צרפת': 'France', 'ספרד': 'Spain',
  'ברזיל': 'Brazil', 'אנגליה': 'England', 'ארגנטינה': 'Argentina', 'גרמניה': 'Germany',
  'הולנד': 'Netherlands', 'נורווגיה': 'Norway', 'איטליה': 'Italy', 'בלגיה': 'Belgium',
  'קרואטיה': 'Croatia', 'מרוקו': 'Morocco', 'יפן': 'Japan', 'ארה״ב': 'United States',
  'ניגריה': 'Nigeria', 'סנגל': 'Senegal', 'פולין': 'Poland', 'אורוגוואי': 'Uruguay',
  'גאורגיה': 'Georgia', 'שוודיה': 'Sweden', 'דנמרק': 'Denmark', 'מצרים': 'Egypt',
  'קוריאה': 'Korea', 'קולומביה': 'Colombia', 'טורקיה': 'Türkiye', 'שווייץ': 'Switzerland',
  'הונגריה': 'Hungary', 'אוקראינה': 'Ukraine', 'קנדה': 'Canada', 'סלובניה': 'Slovenia',
  'גבון': 'Gabon', 'צ׳כיה': 'Czechia', 'סרביה': 'Serbia', 'אלג׳יריה': 'Algeria',
  'אוסטריה': 'Austria', 'יוון': 'Greece', 'מקסיקו': 'Mexico', 'חוף השנהב': 'Ivory Coast',
  'קמרון': 'Cameroon', 'גאנה': 'Ghana', 'מאלי': 'Mali', 'ויילס': 'Wales',
  'אירלנד': 'Ireland', 'פינלנד': 'Finland', 'אוסטרליה': 'Australia', 'זמביה': 'Zambia',
  'צ׳ילה': 'Chile', 'הרפובליקה הדמוקרטית של קונגו': 'DR Congo',
  // Leagues
  'פרמייר ליג': 'Premier League', 'לה ליגה': 'LaLiga', 'ליג 1': 'Ligue 1',
  'ליגה פורטוגל': 'Liga Portugal', 'ליגת העל הסקוטית': 'Scottish Premiership',
  'סרייה א׳': 'Serie A', 'בונדסליגה': 'Bundesliga', 'ארדיוויזי': 'Eredivisie',
  'ליגת העל הסעודית': 'Saudi Pro League', 'סופר ליג': 'Süper Lig',
  'ליגת העל הבלגית': 'Belgian Pro League', 'הצ׳מפיונשיפ': 'Championship',
  'ליגת העל הארגנטינאית': 'Argentine Primera División', 'ליג 1 נשים': 'Première Ligue',
  'בונדסליגה נשים': 'Frauen-Bundesliga', 'ליגה F': 'Liga F', 'ליגה F נשים': 'Liga F',
  'מילאן': 'AC Milan', 'מילאנו FC': 'AC Milan',
  // Clubs
  'סלטיק': 'Celtic', 'ריינג׳רס': 'Rangers', 'פורטו': 'Porto', 'בנפיקה': 'Benfica',
  'ספורטינג': 'Sporting CP', 'פריז סן ז׳רמן': 'Paris Saint-Germain',
  'אולימפיק מרסיי': 'Olympique Marseille', 'ריאל מדריד': 'Real Madrid',
  'אתלטיקו מדריד': 'Atlético Madrid', 'ברצלונה': 'Barcelona', 'מנצ׳סטר סיטי': 'Manchester City',
  'ליברפול': 'Liverpool', 'ארסנל': 'Arsenal', 'צ׳לסי': 'Chelsea',
  'מנצ׳סטר יונייטד': 'Manchester United', 'טוטנהאם': 'Tottenham Hotspur',
  'ניוקאסל': 'Newcastle United', 'באיירן מינכן': 'Bayern Munich',
  'באייר לברקוזן': 'Bayer Leverkusen', 'בורוסיה דורטמונד': 'Borussia Dortmund',
  'אינטר': 'Inter', 'יובנטוס': 'Juventus', 'נאפולי': 'Napoli', 'רומא': 'Roma',
  'אייאקס': 'Ajax', 'פ.ס.וו': 'PSV', 'גלאטסראיי': 'Galatasaray',
  'קלאב ברוז׳': 'Club Brugge', 'אינטר מיאמי': 'Inter Miami', 'אל-הילאל': 'Al Hilal',
  'ברייטון': 'Brighton & Hove Albion', 'אסטון וילה': 'Aston Villa',
  // Positions, UI labels, and player attributes
  'שוער': 'Goalkeeper', 'חלוץ': 'Striker', 'כנף': 'Winger', 'קשר התקפי': 'Attacking midfielder',
  'קשר מרכזי': 'Central midfielder', 'קשר אחורי': 'Defensive midfielder', 'בלם': 'Centre back',
  'מגן': 'Full back', 'קשר שמאלי': 'Left midfielder', 'קשר ימני': 'Right midfielder',
  'כנף שמאל': 'Left winger', 'כנף ימין': 'Right winger', 'שמאל': 'Left', 'ימין': 'Right',
  'אייקון': 'Icon', 'רגל חלשה': 'Weak foot', 'סקיל': 'Skill moves', 'ס״מ': 'cm',
  'קלף רגיל': 'Regular card', 'קלף פרומו': 'Promo card', 'תגובות': 'Comments',
  'שליחה': 'Post', 'אין נתון רשמי לרגל ולסקיל': 'No official weak-foot or skill-move data',
  'שחקן קהילה': 'Community player', 'שחקן מהקהילה': 'Community player',
};

export function playerLabel(value: string | undefined | null, language: 'he' | 'en'): string {
  if (!value || language === 'he') return value ?? '';
  return ENGLISH_LABELS[value] ?? value;
}
