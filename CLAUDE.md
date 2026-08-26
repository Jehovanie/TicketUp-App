# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TicketUp mobile app — browse events, buy and manage tickets. Expo SDK 54 / React Native 0.81 / React 19, expo-router, NativeWind (Tailwind) for styling, TypeScript strict. Consumes a separate REST backend ([ticketup-api](https://github.com/jehovanie/ticketup-api)), which is an API Platform / Symfony service (responses carry `@context` / `@id` / `@type` JSON-LD fields — see `_core/model/*`).

## Commands

```bash
npm run start          # expo start (dev server + QR)
npm run android        # expo start --android
npm run ios            # expo start --ios
npm run web            # expo start --web
npm run lint           # expo lint
npm test               # jest --watchAll (jest-expo preset)
```

`npm test -- --watchAll=false path/to/file.test.tsx` runs a single suite non-interactively.

Caveats:
- There are **no test files yet**. `environment/environement.test.ts` is an *environment config* (test/staging tier), not a Jest test — but its name matches jest's default pattern, so it will be picked up as an empty suite.
- `npm run reset-project` is declared in package.json but `scripts/reset-project.js` does not exist.

## Backend URL / environments

`environment/environement.ts` is the only file actually imported (by `_config/api/client.ts`). It hardcodes a LAN IP (`http://192.168.16.108:8000`) — **change it to your machine's LAN IP** for a device/emulator to reach the local API. `environement.prod.ts` and `environement.staging.ts` exist but are empty; there is no build-time environment switching wired up yet.

## Architecture

Directory prefixes are deliberate (underscore keeps them out of expo-router's file-based routing, which only scans `app/`):

- `app/` — routes only. Anything non-route must live outside it.
- `_core/` — domain: `model/` (TypeScript interfaces mirroring API resources) and `context/` (data providers).
- `_config/api/client.ts` — the single fetch wrapper. `client.get<T>(path)` / `client.post<T>(path, body)` return `{ status, data, header, url }` and reject with a message string. All network access goes through this; it prepends `environment.apiUrl` and sets JSON headers. It currently logs the URL and config on every call.
- `_shard/` — shared presentational components and asset constant maps (`icons.ts`, `images.ts`, `data.ts`). Note the spelling: `_shard`, not `_shared`.
- `environment/` — API base URL per tier.

Path alias `@/*` maps to the repo root (`tsconfig.json`), so imports read `@/_core/model/IEvent`, `@/_shard/components/Cards`.

### Routing

```
app/_layout.tsx              loads Poppins fonts, hides splash, wraps <Slot/> in CategoryProvider > EventProvider
app/(root)/_layout.tsx       headerless Stack; initialRouteName = "(tabs)"
app/(root)/(tabs)/           index (home) | explore | profile — custom TabIcon, absolute white tab bar
app/(root)/(auth)/           signin | signup
app/(root)/event/[id].tsx    event detail, fetches /api/events/:id directly
```

`typedRoutes` is enabled in `app.json`, so route strings are type-checked. Navigation uses absolute paths: `router.push('/(root)/event/${id}')`.

### Data flow

Two React contexts fetch once on mount at app root and expose `{ data, isLoading, errors }` — there is no refetch, cache, or mutation layer:

- `EventContext` → `GET /api/events`
- `CategoryContext` → `GET /api/categories`

Screens `useContext` these and throw if the value is missing. Detail screens bypass the contexts and call `client` directly. Filtering/search is done client-side over the context arrays (see `app/(root)/(tabs)/explore.tsx`).

**Auth is not implemented.** `app/(root)/(tabs)/_layout.tsx` hardcodes `{ loading: false, isLogged: true }` where a session hook belongs; the sign-in/sign-up screens have empty submit handlers. Wire real auth there rather than adding a parallel guard.

## Styling

NativeWind v4 — style with `className`, not `StyleSheet`. `app/global.css` holds the Tailwind directives and is fed to Metro via `withNativeWind` in `metro.config.js`.

`tailwind.config.js` `content` only globs `./app/**` and `./_shard/components/**`. **Classes written anywhere else (e.g. `_core/`) will not be generated** — add the path to `content` if you place styled components elsewhere.

Design tokens: `primary` `#5C27C0` (with `100`/`200`/`300` shades), `black-100/200/300`, `danger`. Fonts are `font-poppins`, `font-poppins-medium`, `-semibold`, `-bold`, `-extrabold`, `-light` (note: `poppins-light` is misconfigured in the Tailwind theme — it points at `Rubik-Light`, which is not loaded). Every Poppins face must be registered in both `app.json`'s `expo-font` plugin and `useFonts` in `app/_layout.tsx`.

Code style: tabs for indentation, double quotes.

## Conventions in flight

The codebase is mid-refactor from a real-estate template: several components and constants still carry property/rental naming (`properties`, `latestProperties`, `bed`/`bath` icons, `_shard/constants/data.ts` sample cards). Cards also render hardcoded placeholder images (`images.maitreGims`, `images.imageiDragons`) instead of `event.imageUrl`. Prefer event-domain names in new code.

Branches: work lands on `develop` via feature branches (`features/<name>`); `main` is the release branch.
