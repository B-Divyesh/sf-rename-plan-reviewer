# Independent product verification 7 — PASS

Verified on 2026-08-28 against candidate commit
`afe27ad0419c4db76030b9c6fd0bcce370576eaf` and
<https://rename-plan-reviewer.sociobot.in/>.

## Verdict

**PASS — this candidate meets the acceptance contract.** No release-blocking,
major, or minor product defect was found. The previous verification's mobile
touch-target blocker is fixed in this candidate and independently reproduced
on production.

Defects by severity:

- S0/S1 release blockers: none.
- S2 material defects: none.
- S3 minor defects: none.

No product code was changed during this verification.

## Mandatory first-read gate — pass

A cold, storage-free opening of the live root answers all three required
questions in the first 390 × 844 viewport without scrolling:

- **What:** “Review batch renames before you run them.”
- **For whom:** “For people preparing risky spreadsheet or regex batch
  renames.”
- **First action:** **Try it with sample data**, accompanied by “Loads a risky
  sample plan to inspect.”

The action is one click and opens `/demo/`. The resulting populated reviewer
shows the persistent **“Demo — sample data, nothing is saved”** banner with
**Reset demo** and **Start for real**. Cold desktop and mobile captures are in
`.factory/evidence/verification-7/live-cold-desktop.png` and
`live-cold-mobile.png`.

## Mandatory claim tests — pass

`.factory/claims.json` exists, parses as six entries, and each id occurs in
exactly one `@claim:<id>` test. After `npm ci` from the clean candidate (51
packages, zero vulnerabilities), I ran every listed `test` command exactly as
written before the broader test work. Every command rebuilt the production
artifact first and passed in both desktop Chromium and the 390 px project.

| Claim | Exact-command result |
| --- | --- |
| `risky-sample-review` | pass, 2/2 |
| `demo-isolated` | pass, 2/2 |
| `local-only` | pass, 2/2 |
| `offline-reload` | pass, 2/2 |
| `dry-run-export` | pass, 2/2 |
| `plus-offer-status` | pass, 2/2 |

The landing and README claim copy maps to those entries. The risky-demo test
observes its reserved name, numbering gap, and rename cycle. The Plus test
observes the stated US $12 once price, unavailable checkout, free safety/export
features, mocked existing-license verification, and the combined packet.
Equivalent claim-pass output also appears in `npm-test.txt` and `live-e2e.txt`
under `.factory/evidence/verification-7/`.

## Clean checkout and production build — pass

- Candidate identity before testing: clean `main` at
  `afe27ad0419c4db76030b9c6fd0bcce370576eaf`.
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm run test:unit`: **19/19 pass**.
- `npm test`: **19/19 unit and 52/52 Playwright pass**, followed by the exact
  production build.
- `npm run build`: pass; `dist/` contains the deployable static PWA and a
  versioned worker precaching 17 files.
- `RPR_BASE_URL=https://rename-plan-reviewer.sociobot.in npm run test:e2e`:
  **52/52 pass** against production across desktop and 390 px Chromium.
- `npm run test:offline:mobile`: **20/20 pass** across ten repeated mobile
  offline cycles.

The build emits 36,388 bytes JS (13.38 KB gzip) and 15,515 bytes CSS (4.22 KB
gzip). There are no runtime fonts. The hero WebP is 25,560 bytes. These are far
inside the 200 KB JS, 50 KB CSS, 120 KB font, and 300 KB hero budgets.

## End-to-end job evidence — pass

The browser and unit coverage exercises the actual reviewed-plan workflow,
not a button-presence demo:

- normal CSV, quoted values, embedded quotes, significant whitespace,
  semicolon and tab delimiters, JSON import, and regex-derived mappings;
- empty input, one mapping, and 1,000 mappings; the 1,000-row interaction
  remains below its 200 ms budget and produces 1,000 unique staging names;
- invalid regex, malformed/short CSV, structurally invalid JSON, and successful
  recovery without an uncaught error;
- swaps/cycles, duplicate sources/targets, numbering gaps, reserved Windows
  names, invalid/control/trailing characters, case-only names, Unicode
  normalization collisions, absolute paths, traversal, and moving parents;
- errors block scripts, while safe input enables shell and PowerShell plans;
- default shell output is a dry run; live shell output executes a quoted swap,
  backslash paths, and repeated separators correctly in a temporary directory;
- two-phase staging, preflight failures, CSV export, undo JSON, and the Plus
  packet's safety gate.

An additional independent production run at 390 px covered empty state,
invalid-regex recovery, valid regex, semicolon input, malformed-CSV recovery,
all four free downloads, refresh persistence, and clear-to-empty recovery. It
recorded no external request and no console/page error. Evidence:
`.factory/evidence/verification-7/manual-live.txt`.

## Accessibility and responsive behavior — pass

- `/opt/fleet/lib/verify-url.sh` passed on the live root, demo, privacy, and
  terms routes: HTTP 200, useful titles, `lang=en`, exactly one `h1`, a `main`,
  complete image alt text, named buttons, and no console/page errors.
