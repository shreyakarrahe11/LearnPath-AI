# Windows SWC startup repair — v8

This package pins Next.js 14.2.35 and its SWC WASM compiler 14.2.33. On Windows it uses the portable compiler before attempting any native `.node` binary. A guarded, idempotent postinstall adjustment enables this in Next 14’s loader. Development, middleware and production builds use the same compiler. Do not use Turbopack (`--turbo`) with this package.

1. Extract into a **new folder**, rather than overwriting the old installation.
2. Copy your old `.env.local` into the new `LearnPath-AI` folder.
3. Open a terminal there and run `npm run repair` (or double-click `REPAIR-WINDOWS.cmd`). This removes only `node_modules` and `.next`, installs the locked dependencies, and preserves `.env.local`.
4. Run `npm run compiler:check`, then `npm run dev`.
5. Open http://localhost:3000.

If you have no environment file yet, repair creates one. Fill in your PostgreSQL URL, both Clerk keys and Gemini key before starting. Keep PostgreSQL running.

Validation: fresh npm ci installation, JSX compilation using forced WASM, ESLint, and a full Next.js production build passed on Linux. Windows execution and live Clerk/PostgreSQL/Gemini requests could not be tested here; they require your local runtime and private settings. No credentials or installed dependencies are included in this ZIP.

---

# LearnPath AI course generator

## Run on Windows

Install 64-bit Node.js 22 LTS and PostgreSQL. Extract this ZIP into a new folder. Copy your existing `.env.local` into `LearnPath-AI` if you already configured it. Create one empty database named `learnpath_ai` in pgAdmin or PostgreSQL. In a terminal opened in this project folder:

```powershell
npm run repair
```

Open `.env.local` and enter your **full PostgreSQL connection URL**, your **Clerk publishable and secret keys**, and your **Gemini API key**. For a local database, the URL looks like:

```text
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/learnpath_ai
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
GEMINI_API_KEY=...
```

If your PostgreSQL password has characters such as `@`, `#`, or `/`, URL encode them (`%40`, `%23`, `%2F`). Obtain both Clerk keys from the same Clerk application. Enable email sign-in in that application. The database itself must exist; the app creates its tables automatically when starting.

```powershell
npm run dev
```

Open http://localhost:3000. Sign in with **your account first** to claim this database. Other Clerk accounts cannot use this copy. Create a course, edit its layout, select **Finish** to generate lessons, then view it in the dashboard. The Gemini key stays on the server. No Firebase, YouTube API, or separate host URL configuration is needed. If video is selected, a related YouTube search link appears with the lesson; an automatically selected embedded video requires a separate video provider. Uploaded course banner images (JPG, PNG, or WebP under 1 MB) are stored in PostgreSQL.

To run a production build locally: `npm run build` followed by `npm run start`.

Keep the `.env.local` file private. Do not paste keys into chat or commit the file. The app does not require a separate Firebase or YouTube account.

## If generation fails

Run `npm run doctor` inside the project folder. It checks the database tables lists models available to your key and sends a tiny Gemini request, showing which service failed without printing your keys. Copy only its output when asking for help.

The app selects a working Gemini generation model automatically. You may optionally set `GEMINI_MODEL` in `.env.local` to prefer a particular available model.

## Empty lesson on an existing course

Open the course and select the chapter. The app regenerates any missing or empty lesson and saves it to PostgreSQL. If generation fails, the chapter page displays the error and a retry button.
