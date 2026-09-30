import './prepare-compiler.mjs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
process.env.LEARNPATH_FORCE_WASM = '1';
const { loadBindings } = require('next/dist/build/swc');
const bindings = await loadBindings();
if (!bindings.isWasm) throw new Error('Expected portable WASM compiler');
const result = await bindings.transform('export const Hello = () => <h1>LearnPath</h1>;', {
  filename: 'check.jsx',
  jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } } },
  module: { type: 'es6' },
});
if (!result.code.includes('LearnPath')) throw new Error('Compiler transformation failed');
console.log('PASS: portable compiler loads and compiles JSX without a native SWC binary.');
