import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { runInThisContext } from 'node:vm';
import ts from 'typescript';

/** Execute the same data modules Metro uses, without loading React Native. */
export function loadPlayerCatalogue(root = process.cwd()) {
  const cache = new Map();
  const requirePackage = createRequire(path.join(root, 'package.json'));
  function load(filename) {
    if (!path.extname(filename)) filename += '.ts';
    filename = path.resolve(filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const source = fs.readFileSync(filename, 'utf8');
    if (filename.endsWith('.json')) {
      module.exports = JSON.parse(source);
      return module.exports;
    }
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
      fileName: filename,
    });
    const localRequire = (id) => {
      if (id.startsWith('@/')) return load(path.join(root, id.slice(2)));
      if (id.startsWith('.')) return load(path.resolve(path.dirname(filename), id));
      return requirePackage(id);
    };
    const execute = runInThisContext(`(function(require, module, exports) {\n${outputText}\n})`, { filename });
    execute(localRequire, module, module.exports);
    return module.exports;
  }
  return load(path.join(root, 'lib/fcPlayers.ts')).PLAYERS;
}
