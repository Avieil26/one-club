import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { loadRepositoryModule } from './load-player-catalogue.mjs';

// Expose the existing private question factories only inside this test module.
// Every dynamic prompt is checked, including ones random smoke tests might miss.
const filename = path.resolve('lib/miniGames.ts');
const source = fs.readFileSync(filename, 'utf8') + '\nexport { regularRules, iconRules, factRules, historyRound };\n';
const { outputText } = ts.transpileModule(source, {
  fileName: filename,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const requirePackage = createRequire(import.meta.url);
const cache = new Map();
function localRequire(id) {
  if (!id.startsWith('@/')) return requirePackage(id);
  if (!cache.has(id)) cache.set(id, loadRepositoryModule(id.slice(2)));
  return cache.get(id);
}
const module = { exports: {} };
new Function('require', 'module', 'exports', outputText)(localRequire, module, module.exports);
const game = module.exports;
const { miniGamePrompt, miniGameMessage, draftManagerName } = loadRepositoryModule('lib/miniGameLocalization.ts');
const { displayClub, displayNation, displayLeague } = loadRepositoryModule('lib/footballLocalization.ts');
const { plannedMiniGamePrompt } = loadRepositoryModule('lib/plannedMiniGamePatterns.ts');
const { DRAFT_MANAGERS } = loadRepositoryModule('lib/draftRun.ts');
const hebrew = /[\u0590-\u05FF]/u;
const prompts = new Set();
for (let difficulty = 0; difficulty <= 4; difficulty += 1) {
  for (const factory of [game.regularRules, game.iconRules, game.factRules]) {
    for (const rule of factory(difficulty)) prompts.add(rule.prompt);
  }
}
// All literal questions cover the historical and last-resort paths too.
const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
function visit(node) {
  if (ts.isStringLiteral(node) && /^(סמנו|מי )/u.test(node.text)) prompts.add(node.text);
  ts.forEachChild(node, visit);
}
visit(ast);
for (const prompt of prompts) {
  assert.equal(miniGamePrompt(prompt, 'he'), prompt, 'Keep the original Hebrew question');
  const english = miniGamePrompt(prompt, 'en');
  assert(english && !hebrew.test(english), `Untranslated question: ${prompt} => ${english}`);
  assert.equal(miniGamePrompt(prompt, 'en'), english, 'Switching language keeps the question stable');
  for (const locale of ['ar', 'pt-BR', 'es']) {
    const translated = miniGamePrompt(prompt, locale);
    assert(translated && !hebrew.test(translated) && translated !== english, `${locale}: untranslated mini-game prompt: ${prompt}`);
    if (plannedMiniGamePrompt(prompt, locale)) {
      const numbers = text => [...text.matchAll(/\d+/g)].map(match => match[0]).sort();
      assert.deepEqual(numbers(translated), numbers(prompt), `${locale}: number mismatch in ${prompt}`);
    }
  }
}
assert.equal(miniGamePrompt('סמנו מי שמשחק בפרמייר ליג ומדורג 88+', 'en'), 'Select players in Premier League rated 88+');
assert.equal(miniGamePrompt('סמנו מי שמשחק בברצלונה והוא החלוצים', 'en'), 'Select strikers at Barcelona');
assert.equal(miniGamePrompt('סמנו מי שבנבחרת ספרד ומדורג 88+', 'en'), 'Select players from Spain rated 88+');
assert.equal(miniGamePrompt('סמנו אייקונים מברזיל בעמדת ST', 'en'), 'Select ST Icons from Brazil');
assert.equal(miniGamePrompt('סמנו את הקשרים שמדורגים 90+', 'en'), 'Select midfielders rated 90+');
for (const count of [0, 1, 2, 3]) {
  const message = game.missLine(count);
  assert.equal(miniGameMessage(message, 'he'), message);
  assert(!hebrew.test(miniGameMessage(message, 'en')));
  for (const locale of ['ar', 'pt-BR', 'es']) assert(!hebrew.test(miniGameMessage(message, locale)) && miniGameMessage(message, locale) !== miniGameMessage(message, 'en'), `${locale}: untranslated mini-game feedback`);
}
for (const message of ['נכון', 'השחקן כבר על הלוח']) {
  assert.equal(miniGameMessage(message, 'he'), message);
  assert(!hebrew.test(miniGameMessage(message, 'en')));
}
for (const player of game.starMen()) {
  assert(!hebrew.test(displayClub(player.club, 'en')));
  assert(!hebrew.test(displayNation(player.nation, 'en')));
}
for (const manager of DRAFT_MANAGERS) {
  assert.equal(draftManagerName(manager, 'he'), manager.name);
  assert(!hebrew.test(draftManagerName(manager, 'en')));
  assert(!hebrew.test(displayLeague(manager.league, 'en')));
}
for (const score of [0, 3, 6, 10, 15, 25]) {
  const round = game.makeMarkRound(score);
  const before = JSON.stringify(round);
  assert.equal(round.players.length, 9);
  assert(round.players.some((player) => player.hit));
  assert(round.players.some((player) => !player.hit));
  assert(!hebrew.test(miniGamePrompt(round.prompt, 'en')));
  assert.equal(miniGamePrompt(round.prompt, 'he'), round.prompt);
  assert.equal(JSON.stringify(round), before, 'Localization must not mutate answers or round state');
}
for (const [filename, binding] of [
  ['app/games/who.tsx', 'miniGamePrompt(round.prompt, locale)'],
  ['components/MiniGameChrome.tsx', 'miniGameMessage(text, locale)'],
  ['app/games/grid.tsx', 'displayNation(nation, locale)'],
  ['app/games/club.tsx', 'displayClub(club, language)'],
  ['app/games/draft.tsx', 'draftManagerName(item, language)'],
]) {
  assert(fs.readFileSync(filename, 'utf8').includes(binding), `Connect localized copy to the game UI: ${filename}`);
}
console.log(`Mini-games verified: ${prompts.size} distinct prompts across all difficulty tiers, history/fallback questions, mistake messages, grid/club identities and draft managers; Hebrew and game state preserved.`);
