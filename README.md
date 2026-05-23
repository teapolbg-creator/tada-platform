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

# 2. Set up your environment variables.
cp .env.example .env
# Then open .env in a text editor and fill in real values.
# At minimum you need:
#   EXPO_PUBLIC_SUPABASE_URL
#   EXPO_PUBLIC_SUPABASE_ANON_KEY
#   NEXT_PUBLIC_SUPABASE_URL    (same as above)
#   NEXT_PUBLIC_SUPABASE_ANON_KEY (same as above)
```

Where to find your Supabase keys: Supabase Dashboard → your project → Settings → API. The "anon public" key is what goes in both `EXPO_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The "service_role" key goes in `SUPABASE_SERVICE_ROLE_KEY` and is for server-side use only.

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

- **Patient app** — renders the prototype demo shell: a role picker at `/`, then
  splash → onboarding → phone-number entry. Tap **Patient** to walk through it.
  See [`apps/patient/README.md`](apps/patient/README.md) for screen-by-screen detail.
- **Driver / dispatcher / hospital** — still on the placeholder screen with the
  `@tada/shared` smoke-test values. Real screens land in later modules.

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

**Next.js says missing env vars** — make sure `.env` is at the project root, not inside the app folder. Restart the dev server after editing `.env`.
