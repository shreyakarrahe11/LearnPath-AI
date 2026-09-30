import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

if (Number(process.versions.node.split('.')[0]) < 20 || process.arch === 'ia32') {
  console.error('Install 64-bit Node.js 22 LTS, reopen your terminal, then retry.');
  process.exit(1);
}
console.log(`Node ${process.version} (${process.platform}/${process.arch}). Stop the app before repairing.`);
// Only disposable dependencies and build output are removed. Credentials stay intact.
for (const dir of ['node_modules', '.next']) {
  try { fs.rmSync(dir, { recursive: true, force: true }); }
  catch { console.error(`Close running Node processes and retry: ${dir} is locked.`); process.exit(1); }
}
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error('Run this command with npm run repair.');
const install = spawnSync(process.execPath, [npmCli, 'ci', '--include=optional', '--ignore-scripts=false'], { stdio: 'inherit' });
if (install.status !== 0) process.exit(install.status || 1);
const setup = spawnSync(process.execPath, ['scripts/init-env.mjs'], { stdio: 'inherit' });
process.exit(setup.status || 0);
