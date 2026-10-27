import { displayClub, displayLeague, displayNation, LEAGUE_NAMES_EN } from '@/lib/footballLocalization';
import type { DraftManager } from '@/lib/draftRun';
import type { AppLocale } from '@/lib/language';
import { plannedUiTranslations } from '@/lib/plannedUiTranslations';

type Language = 'he' | 'en';

const QUESTIONS_EN: Record<string, string> = {
  'סמנו מי שזכה בליגת האלופות': 'Select the players who have won the Champions League',
  'סמנו מי ששיחק עם מסי': 'Select the players who have played alongside Messi',
  'סמנו מי ששיחק עם רונאלדו': 'Select the players who have played alongside Ronaldo',
  'סמנו מי שזכה ביורו 2024': 'Select the players who won EURO 2024',
  'סמנו מי שזכה במונדיאל 2022': 'Select the players who won the 2022 World Cup',
  'סמנו מי שרגלו החזקה שמאל': 'Select the left-footed players',
  'סמנו את האייקונים': 'Select the Icons',
  'מי זכה בפרס שחקן השנה לגברים של UEFA שלוש פעמים?': 'Who has won the UEFA Men’s Player of the Year award three times?',
  'מי נבחר לנבחרת השנה של FIFPRO תשע שנים ברציפות?': 'Who was selected for the FIFPRO World 11 nine years in a row?',
  'מי זכה בליגת האלופות עם יותר ממועדון אחד?': 'Who has won the Champions League with more than one club?',
  'מי מלך ההופעות בכל הזמנים בליגת האלופות?': 'Who holds the all-time Champions League appearance record?',
  'מי מלך השערים בכל הזמנים בליגת האלופות?': 'Who is the all-time Champions League top scorer?',
  'מי השחקן היחיד שכבש בשלושה גמרי ליגת האלופות?': 'Who is the only player to have scored in three Champions League finals?',
  'מי נבחר ל-FIFPRO World 11 גם ב-2024 וגם ב-2025?': 'Who was selected for the FIFPRO World 11 in both 2024 and 2025?',
  'מי נבחר ל-FIFPRO World 11 ב-2025?': 'Who was selected for the FIFPRO World 11 in 2025?',
  'מי מחזיק בשיא ההופעות במונדיאל?': 'Who holds the World Cup appearance record?',
  'מי כבש בשש מהדורות שונות של גביע העולם?': 'Who has scored in six different World Cup tournaments?',
  'מי כבש ב-9 הופעות רצופות בגביע העולם?': 'Who scored in nine consecutive World Cup appearances?',
  'מי נבחר ל-FIFPRO World 11 תשע פעמים ברצף?': 'Who was selected for the FIFPRO World 11 nine times in a row?',
  'מי זכה בליגת האלופות 5 פעמים?': 'Who has won the Champions League five times?',
  'מי שיחק ב-5 טורנירי מונדיאל?': 'Who has played in five World Cup tournaments?',
  'מי זכה גם במונדיאל וגם בליגת האלופות?': 'Who has won both the World Cup and the Champions League?',
  'מי נבחר ל-FIFPRO World 11 ב-2024?': 'Who was selected for the FIFPRO World 11 in 2024?',
  'מי כבש בשלושה גמרי ליגת האלופות?': 'Who has scored in three Champions League finals?',
};
const GROUPS_EN: Record<string, string> = {
  'החלוצים': 'strikers', 'הקיצוניים': 'wingers',
  'הקשרים': 'midfielders', 'שחקני ההגנה': 'defenders',
};

const leagues = new Set([...Object.keys(LEAGUE_NAMES_EN), ...Object.values(LEAGUE_NAMES_EN)]);
function playingAt(value: string) {
  return leagues.has(value) ? `in ${displayLeague(value, 'en')}` : `at ${displayClub(value, 'en')}`;
}

