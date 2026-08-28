# Rename Plan Reviewer

Rename Plan Reviewer turns a spreadsheet mapping or regex rule into a checked, portable rename plan before any file is touched. It is for people preparing high-stakes photo, document, and archive renames who need to catch collisions, unsafe paths, numbering gaps, case/Unicode surprises, and rename cycles.

Live: <https://rename-plan-reviewer.sociobot.in>

## What it does

- Imports two-column CSV/TSV/semicolon mappings and Rename Plan Reviewer JSON, or derives destinations from a JavaScript regex.
- Checks duplicate sources and destinations, reserved names, invalid portable characters, absolute/traversal paths, case-only changes, Unicode normalization collisions, numbering gaps, cycles, and moving-parent dependencies.
- Generates a preflighted, two-phase shell or PowerShell plan. Exports are dry-run-only by default.
- Exports a reviewed CSV and JSON undo manifest even when a plan still has findings.
- Saves the current draft in IndexedDB and works offline after the first visit. Paths are never uploaded.
- Offers optional Plus convenience features through a one-time Sociobot license. Safety checks and core exports are never gated.

The app does not browse, inspect, or rename files. Generated live scripts validate the real folder state immediately before staging, but users should still keep a backup.

## Develop and verify

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
npm test
npm run build
```

`npm test` runs unit coverage plus Chromium desktop/mobile, keyboard, axe accessibility, download, console, and offline service-worker tests. The exact production build command is `npm run build`; output lands in `dist/` with `dist/index.html` at its root.

For a local production preview:

```sh
npm run build
npm run preview
```

## Billing configuration

The default checkout/verification host is the Sociobot pilot API for staging. Set `VITE_BILLING_BASE=https://api.sociobot.in/api/v1` for production builds after the factory registers the product. No payment provider or product ID is embedded in this repository.

## Privacy, design, and deployment

There are no analytics, runtime CDNs, or third-party fonts. The [privacy policy](https://rename-plan-reviewer.sociobot.in/privacy/) explains local draft and license storage. The product-specific visual system and generated-asset provenance live in [`.factory/design.md`](.factory/design.md). This is a static PWA; deploy the contents of `dist/` and configure clean-path fallback if the host needs it.

MIT licensed. See [LICENSE](LICENSE).
