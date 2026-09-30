import fs from 'node:fs';
import pg from 'pg';
import { runGemini } from '../lib/gemini-client.mjs';

if (!fs.existsSync('.env.local')) { console.error('Missing .env.local. Run npm run setup first.'); process.exit(1); }
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('=');
  if (i > 0 && /^[A-Z_]+$/.test(line.slice(0, i))) process.env[line.slice(0, i)] = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
}
const required = ['DATABASE_URL', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY', 'GEMINI_API_KEY'];
let failed = false;
for (const key of required) if (!process.env[key] || /REPLACE_ME|YOUR_PASSWORD/.test(process.env[key])) { console.error(`Missing or placeholder: ${key}`); failed = true; }
if (failed) process.exit(1);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
try {
  await client.connect();
  const { rows } = await client.query('select to_regclass(\'"appOwner"\') as owner, to_regclass(\'"courseList"\') as courses, to_regclass(\'chapters\') as chapters');
  if (Object.values(rows[0]).some(v => v === null)) { console.error('PostgreSQL connected, but tables are missing. Restart npm run dev to create them.'); failed = true; }
  else console.log('PostgreSQL: connected; tables found.');
} catch (error) {
  failed = true;
  const hints = { '28P01': 'password rejected', '3D000': 'database does not exist', 'ECONNREFUSED': 'server is not reachable', 'ENOTFOUND': 'host not found', 'ETIMEDOUT': 'connection timed out' };
  console.error(`PostgreSQL: ${hints[error.code] || error.code || 'connection failed'}.`);
} finally { await client.end().catch(() => {}); }
try {
  const { model } = await runGemini('Reply with the word OK.');
  console.log(`Gemini: ${model} responded.`);
} catch (error) {
  failed = true;
  const status = Number(error.status) || (error.message.match(/\[(\d{3}) /)?.[1]);
  const hint = { 400: 'bad request or unsupported model settings', 401: 'invalid API key', 403: 'key lacks permission', 404: 'model unavailable to this key', 429: 'quota or rate limit reached', 503: 'service temporarily unavailable' };
  console.error(`Gemini: ${hint[status] || 'request failed'}${status ? ` (HTTP ${status})` : ''}.`);
}
if (!failed) console.log('Checks passed. Run npm run dev and try again.');
process.exit(failed ? 1 : 0);