type PromptPattern = readonly [RegExp, (match: RegExpMatchArray) => string];
// Compound conditions come first. Raw identifiers stay in the game engine for
// answer checking and question deduplication; only the displayed copy changes.
const PATTERNS: readonly PromptPattern[] = [
  [/^סמנו מי שמשחק ב(.+) ומדורג (\d+)\+$/, (m) => `Select players ${playingAt(m[1])} rated ${m[2]}+`],
  [/^סמנו מי שבנבחרת (.+) ומדורג (\d+)\+$/, (m) => `Select players from ${displayNation(m[1], 'en')} rated ${m[2]}+`],
  [/^סמנו מי שמשחק ב(.+) והוא (.+)$/, (m) => `Select ${GROUPS_EN[m[2]] ?? m[2]} ${playingAt(m[1])}`],
  [/^סמנו מי שבנבחרת (.+) והוא (.+)$/, (m) => `Select ${GROUPS_EN[m[2]] ?? m[2]} from ${displayNation(m[1], 'en')}`],
  [/^סמנו מי שמשחק ב(.+) ורגלו החזקה שמאל$/, (m) => `Select left-footed players ${playingAt(m[1])}`],
  [/^סמנו את (.+) שמדורגים (\d+)\+$/, (m) => `Select ${GROUPS_EN[m[1]] ?? m[1]} rated ${m[2]}+`],
  [/^סמנו אייקונים מ(.+) בדירוג (\d+)\+$/, (m) => `Select Icons from ${displayNation(m[1], 'en')} rated ${m[2]}+`],
  [/^סמנו אייקונים בעמדת (.+) בדירוג (\d+)\+$/, (m) => `Select ${m[1]} Icons rated ${m[2]}+`],
  [/^סמנו אייקונים מ(.+) בעמדת (.+)$/, (m) => `Select ${m[2]} Icons from ${displayNation(m[1], 'en')}`],
  [/^סמנו את האייקונים מ(.+)$/, (m) => `Select Icons from ${displayNation(m[1], 'en')}`],
  [/^סמנו את האייקונים בעמדת (.+)$/, (m) => `Select the ${m[1]} Icons`],
  [/^סמנו אייקונים בדירוג (\d+)\+$/, (m) => `Select Icons rated ${m[1]}+`],
  [/^סמנו את שחקני ה-(.+)$/, (m) => `Select the ${m[1]} players`],
  [/^סמנו מי שמדורג (\d+) ומעלה$/, (m) => `Select players rated ${m[1]} or higher`],
  [/^סמנו מי שמשחק ב(.+)$/, (m) => `Select players ${playingAt(m[1])}`],
  [/^סמנו מי שבנבחרת (.+)$/, (m) => `Select players from ${displayNation(m[1], 'en')}`],
  [/^סמנו את (.+)$/, (m) => `Select the ${GROUPS_EN[m[1]] ?? m[1]}`],
];

export function miniGamePrompt(prompt: string, language: AppLocale): string {
  if (language === 'he') return prompt;
  if (QUESTIONS_EN[prompt]) {
    const english = QUESTIONS_EN[prompt];
    return language === 'en' ? english : plannedUiTranslations[language][english] ?? english;
  }
  for (const [pattern, render] of PATTERNS) {
    const match = prompt.match(pattern);
    if (match) return render(match);
  }
  return prompt;
}

const MESSAGES_EN: Record<string, string> = {
  'נכון': 'Correct',
  'השחקן כבר על הלוח': 'That player is already on the grid',
  'טעית. נשאר לך עוד טעות אחת': 'Incorrect. One mistake left',
  'טעית. נגמרו הטעויות': 'Incorrect. No mistakes left',
};
export function miniGameMessage(message: string, language: Language): string {
  if (language === 'he') return message;
  const mistakes = message.match(/^טעית\. נשאר לך עוד (\d+) טעויות$/)?.[1];
  return mistakes ? `Incorrect. ${mistakes} mistakes left` : MESSAGES_EN[message] ?? message;
}

const MANAGERS_EN: Record<string, string> = {
  pep: 'Pep Guardiola', carlo: 'Carlo Ancelotti', alonso: 'Xabi Alonso',
  arteta: 'Mikel Arteta', simeone: 'Diego Simeone',
};
export function draftManagerName(manager: Pick<DraftManager, 'id' | 'name'>, language: Language): string {
  return language === 'en' ? MANAGERS_EN[manager.id] ?? manager.name : manager.name;
}
