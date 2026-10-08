export type FaceStats = {
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
  ovr?: number;
};

export type PlayerMedia = {
  en: string;
  photo?: string;
  face?: FaceStats;
  /** Zoom/crop toward the head for tall full-body shots */
  photoFocus?: 'face' | 'center' | 'bust';
};

const photo = (file: string) => `https://upload.wikimedia.org/wikipedia/commons/thumb/${file}`;

export const PLAYER_MEDIA: Record<string, PlayerMedia> = {
  'patati--foundations': {
    en: 'Weslley Patati',
    photo: 'https://www.az.nl/media/rwqf013h/smiling-soccer-player-in-red-29082025114432.png?height=584&rxy=0.44428969359331477%2C0.00386597944329077&v=1dc1b257ac4ccd0&width=584',
    face: { ovr: 84, pac: 90, sho: 82, pas: 77, dri: 84, def: 40, phy: 75 },
    photoFocus: 'bust',
  },
  mcgregor: {
    en: 'Callum McGregor',
    photo: photo('e/ea/Callum_McGregor_with_a_fan_%28cropped%29.jpg/330px-Callum_McGregor_with_a_fan_%28cropped%29.jpg'),
    face: { pac: 74, sho: 75, pas: 75, dri: 79, def: 71, phy: 77 },
  },
  tierney: { en: 'Kieran Tierney', photo: photo('7/79/Kieran_Tierney_Scotland_v_Bolivia_6_June_2026-6.jpg/330px-Kieran_Tierney_Scotland_v_Bolivia_6_June_2026-6.jpg') },
  carter: { en: 'Cameron Carter-Vickers', photo: photo('e/e6/Cameron_Carter-Vickers_USA-Columbia%2C_FIFA_U20_World_Cup_%2818684217745%29_%28cropped%29.jpg/330px-Cameron_Carter-Vickers_USA-Columbia%2C_FIFA_U20_World_Cup_%2818684217745%29_%28cropped%29.jpg') },
  souttar: { en: 'John Souttar', photo: photo('0/02/John_Souttar_Scotland_v_Bolivia_6_June_2026-163.jpg/330px-John_Souttar_Scotland_v_Bolivia_6_June_2026-163.jpg') },
  tavernier: { en: 'James Tavernier', photo: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Tavernier_Rangers_Glasgow_2025.jpg' },
  hatate: { en: 'Reo Hatate', photo: photo('8/8b/Celtic-20240722-037_%28cropped%29.jpg/330px-Celtic-20240722-037_%28cropped%29.jpg') },
  maeda: { en: 'Daizen Maeda', photo: photo('7/7b/Celtic-20240722-018_%28cropped%29.jpg/330px-Celtic-20240722-018_%28cropped%29.jpg') },
  dessers: { en: 'Cyriel Dessers', photo: photo('b/b3/Cyriel_Dessers_2017_%28cropped%29.jpg/330px-Cyriel_Dessers_2017_%28cropped%29.jpg') },
  butland: { en: 'Jack Butland', photo: photo('6/69/Butland_2018.jpg/330px-Butland_2018.jpg') },
  cerny: { en: 'Vaclav Cerny' },
  diomande: { en: 'Mohamed Diomande' },
  costa: { en: 'Diogo Costa', photo: photo('4/45/Diogo_Costa_Croatia_v_Portugal_2_July_2026-188_%28cropped%29.jpg/330px-Diogo_Costa_Croatia_v_Portugal_2_July_2026-188_%28cropped%29.jpg') },
  nuno: { en: 'Nuno Mendes' },
  pepe: { en: 'Pepe' },
  silva: { en: 'Antonio Silva', photo: photo('f/f2/Ant%C3%B3nio_Silva_USMNT_v_Portugal_Mar_31_2026-19_%28cropped%29.jpg/330px-Ant%C3%B3nio_Silva_USMNT_v_Portugal_Mar_31_2026-19_%28cropped%29.jpg') },
  bah: { en: 'Alexander Bah', photo: photo('f/f9/Alexander_Bah_2026.jpg/330px-Alexander_Bah_2026.jpg') },
  florentino: { en: 'Florentino Luis', photo: photo('8/87/Florentino_Luis_2019.png/330px-Florentino_Luis_2019.png') },
  kokcu: { en: 'Orkun Kokcu', photo: photo('9/98/Orkun_K%C3%B6k%C3%A7%C3%BC_20260121_%282%29_-_cropped_version.jpg/330px-Orkun_K%C3%B6k%C3%A7%C3%BC_20260121_%282%29_-_cropped_version.jpg') },
  eustaquio: { en: 'Stephen Eustaquio' },
  galeno: { en: 'Galeno', photo: photo('9/93/Galeno.jpg/330px-Galeno.jpg') },
  gyokeres: { en: 'Viktor Gyokeres' },
  conceicao: { en: 'Francisco Conceicao' },
  alisson: { en: 'Alisson Becker', photo: photo('4/4f/Alisson_Becker_Brazil_V_Morocco_13_June_2026-117_%28cropped%29.jpg/330px-Alisson_Becker_Brazil_V_Morocco_13_June_2026-117_%28cropped%29.jpg') },
  robertson: { en: 'Andrew Robertson', photo: photo('9/9a/Andy_Robertson_Scotland_v_Bolivia_6_June_2026-43.jpg/330px-Andy_Robertson_Scotland_v_Bolivia_6_June_2026-43.jpg') },
  vandijk: { en: 'Virgil van Dijk', photo: photo('5/5d/20160604_AUT_NED_8876_%28cropped%29.jpg/330px-20160604_AUT_NED_8876_%28cropped%29.jpg') },
  konate: { en: 'Ibrahima Konate', photo: photo('f/f2/Ibrahima_Konate_France_v_Senegal_16_June_2026-516_%28cropped%29.jpg/330px-Ibrahima_Konate_France_v_Senegal_16_June_2026-516_%28cropped%29.jpg') },
  porro: { en: 'Pedro Porro', photo: photo('5/5e/Pedro_Porro_Argentina_v_Spain_19_July_2026-177_%28cropped%29.jpg/330px-Pedro_Porro_Argentina_v_Spain_19_July_2026-177_%28cropped%29.jpg') },
  vitinha: { en: 'Vitinha' },
  bellingham: { en: 'Jude Bellingham', photo: photo('2/23/Jude_Bellingham_England_v_Ghana_23_June_2026-061_%28cropped%29.jpg/330px-Jude_Bellingham_England_v_Ghana_23_June_2026-061_%28cropped%29.jpg') },
  valverde: { en: 'Federico Valverde', photo: photo('7/73/Federico_Valverde_2021_%28cropped%29.jpg/330px-Federico_Valverde_2021_%28cropped%29.jpg') },
  vinicius: { en: 'Vinicius Junior', photo: photo('1/10/Vin%C3%ADcius_J%C3%BAnior_Brazil_V_Morocco_13_June_2026-207_%28cropped%29.jpg/330px-Vin%C3%ADcius_J%C3%BAnior_Brazil_V_Morocco_13_June_2026-207_%28cropped%29.jpg') },
  mbappe: { en: 'Kylian Mbappe', photo: photo('9/95/Kylian_Mbappe_France_v_Senegal_16_June_2026-391_%28cropped%29.jpg/330px-Kylian_Mbappe_France_v_Senegal_16_June_2026-391_%28cropped%29.jpg') },
  rodrygo: { en: 'Rodrygo' },
  courtois: { en: 'Thibaut Courtois', photo: photo('a/a4/Thibaut_Courtois_Belgium_v_USA_6_July_2026-076_%28cropped%29.jpg/330px-Thibaut_Courtois_Belgium_v_USA_6_July_2026-076_%28cropped%29.jpg') },
  balde: { en: 'Alejandro Balde', photo: photo('9/93/Esapana-inglaterra-74_%2848899354493%29.jpg/330px-Esapana-inglaterra-74_%2848899354493%29.jpg') },
  cubarsi: { en: 'Pau Cubarsi', photo: photo('7/77/Pau_Cubarsi_Argentina_v_Spain_19_July_2026-181_%28cropped%29.jpg/330px-Pau_Cubarsi_Argentina_v_Spain_19_July_2026-181_%28cropped%29.jpg') },
  militao: { en: 'Eder Militao' },
  carvajal: { en: 'Dani Carvajal', photo: photo('b/b6/UEFA_EURO_qualifiers_Sweden_vs_Spain_20191015_Dani_Carvajal_10_%28cropped%29.jpg/330px-UEFA_EURO_qualifiers_Sweden_vs_Spain_20191015_Dani_Carvajal_10_%28cropped%29.jpg') },
  pedri: { en: 'Pedri' },
  koke: { en: 'Koke' },
  depaul: { en: 'Rodrigo De Paul' },
  williams: { en: 'Nico Williams' },
  griezmann: { en: 'Antoine Griezmann', photo: photo('6/6e/FRA-ARG_%2810%29_%28cropped%29.jpg/330px-FRA-ARG_%2810%29_%28cropped%29.jpg') },
  kubo: { en: 'Takefusa Kubo' },
  saliba: { en: 'William Saliba' },
  odegaard: { en: 'Martin Odegaard' },
  macallister: { en: 'Alexis Mac Allister' },
  szoboszlai: { en: 'Dominik Szoboszlai', photo: photo('5/52/Dominik_Szoboszlai_04012026_%281%29.jpg/330px-Dominik_Szoboszlai_04012026_%281%29.jpg') },
  diaz: { en: 'Luis Diaz' },
  isak: { en: 'Alexander Isak', photo: photo('3/32/Alexander_Isak_-_Sweden_-_Greece21_%28cropped%29.jpg/330px-Alexander_Isak_-_Sweden_-_Greece21_%28cropped%29.jpg') },
  son: { en: 'Son Heung-min', photo: photo('b/b0/BFA_2023_-2_Heung-Min_Son_%28cropped%29.jpg/330px-BFA_2023_-2_Heung-Min_Son_%28cropped%29.jpg') },
  haaland: { en: 'Erling Haaland', photo: photo('4/43/Erling_Haaland_Morocco_v_Norway_7_June_2026-51.jpg/330px-Erling_Haaland_Morocco_v_Norway_7_June_2026-51.jpg') },
  'di-maria': { en: 'Ángel Di María' },
  raskin: { en: 'Nicolas Raskin' },
  pandur: { en: 'Ivor Pandur' },
  kiwior: { en: 'Jakub Kiwior' },
  trent: { en: 'Trent Alexander-Arnold' },
  aitana: { en: 'Aitana Bonmatí' },
  hansen: { en: 'Caroline Graham Hansen' },
  hegerberg: { en: 'Ada Hegerberg' },
  kerr: { en: 'Sam Kerr' },
  miedema: { en: 'Vivianne Miedema' },
  mead: { en: 'Beth Mead' },
  'lauren-james': { en: 'Lauren James' },
  earps: { en: 'Mary Earps' },
  williamson: { en: 'Leah Williamson' },
  bronze: { en: 'Lucy Bronze' },
  walsh: { en: 'Keira Walsh' },
  katoto: { en: 'Marie Katoto' },
  renard: { en: 'Wendie Renard' },
  karchaoui: { en: 'Sakina Karchaoui' },
  rodman: { en: 'Trinity Rodman' },
  wilson: { en: 'Sophia Wilson' },
  buhl: { en: 'Klara Bühl' },
  oberdorf: { en: 'Lena Oberdorf' },
  debinha: { en: 'Debinha' },
  hemp: { en: 'Lauren Hemp' },
  kelly: { en: 'Chloe Kelly' },
  russo: { en: 'Alessia Russo' },
  guijarro: { en: 'Patri Guijarro' },
  paraluelo: { en: 'Salma Paralluelo' },
  mapi: { en: 'Mapi León' },
  paredes: { en: 'Irene Paredes' },
  'caicedo-w': { en: 'Linda Caicedo' },
  banda: { en: 'Barbra Banda' },
  berger: { en: 'Ann-Katrin Berger' },
  endler: { en: 'Christiane Endler' },
  nusken: { en: 'Sjoeke Nüsken' },
  stanway: { en: 'Georgia Stanway' },
  mariona: { en: 'Mariona' },
  gwinn: { en: 'Giulia Gwinn' },
  diani: { en: 'Kadidiatou Diani' },
  lavelle: { en: 'Rose Lavelle' },
  swanson: { en: 'Mallory Swanson' },
};

import { EA_FACE } from '@/lib/eaFace';
import { ICON_FACE, ICON_PHOTOS } from '@/lib/iconPlayers';
import { rosterMedia } from '@/lib/playerDb';
import { PLAYER_PHOTOS } from '@/lib/playerPhotos';

const CARD_PHOTO_PX = 330;

function thumbName(file: string): string {
  if (/\.svg$/i.test(file)) return `${file}.png`;
  if (/\.tiff?$/i.test(file)) return `${file}.jpg`;
  return file;
}

export function cardPhotoUrl(url: string): string {
  if (!url) return '';
  const normalized = url.replace('https://thumb.wikimedia.org', 'https://upload.wikimedia.org');
  if (!normalized.includes('wikimedia.org')) return normalized;
  const clean = normalized.split(/[?#]/)[0];
  const sized = clean.match(/^(.*)\/\d+px-[^/]+$/);
  if (sized) {
    const file = sized[1].split('/').pop() ?? '';
    return `${sized[1]}/${CARD_PHOTO_PX}px-${thumbName(file)}`;
  }
  const original = clean.match(/^(https?:\/\/upload\.wikimedia\.org\/wikipedia\/[^/]+)\/([0-9a-f])\/([0-9a-f]{2})\/([^/]+)$/i);
  if (!original) return clean;
  const file = original[4];
  return `${original[1]}/thumb/${original[2]}/${original[3]}/${file}/${CARD_PHOTO_PX}px-${thumbName(file)}`;
}

export function playerMedia(id: string): PlayerMedia {
  const roster = rosterMedia(id);
  const extra = PLAYER_PHOTOS[id];
  const iconPhoto = ICON_PHOTOS[id];
  const base = PLAYER_MEDIA[id] ?? { en: roster?.en ?? extra?.en ?? iconPhoto?.en ?? id };
  const photo = cardPhotoUrl(roster?.photo ?? base.photo ?? extra?.photo ?? iconPhoto?.photo ?? '');
  const face = roster?.face ?? EA_FACE[id] ?? ICON_FACE[id] ?? base.face;
  const photoFocus = iconPhoto?.photoFocus ?? base.photoFocus;
  return {
    ...base,
    en: roster?.en ?? base.en,
    ...(photo ? { photo } : {}),
    ...(face ? { face } : {}),
    ...(photoFocus ? { photoFocus } : {}),
  };
}
