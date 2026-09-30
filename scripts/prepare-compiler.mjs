import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
// Next 14's native loader exits on ERR_DLOPEN_FAILED before trying WASM.
// Install a narrowly scoped, repeatable fallback for the pinned Next version.
const filename = require.resolve('next/dist/build/swc/index.js');
const marker = '// LearnPath portable SWC fallback';
let source = fs.readFileSync(filename, 'utf8');
if (!source.includes(marker)) {
  if (require('next/package.json').version !== '14.2.35') {
    throw new Error('Unexpected Next.js version. Run npm run repair to restore the pinned dependencies.');
  }
  const anchor = 'const isWebContainer = process.versions.webcontainer;';
  const importAnchor = 'let pkgPath = pkg;';
  if (!source.includes(anchor) || !source.includes(importAnchor)) {
    throw new Error('Compiler layout changed; refusing to patch an unknown loader.');
  }
  source = source.replace(anchor, `${marker}\n        const isWebContainer = process.versions.webcontainer || process.platform === "win32" || process.env.LEARNPATH_FORCE_WASM === "1";`);
  // loadWasm converts this value to a file URL, so resolve the package entry first.
  source = source.replace(importAnchor, 'let pkgPath = require.resolve(pkg);');
  fs.writeFileSync(filename, source);
}
require.resolve('@next/swc-wasm-nodejs');
console.log('Portable SWC ready (Windows uses WASM; native binary not required).');
