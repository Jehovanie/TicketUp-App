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

`tailwind.config.js` `content` globs `./app/**` and `./_shard/**`. **Classes written outside those two trees (e.g. `_core/`) will not be generated** — keep styled components in `_shard/components/`, or add the path to `content`.

Design tokens live in **`_shard/constants/palette.js`** — a single CommonJS module `require`d by `tailwind.config.js` and re-exported, typed, by `_shard/constants/colors.ts`. Edit the palette there, never in the Tailwind config.

The scheme is *bleu nuit & or*: `primary` (deep royal blue, `DEFAULT` = `#1B2A5B`, full `50`→`950` scale), `gold` (accent — prices, featured badges; used sparingly, never as a fill), `ink` (cool neutrals for text and borders), `surface` (`DEFAULT` page background / `raised` cards / `sunken` skeletons), plus `success` / `warning` / `danger`. The legacy `black-100/200/300` and `accent-100` aliases are kept, remapped onto `ink`, for screens not yet reworked.

Use `colors`, `GRADIENTS`, `withAlpha()`, `readableOn()` and `coverGradient()` from `_shard/constants/colors.ts` wherever `className` cannot reach — `LinearGradient`, `tintColor`, `ActivityIndicator`, `RefreshControl`.

Fonts are `font-poppins`, `font-poppins-light`, `-medium`, `-semibold`, `-bold`, `-extrabold`. Every Poppins face must be registered in both `app.json`'s `expo-font` plugin and `useFonts` in `app/_layout.tsx`.

Code style: tabs for indentation, double quotes.

## Conventions in flight

The codebase is mid-refactor from a real-estate template: several constants still carry property/rental naming (`bed`/`bath` icons, `_shard/constants/data.ts` sample cards). Prefer event-domain names in new code. `app/(root)/(tabs)/explore.tsx` and `profile.tsx` still hold template-era markup and `any`-typed state; the home screen, `Cards`, `Filters` and the empty states have been reworked.

**No event carries an image.** `Event::$imageUrl` has no serialization group on the API side, so it is never returned. Cards therefore build their cover from the event's **category colour** (`Category::$color`) — see `EventCover` in `_shard/components/Cards.tsx`, the single place to change the day the back exposes images. Note that `color` is *not* in the `events:lists` group: `event.category` only carries `id` and `name`, so screens resolve the colour through `buildCategoryColorMap(categories)` from `CategoryContext` and pass it to cards via the `accent` prop.

`GET /api/events` neither filters drafts (`status = false`) nor past events, and sorts by `createdAt` DESC. Any public listing must therefore rebuild its own programme with the selectors in **`_core/selectors/events.ts`** (`isPublished`, `isBookable`, `eventPhase`, `compareByStartAsc`, `minPriceTicket`, …) rather than rendering the raw array. Because that filtering happens client-side, a page of 20 can yield very few dates — the home screen keeps calling `loadMore()` until it holds enough.

`ticket_type` can be empty (roughly one event in twelve): `minPriceTicket()` returns `null`, which is a third state distinct from a free ticket — render « Tarifs à venir », not « 0 Ar ».

Branches: work lands on `develop` via feature branches (`features/<name>`); `main` is the release branch.
