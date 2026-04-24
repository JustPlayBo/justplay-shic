# JustPlay — Sherlock Holmes Consulente Investigativo

Companion web app for the Italian edition of the board game *Sherlock Holmes — Consulente Investigativo*, including the *Carlton House / Queen's Park* expansion, the *Scrittore Senza Nome* extra cases, and the *Baker Street Irregulars* (BSI) edition.

**Play it here:** <https://sherlock.justplaybo.it/>

Nothing on the page talks to a server while you play: your session lives entirely in the browser's `localStorage`.

## What's on the screen

A Leaflet map of Victorian London (with Queen's Park and a Bologna overlay) takes the main area. Two side drawers fold out from the toolbar:

- **Times** (left) — every issue of *The Times* included with each edition, as scanned pages. Click a thumbnail to open it full-size.
- **Annuario** (right) — the directory pages, same treatment.

On the map you'll see two kinds of markers: **hollow orange circles** are investigation *points* (click for the hint), **filled polygons** are *interactions* (buildings / characters, click for the detail card).

## Playing a case

1. **Scegli Avventura** lets you pick from the published catalogue.
   **Carica avventura (JSON)...** loads one from a file you have locally (see the format below).
   **Crea avventura...** opens the in-app editor to write one from scratch — no external tools needed.
2. **Nuova partita** starts a session. From here on, the app tracks:
   - **Visited places** — map circles fill with brown when you've opened their hint.
   - **Appunti** — a freeform textarea inside each hint dialog for your own notes.
   - **Indizi cerchiati** — the "circle letter S / W / …" mechanic from BSI. The hint dialog has a chip row where you record the letters you've circled, and hints with matching `requires` unlock automatically.
3. **Cerca** (magnifying-glass icon) opens a searchable list of every point. Filter by name or id; "Solo visitati" turns it into a notebook of where you've already been.
4. **Taccuino** — summary view of the session: started-at, list of visited places with their notes, list of circled letters with where you found them.
   - **Esporta JSON** downloads the full session so you can pause a case and come back to it on another device.
   - **Importa JSON** loads a previously exported session.
5. **Risolvi il caso** shows the adventure's solution.
6. **Domande** (only when the adventure ships them) walks through the two sets of end-of-case questions. Each card reveals the correct answer on expand; mark "Risposta esatta" to add the points. The dialog keeps a running total per set and overall.
7. **Percorso di Holmes** reveals the reference walkthrough — Holmes's step-by-step path with the clue letters he'd have circled at each step. Clicking a step flies the map to that point.

## Adventure JSON format (v1)

An adventure is a single JSON file. You can browse a working example at [`src/assets/ddt/adventures/sample-bsi.json`](src/assets/ddt/adventures/sample-bsi.json) or open **Crea avventura...** and hit **Anteprima JSON** to see the shape build up as you fill the form.

```jsonc
{
  "id": "my-case",
  "title": "Il caso della …",
  "version": 1,

  "intro":    { "title": "Introduzione", "html": "<p>Londra, 1889…</p>" },
  "solution": { "title": "Soluzione",    "html": "<p>…</p>" },

  "places": {
    "3SO": {
      "default": "<p>Indizio visibile ogni volta che visiti il luogo.</p>",
      "conditional": [
        { "requires": ["S"],      "html": "<p>Si rivela se hai cerchiato S.</p>" },
        { "requires": ["S", "W"], "html": "<p>Solo con S e W insieme.</p>" }
      ]
    },
    "6SO": "<p>Anche una semplice stringa va bene se il luogo non ha rami.</p>"
  },

  "questions": {
    "primary": {
      "title": "Domande principali",
      "items": [
        { "id": "p1", "text": "Chi…?", "answer": "…", "points": 15, "rationale": "opzionale" }
      ]
    },
    "secondary": { "title": "Domande accessorie", "items": [ /* … */ ] }
  },

  "sherlockPath": {
    "title": "Percorso di riferimento",
    "steps": [
      { "at": "3SO", "title": "Criterion Club", "description": "…", "gains": ["S"] }
    ]
  }
}
```

Things worth knowing:

- Clue letters are normalised to uppercase. A conditional fires when **every** letter in `requires` is currently held by the player — it does not replace the `default`, it's appended. Design each branch so it reads naturally alongside whatever came before.
- `places["id"]` can be a plain HTML string for a straightforward single-clue location.
- Question `id`s must be stable across edits. The session scorecard keys on them, so reordering or editing the text of a question won't lose progress; changing the `id` will.
- `sherlockPath.steps[].gains` is **informational**. It tells the player which letters Holmes would have circled, but the app never auto-applies them — that would spoil self-scoring.
- `at` on a step is optional; without it the step still renders but has no fly-to button.

Additional architecture and evaluation notes live in [CLAUDE.md](CLAUDE.md) if you plan to hack on the app itself.

## Local development

```bash
npm install
npm start          # ng serve → http://localhost:4200
```

Requires Node 20.19+ (Node 22 is what CI uses). `npm run build` emits `dist/justplay-shic/`.

## Credits

- *Sherlock Holmes — Consulente Investigativo* © Asmodee / Space Cowboys — game text and materials.
- London and Queen's Park map overlays © Asmodee; Bologna overlay © Archivio Digitale Comune di Bologna.
- Base map tiles © OpenStreetMap contributors (CC-BY-SA).
