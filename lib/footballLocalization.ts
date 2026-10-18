export type FootballLanguage = 'he' | 'en';

export const CLUB_NAMES_EN: Record<string, string> = {
  'אאוגסבורג': 'FC Augsburg', 'אברטון': 'Everton', 'אייאקס': 'Ajax',
  'אינטר': 'Inter Milan', 'אינטר מיאמי': 'Inter Miami', 'אלצ׳ה': 'Elche CF',
  'אלקמאר': 'AZ Alkmaar', 'אספניול': 'Espanyol', 'ארסנל': 'Arsenal',
  'באהיה': 'Bahia', 'באייר לברקוזן': 'Bayer Leverkusen', 'בוטאפוגו': 'Botafogo',
  'בולוניה': 'Bologna', 'בורוסיה דורטמונד': 'Borussia Dortmund',
  'בורוסיה מנשנגלדבאך': 'Borussia Mönchengladbach', 'בנפיקה': 'Benfica',
  'ברייטון': 'Brighton & Hove Albion', 'ברמינגהאם סיטי': 'Birmingham City',
  'ברסט': 'Stade Brestois 29', 'ברצלונה': 'Barcelona', 'בשיקטאש': 'Beşiktaş',
  'גלאטסראיי': 'Galatasaray', 'גנואה': 'Genoa', 'גנט': 'Gent', 'ג׳ירונה': 'Girona',
  'דרבי קאונטי': 'Derby County', 'הנובר 96': 'Hannover 96',
  'וולבס': 'Wolverhampton Wanderers', 'וולפסבורג': 'VfL Wolfsburg',
  'ורדר ברמן': 'Werder Bremen', 'חוארס': 'FC Juárez', 'חטאפה': 'Getafe CF',
  'טוונטה': 'FC Twente', 'טוטנהאם': 'Tottenham Hotspur', 'טולוז': 'Toulouse FC',
  'טורינו': 'Torino', 'יאנג בויז': 'BSC Young Boys', 'לאנס': 'RC Lens',
  'לבנטה': 'Levante UD', 'לוריאן': 'FC Lorient', 'ליברפול': 'Liverpool',
  'לידס יונייטד': 'Leeds United', 'ליון': 'Olympique Lyonnais', 'ליל': 'Lille OSC',
  'מונצה': 'AC Monza', 'מונקו': 'AS Monaco', 'מיורקה': 'RCD Mallorca',
  'מיינץ 05': 'Mainz 05', 'מילאן': 'AC Milan', 'מכבי חיפה': 'Maccabi Haifa',
  'מנצ׳סטר יונייטד': 'Manchester United', 'מנצ׳סטר סיטי': 'Manchester City',
  'נוטינגהאם פורסט': 'Nottingham Forest', 'ניו אינגלנד': 'New England Revolution',
  'ניוקאסל': 'Newcastle United', 'סאות׳המפטון': 'Southampton',
  'סלביה פראג': 'Slavia Prague', 'סנדרלנד': 'Sunderland AFC',
  'ספורטינג': 'Sporting CP', 'פ.ס.וו': 'PSV Eindhoven', 'פ.צ. קופנהגן': 'FC Copenhagen',
  'פולהאם': 'Fulham', 'פיורנטינה': 'Fiorentina', 'פילדלפיה יוניון': 'Philadelphia Union',
  'פנאתינייקוס': 'Panathinaikos', 'פנרבחצ׳ה': 'Fenerbahçe',
  'פריז סן ז׳רמן': 'Paris Saint-Germain', 'פרייבורג': 'SC Freiburg',
  'פרנצווארוש': 'Ferencvárosi TC', 'צ׳לסי': 'Chelsea', 'קובנטרי סיטי': 'Coventry City',
  'קומו': 'Como 1907', 'קלאב ברוז׳': 'Club Brugge', 'קריסטל פאלאס': 'Crystal Palace',
  'ר.ב. לייפציג': 'RB Leipzig', 'ראסינג קלוב': 'Racing Club', 'רומא': 'AS Roma',
  'ריאל מדריד': 'Real Madrid', 'שארלוט': 'Charlotte FC', 'שארלוט FC': 'Charlotte FC',
  'שטוטגרט': 'VfB Stuttgart', 'שנג׳ן פנג סיטי': 'Shenzhen Peng City',
};

export const NATION_NAMES_EN: Record<string, string> = {
  'אוסטריה': 'Austria', 'אוסטרליה': 'Australia', 'איטליה': 'Italy',
  'אירלנד': 'Ireland', 'אנגליה': 'England', 'ארגנטינה': 'Argentina',
  'בורקינה פאסו': 'Burkina Faso', 'בלגיה': 'Belgium', 'ברזיל': 'Brazil',
  'גאורגיה': 'Georgia', 'גאנה': 'Ghana', 'גרמניה': 'Germany', 'דנמרק': 'Denmark',
  'הולנד': 'Netherlands', 'ונצואלה': 'Venezuela', 'חוף השנהב': 'Ivory Coast',
  'טורקיה': 'Türkiye', 'ישראל': 'Israel', 'מרוקו': 'Morocco', 'נורווגיה': 'Norway',
  'סנגל': 'Senegal', 'ספרד': 'Spain', 'סקוטלנד': 'Scotland', 'פורטוגל': 'Portugal',
  'צרפת': 'France', 'צ׳כיה': 'Czechia', 'קולומביה': 'Colombia', 'קונגו': 'Congo',
  'קנדה': 'Canada', 'שוודיה': 'Sweden', 'שווייץ': 'Switzerland',
};

export const LEAGUE_NAMES_EN: Record<string, string> = {
  'לה ליגה': 'La Liga',
  'ליג 1': 'Ligue 1',
  'פרמייר ליג': 'Premier League',
  'בונדסליגה': 'Bundesliga',
  'סרייה א׳': 'Serie A',
  'סרייה א': 'Serie A',
  'ליגת העל': 'Israeli Premier League',
  'הליגה ההולנדית': 'Eredivisie',
  'ארדיוויזי': 'Eredivisie',
  'הליגה הפורטוגלית': 'Primeira Liga',
  'ליגה פורטוגלית': 'Primeira Liga',
  'ליגת האלופות': 'UEFA Champions League',
  'ליגה אירופית': 'UEFA Europa League',
  'MLS': 'MLS',
};

export function displayClub(club: string, language: FootballLanguage): string {
  return language === 'en' ? (CLUB_NAMES_EN[club] ?? club) : club;
}

export function displayNation(nation: string, language: FootballLanguage): string {
  return language === 'en' ? (NATION_NAMES_EN[nation] ?? nation) : nation;
}

export function displayLeague(league: string, language: FootballLanguage): string {
  return language === 'en' ? (LEAGUE_NAMES_EN[league] ?? league) : league;
}
