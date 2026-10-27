// Check statically identifiable t(hebrew, english) calls before enabling new locales.
// Legal dictionary entries are checked separately; dynamic content still needs review.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { loadRepositoryModule } from './load-player-catalogue.mjs';

const translations = loadRepositoryModule('lib/plannedUiTranslations.ts').plannedUiTranslations;
const glossary = loadRepositoryModule('lib/plannedLanguageGlossary.ts').plannedLanguageGlossary;
const legal = loadRepositoryModule('lib/plannedLegalTranslations.ts').plannedLegalTranslations;
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
const legalSource = ts.createSourceFile('lib/legalTranslations.ts', fs.readFileSync('lib/legalTranslations.ts', 'utf8'), ts.ScriptTarget.Latest, true);
const legalTexts = new Set();
function inspectLegal(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(legalSource) === 'LEGAL_EN' && ts.isObjectLiteralExpression(node.initializer)) {
    for (const property of node.initializer.properties) {
      if (ts.isPropertyAssignment(property) && ts.isStringLiteral(property.initializer)) legalTexts.add(property.initializer.text);
    }
  }
  ts.forEachChild(node, inspectLegal);
}
inspectLegal(legalSource);
const missingLegal = Object.fromEntries(Object.keys(translations).map(locale => {
  const strings = [...legalTexts].filter(text => !legal[locale]?.[text]);
  return [locale, { missingCount: strings.length, strings }];
}));
// Built-in SBC copy is selected dynamically and is not captured by t() literal scanning.
const sbcSource = ts.createSourceFile('lib/sbcLocalization.ts', fs.readFileSync('lib/sbcLocalization.ts', 'utf8'), ts.ScriptTarget.Latest, true);
const sbcTexts = new Set(Object.values(loadRepositoryModule('lib/sbcLive20261020.ts').LIVE_SBC_TRANSLATIONS));
function inspectSbc(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(sbcSource) === 'SBC_ENGLISH' && ts.isObjectLiteralExpression(node.initializer)) {
    for (const property of node.initializer.properties) if (ts.isPropertyAssignment(property) && ts.isStringLiteral(property.initializer)) sbcTexts.add(property.initializer.text);
  }
  ts.forEachChild(node, inspectSbc);
}
inspectSbc(sbcSource);
const missingSbc = Object.fromEntries(Object.keys(translations).map(locale => {
  const strings = [...sbcTexts].filter(text => !translations[locale]?.[text]);
  return [locale, { missingCount: strings.length, strings }];
}));
console.log(JSON.stringify({ dynamicCalls, locales: result, legal: missingLegal, sbc: missingSbc }, null, 2));
if (process.argv.includes('--require-complete') && (dynamicCalls || Object.values(missing).some(strings => strings.size) || Object.values(missingLegal).some(item => item.missingCount) || Object.values(missingSbc).some(item => item.missingCount))) process.exitCode = 1;
