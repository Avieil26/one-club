import { readFileSync, writeFileSync } from 'node:fs';

const nations = {
  Brazil: 'ברזיל',
  Argentina: 'ארגנטינה',
  France: 'צרפת',
  Italy: 'איטליה',
  Germany: 'גרמניה',
  Netherlands: 'הולנד',
  England: 'אנגליה',
  Spain: 'ספרד',
  Portugal: 'פורטוגל',
  Uruguay: 'אורוגוואי',
  Hungary: 'הונגריה',
  Czechia: 'צ׳כיה',
  'Czech Republic': 'צ׳כיה',
  Sweden: 'שוודיה',
  Denmark: 'דנמרק',
  Norway: 'נורווגיה',
  Poland: 'פולין',
  Belgium: 'בלגיה',
  Croatia: 'קרואטיה',
  Scotland: 'סקוטלנד',
  Wales: 'ויילס',
  Ireland: 'אירלנד',
  'Northern Ireland': 'צפון אירלנד',
  Mexico: 'מקסיקו',
  Colombia: 'קולומביה',
  Chile: 'צ׳ילה',
  Cameroon: 'קמרון',
  Nigeria: 'ניגריה',
  Ghana: 'גאנה',
  "Côte d'Ivoire": 'חוף השנהב',
  'Ivory Coast': 'חוף השנהב',
  Mali: 'מאלי',
  Senegal: 'סנגל',
  Morocco: 'מרוקו',
  Algeria: 'אלג׳יריה',
  Egypt: 'מצרים',
  Japan: 'יפן',
  'Korea Republic': 'קוריאה',
  'South Korea': 'קוריאה',
  USA: 'ארה״ב',
  'United States': 'ארה״ב',
  Canada: 'קנדה',
  Australia: 'אוסטרליה',
  Turkey: 'טורקיה',
  Greece: 'יוון',
  Austria: 'אוסטריה',
  Switzerland: 'שווייץ',
  Serbia: 'סרביה',
  Ukraine: 'אוקראינה',
  Romania: 'רומניה',
  Bulgaria: 'בולגריה',
  Russia: 'רוסיה',
  Paraguay: 'פרגוואי',
  Peru: 'פרו',
  Ecuador: 'אקוודור',
  'Costa Rica': 'קוסטה ריקה',
  'South Africa': 'דרום אפריקה',
  Cameroon: 'קמרון',
};

const hebrew = {
  Pelé: 'פלה',
  Maradona: 'מראדונה',
  Zidane: 'זידאן',
  Ronaldo: 'רונאלדו',
  Ronaldinho: 'רונאלדיניו',
  Beckenbauer: 'בקנבאואר',
  Cruyff: 'קרויף',
  Maldini: 'מלדיני',
  Garrincha: 'גארינצ׳ה',
  Hamm: 'מיה האם',
  Iniesta: 'אינייסטה',
  Buffon: 'בופון',
  Müller: 'גרד מילר',
  Charlton: 'בובי צ׳רלטון',
  Puskás: 'פושקאש',
  Kahn: 'קאן',
  Baggio: 'באג׳ו',
  Henry: 'תיארי הנרי',
  Cafu: 'קאפו',
};

const icons = JSON.parse(readFileSync(new URL('./icons.json', import.meta.url), 'utf8')).filter((item) => item.photo);
const lines = icons.map((item) => {
  const slug = item.url.split('/').pop();
  const id = `icon-${slug}`;
  const name = hebrew[item.name] ?? item.name;
  const nation = nations[item.nation] ?? item.nation;
  const positions = JSON.stringify(item.positions?.length ? item.positions : [item.position]);
  const playstyles = JSON.stringify(item.playstyles ?? []);
  return `  { id: '${id}', name: ${JSON.stringify(name)}, rating: ${item.ovr}, position: '${item.position}', nation: ${JSON.stringify(nation)}, league: 'אייקונים', club: 'אייקונים', icon: true, positions: ${positions}, playstyles: ${playstyles} },`;
});
const faces = icons.map((item) => {
  const id = `icon-${item.url.split('/').pop()}`;
  return `  '${id}': f(${item.ovr}, ${item.pac}, ${item.sho}, ${item.pas}, ${item.dri}, ${item.def}, ${item.phy}),`;
});
const photos = icons.map((item) => {
  const id = `icon-${item.url.split('/').pop()}`;
  return `  '${id}': { en: ${JSON.stringify(item.name)}, photo: ${JSON.stringify(item.photo)} },`;
});

const file = `import type { FcPlayer } from '@/lib/fcPlayers';
import type { FaceStats } from '@/lib/playerMedia';

function f(ovr: number, pac: number, sho: number, pas: number, dri: number, def: number, phy: number): FaceStats {
  return { ovr, pac, sho, pas, dri, def, phy };
}

export const ICON_PLAYERS: FcPlayer[] = [
${lines.join('\n')}
];

export const ICON_FACE: Record<string, FaceStats> = {
${faces.join('\n')}
};

export const ICON_PHOTOS: Record<string, { en: string; photo: string }> = {
${photos.join('\n')}
};
`;

writeFileSync(new URL('../lib/iconPlayers.ts', import.meta.url), file);
console.log('wrote', icons.length);
