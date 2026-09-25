import { DB_PLAYERS } from '@/lib/playerDb';

export type PlayStyle = { name: string; plus: boolean };

export type FcPlayer = {
  id: string;
  name: string;
  rating: number;
  position: string;
  nation: string;
  league: string;
  club: string;
  icon?: boolean;
  positions?: string[];
  playstyles?: PlayStyle[];
};

export const N = {
  scotland: 'סקוטלנד',
  portugal: 'פורטוגל',
  france: 'צרפת',
  spain: 'ספרד',
  brazil: 'ברזיל',
  england: 'אנגליה',
  argentina: 'ארגנטינה',
  germany: 'גרמניה',
  netherlands: 'הולנד',
  norway: 'נורווגיה',
  italy: 'איטליה',
  belgium: 'בלגיה',
  croatia: 'קרואטיה',
  morocco: 'מרוקו',
  japan: 'יפן',
  usa: 'ארה״ב',
  nigeria: 'ניגריה',
  senegal: 'סנגל',
  poland: 'פולין',
  uruguay: 'אורוגוואי',
  georgia: 'גאורגיה',
  sweden: 'שוודיה',
  denmark: 'דנמרק',
  egypt: 'מצרים',
  korea: 'קוריאה',
  colombia: 'קולומביה',
  turkey: 'טורקיה',
  switzerland: 'שווייץ',
  hungary: 'הונגריה',
  ukraine: 'אוקראינה',
  canada: 'קנדה',
  slovenia: 'סלובניה',
  gabon: 'גבון',
  czech: 'צ׳כיה',
  serbia: 'סרביה',
  algeria: 'אלג׳יריה',
  austria: 'אוסטריה',
  greece: 'יוון',
  mexico: 'מקסיקו',
  ivory: 'חוף השנהב',
  cameroon: 'קמרון',
  ghana: 'גאנה',
  mali: 'מאלי',
  wales: 'ויילס',
  ireland: 'אירלנד',
  finland: 'פינלנד',
  australia: 'אוסטרליה',
  zambia: 'זמביה',
  chile: 'צ׳ילה',
} as const;

export const L = {
  prem: 'פרמייר ליג',
  laliga: 'לה ליגה',
  ligue1: 'ליג 1',
  ligaPt: 'ליגה פורטוגל',
  scottish: 'ליגת העל הסקוטית',
  seriea: 'סרייה א׳',
  bundes: 'בונדסליגה',
  eredivisie: 'ארדיוויזי',
  mls: 'MLS',
  saudi: 'ליגת העל הסעודית',
  turkish: 'סופר ליג',
  belgian: 'ליגת העל הבלגית',
  championship: 'הצ׳מפיונשיפ',
  lpf: 'ליגת העל הארגנטינאית',
  wsl: 'WSL',
  ligaF: 'ליגה F',
  nwsl: 'NWSL',
  arkema: 'ליג 1 נשים',
  frauen: 'בונדסליגה נשים',
} as const;

export const C = {
  celtic: 'סלטיק',
  rangers: 'ריינג׳רס',
  porto: 'פורטו',
  benfica: 'בנפיקה',
  sporting: 'ספורטינג',
  psg: 'פריז סן ז׳רמן',
  om: 'אולימפיק מרסיי',
  real: 'ריאל מדריד',
  atletico: 'אתלטיקו מדריד',
  barca: 'ברצלונה',
  city: 'מנצ׳סטר סיטי',
  liverpool: 'ליברפול',
  arsenal: 'ארסנל',
  chelsea: 'צ׳לסי',
  united: 'מנצ׳סטר יונייטד',
  spurs: 'טוטנהאם',
  newcastle: 'ניוקאסל',
  bayern: 'באיירן מינכן',
  leverkusen: 'באייר לברקוזן',
  dortmund: 'בורוסיה דורטמונד',
  inter: 'אינטר',
  milan: 'מילאן',
  juve: 'יובנטוס',
  napoli: 'נאפולי',
  roma: 'רומא',
  ajax: 'אייאקס',
  psv: 'פ.ס.וו',
  galatasaray: 'גלאטסראיי',
  brugge: 'קלאב ברוז׳',
  miami: 'אינטר מיאמי',
  hilal: 'אל-הילאל',
  brighton: 'ברייטון',
  villa: 'אסטון וילה',
} as const;

export const PLAYERS: FcPlayer[] = DB_PLAYERS;
