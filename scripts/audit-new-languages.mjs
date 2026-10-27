// Read-only inventory for the planned Arabic, Brazilian Portuguese and Spanish rollout.
// It deliberately reports candidates rather than claiming complete translation coverage.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const roots = ['app', 'components', 'lib'];
const files = [];
async function collect(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(path);
  }
}
for (const root of roots) await collect(root);

let calls = 0;
let hebrewLines = 0;
const flagged = [];
for (const file of files.sort()) {
  const content = await readFile(file, 'utf8');
  const lines = content.split('\n');
  const translationCalls = [...content.matchAll(/\bt\s*\(/g)].length;
  const containingHebrew = lines.filter(line => /[\u0590-\u05ff]/u.test(line)).length;
  calls += translationCalls;
  hebrewLines += containingHebrew;
  if (translationCalls || containingHebrew) flagged.push({ file: relative('.', file), translationCalls, containingHebrew });
}
console.log(JSON.stringify({ filesScanned: files.length, translationCalls: calls, linesContainingHebrew: hebrewLines, files: flagged }, null, 2));
