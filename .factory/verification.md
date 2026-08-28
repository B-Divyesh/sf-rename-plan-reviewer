# Independent product verification — FAIL

Verified 2026-08-28 against candidate commit `4d0fc67a5208bfe68465ed67e1553149263d0e4d` and `https://rename-plan-reviewer.sociobot.in/`.

## Verdict

**FAIL.** The candidate and live deployment are the same build, but the smallest useful product is not safe or complete. Generated shell and PowerShell plans reject ordinary filename-only destinations, source paths can leave the reviewed root without a finding, and the deployed PWA cannot reload offline. These are release blockers even though the repository's automated suite passes.

Severity used below: S1 = release blocker or unsafe core behavior; S2 = major workflow/accessibility failure; S3 = non-blocking quality or deployment-policy defect.

## Candidate and deployment identity

- Clean starting tree: `main` at the requested SHA, matching `origin/main`; no pre-existing changes.
- Candidate commit date/subject: `2026-08-28T05:02:16Z`, `test: harden safety checks and document handoff`.
- Live files matched the clean production build byte for byte:
  - `index.html`: `5319a7979f9d5b52d5d50ed6159c10f163a97e6afd6ca04b5cecea5e54e760f2`
  - `assets/main-sql0xZkk.js`: `645f01598d3b603548769e7802fbd15b950d251bb6791f56a6ed38aa4d775d85`
  - `sw.js`: `8ed884fd26d551921136d79eab8e310d0e11a41dc245122cfb66f084db98ead5`
  - `manifest.webmanifest`: `72ae27d765732d6719aa4c99c3b1e1a66fdba40622dd0757138f810a9dd4956b`
- Therefore the failures below are not stale-deployment drift.

## Defects

### S1 — filename-only destinations make both generated script formats stop

`targetDirectories()` slices every destination at `lastIndexOf('/')`. When no slash exists, `lastIndexOf` is `-1`, so `b.txt` becomes the fictitious directory `b.tx`. Shell and PowerShell both consume this list.

Reproduction: review the safe swap `a's file.txt -> b.txt`, `b.txt -> a's file.txt`, export either script, and run it with both files present. The shell plan exits during preflight with `Destination folder is missing: b.tx`; the dry run prints no planned commands, the live plan applies no renames, and the two source files remain unchanged. The PowerShell generator emits the equivalent `Test-Path ... -PathType Container` check from the same faulty list. This prevents the brief's primary output from working for common same-folder renames.

### S1 — unsafe source/root boundaries are accepted and exported

Path-safety checks only inspect destinations. `/tmp/outside.txt -> safe.txt` and `../outside.txt -> safe.txt` both show **No blocking risks found**, zero errors, and enabled script exports. A controlled temporary fixture using `../outside.txt -> dest/new.txt` then ran the exported live shell plan: the parent file was moved into the plan root and the script printed `Applied 1 renames.`

Destination validation is also incomplete: `a.txt -> C:\outside\b.txt` is marked safe because drive-absolute detection only recognizes `C:/...`, not `C:\...`. This violates the reviewed-root safety promise.

### S1 — live PWA offline reload fails

The service worker is installed, controls the page, and precaches cache `rpr-b23e4c7b34`. On the production host, however, its first fetch branch sends every hostname ending in `sociobot.in` directly to `fetch()`. That includes the app's own origin. After a controlled online reload, setting the browser offline and reloading produced `net::ERR_FAILED`, an empty body, and zero `<h1>` elements. Localhost offline tests pass only because `127.0.0.1` does not match that hostname rule.

### S2 — quoted filename whitespace is silently changed

CSV `a.txt,"bad "` is shown as `a.txt -> bad`, with no finding and script export enabled. The parser trims every cell after parsing, including quoted fields. This both hides the intended trailing-space portability finding and changes the user's proposed filename rather than reviewing it.

### S2 — keyboard users cannot open the regex workflow

Only the selected mapping tab is tabbable; the Regex rule tab has `tabindex=-1`. Focusing Mapping table and pressing ArrowRight leaves Mapping table selected and the regex panel hidden because tablist arrow-key behavior is not implemented. The file input also receives keyboard focus in a 1 x 1 px transparent element, so its otherwise styled focus ring is not visibly associated with the Import CSV or JSON control.

### S2 — case-insensitive moving-parent dependency is missed

With the default case-insensitive assumption, `Folder -> Archive` plus `other.txt -> folder/other.txt` shows zero findings and enables scripts. Moving-parent comparison is case-sensitive, so staging `Folder` can remove the destination folder before phase two on the filesystems the selected assumption represents.

