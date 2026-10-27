import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { loadRepositoryModule } from './load-player-catalogue.mjs';

const ui = loadRepositoryModule('lib/plannedUiTranslations.ts').plannedUiTranslations;
const glossary = loadRepositoryModule('lib/plannedLanguageGlossary.ts').plannedLanguageGlossary;
const legal = loadRepositoryModule('lib/plannedLegalTranslations.ts').plannedLegalTranslations;
const { localizedLegal, localizedLegalDate } = loadRepositoryModule('lib/legalLocalization.ts');
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
const languageSource = fs.readFileSync('lib/language.tsx', 'utf8');
assert(languageSource.includes('NEW_LOCALES_READY = false'), 'Keep incomplete languages unavailable');
console.log(`Drafts checked: ${baseline.length} UI strings, ${glossaryBaseline.length} glossary entries and ${Object.keys(legal.ar).length} legal entries per locale; rollout disabled.`);
