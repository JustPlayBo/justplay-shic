# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Angular CLI 9 project. Standard scripts via npm:

- `npm start` / `ng serve` — dev server at http://localhost:4200
- `ng build` — build to `dist/justplay-shic/` (add `--prod` for production)
- `ng test` — Karma + Jasmine unit tests (all `*.spec.ts`)
  - Single spec: `ng test --include='**/adventure.service.spec.ts'`
- `ng lint` — TSLint (`tslint.json`, `codelyzer`)
- `ng e2e` — Protractor end-to-end tests (`e2e/`)

Node 12 toolchain (see `.travis.yml`). CI builds the app, then a Docker image `justplaybo/shic` (nginx:alpine serving `dist/justplay-shic`).

## Architecture

This is a **companion web app** for the Italian board game *Sherlock Holmes — Consulente Investigativo*. It is not a generic Angular template: almost all logic lives in `AppComponent` and the interactive state is a Leaflet map overlaid on scanned game materials.

### Single-page layout, not a router-driven app

- `app-routing.module.ts` defines **no routes** — `AppComponent` is the whole UI, and sub-features are opened as `MatDialog` instances (`GameInfoComponent`, `ImageDialogComponent`, `BdgComponent`, `HintComponent`, `AdventuresComponent`, `IntroComponent`, `SolutionComponent`). When adding a feature, prefer a dialog over a route unless real navigation is needed.
- Netlify SPA fallback is `src/_redirects` (`/* /index.html 200`).

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

### Static content inventory (loops in `AppComponent`)

`times` and `annuario` arrays are hand-built in `ngOnInit` by counting through fixed filename patterns:
`/assets/ddt/times/{ddt,chqp,ddt-old,ssn}/Times-page-NNN.jpg` and `/assets/ddt/annuario/{ddt,chqp}/Annuario-page-NNN.jpg`.
Page counts are hard-coded loop bounds — when adding/removing scans you must update both the filesystem **and** the loop ranges in `app.component.ts`.

### Side drawers

The left (`#lbar`) and right (`#rbar`) `mat-drawer`s render the Times and Annuario thumbnails; clicking a thumbnail opens `ImageDialogComponent` with `{title, url, width}`. Both drawers are `mode="over"` and `opened` by default.
