import { displayClub, displayLeague, displayNation, LEAGUE_NAMES_EN } from '@/lib/footballLocalization';

type Locale = 'ar' | 'pt-BR' | 'es';
type Group = 'strikers' | 'wingers' | 'midfielders' | 'defenders';
const groups: Record<Locale, Record<Group, string>> = {
  ar: { strikers: 'المهاجمين', wingers: 'الأجنحة', midfielders: 'لاعبي الوسط', defenders: 'المدافعين' },
  'pt-BR': { strikers: 'atacantes', wingers: 'pontas', midfielders: 'meio-campistas', defenders: 'defensores' },
  es: { strikers: 'delanteros', wingers: 'extremos', midfielders: 'centrocampistas', defenders: 'defensas' },
};
const groupKeys: Record<string, Group> = { 'החלוצים': 'strikers', 'הקיצוניים': 'wingers', 'הקשרים': 'midfielders', 'שחקני ההגנה': 'defenders' };
const leagues = new Set([...Object.keys(LEAGUE_NAMES_EN), ...Object.values(LEAGUE_NAMES_EN)]);
type Templates = Record<Locale, readonly string[]>;
const templates: Templates = {
  ar: [
    'اختر اللاعبين في {place} بتقييم {rating} أو أكثر', 'اختر لاعبي {nation} بتقييم {rating} أو أكثر',
    'اختر {group} في {place}', 'اختر {group} من {nation}',
    'اختر اللاعبين في {place} الذين يلعبون بقدمهم اليسرى', 'اختر {group} بتقييم {rating} أو أكثر',
    'اختر أيقونات من {nation} بتقييم {rating} أو أكثر', 'اختر أيقونات في مركز {position} بتقييم {rating} أو أكثر',
    'اختر أيقونات من {nation} في مركز {position}', 'اختر الأيقونات من {nation}',
    'اختر الأيقونات في مركز {position}', 'اختر أيقونات بتقييم {rating} أو أكثر',
    'اختر لاعبي {value}', 'اختر لاعبين بتقييم {rating} أو أكثر',
    'اختر اللاعبين في {place}', 'اختر لاعبي {nation}', 'اختر {group}',
  ],
  'pt-BR': [
    'Selecione jogadores de {place} com nota {rating} ou maior', 'Selecione jogadores de {nation} com nota {rating} ou maior',
    'Selecione {group} de {place}', 'Selecione {group} de {nation}',
    'Selecione jogadores canhotos de {place}', 'Selecione {group} com nota {rating} ou maior',
    'Selecione Ídolos de {nation} com nota {rating} ou maior', 'Selecione Ídolos na posição {position} com nota {rating} ou maior',
    'Selecione Ídolos de {nation} na posição {position}', 'Selecione os Ídolos de {nation}',
    'Selecione os Ídolos na posição {position}', 'Selecione Ídolos com nota {rating} ou maior',
    'Selecione os jogadores de {value}', 'Selecione jogadores com nota {rating} ou maior',
    'Selecione jogadores de {place}', 'Selecione jogadores de {nation}', 'Selecione {group}',
  ],
  es: [
    'Selecciona jugadores de {place} con valoración {rating} o superior', 'Selecciona jugadores de {nation} con valoración {rating} o superior',
    'Selecciona {group} de {place}', 'Selecciona {group} de {nation}',
    'Selecciona jugadores zurdos de {place}', 'Selecciona {group} con valoración {rating} o superior',
    'Selecciona Iconos de {nation} con valoración {rating} o superior', 'Selecciona Iconos en la posición {position} con valoración {rating} o superior',
    'Selecciona Iconos de {nation} en la posición {position}', 'Selecciona los Iconos de {nation}',
    'Selecciona los Iconos en la posición {position}', 'Selecciona Iconos con valoración {rating} o superior',
    'Selecciona los jugadores de {value}', 'Selecciona jugadores con valoración {rating} o superior',
    'Selecciona jugadores de {place}', 'Selecciona jugadores de {nation}', 'Selecciona {group}',
  ],
};
const patterns: readonly RegExp[] = [
  /^סמנו מי שמשחק ב(.+) ומדורג (\d+)\+$/, /^סמנו מי שבנבחרת (.+) ומדורג (\d+)\+$/,
  /^סמנו מי שמשחק ב(.+) והוא (.+)$/, /^סמנו מי שבנבחרת (.+) והוא (.+)$/,
  /^סמנו מי שמשחק ב(.+) ורגלו החזקה שמאל$/, /^סמנו את (.+) שמדורגים (\d+)\+$/,
  /^סמנו אייקונים מ(.+) בדירוג (\d+)\+$/, /^סמנו אייקונים בעמדת (.+) בדירוג (\d+)\+$/,
  /^סמנו אייקונים מ(.+) בעמדת (.+)$/, /^סמנו את האייקונים מ(.+)$/,
  /^סמנו את האייקונים בעמדת (.+)$/, /^סמנו אייקונים בדירוג (\d+)\+$/,
  /^סמנו את שחקני ה-(.+)$/, /^סמנו מי שמדורג (\d+) ומעלה$/,
  /^סמנו מי שמשחק ב(.+)$/, /^סמנו מי שבנבחרת (.+)$/, /^סמנו את (.+)$/,
];
export function plannedMiniGamePrompt(prompt: string, locale: Locale): string | undefined {
  for (let index = 0; index < patterns.length; index++) {
    const match = prompt.match(patterns[index]);
    if (!match) continue;
    const first = match[1];
    const group = (value: string) => groupKeys[value] ? groups[locale][groupKeys[value]] : value;
    const place = (value: string) => leagues.has(value) ? displayLeague(value, 'en') : displayClub(value, 'en');
    const nation = (value: string) => displayNation(value, locale);
    const args: Record<string, string> = {};
    if ([0, 2, 4, 14].includes(index)) args.place = place(first);
    if ([1, 3, 6, 8, 9, 15].includes(index)) args.nation = nation(first);
    if ([2, 3].includes(index)) args.group = group(match[2]);
    if ([5, 16].includes(index)) args.group = group(first);
    if ([0, 1, 5, 6, 7].includes(index)) args.rating = match[2];
    if ([11, 13].includes(index)) args.rating = first;
    if ([7, 10].includes(index)) args.position = first;
    if (index === 8) args.position = match[2];
    if (index === 12) args.value = first;
    return templates[locale][index].replace(/\{(\w+)\}/g, (_, key: string) => args[key] ?? '');
  }
  return undefined;
}
