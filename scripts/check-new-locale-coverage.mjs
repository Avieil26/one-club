// Check statically identifiable t(hebrew, english) calls before enabling new locales.
// Other content sources (including legal text and dynamic data) need separate checks.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { loadRepositoryModule } from './load-player-catalogue.mjs';

const translations = loadRepositoryModule('lib/plannedUiTranslations.ts').plannedUiTranslations;
const glossary = loadRepositoryModule('lib/plannedLanguageGlossary.ts').plannedLanguageGlossary;
const glossaryKeys = { Settings: 'settings', Language: 'language', Players: 'players', Comments: 'comments', 'Terms of Use': 'termsOfUse', 'Privacy Policy': 'privacyPolicy' };
const missing = Object.fromEntries(Object.keys(translations).map(locale => [locale, new Set()]));
let dynamicCalls = 0;
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) { walk(filename); continue; }
    if (!/\.[jt]sx?$/.test(filename)) continue;
    const source = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true);
    function inspect(node) {
      if (ts.isCallExpression(node) && node.expression.getText(source) === 't' && node.arguments.length >= 2) {
        const text = node.arguments[1];
        if (!ts.isStringLiteral(text) && !ts.isNoSubstitutionTemplateLiteral(text)) dynamicCalls++;
        else for (const locale of Object.keys(translations)) {
          if (!translations[locale][text.text] && !glossary[locale][glossaryKeys[text.text]]) missing[locale].add(text.text);
        }
      }
      ts.forEachChild(node, inspect);
    }
    inspect(source);
  }
}
for (const directory of ['app', 'components', 'lib']) walk(directory);
const result = Object.fromEntries(Object.entries(missing).map(([locale, strings]) => [locale, { missingCount: strings.size, strings: [...strings].sort() }]));
console.log(JSON.stringify({ dynamicCalls, locales: result }, null, 2));
if (process.argv.includes('--require-complete') && (dynamicCalls || Object.values(missing).some(strings => strings.size))) process.exitCode = 1;