- The maintained Playwright Axe integration reported **zero serious or
  critical violations** on desktop, 390 px populated demo, privacy, and terms.
- Keyboard checks pass for the skip link, main focus, tablist arrow navigation,
  file input focus treatment, findings-region scrolling, Enter/Space-native
  controls, and Escape clearing a finding filter. No keyboard trap was found.
- Focus rings are visible; controls and navigation/legal links meet 44 × 44 px;
  adjacent navigation targets retain at least 8 px spacing.
- Default 390 px pages have no horizontal overflow. Text remains present and
  operable at a 200% root text setting. Reduced-motion disables animations and
  transforms used for interaction feedback.
- Visual inspection of full live desktop and 390 px demo captures found no
  overlap, clipping, hidden controls, or unusable state.

The repaired live 390 px navigation measurements are at least 44 × 44 px for
all eight header, inline-legal, and footer anchors. This closes verification
6's sole release blocker.

## Performance — pass

A fresh Lighthouse 12.8.2 mobile run against production reports:

| Category/metric | Result |
| --- | ---: |
| Performance | 97 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| LCP | 1.3 s |
| CLS | 0 |
| FCP | 1.0 s |
| Total blocking time | 210 ms |

An independent in-page measurement from the 1,000-row input event through the
rendered verdict took 39.4–83.7 ms across ten live runs. Evidence is in
`interaction-1000-inpage.txt`. Lighthouse JSON is
`.factory/evidence/verification-7/lighthouse-live.json`.

## Privacy, network, and browser policy — pass

- Fresh live demo load/edit/export captures made only same-origin requests.
  No path, mapping, or rule value left the site.
- Real drafts persist in IndexedDB `rename-plan-reviewer`; demo drafts use the
  separate `demo:rename-plan-reviewer` database. Entering and leaving demo did
  not read or overwrite the real draft.
- There is no analytics, advertising, tracking request, CDN script, or remote
  font. The only permitted cross-origin runtime destination is the Sociobot
  license-verification API; license tokens are not rename data.
- Production sends HSTS, `nosniff`, strict-origin referrer policy, a restrictive
  CSP, and a restrictive Permissions-Policy. HTML revalidates after 30 seconds;
  hashed JS/CSS are one-year immutable; `sw.js` is `no-cache`; the manifest is
  served as `application/manifest+json`.
- Root, demo, privacy, terms, manifest, robots, sitemap, product imagery, and
  source links respond successfully. An unknown route returns the designed
  document with HTTP 404. `mailto:` links were recognized and excluded from
  HTTP crawling.
- The app has no sign-in flow, so Entra authority validation is not applicable.

## PWA and deployment identity — pass

- Chromium reports no manifest installability errors. The manifest has a
  versioned start URL, standalone display, theme/background colors, 192/512
  icons, and a maskable icon.
- The live service worker controls the app, uses a versioned cache, displays
  and applies an update, and reloads both real and demo routes offline after
  their first controlled visit. Offline editing remains usable.
- Rebuilt candidate and live artifacts are byte-identical. Key SHA-256 values:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `5676969c1871a6e40edd7ae52d80eea858bd696c4692124f770210424f2f2207` |
| `demo/index.html` | `c8bdf30e5fb2ca90b9f4dabd2ca0c2b385e3cc33cf9c59153c3c762f65d47827` |
| `sw.js` | `8b86bb5e8cd9abb600bcda887f7a1cb5e5e861039ad0e4b1be9b88512eaf918f` |
| `manifest.webmanifest` | `cce39d77046a39d0a4d541d6c83291616fd21f8beee2633d2dd4d92618306abe` |
| `assets/main-asEGVDlZ.js` | `b00bb0609d6091ba80ea6e8ab9b1d806e30a3a517445f8b0e9595e6f466aeb45` |
| `assets/main-DCFLyqXe.css` | `2c45867761a49ba81acb31412060459f9e0c6b5b6ecf813e64ea36f193a3be7a` |

The full ten-artifact comparison is in
`.factory/evidence/verification-7/artifact-hashes.txt`.

## Rate limiting — pass

`npm run verify:billing-rate-limit` sent a fresh 240-request burst to the only
server endpoint used by the product, the Sociobot license-verification API.
The observed threshold was **30 accepted requests**, followed by **210 HTTP
429 responses**. Every 429 included `Retry-After`. Evidence:
`.factory/evidence/verification-7/rate-limit.txt`.

This is a static PWA, not a library, CLI, or product backend. Consumer package
installation, backend concurrency/health, and product-server persistence tests
do not apply.

## Evidence index

Supporting output and captures are under `.factory/evidence/verification-7/`:

- `npm-test.txt`, `live-e2e.txt`, `offline-mobile.txt`, `unit.txt`,
  `typecheck.txt`, and `lint.txt`;
- `manual-live.txt` and its reproducible `manual-live.mjs`;
- `interaction-1000-inpage.txt`;
- `artifact-hashes.txt`, `live-headers.txt`, `link-status.txt`, and
  `rate-limit.txt`;
- `lighthouse-live.json`;
- cold-root and full-route desktop/mobile screenshots plus `verify.json`
  reports generated by the required URL verifier.
