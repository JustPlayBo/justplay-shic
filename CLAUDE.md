# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Angular CLI 20 project. Standard scripts via npm:

- `npm start` / `ng serve` — dev server at http://localhost:4200
- `ng build` — build to `dist/justplay-shic/` (production config is the default; add `--configuration=development` for a fast dev build)
- `ng test` — Karma + Jasmine unit tests (all `*.spec.ts`)
  - Single spec: `ng test --include='**/adventure.service.spec.ts'`

Node 22 toolchain (see `.travis.yml`); Node 20.19+ also works. Linting (TSLint) and e2e (Protractor) were removed during the Angular 9→19 migration; there is no `ng lint`/`ng e2e` target. CI builds the app, then a Docker image `justplaybo/shic` (nginx:alpine serving `dist/justplay-shic`).

## Architecture

This is a **companion web app** for the Italian board game *Sherlock Holmes — Consulente Investigativo*. It is not a generic Angular template: almost all logic lives in `AppComponent` and the interactive state is a Leaflet map overlaid on scanned game materials.

### Single-page layout, not a router-driven app

- `app-routing.module.ts` defines **no routes** — `AppComponent` is the whole UI, and sub-features are opened as `MatDialog` instances (`GameInfoComponent`, `ImageDialogComponent`, `BdgComponent`, `HintComponent`, `AdventuresComponent`, `IntroComponent`, `SolutionComponent`). When adding a feature, prefer a dialog over a route unless real navigation is needed.
- Netlify SPA fallback is `src/_redirects` (`/* /index.html 200`).
- Every component has `standalone: false` — they are still declared in `AppModule`. Angular 19+ defaults new components to standalone; if you add one intended for the module, you must set `standalone: false` explicitly.

### Leaflet is loaded globally, not as an npm dep

- `src/index.html` pulls `leaflet.css` / `leaflet.js` from unpkg at runtime.
- `AppComponent` references it via `declare const L;` — do **not** add `import * as L from 'leaflet'`; there is no npm dependency to resolve.
- `ngOnInit` creates the map on `#map`, then stacks four tile layers (OSM base + three game-specific tile pyramids under `src/assets/ddt/{map,qp,bo}/{z}/{x}/{y}.png`).

### Data-driven map interaction

Two GeoJSON files drive what the user can click:

- `src/assets/ddt/interactions.geojson` — polygon/region features; clicking opens `BdgComponent` with `feature.properties` as dialog data (case briefings/characters).
- `src/assets/ddt/points.geojson` — point features rendered as translucent `L.circle` markers; clicking opens `HintComponent`.

Dialog data for hints is resolved through `AdventureService.getHint(place)`, which looks up `place` in the currently loaded `adventure.places`. A missing key returns the Italian fallback string — treat that as expected behavior, not an error.

### Adventure state (the only real service)

`AdventureService` (`providedIn: 'root'`) is the single source of truth for the selected adventure. It talks to an external API at `https://adventures.sherlock.justplaybo.it/` (not configurable via `src/environments/`), exposes `adventureSelected` to toggle menu items in `app.component.html`, and holds `adventure` for `getHint` / `solveAdventure`. Errors are swallowed via `catchError(() => of([]))` — if you need user-visible error handling, add it here.

### Session tracking (localStorage-only)

`SessionService` persists a single active "partita" under the localStorage key `shic.session`: `{startedAt, visited: Record<pointId, {at, note?}>}`. No backend. "Nuova partita" (app toolbar menu) calls `startNew()` which overwrites the previous session; there is no multi-session history. `SessionService.session$` is a `BehaviorSubject` — subscribing to it is how `AppComponent` re-styles the map circles when the player visits a new point or starts a new game.

`HintComponent` auto-calls `session.markVisited(id)` on open **only if a session is active**; otherwise the hint dialog behaves exactly as before. Map circles switch between `VISITED_STYLE` (filled brown-accent) and `UNVISITED_STYLE` (hollow orange) in `app.component.ts` — change the constants there, not in `pointToLayer`, or the style will drift between the initial render and the restyle-on-visit path.

### MapService bridge

`MapService` is a tiny shared-state holder: the Leaflet map instance, a flat `MapPoint[]` derived from `points.geojson`, and an `openHint` callback. `AppComponent` populates it after loading; `SearchComponent` reads from it to `flyToAndOpen` a result. Other components should prefer this bridge over digging into `AppComponent` when they need to manipulate the map.

### Static content inventory (`assets/ddt/manifest.json`)

The left-drawer `times` and right-drawer `annuario` lists are loaded at runtime from `src/assets/ddt/manifest.json`. Each section has `{title, open, pages: string[]}`, where `pages` holds absolute URLs. `AppComponent.ngOnInit` fetches the manifest via `HttpClient` and assigns directly to `this.times` / `this.annuario`.

When adding/removing scans, regenerate the manifest from the filesystem — there is a short Node one-liner in the Angular 20 migration commit that walks `assets/ddt/{times,annuario}/*/` and emits the JSON. Thumbnails use `loading="lazy"` + `decoding="async"`, so a section only pays for the pages visible after the user expands it.

### Side drawers

The left (`#lbar`) and right (`#rbar`) `mat-drawer`s render the Times and Annuario thumbnails; clicking a thumbnail opens `ImageDialogComponent` with `{title, url, width}`. Both drawers are `mode="over"` and `opened` by default.

### Material theming

`src/styles.scss` uses the Material 18+ M2 helpers (`mat.m2-define-palette`, `mat.$m2-brown-palette`, `mat.m2-define-dark-theme`, …) with `@use '@angular/material' as mat`. If/when you move to M3 (`mat.define-theme`), the custom brown/tan palette (`#644b13` primary, `#a19476` accent) needs to be redefined since M3 uses source-color generation rather than Material 2 palette maps.
