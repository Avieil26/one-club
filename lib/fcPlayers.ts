import { destinedEdition } from '@/lib/destinedEditions';
import { DB_PLAYERS } from '@/lib/playerDb';
import { otwFor, totwFor } from '@/lib/specialCards';

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
  /** Promo card of an existing player. The regular card keeps the plain id. */
  edition?: 'destined' | 'hero' | 'totw' | 'otw' | 'squadFoundations';
  /** English name used on the card and in search. */
  en?: string;
  face?: { ovr?: number; pac: number; sho: number; pas: number; dri: number; def: number; phy: number };
  /** Regular-card id when this row is a promo version. */
  baseId?: string;
  /** Rating of the regular card, so the pair stays together in the list. */
  pairRating?: number;
  regularPosition?: string;
  regularClub?: string;
  regularLeague?: string;
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

function withPromoCards(players: FcPlayer[]): FcPlayer[] {
  const cards: FcPlayer[] = [];
  for (const player of players) {
    cards.push(player);
    const promo = destinedEdition(player.id);
    if (promo) {
      cards.push({
        ...player,
        id: `${player.id}--destined`,
        edition: 'destined',
        baseId: player.id,
        pairRating: player.rating,
        regularPosition: player.position,
        regularClub: player.club,
        regularLeague: player.league,
        rating: promo.rating,
        position: promo.position || player.position,
        club: promo.club || player.club,
        league: promo.league || player.league,
        face: promo.face,
      });
    }
    const otw = otwFor(player.id);
    if (otw) {
      cards.push({
        ...player,
        id: `${player.id}--otw`,
        edition: 'otw',
        baseId: player.id,
        pairRating: player.rating,
        regularPosition: player.position,
        regularClub: player.club,
        regularLeague: player.league,
        rating: otw.rating,
        position: otw.position,
        face: otw.face,
        ...(otw.positions?.length ? { positions: otw.positions } : {}),
        ...(otw.playstyles?.length ? { playstyles: otw.playstyles } : {}),
      });
    }

    const totw = totwFor(player.id);
    if (totw) {
      cards.push({
        ...player,
        id: `${player.id}--totw`,
        edition: 'totw',
        baseId: player.id,
        pairRating: player.rating,
        regularPosition: player.position,
        regularClub: player.club,
        regularLeague: player.league,
        rating: totw.rating,
        position: totw.position,
        face: totw.face,
        ...(totw.positions?.length ? { positions: totw.positions } : {}),
        ...(totw.playstyles?.length ? { playstyles: totw.playstyles } : {}),
      });
    }
  }
  return cards;
}

/** Every card in the database, including promo versions beside their regular card. */
export const PLAYERS: FcPlayer[] = withPromoCards(DB_PLAYERS);
