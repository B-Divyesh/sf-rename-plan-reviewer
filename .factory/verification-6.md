# Independent product verification 6 — FAIL

Verified on 2026-08-28 against candidate commit
`1205180452b391f4a7818f1e8dc3c8cdc2a96813` and
<https://rename-plan-reviewer.sociobot.in/>.

## Verdict

**FAIL — do not release this candidate.** The core local-first rename-review
workflow, declared claims, PWA behaviour, privacy checks, response policies,
and deployed-artifact identity all passed. The live 390 px UI nevertheless
fails the explicit factory accessibility requirement that touch targets are at
least **44 × 44 CSS px**. This is a release gate, not an axe heuristic.

Severity: S1 is a release blocker; S2 is a material issue that must be fixed
for this product contract.

## S1 — mobile navigation and footer links are narrower than 44 px

In a fresh 390 × 844 Chromium context on the live `/demo/` route, I measured
the actual interactive `<a>` bounding boxes. They are not merely visual text:
the links themselves are the click/tap targets.

| Location / link | Measured target |
| --- | --- |
| Header `Demo` | 30 × 44 px |
| Header `Terms` | 38 × 44 px |
| Footer `Privacy` | 42 × 44 px and 40 × 44 px (two footer/legal placements) |
| Footer `Terms` | 34 × 44 px and 33 × 44 px (two footer/legal placements) |
| Footer `Source` | 36 × 44 px |

The governing accessibility and design instructions require 44 × 44 px touch
targets. The demo controls themselves now meet the rule; this remaining defect
is in ordinary navigation/footer links. Give each interactive link a minimum
inline size of 44 px (while retaining at least 8 px between adjacent targets),
then rerun the mobile measurement and full accessibility suite.

## First-read and demo sandbox — pass

A cold, storage-free opening of the live root answered the required questions
in plain words on the first screen:

- **What:** “Review batch renames before you run them.”
- **For whom:** “For people preparing risky spreadsheet or regex batch
  renames.”
- **First action:** **Try it with sample data**, with “Loads a risky sample
  plan to inspect.” beside it.

The one-click action reaches `/demo/`. The populated sandbox displays the
persistent **“Demo — sample data, nothing is saved”** banner with **Reset
demo** and **Start for real**. An independent live edit of the sample found a
safe one-row mapping and made no external requests.

## Mandatory claims — pass

From this clean checkout I first ran `npm ci` (51 packages, 0 vulnerabilities),
then every exact command in `.factory/claims.json`. Each command builds first
and exercises the direct demo entry point; every claim has exactly one matching
`@claim:` test tag.

| Claim | Result |
| --- | --- |
| `risky-sample-review` | pass, 2/2 desktop + 390 px |
| `demo-isolated` | pass, 2/2 |
| `local-only` | pass, 2/2 |
| `offline-reload` | pass, 2/2 |
| `dry-run-export` | pass, 2/2 |
| `plus-offer-status` | pass, 2/2 |

## Build, functional, and PWA evidence — pass

- `npm run typecheck`, `npm run lint`, and `npm run test:unit` passed; unit
  tests: **19/19**.
- `npm test` passed: the same 19 unit tests, the exact production build, and
  **50/50** Playwright checks across desktop Chromium and 390 px Chromium.
  `test-results/.last-run.json` recorded `status: "passed"` and no failures.
- `RPR_BASE_URL=https://rename-plan-reviewer.sociobot.in npm run test:e2e`
  completed against production with its 50-test desktop/390 px suite and no
  failed-test artifact.
- `npm run test:offline:mobile` passed **20/20** controlled offline reloads
  (two offline flows repeated ten times at 390 px).
- Direct browser and suite coverage included normal CSV, semicolon/tab and
  quoted input, regex mappings and invalid-regex recovery, malformed JSON
  recovery, duplicate/collision/cycle/numbering/reserved-name/traversal/case/
  Unicode/moving-parent validation, 1,000 mappings, dry and live export,
  quote-safe reversible shell swaps, PowerShell output, CSV/undo export, and
  Plus packet safety gating. The 1,000-mapping interaction test passed its
  <200 ms test budget.
- The live service worker controlled the application, showed/activated an
  update, and reloaded both the real app and demo offline after an online
  visit. Its manifest reports standalone display, a versioned start URL, and
  no Chromium installability errors.

## Accessibility, privacy, and browser evidence

- `/opt/fleet/lib/verify-url.sh` passed against both local production preview
  and the live root: HTTP 200, no console/page errors, descriptive title,
  `lang=en`, one `h1`, `main`, alt text, and named buttons.
- Playwright Axe found **zero serious or critical violations** on the live
  populated demo at 390 px and desktop, and the full suite covered its other
  routes. There was no mobile horizontal overflow; keyboard skip-link, tab
  arrow-key operation, focus treatment, and reduced-motion behaviour passed.
  `@axe-core/cli` was also attempted, but its Selenium launcher could not
  start the container’s Playwright-managed Chromium; this is a verifier-tool
  limitation, not substituted for the successful in-browser Axe scan.
- Network capture on live demo load/edit showed only same-origin requests.
  There are no analytics, CDN fonts, or path-upload endpoint. The only
  product cross-origin API allowed by CSP is Sociobot license verification;
  the app has no sign-in flow, so Entra tenant validation is not applicable.
- Privacy pages, terms, README, MIT LICENSE, demo documentation, manifest,
  robots, sitemap, designed 404, and the required visual-design documentation
  are present.

## Live deployment and response policy — pass

The rebuilt candidate and production responses are byte-identical:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `1a973b7280bf6d64f5f24bd4745c188a3a52c3ddc72bce7245f4dfa6529d70af` |
| `sw.js` | `b5118a6d52990d996f486bf25982f652c7868ff78bfabaa1104daf73d54e943f` |
| `manifest.webmanifest` | `cce39d77046a39d0a4d541d6c83291616fd21f8beee2633d2dd4d92618306abe` |
| `assets/main-D1EUE9dW.js` | `c3a6097201ccf8b17d552e9165131c964d32bff0f8154a3925c287ad5747acae` |
| `assets/main-DWHg--M3.css` | `99ab1ae0f374b0954af60f9df952bd7efda30c35407d4977b9fb510cc60e6780` |
| `assets/rename-ledger-social.webp` | `96bc3eeee4d2282ab4aba1ff814e244c532a5a239c96c804bbcb68f593c01ea7` |

Live `/`, `/demo/`, `/privacy/`, `/terms/`, manifest, robots, sitemap, and
the designed 404 behave as expected; an unknown route returns HTTP 404. HTTPS
has HSTS, `nosniff`, strict-origin referrer policy, a restrictive CSP and
Permissions-Policy. Hashed JS/CSS are one-year immutable; `sw.js` is
`no-cache`; manifest MIME is `application/manifest+json`.

Initial assets meet static budgets: JS 36,388 bytes raw / 13.38 KB gzip; CSS
15,462 bytes raw / 4.21 KB gzip; hero WebP 25,560 bytes; social WebP 19,800
bytes. Lighthouse was attempted with the installed Chromium but its launcher
could not establish a debugging connection in this container, so no score is
claimed.

## Rate limiting

`npm run verify:billing-rate-limit` sent the required 240-request burst to the
Sociobot license-verification endpoint: **30 × 200**, then **210 × 429**;
every 429 carried `Retry-After`. The observed fresh-burst threshold was 30
accepted requests. This is the only server-side endpoint used by the product.

## Required disposition

Do not release until the S1 touch-target defect is fixed and independently
rechecked. No product code was modified during this verification.
