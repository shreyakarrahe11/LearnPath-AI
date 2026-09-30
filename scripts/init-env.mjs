import fs from 'node:fs';
const path = '.env.local';
if (fs.existsSync(path)) { console.log('.env.local already exists. Edit it to change your credentials.'); process.exit(0); }
fs.writeFileSync(path, `# Create an empty PostgreSQL database first. Use the full connection URL here.\n# Encode special password characters in the URL (for example @ becomes %40).\nDATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/learnpath_ai\nNEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_REPLACE_ME\nCLERK_SECRET_KEY=sk_test_REPLACE_ME\nGEMINI_API_KEY=REPLACE_ME\n`);
console.log('Created .env.local. Fill in the PostgreSQL URL, both Clerk keys, and Gemini key, then run npm run dev.');
