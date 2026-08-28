# Independent product verification 4 — FAIL

Verified 2026-08-28 against candidate commit
`82fc214325c1f0dfdb60ab342758451fc55895d2` and the live deployment
<https://rename-plan-reviewer.sociobot.in/>.

## Verdict

**FAIL — do not release yet.** The deployed JavaScript and service worker
match the candidate exactly, all required claim tests and the full local/live
test suites pass, and the core rename-review job works. The candidate still
misses the non-negotiable mobile accessibility baseline: two persistent demo
controls are only 36 CSS px high, below the required 44 × 44 px touch target.

Severity: S1 = release blocker; S2 = required quality-contract repair.

## First-read test — pass

Cold opening the live landing page plainly answered the required questions:

- **What:** it reviews batch rename plans before they run.
- **For whom:** people preparing risky spreadsheet or regex batch renames.
- **First action:** **Try it with sample data**, which says it loads a risky
  sample plan to inspect.

The action opens `/demo/` in one click. The populated demo has the persistent
banner **“Demo — sample data, nothing is saved”**, plus **Reset demo** and
**Start for real**. It starts with a five-row sample showing a swap, a
numbering gap, and a reserved Windows filename.

## Release-blocking defect

### S1 — demo controls fail the 44 px mobile touch-target requirement

In a fresh 390 × 844 Chromium context at `/demo/`, measured bounding boxes
were:

| Control | Measured size |
| --- | --- |
| Reset demo | 102 × 36 CSS px |
| Start for real | 127 × 36 CSS px |

The product contract's accessibility and mobile requirements set a 44 × 44 CSS
px minimum. These are persistent primary demo controls and therefore cannot be
excused as hidden native inputs. Lighthouse's heuristic target-size audit
passes, but that does not override the stricter explicit factory acceptance
rule.

Repair the demo-banner action sizing (and retest its adjacent spacing) to at
least 44 px high before release.

## Other required repairs

### S2 — social preview asset does not meet the specified 1200 × 630 size

The only Open Graph/Twitter image is
`/assets/rename-ledger.webp`, measured at **960 × 640** (25,560 bytes). The
site-structure contract requires a real product-derived **1200 × 630** social
image. The supplied asset is attractive, product-specific, locally hosted, and
properly declared, but not the required social-preview dimensions.

### S2 — footer has no visible version/build identifier

The deployed footer includes the product one-liner, Privacy, Terms, Source, and
art provenance, but no version or build id. The required site skeleton calls
for a version/build id in the footer. Add a stable displayed build identifier.

## Required claims — all pass

Fresh-clone setup used `npm ci` (51 packages; 0 vulnerabilities). Every
entry in `.factory/claims.json` was run exactly, through the direct demo
entry point, before broader testing:

| Claim | Exact command | Evidence |
| --- | --- | --- |
| risky-sample-review | `npm run build && npm run test:e2e -- --grep @claim:risky-sample-review` | 2/2 desktop + 390px passed |
| demo-isolated | `npm run build && npm run test:e2e -- --grep @claim:demo-isolated` | 2/2 passed |
| local-only | `npm run build && npm run test:e2e -- --grep @claim:local-only` | 2/2 passed |
| offline-reload | `npm run build && npm run test:e2e -- --grep @claim:offline-reload` | 2/2 passed |
| dry-run-export | `npm run build && npm run test:e2e -- --grep @claim:dry-run-export` | 2/2 passed |

The claim tests demonstrate the supplied risky sample, `demo:` IndexedDB
isolation from real data, same-origin-only demo review traffic, controlled
offline reload, and a shell download that prints rather than executes rename
commands.

## Functional and regression evidence — pass

- `npm run typecheck`, `npm run lint`, and `npm run test:unit` passed;
  unit tests: **17/17**.
- `npm test` passed: production build plus **42/42** desktop and 390px
  Playwright tests. `dist/` was produced.
- `RPR_BASE_URL=https://rename-plan-reviewer.sociobot.in npm run test:e2e`
  passed: **42/42 against production**, not a local preview.
- `npm run test:offline:mobile` passed: **20/20** (two controlled 390px
  offline paths repeated ten times).
- `npm run verify:billing-rate-limit` sent 240 requests to the product
  license-verification API: **30 × 200, 210 × 429**; all 429 responses had
  `Retry-After`. Thus the observed rapid-burst limit started after 30
  accepts in that run. A follow-up rejected request returned
  `429 Retry-After: 0`.

The live browser scenarios cover normal CSV plans; quote-safe two-file swaps
that execute and reverse correctly in a temporary directory; dry-run and live
shell generation; PowerShell generation; CSV and undo exports; collision,
reserved-name, traversal, case-folded-parent, Unicode, numbering, and cycle
findings; malformed JSON import recovery; regex entry/error recovery; 1,000
mappings; Plus safety gating; keyboard-only tabs/skip link; legal routes; and
the 404 route. No browser console errors or page errors occurred in the
desktop or 390px review flows.

## Accessibility, PWA, privacy, and performance evidence

- Playwright axe found **zero serious or critical violations** on the live
  populated demo at desktop and 390px. The former scrollable-findings defect
  is fixed: the region is focusable and keyboard-scrollable. Focus rings,
  reduced-motion behavior, semantic `lang`/title/one-`h1`/main, labels,
  alt text, skip link, and no horizontal overflow all passed.
- A mobile Lighthouse run produced **97 Performance / 100 Accessibility**,
  FCP 1.0 s, LCP 1.2 s, CLS 0, and TBT 190 ms. Lighthouse reported a
  `TARGET_CRASHED` during its full-page screenshot after collection, so
  these scores are recorded as diagnostic rather than a clean Lighthouse
  process exit. Separate Playwright browser tests completed cleanly.
- The PWA manifest is Chromium-installable; the versioned service worker
  showed its update toast and activation flow. After an online controlled
  visit, both normal and demo routes reloaded offline and still reviewed new
  mappings.
- No third-party request occurred while loading and editing the demo. There
  are no analytics, CDN fonts, or embedded payment provider. The only allowed
  cross-origin policy is the Sociobot license API; no sign-in exists, so the
  Entra tenant check is not applicable.
- Live headers include HSTS, `nosniff`, strict-origin referrer policy,
  restrictive self-only CSP with the explicit Sociobot API exception, and a
  restrictive Permissions-Policy. `sw.js` is `no-cache`; hashed JS is
  one-year immutable. `robots.txt`, `sitemap.xml`, legal routes,
  manifest, and the 404 route all return their expected statuses.
- Built initial JS is **36.28 KB raw / 13.33 KB gzip**; CSS is **15.34 KB
  raw / 4.19 KB gzip**; the hero WebP is **25,560 bytes**. All are within the
  PWA budgets.

## Candidate/deployment identity

The fresh build and live artifacts have identical SHA-256 values:

| Artifact | SHA-256 |
| --- | --- |
| `assets/main-BcTSu5Iz.js` | `2ceb2bf78cebe73720fca1b3ee546e7d3dbe3cdfb14a536f24fc5e163c1ad69f` |
| `sw.js` | `c61ea2d76176f78ac184a29ecb8d35b5a5fea0d6aed4280d6d4fd48ca9a1c9da` |

This failure is therefore about the tested candidate as deployed, not a stale
or deployment-only discrepancy.
