# TADA

Ambulance dispatch platform for Ghana. Tema pilot.

## Structure

```
tada/
├── apps/
│   ├── patient/      Patient mobile app — Expo + React Native
│   ├── driver/       Driver mobile app — Expo + React Native
│   ├── dispatcher/   Dispatcher web dashboard — Next.js (port 3001)
│   └── hospital/     Hospital ER dashboard — Next.js (port 3002)
├── packages/
│   ├── shared/       Types, schemas, utilities used by every app
│   └── config/       Shared TypeScript, Tailwind configs
└── supabase/
    └── migrations/   Database schema (already applied)
```

## Prerequisites

You need these installed once on your computer:

- **Node.js 20+** — nodejs.org (download the LTS)
- **pnpm 9+** — after Node.js, run `npm install -g pnpm`
- **Git** — git-scm.com

For the mobile apps, also install:

- **Expo Go** on your phone — App Store or Play Store
  (Note: in Q3 2026, Expo Go for SDK 51 still works on Android. For iOS you may need a development build — instructions in apps/patient/README later.)

## First-time setup

From the repository root:

```bash
# 1. Install all dependencies for all apps and packages.
pnpm install
```

Then set up environment variables. **Each app has its own `.env` file** in its own folder — Next.js and Expo each load env vars from their own app directory, not the project root.

```bash
# Dispatcher dashboard — Next.js uses .env.local
cp apps/dispatcher/.env.example apps/dispatcher/.env.local

# Hospital dashboard — Next.js uses .env.local
cp apps/hospital/.env.example apps/hospital/.env.local

# Patient mobile app — Expo uses .env
cp apps/patient/.env.example apps/patient/.env

# Driver mobile app — Expo uses .env
cp apps/driver/.env.example apps/driver/.env
```

Then open each one in a text editor and fill in real values. At minimum, every app needs the Supabase URL and anon key. The Next.js apps additionally need the service role key (server-only) for some operations later.

Where to find your Supabase keys: Supabase Dashboard → your project → Settings → API. The "anon public" key goes in `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for the Next.js apps) and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (for the Expo apps) — same value, different name. The "service_role" key goes in `SUPABASE_SERVICE_ROLE_KEY` in the Next.js apps only, and is for server-side use that needs to bypass RLS.

**Why two names for the same value?** It's a framework convention. Next.js exposes vars prefixed with `NEXT_PUBLIC_` to the browser; Expo exposes ones prefixed with `EXPO_PUBLIC_` to the bundled app. Both treat any other prefix as server-only. Setting both lets us follow each framework's rules without arguing with them.

## Running the apps

Each app runs independently. Open a separate terminal for each one you want to run.

```bash
# The patient mobile app
pnpm dev:patient
# Scan the QR code with Expo Go on your phone, or press 'w' for web.

# The driver mobile app
pnpm dev:driver

# The dispatcher dashboard
pnpm dev:dispatcher
# Then open http://localhost:3001 in a browser.

# The hospital dashboard
pnpm dev:hospital
# Then open http://localhost:3002 in a browser.
```

You can also run everything at once with `pnpm dev` from the root, but for active development the per-app commands give cleaner output.

## What you should see right now

Each app, when launched, renders a placeholder screen that displays values from `@tada/shared`. The text "If you can read this, the [app] is wired up correctly" appears at the bottom of each. If you see that text, the foundation is solid and we can start building real screens.

## Common scripts

From the root:

```bash
pnpm typecheck   # type-check every package
pnpm lint        # lint every package
pnpm test        # run smoke tests (currently just @tada/shared)
pnpm clean       # remove all node_modules and build artifacts
```

## What's next

The next modules in Stage 0:

- **Module 4:** Phone OTP authentication via Hubtel SMS (so users can actually log in).
- **Module 5:** Realtime channels and data-flow architecture documentation.

Then Stage 1: building the actual patient app, screen by screen.

## Troubleshooting

**"pnpm: command not found"** — install pnpm globally: `npm install -g pnpm`

**"Cannot find module '@tada/shared'"** — run `pnpm install` from the root. Inside an app folder it won't link properly.

**Metro bundler fails on mobile app** — clear cache: `cd apps/patient && rm -rf .expo node_modules && pnpm install`

**Next.js says missing env vars** — make sure your `.env.local` file is inside the app folder (e.g. `apps/dispatcher/.env.local`), not at the project root. Restart the dev server after editing it.
