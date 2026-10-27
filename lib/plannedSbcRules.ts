import { CLUB_NAMES_EN, LEAGUE_NAMES_EN, NATION_NAMES_EN, displayClub, displayLeague, displayNation } from '@/lib/footballLocalization';
type Locale = 'ar' | 'pt-BR' | 'es';
const words = {
  ar: { min: 'على الأقل', max: 'الحد الأقصى', exact: 'بالضبط', players: 'اللاعبون', duplicate: 'لا يوجد لاعبون مكررون', chemistry: 'التناغم', current: 'الحالي', card: 'تقييم البطاقة', squad: 'تقييم التشكيلة', leagues: 'الدوريات', nations: 'الجنسيات', clubs: 'الأندية', sameNation: 'من الجنسية نفسها', sameClub: 'من النادي نفسه', sameLeague: 'من الدوري نفسه', gold: 'ذهبي', silver: 'فضي', bronze: 'برونزي', all: 'كل البطاقات', orHigher: 'أو أعلى', from: 'من', or: 'أو' },
  'pt-BR': { min: 'Mínimo', max: 'Máximo', exact: 'Exatamente', players: 'Jogadores', duplicate: 'Sem jogadores duplicados', chemistry: 'Entrosamento', current: 'atual', card: 'Nota da carta', squad: 'Nota do elenco', leagues: 'ligas', nations: 'nacionalidades', clubs: 'clubes', sameNation: 'da mesma nacionalidade', sameClub: 'do mesmo clube', sameLeague: 'da mesma liga', gold: 'ouro', silver: 'prata', bronze: 'bronze', all: 'Todas as cartas', orHigher: 'ou superior', from: 'de', or: 'ou' },
  es: { min: 'Mínimo', max: 'Máximo', exact: 'Exactamente', players: 'Jugadores', duplicate: 'Sin jugadores duplicados', chemistry: 'Química', current: 'actual', card: 'Valoración de carta', squad: 'Valoración de plantilla', leagues: 'ligas', nations: 'nacionalidades', clubs: 'clubes', sameNation: 'de la misma nacionalidad', sameClub: 'del mismo club', sameLeague: 'de la misma liga', gold: 'oro', silver: 'plata', bronze: 'bronce', all: 'Todas las cartas', orHigher: 'o superior', from: 'de', or: 'o' },
} as const;
export function plannedSbcRule(label: string, locale: Locale): string | undefined {
  const w = words[locale];
  if (label === 'ללא שחקנים כפולים') return w.duplicate;
  let m = /^(\d+) שחקנים \((\d+)\)$/.exec(label);
  if (m) return `${w.players}: ${m[1]} (${w.current}: ${m[2]})`;
  m = /^כימיה (\d+) \(עכשיו (\d+)\)$/.exec(label);
  if (m) return `${w.chemistry}: ${m[1]} (${w.current}: ${m[2]})`;
  m = /^דירוג (קלף|קבוצה) עד (\d+)$/.exec(label);
  if (m) return `${m[1] === 'קלף' ? w.card : w.squad}: ${w.max} ${m[2]}`;
  m = /^דירוג קבוצה (\d+)(?: \(עכשיו (\d+)\))?$/.exec(label);
  if (m) return `${w.squad}: ${m[1]}` + (m[2] ? ` (${w.current}: ${m[2]})` : '');
  const qualities: Record<string, string> = { 'זהב': w.gold, 'כסף': w.silver, 'ארד': w.bronze };
  m = /^כל הכרטיסים מ(זהב|כסף) ומעלה$/.exec(label);
  if (m) return `${w.all}: ${qualities[m[1]]} ${w.orHigher}`;
  m = /^כל הכרטיסים (זהב|כסף|ארד) \((\d+)\/(\d+)\)$/.exec(label);
  if (m) return `${w.all}: ${qualities[m[1]]} (${m[2]}/${m[3]})`;
  m = /^(לפחות|עד|בדיוק) (\d+) (.+?)(?: \((\d+)\))?$/.exec(label);
  if (!m) return undefined;
  const limit = m[1] === 'לפחות' ? w.min : m[1] === 'עד' ? w.max : w.exact;
  const entities: Record<string, string> = { 'ליגות': w.leagues, 'מדינות': w.nations, 'מועדונים': w.clubs, 'מאותה מדינה': w.sameNation, 'מאותו מועדון': w.sameClub, 'מאותה ליגה': w.sameLeague, ...qualities };
  let entity = entities[m[3]];
  if (!entity && m[3].startsWith('מ')) {
    const names = m[3].slice(1).split(' או ');
    const localized = names.map(name => {
      if (NATION_NAMES_EN[name]) return displayNation(name, locale);
      if (LEAGUE_NAMES_EN[name]) return displayLeague(name, 'en');
      if (CLUB_NAMES_EN[name]) return displayClub(name, 'en');
      if (name === 'אולימפיק מרסיי') return 'Olympique Marseille';
      return /[\u0590-\u05ff]/u.test(name) ? undefined : name;
    });
    if (localized.some(name => !name)) return undefined;
    entity = `${w.from} ${localized.join(` ${w.or} `)}`;
  }
  if (!entity) return undefined;
  return `${limit}: ${m[2]} ${entity}` + (m[4] ? ` (${w.current}: ${m[4]})` : '');
}
