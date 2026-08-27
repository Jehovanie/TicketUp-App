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
- `_core/` — domain, no styling: `model/` (interfaces mirroring API resources), `context/` (providers), `selectors/` (pure functions over API data), `hooks/`.
- `_config/api/client.ts` — the single fetch wrapper. `client.get<T>(path, { query })` / `client.post<T>(path, body, { skipAuth })` return `{ status, data, header, url }` and **throw `ApiError`** (`status`, `payload`, `url`; `status === 0` means the device never reached the host). It prepends `environment.apiUrl`, forces `Accept: application/json` — without it API Platform answers JSON-LD — and attaches `Authorization: Bearer` from the module-level token set by `setAuthToken()`. All network access goes through it.
- `_config/api/` also holds one module per resource (`events.ts`, `categories.ts`, `auth.ts`); screens and contexts call those, not `client` directly.
- `_shard/` — shared presentational components and asset constant maps (`icons.ts`, `images.ts`, `data.ts`). Note the spelling: `_shard`, not `_shared`.
- `environment/` — API base URL per tier.

Path alias `@/*` maps to the repo root (`tsconfig.json`), so imports read `@/_core/model/IEvent`, `@/_shard/components/Cards`.

### Routing

```
app/_layout.tsx              loads Poppins fonts, hides splash, wraps <Slot/> in SessionProvider > CategoryProvider > EventProvider
app/(root)/_layout.tsx       headerless Stack; initialRouteName = "(tabs)"
app/(root)/(tabs)/           index (home) | explore | profile — custom TabIcon, absolute white tab bar
app/(root)/(auth)/           signin | signup — both built on <AuthShell/>
app/(root)/event/[id].tsx    event detail, fetches /api/events/:id directly
```

`typedRoutes` is enabled in `app.json`, so route strings are type-checked. Navigation uses absolute paths: `router.push('/(root)/event/${id}')`.

### Data flow

Two React contexts fetch once on mount at app root and expose `{ data, isLoading, errors }` — there is no refetch, cache, or mutation layer:

- `EventContext` → `GET /api/events`
- `CategoryContext` → `GET /api/categories`

Screens `useContext` these and throw if the value is missing. Detail screens bypass the contexts and call `client` directly. Filtering/search is done client-side over the context arrays (see `app/(root)/(tabs)/explore.tsx`).

### Auth

`SessionContext` is the single source of truth for logged-in / logged-out — never add a parallel guard. `signIn()` calls `POST /api/auth/login` (Symfony's `json_login` firewall, so the response skips the house envelope and a 401 comes back in Lexik's `{ code, message }` shape), stores the JWT via `setAuthToken()`, then fetches `GET /api/user/me` — which also answers **flat**, outside the envelope.

Two gaps to know about:
- **The token lives in memory only.** No `expo-secure-store` / `async-storage` is installed, so the session dies with the app. `refresh_token` is returned by the API but unused. Hook persistence into `SessionProvider`.
- **There is no account-creation endpoint.** `signup.tsx` validates locally and stops at a `TODO` in `handleSignUp`.

Browsing stays public. The wall sits on the *action*, not on navigation: `useRequireAuth()(action)` runs the action when logged in, otherwise pushes `signin` with the current path in `redirect`, which the screen `replace`s back to on success.

### Forms and the on-screen keyboard

Expo SDK 54 forces **edge-to-edge** on Android, so the window is no longer resized when the keyboard opens: `adjustResize` moves nothing, and `KeyboardAvoidingView` leaves the form buried under the keyboard. Every screen with text input must therefore lift its own content.

The auth screens do it through three pieces — reuse them rather than reinventing per screen:

- `_core/hooks/useKeyboardInset.ts` — the number of pixels the content must rise. iOS reads `window.height - endCoordinates.screenY` (correct for floating/split keyboards), Android reads `endCoordinates.height`. **Never combine it with a `KeyboardAvoidingView` on the same subtree** — the offset would be applied twice.
- `_shard/components/AuthShell.tsx` — the shared scaffold: night gradient, collapsing logo, and a light sheet whose *own* bottom padding carries the keyboard inset, so the sheet docks onto the keyboard instead of sliding under it. It also owns the scroll: fields report their position through the `RevealContext`, and the shell scrolls only as far as needed (`measureLayout` against an inner content `View`, re-run whenever the keyboard height changes).
- `_shard/components/AuthField.tsx` — labelled input; forwards its `ref` to the `TextInput` so screens chain fields with `returnKeyType` + `submitBehavior="submit"` + `onSubmitEditing`, and announces its focus to the shell.

