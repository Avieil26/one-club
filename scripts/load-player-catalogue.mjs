import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { runInThisContext } from 'node:vm';
import ts from 'typescript';

/** Execute the same data modules Metro uses, without loading React Native. */
function createRepositoryLoader(root) {
  const cache = new Map();
  const requirePackage = createRequire(path.join(root, 'package.json'));
  function load(filename) {
    if (!path.extname(filename)) filename += '.ts';
    filename = path.resolve(filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    if (!fs.existsSync(filename)) throw new Error(`Missing module or asset: ${filename}`);
    if (/\.(png|webp|jpg|jpeg)$/.test(filename)) {
      module.exports = filename;
      return module.exports;
    }
    if (filename.endsWith('.json')) {
      module.exports = JSON.parse(fs.readFileSync(filename, 'utf8'));
      return module.exports;
    }
    const source = fs.readFileSync(filename, 'utf8');
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
  return load;
}

export function loadRepositoryModule(modulePath, root = process.cwd()) {
  return createRepositoryLoader(root)(path.resolve(root, modulePath));
}

export function loadPlayerCatalogue(root = process.cwd()) {
  return loadRepositoryModule('lib/fcPlayers.ts', root).PLAYERS;
}