### S2 — the advertised purchase action is unavailable

The live Buy Plus link uses the staging URL `https://pilot-api.sociobot.in/api/v1/products/rename-plan-reviewer/checkout`. A fresh request returned HTTP 404 with `{"error":"enabled factory product","status":404}`. The production API checkout URL also returned 404. Invalid-license verification itself returned a valid 200/`valid:false` response and the free workflow remained usable.

### S3 — deployment caching and browser policies are incomplete

- Hashed JS/CSS and the hero asset use `Cache-Control: public, must-revalidate, max-age=30`, not long-lived immutable caching.
- `manifest.webmanifest` is served as `application/octet-stream` rather than a manifest/JSON type, although Chromium still parsed it and reported no installability errors.
- HTTPS redirect, HSTS, `nosniff`, DNS-prefetch control, and a strict-origin referrer policy are present. CSP and Permissions-Policy are absent.

### S3 — 1,000-row responsiveness misses the stated target in lab checks

A 1,000-row input event completed correctly but occupied about 293 ms on the unthrottled test host; Lighthouse reported 292 ms Total Blocking Time. The contract's responsiveness target is under 200 ms. No field INP sample exists, so this is recorded as a budget risk rather than a field measurement.

## Quality-gate evidence

Environment: Node `v22.23.2`, npm `10.9.8`, Playwright `1.58.2`, preinstalled Chromium.

- `npm ci`: passed; 51 packages installed; 0 audit vulnerabilities.
- `npm test`: passed. Vitest: 1 file / 9 tests. Playwright: 6 tests across desktop Chromium and Pixel 5. This command also passed TypeScript and its embedded production build.
- `npm run build`: passed independently and produced `dist/`. No lint script exists in `package.json`; TypeScript checking is `tsc --noEmit` inside the build.
- Independent desktop and 390 px browser runs: no online console/page errors, no horizontal overflow, one `<h1>`, one `<main>`, `lang=en`, descriptive title/alt text, and reduced-motion media query active with animations disabled.
- Axe: zero serious/critical findings on empty and populated desktop/mobile states and on live main/privacy/terms pages. Manual keyboard defects are listed above.
- Lighthouse mobile, live URL: Performance 94, Accessibility 100, Best Practices 100, SEO 100; FCP 0.90 s, LCP 1.11 s, CLS 0, TBT 292 ms.
- Initial production assets: JS 32,811 bytes raw / 12.27 KB gzip; CSS 13,941 bytes raw / 3.95 KB gzip; hero WebP 25,560 bytes; no webfont payload. Static budgets pass.
- Manifest: required names, standalone mode, versioned start URL, theme/background colors, 192/512/maskable icons. Chromium reported zero installability errors.

## Functional and recovery coverage

- Confirmed collisions, duplicate destinations, swaps/cycles, reserved names, numbering gaps, traversal and absolute POSIX destinations, invalid portable characters, Unicode collision coverage from unit/browser fixtures.
- Confirmed valid CSV import, quoted commas/quotes, tab/semicolon parser coverage, regex transformation, malformed regex error and recovery, malformed JSON notice, risky-to-safe editing, finding filters/Escape, dry/live mode labeling, CSV/undo downloads, and local draft save/restore/clear with cancel/confirm.
- A 1,000-row browser fixture reviewed all rows, limited preview to 100, and correctly blocked seeded duplicate destinations, reserved name, and destination traversal. The unit fixture also confirmed 1,000 unique staging names.
- Shell quoting and phase ordering are present; the actual filename-only execution failure is listed above. `pwsh` was not installed, so PowerShell was inspected/generated rather than executed; it shares the proven faulty destination-directory function.
- Update flow positive control: with an in-memory second service-worker response, the waiting worker produced `A fresh notebook is ready. Update now`; selecting it activated the worker, cleared waiting state, and retained control. Production-host offline fetch still fails as described.

## Privacy and network evidence

- Normal main/legal workflows generated no third-party requests and source inspection found no analytics, tracking, CDN scripts, or remote fonts. Rename paths stayed in browser storage.
- Draft state persisted in IndexedDB and Clear desk removed it across reload.
- A fake `?license=qa-invalid` callback was stored under `sb_license:rename-plan-reviewer`, removed from the visible URL, and sent only to the documented Sociobot pilot verification endpoint; the UI recovered to the free experience.
- Privacy and terms pages are present and semantically valid.

## Required disposition

Do not release this candidate. Correct all S1 defects, add regression tests that execute generated shell plans and test offline on the real `*.sociobot.in` hostname, then address the S2 safety/accessibility/purchase defects and rerun independent verification.
