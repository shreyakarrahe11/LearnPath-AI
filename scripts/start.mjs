import './prepare-compiler.mjs';
import { spawnSync, spawn } from 'node:child_process';
import fs from 'node:fs';
const file = '.env.local';
if (!fs.existsSync(file)) { console.error('Run npm run setup, then fill in .env.local.'); process.exit(1); }
const env = Object.fromEntries(fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(line => /^[A-Z_]+=/.test(line)).map(line => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')]; }));
const required = ['DATABASE_URL', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY', 'GEMINI_API_KEY'];
const missing = required.filter(key => !env[key] || /REPLACE_ME|YOUR_PASSWORD/.test(env[key]));
if (missing.length) { console.error(`Fill in ${missing.join(', ')} in .env.local first.`); process.exit(1); }
const childEnv = { ...process.env, ...env };
const bin = (name) => `node_modules/${name}`;
const push = spawnSync(process.execPath, [bin('drizzle-kit/bin.cjs'), 'push'], { env: childEnv, stdio: 'inherit' });
if (push.status !== 0) { console.error('Database setup failed. Confirm PostgreSQL is running and the database exists.'); process.exit(push.status || 1); }
const next = spawn(process.execPath, [bin('next/dist/bin/next'), process.argv[2] === 'start' ? 'start' : 'dev'], { env: childEnv, stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => next.kill(signal));
next.on('exit', code => process.exit(code || 0));
