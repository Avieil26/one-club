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
// Community errors are selected dynamically from a data map, so verify every entry.
const communitySource = ts.createSourceFile('CommunityActivityUI.tsx', fs.readFileSync('components/CommunityActivityUI.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let communityErrorCount = 0;
for (const statement of communitySource.statements) if (ts.isVariableStatement(statement)) {
  for (const declaration of statement.declarationList.declarations) if (declaration.name.getText(communitySource) === 'ERRORS' && ts.isObjectLiteralExpression(declaration.initializer)) {
    for (const property of declaration.initializer.properties) if (ts.isPropertyAssignment(property) && ts.isArrayLiteralExpression(property.initializer)) {
      const english = property.initializer.elements[1];
      assert(ts.isStringLiteral(english), 'Community error must have an English source');
      for (const locale of locales) {
        const translation = plannedStructuredError(locale, english.text);
        assert(translation && translation !== english.text, `${locale}: missing community error: ${english.text}`);
        assert.deepEqual([...translation.matchAll(/\d+/g)].map(m => m[0]), [...english.text.matchAll(/\d+/g)].map(m => m[0]), `${locale}: community error numbers differ`);
      }
      communityErrorCount++;
    }
  }
}
assert(communityErrorCount > 0, 'Community error map was not found');
// Fixed mini-game questions also live in a data lookup rather than literal t() calls.
const miniGameSource = ts.createSourceFile('lib/miniGameLocalization.ts', fs.readFileSync('lib/miniGameLocalization.ts', 'utf8'), ts.ScriptTarget.Latest, true);
const { miniGamePrompt } = loadRepositoryModule('lib/miniGameLocalization.ts');
for (const statement of miniGameSource.statements) if (ts.isVariableStatement(statement)) {
  for (const declaration of statement.declarationList.declarations) if (declaration.name.getText(miniGameSource) === 'QUESTIONS_EN' && ts.isObjectLiteralExpression(declaration.initializer)) {
    for (const property of declaration.initializer.properties) if (ts.isPropertyAssignment(property) && ts.isStringLiteral(property.name) && ts.isStringLiteral(property.initializer)) {
      for (const locale of locales) {
        assert(ui[locale][property.initializer.text], `${locale}: missing fixed mini-game question`);
        assert.equal(miniGamePrompt(property.name.text, locale), ui[locale][property.initializer.text]);
      }
    }
  }
}
const careerSource = ts.createSourceFile('lib/careerLocalization.ts', fs.readFileSync('lib/careerLocalization.ts', 'utf8'), ts.ScriptTarget.Latest, true);
const { careerText } = loadRepositoryModule('lib/careerLocalization.ts');
for (const statement of careerSource.statements) if (ts.isVariableStatement(statement)) {
  for (const declaration of statement.declarationList.declarations) if (declaration.name.getText(careerSource) === 'ENGLISH' && ts.isObjectLiteralExpression(declaration.initializer)) {
    for (const property of declaration.initializer.properties) if (ts.isPropertyAssignment(property) && ts.isStringLiteral(property.name) && ts.isStringLiteral(property.initializer)) {
      for (const locale of locales) {
        assert(ui[locale][property.initializer.text], `${locale}: missing Career translation`);
        assert.equal(careerText(property.name.text, locale), ui[locale][property.initializer.text]);
      }
    }
  }
}
for (const locale of locales) assert.equal(careerText('USER_CREATED_CHALLENGE_SENTINEL', locale), 'USER_CREATED_CHALLENGE_SENTINEL');
// For translated SBC descriptions, protect numeric requirements and rewards.
const sbcSource = ts.createSourceFile('lib/sbcLocalization.ts', fs.readFileSync('lib/sbcLocalization.ts', 'utf8'), ts.ScriptTarget.Latest, true);
const sbcTexts = new Set(Object.values(loadRepositoryModule('lib/sbcLive20261020.ts').LIVE_SBC_TRANSLATIONS));
for (const statement of sbcSource.statements) if (ts.isVariableStatement(statement)) {
  for (const declaration of statement.declarationList.declarations) if (declaration.name.getText(sbcSource) === 'SBC_ENGLISH' && ts.isObjectLiteralExpression(declaration.initializer)) {
    for (const property of declaration.initializer.properties) if (ts.isPropertyAssignment(property) && ts.isStringLiteral(property.initializer)) sbcTexts.add(property.initializer.text);
  }
}
const sbcNumbers = text => [...text.matchAll(/[0-9]+(?:[,.][0-9]{3})*/g)].map(match => match[0].replace(/[,.]/g, '')).sort();
for (const locale of locales) for (const text of sbcTexts) {
  if (ui[locale][text]) assert.deepEqual(sbcNumbers(ui[locale][text]), sbcNumbers(text), `${locale}: SBC number mismatch: ${text}`);
}
// Player names and these game-branded event names are intentionally unchanged.
const unchangedSbcTitles = new Set(['Claudia Pina', 'Maghnes Akliouche', 'Tarciane', 'Raphinha', 'Pascal Groß', 'Michael Olise', 'Donyell Malen', 'Davide Frattesi', 'Renato Veiga', 'Antonio Nusa', 'Cristian Espinoza', 'Yan Diomande', 'Ayyoub Bouaddi', 'Ferran Torres', 'Emre Mor', 'Nick Woltemade', 'Spooky Nights', 'Scary Candy']);
const { sbcFace, localizedSbcTitle } = loadRepositoryModule('lib/sbcTileTheme.ts');
const titleChallenges = loadRepositoryModule('lib/sbcCatalog.ts').officialChallenges;
for (const challenge of titleChallenges) {
  const face = sbcFace(challenge);
  assert.equal(localizedSbcTitle(challenge, 'he'), face.he);
  assert.equal(localizedSbcTitle(challenge, 'en'), face.en);
  for (const locale of locales) {
    assert(ui[locale][face.en] || unchangedSbcTitles.has(face.en), `${locale}: missing SBC title ${face.en}`);
    assert(localizedSbcTitle(challenge, locale));
  }
}
// Exercise generated rule labels for every built-in challenge with empty and filled squads.
const chemistry = loadRepositoryModule('lib/chemistry.ts');
const challenges = loadRepositoryModule('lib/sbcCatalog.ts').officialChallenges;
const players = loadRepositoryModule('lib/fcPlayers.ts').PLAYERS;
const { localizedPlayStyle, plannedPlayStyleNames } = loadRepositoryModule('lib/plannedPlayStyleNames.ts');
const scoutPlayers = loadRepositoryModule('lib/careerScoutData.ts').CAREER_SCOUT_PLAYERS;
const playStyleNames = new Set([
  ...players.flatMap(player => (player.playstyles ?? []).map(style => style.name)),
  ...scoutPlayers.flatMap(player => player.playstyles.map(style => style.name.match(/\(([^)]+)\)/)?.[1] ?? style.name)),
]);
for (const locale of locales) for (const name of playStyleNames) {
  assert.notEqual(localizedPlayStyle(name, locale), name, `${locale}: untranslated player PlayStyle: ${name}`);
}
const { plannedSbcRule } = loadRepositoryModule('lib/plannedSbcRules.ts');
const formation = chemistry.FORMATIONS[0];
const filled = Object.fromEntries(formation.lines.flat().map((slot, index) => [slot.id, players[index]]));
const classicData = {
  ...JSON.parse(fs.readFileSync('assets/data/sbc-classic-verified-20261021.json', 'utf8')),
  ...JSON.parse(fs.readFileSync('assets/data/sbc-refresh-20261025.json', 'utf8')).classic,
  ...JSON.parse(fs.readFileSync('assets/data/sbc-refresh-20261026.json', 'utf8')).classic,
};
const ruleSets = [...challenges.map(challenge => challenge.rules), ...Object.values(classicData).flatMap(entry => entry.segments.map(segment => segment.rules))];
for (const rules of ruleSets) for (const placed of [{}, filled]) {
  const report = chemistry.evaluateSquad(formation, placed, rules);
  for (const check of report.checks) for (const locale of locales) {
    const translated = plannedSbcRule(check.label, locale);
    assert(translated && !/[\u0590-\u05ff]/u.test(translated), `${locale}: untranslated SBC rule: ${check.label}`);
    assert.deepEqual(sbcNumbers(translated), sbcNumbers(check.label), `${locale}: SBC rule number mismatch: ${check.label}`);
  }
}
const groundsSource = ts.createSourceFile('lib/groundsLocalization.ts', fs.readFileSync('lib/groundsLocalization.ts', 'utf8'), ts.ScriptTarget.Latest, true);
const { groundsLabel } = loadRepositoryModule('lib/groundsLocalization.ts');
for (const statement of groundsSource.statements) if (ts.isVariableStatement(statement)) {
  for (const declaration of statement.declarationList.declarations) if (declaration.name.getText(groundsSource) === 'GROUNDS_COPY' && ts.isObjectLiteralExpression(declaration.initializer)) {
    for (const property of declaration.initializer.properties) if (ts.isPropertyAssignment(property) && ts.isStringLiteral(property.name) && ts.isStringLiteral(property.initializer)) {
      for (const locale of locales) {
        assert(ui[locale][property.initializer.text], `${locale}: missing Grounds label: ${property.initializer.text}`);
        assert.equal(groundsLabel(property.name.text, locale), ui[locale][property.initializer.text]);
      }
    }
  }
}
for (const locale of locales) {
  assert(groundsLabel('רמה 12', locale).includes('12'));
  assert(groundsLabel('חלוקה 3', locale).includes('3'));
}
// Filter kinds and Grounds positions use dynamic lookup tables.
const filterSource = ts.createSourceFile('PlayerFilter.tsx', fs.readFileSync('components/PlayerFilter.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const unchangedBrands = new Set(['TOTW', 'OTW', 'Future Stars']);
let filterKindCount = 0;
for (const statement of filterSource.statements) if (ts.isVariableStatement(statement)) {
  for (const declaration of statement.declarationList.declarations) if (declaration.name.getText(filterSource) === 'KINDS' && ts.isArrayLiteralExpression(declaration.initializer)) {
    for (const item of declaration.initializer.elements) if (ts.isObjectLiteralExpression(item)) {
      const english = item.properties.find(property => ts.isPropertyAssignment(property) && property.name.getText(filterSource) === 'en');
      assert(english && ts.isPropertyAssignment(english) && ts.isStringLiteral(english.initializer));
      for (const locale of locales) assert(ui[locale][english.initializer.text] || unchangedBrands.has(english.initializer.text), `${locale}: missing filter kind ${english.initializer.text}`);
      filterKindCount++;
    }
  }
}
assert(filterKindCount > 0, 'Filter kind list was not found');
const groundsPositionSource = ts.createSourceFile('GroundsV22Screen.tsx', fs.readFileSync('components/GroundsV22Screen.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let groundsPositionCount = 0;
function inspectGroundsPosition(node) {
  if (ts.isFunctionDeclaration(node) && node.name?.text === 'positionLabel') {
    function inspectPosition(node) {
      if (ts.isVariableDeclaration(node) && node.name.getText(groundsPositionSource) === 'en' && ts.isObjectLiteralExpression(node.initializer)) {
        for (const property of node.initializer.properties) if (ts.isPropertyAssignment(property) && ts.isStringLiteral(property.initializer)) {
          for (const locale of locales) assert(ui[locale][property.initializer.text], `${locale}: missing Grounds position ${property.initializer.text}`);
          groundsPositionCount++;
        }
      }
      ts.forEachChild(node, inspectPosition);
    }
    inspectPosition(node);
  } else ts.forEachChild(node, inspectGroundsPosition);
}
inspectGroundsPosition(groundsPositionSource);
assert(groundsPositionCount > 0, 'Grounds position map was not found');
// Grounds category names are passed dynamically to t().
const groundsCategories = ts.createSourceFile('groundsPlaystyles.ts', fs.readFileSync('lib/groundsPlaystyles.ts', 'utf8'), ts.ScriptTarget.Latest, true);
let groundsCategoryCount = 0;
for (const statement of groundsCategories.statements) if (ts.isVariableStatement(statement)) {
  for (const declaration of statement.declarationList.declarations) if (declaration.name.getText(groundsCategories) === 'GROUNDS_PLAYSTYLE_CATEGORIES' && ts.isAsExpression(declaration.initializer) && ts.isArrayLiteralExpression(declaration.initializer.expression)) {
    for (const item of declaration.initializer.expression.elements) if (ts.isObjectLiteralExpression(item)) {
      const id = item.properties.find(property => ts.isPropertyAssignment(property) && property.name.getText(groundsCategories) === 'id');
      assert(id && ts.isPropertyAssignment(id) && ts.isStringLiteral(id.initializer), 'Grounds category must have an id');
      for (const locale of locales) assert(ui[locale][id.initializer.text], `${locale}: missing Grounds category ${id.initializer.text}`);
      groundsCategoryCount++;
    }
  }
}
assert(groundsCategoryCount > 0, 'Grounds category list was not found');
// Check PlayStyle names from the source without loading image assets.
const stylesSource = ts.createSourceFile('lib/groundsPlaystyles.ts', fs.readFileSync('lib/groundsPlaystyles.ts', 'utf8'), ts.ScriptTarget.Latest, true);
for (const statement of stylesSource.statements) if (ts.isVariableStatement(statement)) {
  for (const declaration of statement.declarationList.declarations) if (declaration.name.getText(stylesSource) === 'GROUNDS_PLAYSTYLES' && ts.isArrayLiteralExpression(declaration.initializer)) {
    for (const item of declaration.initializer.elements) if (ts.isObjectLiteralExpression(item)) {
      const name = item.properties.find(property => ts.isPropertyAssignment(property) && property.name.getText(stylesSource) === 'name')?.initializer;
      if (!name || !ts.isStringLiteral(name)) continue;
      for (const locale of locales) assert(plannedPlayStyleNames[locale][name.text], `${locale}: missing PlayStyle ${name.text}`);
      assert.equal(localizedPlayStyle(name.text, 'he'), name.text);
      assert.equal(localizedPlayStyle(name.text, 'en'), name.text);
    }
  }
}
const scoutSource = ts.createSourceFile('components/CareerScoutView.tsx', fs.readFileSync('components/CareerScoutView.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
for (const statement of scoutSource.statements) if (ts.isVariableStatement(statement)) {
  for (const declaration of statement.declarationList.declarations) if (declaration.name.getText(scoutSource) === 'POSITION_NAMES_EN' && ts.isObjectLiteralExpression(declaration.initializer)) {
    for (const property of declaration.initializer.properties) if (ts.isPropertyAssignment(property) && ts.isStringLiteral(property.initializer)) {
      for (const locale of locales) assert(ui[locale][property.initializer.text], `${locale}: missing scout position ${property.initializer.text}`);
    }
  }
}
const scoutRoleNames = {};
const scoutPositions = {};
for (const statement of scoutSource.statements) if (ts.isVariableStatement(statement)) {
  for (const declaration of statement.declarationList.declarations) {
    const target = declaration.name.getText(scoutSource) === 'SIMPLE_ROLES_EN' ? scoutRoleNames : declaration.name.getText(scoutSource) === 'POSITION_NAMES_EN' ? scoutPositions : null;
    if (target && ts.isObjectLiteralExpression(declaration.initializer)) for (const property of declaration.initializer.properties) {
      if (ts.isPropertyAssignment(property) && ts.isStringLiteral(property.initializer)) {
        const key = ts.isStringLiteral(property.name) ? property.name.text : property.name.getText(scoutSource);
        target[key] = property.initializer.text;
      }
    }
  }
}
for (const player of scoutPlayers) for (const role of [player.primaryRole, player.secondaryRole]) {
  if (!role) continue;
  const english = role.match(/\(([^)]+)\)/)?.[1] ?? scoutRoleNames[role] ?? scoutPositions[player.position] ?? 'Player role';
  for (const locale of locales) assert(ui[locale][english], `${locale}: missing scouting role ${english}`);
}
for (const player of scoutPlayers) assert(/(\d+)\s*שנים\s*\(עד\s*(\d{4})\)/.test(player.contractYears), `Unrecognized contract years: ${player.contractYears}`);
const attributeSource = ts.createSourceFile('lib/careerAttributes.ts', fs.readFileSync('lib/careerAttributes.ts', 'utf8'), ts.ScriptTarget.Latest, true);
function inspectAttributes(node) {
  if (ts.isPropertyAssignment(node) && node.name.getText(attributeSource) === 'label' && ts.isStringLiteral(node.initializer)) {
    for (const locale of locales) assert(ui[locale][node.initializer.text], `${locale}: missing attribute label ${node.initializer.text}`);
  }
  ts.forEachChild(node, inspectAttributes);
}
inspectAttributes(attributeSource);
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
const { formatDate, formatRemaining, errorMessage } = loadRepositoryModule('lib/format.ts');
const now = Date.parse('2026-10-27T00:00:00Z');
for (const locale of locales) {
  assert(formatDate(null, locale));
  assert.equal(formatDate('2026-10-27T00:00:00Z', locale), new Date('2026-10-27T00:00:00Z').toLocaleDateString(locale));
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
  assert.equal(errorMessage(new Error('צריך להתחבר'), locale), ui[locale]['Sign in required']);
  assert(errorMessage(new Error('חסר כותרת'), locale));
  assert.equal(errorMessage(new Error('UNRECOGNIZED_ERROR_SENTINEL'), locale), ui[locale]['Something went wrong. Try again.']);
}
const languageSource = fs.readFileSync('lib/language.tsx', 'utf8');
assert(languageSource.includes('NEW_LOCALES_READY = false'), 'Keep incomplete languages unavailable');
console.log(`Drafts checked: ${baseline.length} UI strings, ${glossaryBaseline.length} glossary entries and ${Object.keys(legal.ar).length} legal entries per locale; rollout disabled.`);
