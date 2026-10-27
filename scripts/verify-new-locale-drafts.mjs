import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { loadRepositoryModule } from './load-player-catalogue.mjs';

const ui = loadRepositoryModule('lib/plannedUiTranslations.ts').plannedUiTranslations;
const glossary = loadRepositoryModule('lib/plannedLanguageGlossary.ts').plannedLanguageGlossary;
const legal = loadRepositoryModule('lib/plannedLegalTranslations.ts').plannedLegalTranslations;
const { localizedLegal, localizedLegalDate } = loadRepositoryModule('lib/legalLocalization.ts');
const { plannedStructuredError } = loadRepositoryModule('lib/plannedErrorTranslations.ts');
const { errorText } = loadRepositoryModule('lib/errorLocalization.ts');
const locales = ['ar', 'pt-BR', 'es'];
const baseline = Object.keys(ui.ar).sort();
const glossaryBaseline = Object.keys(glossary.ar).sort();
for (const locale of locales) {
  assert.deepEqual(Object.keys(ui[locale]).sort(), baseline, `${locale} draft UI keys differ`);
  assert.deepEqual(Object.keys(glossary[locale]).sort(), glossaryBaseline, `${locale} glossary keys differ`);
  for (const [source, translated] of Object.entries(ui[locale])) {
    assert(translated.trim(), `${locale}: empty translation for ${source}`);
    const placeholders = text => [...text.matchAll(/\{[a-zA-Z]+\}/g)].map(match => match[0]).sort();
    assert.deepEqual(placeholders(translated), placeholders(source), `${locale}: placeholder mismatch for ${source}`);
    assert(!/[\u0590-\u05ff]/u.test(translated), `${locale}: Hebrew in ${source}`);
  }
  assert.deepEqual(Object.keys(legal[locale]).sort(), Object.keys(legal.ar).sort(), `${locale} legal draft keys differ`);
  for (const [source, translated] of Object.entries(legal[locale])) {
    assert(translated.trim(), `${locale}: empty legal translation`);
    assert(!/[\u0590-\u05ff]/u.test(translated), `${locale}: Hebrew in legal translation`);
    // These checks catch lost deadlines, limits and contact addresses; they do
    // not replace linguistic or legal-equivalence review.
    const numbers = text => [...text.matchAll(/\d+/g)].map(match => match[0]).sort();
    const emails = text => [...text.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)].map(match => match[0]).sort();
    assert.deepEqual(numbers(translated), numbers(source), `${locale}: legal number mismatch: ${source}`);
    assert.deepEqual(emails(translated), emails(source), `${locale}: legal contact mismatch: ${source}`);
    assert.equal(localizedLegal(source, locale), translated);
  }
}
for (const filename of fs.readdirSync('app/legal').filter(name => name.endsWith('.tsx'))) {
  const source = ts.createSourceFile(filename, fs.readFileSync(`app/legal/${filename}`, 'utf8'), ts.ScriptTarget.Latest, true);
  function inspect(node) {
    if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer)) {
      const tag = node.parent.parent.tagName.getText(source);
      if (['LegalScreen', 'LegalSection', 'LegalBulletItem'].includes(tag) && ['title', 'body', 'text'].includes(node.name.text)) {
        const text = node.initializer.text;
        for (const locale of locales) assert(localizedLegal(text, locale), `${filename}: missing ${locale} policy text`);
        assert.equal(localizedLegal(text, 'he'), text, 'Preserve Hebrew policy wording');
      }
    }
    ts.forEachChild(node, inspect);
  }
  inspect(source);
}
for (const locale of locales) {
  for (const date of ['1 באוקטובר 2026', '21 באוקטובר 2026']) assert(!/[\u0590-\u05ff]/u.test(localizedLegalDate(date, locale)));
  assert.throws(() => localizedLegal('UNTRANSLATED_LEGAL_SENTINEL', locale), 'Never silently fall back to English');
}
// These choices come from dynamic lookup tables rather than literal t() arguments.
const dynamicLabels = ['Challenges and proof', 'Squads and packs', 'Your run, rewards and tactics', 'Find a player', 'Community solutions', 'Cards and data', 'All positions', 'Goalkeeper', 'Striker', 'Winger', 'Attacking midfielder', 'Central midfielder', 'Defensive midfielder', 'Centre back', 'Full back', 'All platforms'];
for (const locale of locales) for (const label of dynamicLabels) assert(ui[locale][label], `${locale}: missing dynamic label ${label}`);
// Data-driven Season 2 objective descriptions are not visible to the literal t() audit.
const seasonCards = JSON.parse(fs.readFileSync('assets/data/season2.json', 'utf8'));
const seasonTexts = new Set();
for (const card of seasonCards) {
  const acquisition = card.acquisition;
  if (acquisition.summaryEn) seasonTexts.add(acquisition.summaryEn);
  for (const task of acquisition.tasks ?? []) seasonTexts.add(task.en);
  for (const group of acquisition.dependencies ?? []) for (const task of group.tasks) seasonTexts.add(task.en);
}
for (const locale of locales) for (const text of seasonTexts) assert(ui[locale][text], `${locale}: missing Season 2 objective: ${text}`);
// Verify country coverage and search without changing the existing country dataset.
const countries = loadRepositoryModule('lib/countries.ts');
const countryNames = loadRepositoryModule('lib/plannedCountryNames.ts').plannedCountryNames;
for (const locale of locales) {
  for (const country of countries.COUNTRIES) {
    const name = countryNames[locale][country.code];
    assert(name && name !== country.code, `${locale}: missing country ${country.code}`);
    assert.equal(countries.countryName(country.code, locale), name);
    assert(countries.countryOptions(name, locale).some(option => option.code === country.code), `${locale}: country search failed for ${country.code}`);
  }
}
for (const locale of ['he', 'en']) for (const country of countries.COUNTRIES) {
  assert.equal(countries.countryName(country.code, locale), country[locale], `Preserve ${locale} country names`);
}
const { displayNation, NATION_NAMES_EN } = loadRepositoryModule('lib/footballLocalization.ts');
for (const locale of locales) {
  for (const nation of Object.keys(NATION_NAMES_EN)) assert(!/[\u0590-\u05ff]/u.test(displayNation(nation, locale)), `${locale}: untranslated football nation ${nation}`);
  const aliases = ['Korea Republic', 'Republic of Ireland', 'Czech Republic', 'Kosovo', 'Congo DR', 'Trinidad and Tobago', 'Cape Verde Islands', 'St. Kitts and Nevis', 'Chinese Taipei', 'Antigua and Barbuda', 'São Tomé e Príncipe', 'Korea DPR', 'Bosnia Herzegovina', 'Netherlands Antilles', 'CAR'];
  for (const alias of aliases) if (!(alias === 'Kosovo' && locale !== 'ar') && !(alias === 'São Tomé e Príncipe' && locale === 'pt-BR')) assert.notEqual(displayNation(alias, locale), alias, `${locale}: untranslated football nation alias ${alias}`);
}
const { formatRemaining } = loadRepositoryModule('lib/format.ts');
const now = Date.parse('2026-10-27T00:00:00Z');
for (const locale of locales) {
  assert(formatRemaining(null, now, locale));
  assert(formatRemaining('2026-10-26T23:59:00Z', now, locale));
  assert(formatRemaining('2026-10-27T00:00:30Z', now, locale));
  assert(formatRemaining('2026-10-28T01:02:00Z', now, locale));
}
assert.equal(formatRemaining('2026-10-28T01:02:00Z', now, 'en'), '1d 1h');
assert.equal(formatRemaining('2026-10-28T01:02:00Z', now, 'he'), 'יום ו-1 שע׳');
// Test the generated validation patterns against the existing Hebrew-to-English error helper.
const fields = ['כותרת', 'חוקים', 'דרישות צילום', 'שם שחקן או מועדון', 'תיאור', 'טקסט', 'תגובה', 'שם', 'הודעה', 'שם משתמש', 'מטרת הפרסום', 'עמדה', 'פלטפורמה', 'אזור'];
const errors = fields.flatMap(field => [`חסר ${field}`, `${field} ארוך מדי`]).concat(['צריך 1 צילומים', 'צריך 3 צילומים']);
for (const locale of locales) {
  for (const message of errors) {
    const english = errorText(message, 'en');
    assert(ui[locale][english] || plannedStructuredError(locale, english), `${locale}: missing generated error ${english}`);
  }
  assert.equal(plannedStructuredError(locale, 'UNRECOGNIZED_ERROR_SENTINEL'), undefined);
}
const languageSource = fs.readFileSync('lib/language.tsx', 'utf8');
assert(languageSource.includes('NEW_LOCALES_READY = false'), 'Keep incomplete languages unavailable');
console.log(`Drafts checked: ${baseline.length} UI strings, ${glossaryBaseline.length} glossary entries and ${Object.keys(legal.ar).length} legal entries per locale; rollout disabled.`);
