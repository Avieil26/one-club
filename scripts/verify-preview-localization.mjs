import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { loadPlayerCatalogue, loadRepositoryModule } from './load-player-catalogue.mjs';

const hebrew = /[\u0590-\u05FF]/u;
const players = loadPlayerCatalogue();
const { playerDisplayName } = loadRepositoryModule('lib/playerDisplayName.ts');
const football = loadRepositoryModule('lib/footballLocalization.ts');
for (const player of players) {
  assert(!hebrew.test(playerDisplayName(player, 'en')), `English player name: ${player.id}`);
  assert.equal(playerDisplayName(player, 'he'), player.name, `Hebrew name preserved: ${player.id}`);
  for (const [field, display] of [['nation', 'displayNation'], ['club', 'displayClub'], ['league', 'displayLeague']]) {
    assert(!hebrew.test(football[display](player[field], 'en')), `English ${field}: ${player[field]}`);
    assert.equal(football[display](player[field], 'he'), player[field]);
  }
}
const { seedDatabase } = loadRepositoryModule('lib/seed.ts');
const { careerChallengeCopy } = loadRepositoryModule('lib/careerLocalization.ts');
for (const challenge of seedDatabase().careerChallenges) {
  const en = careerChallengeCopy(challenge, 'en');
  const he = careerChallengeCopy(challenge, 'he');
  for (const key of ['title', 'rules', 'proofRequirements']) {
    assert(en[key] && !hebrew.test(en[key]), `English career ${challenge.id}.${key}`);
    assert.equal(he[key], challenge[key], `Hebrew career copy preserved: ${challenge.id}.${key}`);
  }
}
const { officialChallenges } = loadRepositoryModule('lib/sbcCatalog.ts');
const { sbcFace } = loadRepositoryModule('lib/sbcTileTheme.ts');
const { sbcText } = loadRepositoryModule('lib/sbcLocalization.ts');
for (const challenge of officialChallenges) {
  assert(!hebrew.test(sbcFace(challenge).en), `English SBC title: ${challenge.id}`);
  for (const key of ['requirements', 'reward']) {
    if (!challenge[key]) continue;
    assert(!hebrew.test(sbcText(challenge[key], 'en')), `English SBC ${challenge.id}.${key}`);
    assert.equal(sbcText(challenge[key], 'he'), challenge[key]);
  }
}
const { formatDate, formatRemaining, errorMessage } = loadRepositoryModule('lib/format.ts');
assert.equal(formatDate(null, 'en'), 'No time limit');
assert.equal(formatDate(null, 'he'), 'בלי הגבלת זמן');
assert.equal(formatRemaining(null, Date.now(), 'en'), 'No time limit');
assert.equal(errorMessage(new Error('צריך להתחבר'), 'en'), 'Sign in required');
assert.equal(errorMessage(new Error('צריך להתחבר'), 'he'), 'צריך להתחבר');
const scout = fs.readFileSync('components/CareerScoutView.tsx', 'utf8');
assert(!scout.includes("handleTabChange('israel')"), 'Remove the Israeli filter');
const { CAREER_SCOUT_PLAYERS } = loadRepositoryModule('lib/careerScoutData.ts');
assert(CAREER_SCOUT_PLAYERS.some((player) => player.category === 'israel'), 'Preserve Israeli players');
const picker = fs.readFileSync('app/language.tsx', 'utf8');
assert(picker.includes("'he'") && picker.includes("'en'"), 'Keep both language choices');
console.log(`Localization verified: ${players.length} player names and football identities, all seeded career challenges and ${officialChallenges.length} SBCs; Hebrew retained.`);

// Check literal UI copy as well as the runtime catalogue. These components localize
// their string props internally; other screens must use the language hook explicitly.
const { legalEnglish } = loadRepositoryModule('lib/legalTranslations.ts');
const { groundsLabel } = loadRepositoryModule('lib/groundsLocalization.ts');
function inspectDirectory(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) { inspectDirectory(filename); continue; }
    if (!filename.endsWith('.tsx')) continue;
    const source = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function inspect(node) {
      if (ts.isJsxText(node) && hebrew.test(node.text)) {
        const tag = node.parent.openingElement?.tagName.getText(source);
        if (filename === path.join('app', 'grounds', 'new.tsx') && tag === 'FieldLabel') {
          assert(!hebrew.test(groundsLabel(node.text.trim(), 'en')), `Untranslated Grounds label: ${node.text.trim()}`);
        } else {
          assert(filename === path.join('app', 'language.tsx') && ['עברית', 'המשך בעברית'].includes(node.text.trim()), `Unlocalized UI text: ${filename}: ${node.text.trim()}`);
        }
      }
      if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer) && hebrew.test(node.initializer.text)) {
        const text = node.initializer.text;
        const tag = node.parent.parent.tagName.getText(source);
        if (['LegalScreen', 'LegalSection', 'LegalBulletItem'].includes(tag)) {
          assert(!hebrew.test(legalEnglish(text)), `Untranslated legal copy: ${text}`);
        } else if (filename === path.join('app', 'grounds', 'new.tsx')) {
          assert(!hebrew.test(groundsLabel(text, 'en')), `Untranslated Grounds copy: ${text}`);
        } else {
          assert.fail(`Unlocalized UI attribute: ${filename}: ${text}`);
        }
      }
      ts.forEachChild(node, inspect);
    }
    inspect(source);
  }
}
inspectDirectory('app');
inspectDirectory('components');
console.log('Literal UI audit passed; legal and Grounds copy resolve to English, and the Hebrew language option remains available.');