Validation convention: errors surface only after a first submit attempt (a `submitted` flag), then live-update as the user types, and the submit handler focuses the first invalid field so an off-screen message is never missed.

## Styling

NativeWind v4 — style with `className`, not `StyleSheet`. `app/global.css` holds the Tailwind directives and is fed to Metro via `withNativeWind` in `metro.config.js`.

`tailwind.config.js` `content` globs `./app/**` and `./_shard/**`. **Classes written outside those two trees (e.g. `_core/`) will not be generated** — keep styled components in `_shard/components/`, or add the path to `content`.

Design tokens live in **`_shard/constants/palette.js`** — a single CommonJS module `require`d by `tailwind.config.js` and re-exported, typed, by `_shard/constants/colors.ts`. Edit the palette there, never in the Tailwind config.

The scheme is *bleu nuit & or*: `primary` (deep royal blue, `DEFAULT` = `#1B2A5B`, full `50`→`950` scale), `gold` (accent — prices, featured badges; used sparingly, never as a fill), `ink` (cool neutrals for text and borders), `surface` (`DEFAULT` page background / `raised` cards / `sunken` skeletons), plus `success` / `warning` / `danger`. The legacy `black-100/200/300` and `accent-100` aliases are kept, remapped onto `ink`, for screens not yet reworked.

Use `colors`, `GRADIENTS`, `withAlpha()`, `readableOn()` and `coverGradient()` from `_shard/constants/colors.ts` wherever `className` cannot reach — `LinearGradient`, `tintColor`, `ActivityIndicator`, `RefreshControl`.

Fonts are `font-poppins`, `font-poppins-light`, `-medium`, `-semibold`, `-bold`, `-extrabold`. Every Poppins face must be registered in both `app.json`'s `expo-font` plugin and `useFonts` in `app/_layout.tsx`.

The tab bar is `position: "absolute"`, and React Navigation publishes whatever number sits in `tabBarStyle.height` — not a measured value. `TAB_BAR_HEIGHT` / `LIST_BOTTOM_GUTTER` in `_shard/constants/layout.ts` are that number: every scrollable screen reserves its own bottom gutter from them, so never swap the explicit `height` for a `minHeight`.

Display strings go through `_shard/constants/format.ts`: the UI is French (`LOCALE = "fr-FR"`), prices are integers in ariary rendered `50 000 Ar`, and a null/zero price is a *Gratuit* badge — never « 0 Ar ».

Code style: tabs for indentation, double quotes.

## Conventions in flight

The codebase is mid-refactor from a real-estate template: several constants still carry property/rental naming (`bed`/`bath` icons, `_shard/constants/data.ts` sample cards). Prefer event-domain names in new code. `app/(root)/(tabs)/explore.tsx` and `profile.tsx` still hold template-era markup and `any`-typed state; the home screen, `Cards`, `Filters` and the empty states have been reworked.

**No event carries an image.** `Event::$imageUrl` has no serialization group on the API side, so it is never returned. Cards therefore build their cover from the event's **category colour** (`Category::$color`) — see `EventCover` in `_shard/components/Cards.tsx`, the single place to change the day the back exposes images. Note that `color` is *not* in the `events:lists` group: `event.category` only carries `id` and `name`, so screens resolve the colour through `buildCategoryColorMap(categories)` from `CategoryContext` and pass it to cards via the `accent` prop.

`GET /api/events` neither filters drafts (`status = false`) nor past events, and sorts by `createdAt` DESC. Any public listing must therefore rebuild its own programme with the selectors in **`_core/selectors/events.ts`** (`isPublished`, `isBookable`, `eventPhase`, `compareByStartAsc`, `minPriceTicket`, …) rather than rendering the raw array. Because that filtering happens client-side, a page of 20 can yield very few dates — the home screen keeps calling `loadMore()` until it holds enough.

`ticket_type` can be empty (roughly one event in twelve): `minPriceTicket()` returns `null`, which is a third state distinct from a free ticket — render « Tarifs à venir », not « 0 Ar ».

Branches: work lands on `develop` via feature branches (`features/<name>`); `main` is the release branch.
