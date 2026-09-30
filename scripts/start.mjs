import './prepare-compiler.mjs';
import { spawnSync, spawn } from 'node:child_process';
import fs from 'node:fs';

const file = '.env.local';
const env = fs.existsSync(file)
  ? Object.fromEntries(fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(line => /^[A-Z_][A-Z0-9_]*=/.test(line)).map(line => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')]; }))
  : {};
// Hosted configuration takes precedence over optional local defaults.
const childEnv = { ...env, ...process.env };
const required = ['DATABASE_URL', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY', 'GEMINI_API_KEY'];
const missing = required.filter(key => !childEnv[key]?.trim() || /REPLACE_ME|YOUR_PASSWORD/.test(childEnv[key]));
if (missing.length) {
  console.error(`Configure ${missing.join(', ')} in your hosting environment or .env.local before starting.`);
  process.exit(1);
}
const bin = (name) => `node_modules/${name}`;
const push = spawnSync(process.execPath, [bin('drizzle-kit/bin.cjs'), 'push'], { env: childEnv, stdio: 'inherit' });
if (push.status !== 0) { console.error('Database setup failed. Confirm PostgreSQL is running and the database exists.'); process.exit(push.status || 1); }
const mode = process.argv[2] === 'start' ? 'start' : 'dev';
const args = [bin('next/dist/bin/next'), mode];
if (mode === 'start') args.push('--hostname', '0.0.0.0', '--port', childEnv.PORT || '3000');
const next = spawn(process.execPath, args, { env: childEnv, stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => next.kill(signal));
next.on('error', error => { console.error('Next.js failed to start:', error.message); process.exit(1); });
next.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
