import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadRepositoryModule } from './load-player-catalogue.mjs';

const ui = loadRepositoryModule('lib/plannedUiTranslations.ts').plannedUiTranslations;
const glossary = loadRepositoryModule('lib/plannedLanguageGlossary.ts').plannedLanguageGlossary;
const locales = ['ar', 'pt-BR', 'es'];
const baseline = Object.keys(ui.ar).sort();
const glossaryBaseline = Object.keys(glossary.ar).sort();
for (const locale of locales) {
  assert.deepEqual(Object.keys(ui[locale]).sort(), baseline, `${locale} draft UI keys differ`);
  assert.deepEqual(Object.keys(glossary[locale]).sort(), glossaryBaseline, `${locale} glossary keys differ`);
  for (const [source, translated] of Object.entries(ui[locale])) {
    assert(translated.trim(), `${locale}: empty translation for ${source}`);
    assert(!/[\u0590-\u05ff]/u.test(translated), `${locale}: Hebrew in ${source}`);
  }
}
const languageSource = fs.readFileSync('lib/language.tsx', 'utf8');
assert(languageSource.includes('NEW_LOCALES_READY = false'), 'Keep incomplete languages unavailable');
console.log(`Drafts checked: ${baseline.length} matching UI strings and ${glossaryBaseline.length} glossary entries per new locale; rollout disabled.`);
