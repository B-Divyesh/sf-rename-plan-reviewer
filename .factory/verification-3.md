# Independent product verification 3 — FAIL

Verified on 2026-08-28 against candidate commit `fb8013ed03dd7f3c67b7a784d26fecce22917f0b` and the live deployment <https://rename-plan-reviewer.sociobot.in/>.

## Verdict

**FAIL — do not release.** The deployed application matches the requested commit and the core rename-review workflow is sound, but this candidate fails three independent release requirements: there is no claims manifest/test contract, there is no one-click isolated sample-data demo (and the cold first screen is not plain-language complete), and the required 390px sample state has a serious axe accessibility violation.

Severity: S1 = release blocker/explicit acceptance failure; S2 = major product-contract gap; S3 = non-blocking quality gap.

## Mandatory first checks

### Claims contract: S1

`.factory/claims.json` does not exist in the clean candidate. Therefore there were **zero listed claim tests to run**, which is itself a release-blocking failure under the claims contract. There are no `@claim:<id>` tests in the repository.

This also leaves visible, reliance-worthy statements unlisted and untestable through the required demo path, including **“Works offline,” “Your paths never leave this browser,” “Dry run first,” “safely quoted,”** and the README promises for local storage, offline use, no uploads, and exports. The ordinary test suite has useful coverage for several of these behaviors, but that is not a substitute for a manifest that maps every public claim to one tagged, observable demo test.

### Cold first-read and demo sandbox: S1

Fresh cold-page observation (desktop and 390px) was:

- It appears to be a batch-rename preflight tool: it accepts spreadsheet/regex mappings and reviews collisions before exporting a plan.
- It does **not** say who it is for on the first screen; the lede describes inputs/outcome but never names the person preparing a risky batch rename.
- The first `<h1>` is the metaphor **“Catch the collision before the rename.”** It does not state the job in plain words.
- There is no visible one-click **“Try it with sample data”** action, no explanation of what happens after such an action, and no persistent “Demo — sample data, nothing is saved” banner with Reset/Start-for-real controls. The available **“Load risky example”** action is not presented as the required demo.

`/?demo=1` and `/demo` render the ordinary application, with no demo state/banner. Source inspection confirms that `Load risky example` writes via the normal `rename-plan-reviewer` IndexedDB database, `drafts` store, key `current`; there is no `demo:` namespace or separate sandbox. `.factory/demo.md` is also absent. The required direct demo URL and isolation are therefore not present.

## S1 accessibility defect

At the live URL, in a fresh 390 × 844 Chromium context with reduced motion enabled:

1. Open `/?demo=1` and select **Load risky example**.
2. Run axe.
3. Axe reports one serious violation: `scrollable-region-focusable`, target **`.findings`** — “Scrollable region must have keyboard access.”

The report has neither focusable content nor a focusable container, so keyboard/Safari users cannot operate that scrollable findings region. The desktop and small-safe-plan checks pass; this is specifically the actual supplied example/populated mobile state that the existing test suite does not audit.

## S2 product and routing gaps

- There is no real `/demo` route/state as required above.
- `robots.txt` and `sitemap.xml` return HTTP 404.
- An unknown path returns the SPA application with HTTP 200; there is no designed 404 page.
- The landing document lacks canonical, Open Graph, Twitter-card, and apple-touch metadata. The legal documents also omit a description/canonical metadata set.

## Candidate/deployment identity

The fresh production build and live deployment had identical SHA-256 values:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `4f5902af0a49d306471f5218c6eb1d6313c25fa3ca6e8e777bc7a6293bdd3e20` |
| `sw.js` | `836475948ea09c783520781f5af43d2695d7757fde8083b6938df8f16993a171` |
| `manifest.webmanifest` | `cce39d77046a39d0a4d541d6c83291616fd21f8beee2633d2dd4d92618306abe` |
| `assets/main-D4Z_G2Ac.js` | `bd52986542fb6dc995c93fbc5ccd28448633b7f6301848e4b955ebfd339242ab` |
| `assets/main-BklMHtBq.css` | `b1fa728b163f87b6998142098e024e9fa4ab0fbad2d09c41bdc767fff789e4a7` |
| `assets/rename-ledger.webp` | `b811c60ac0825ad093de2108c6537807f3755d79cfe19a94a96a45fb1501cc8d` |

The defects apply to the stated candidate as deployed, not a stale deployment.

## Checks that passed

- Clean install: `npm ci` installed 51 packages and reported 0 vulnerabilities.
- Typecheck and lint: `npm run typecheck` and `npm run lint` passed. `npm run test:unit` passed: 2 files, 16 tests. Exact `npm run build` passed and generated `dist/` plus service worker `rpr-3460dceb14`.
- Repository test exercise: the clean `npm test` chain was invoked; focused fresh live reruns passed the eight desktop application behaviors except for one transient Chromium process crash in the combined run, whose offline case passed immediately on a single-test rerun. The six independent live QA tests passed, covering quoted swap execution/reversibility, directory edge behavior, malformed JSON recovery, safe Plus packet gating, desktop/390 safe-state semantics, and manifest installation. These do not negate the separate mobile populated-state axe result above.
- End-to-end product behavior: normal CSV mappings, quoted swap staging/execution/reversibility, collision/reserved-name/path traversal/case/Unicode/numbering/cycle checks, 1,000-row review, regex workflow/recovery, JSON import recovery, dry-run defaults, undo/CSV exports, and safety gating were exercised through the live UI. No console or page errors were observed in normal desktop or mobile flows.
- PWA: service-worker update toast/activation and an online-first offline reload passed; offline reload retained the app, showed **Offline · on-device**, and reviewed a safe mapping. The manifest is installable and contains standalone display, versioned start URL, and 192/512/maskable icons.
- Privacy/network: while loading/editing the example, browser request capture found no third-party requests; source and response policy show no analytics, CDN fonts, or path-upload endpoint. The only permitted cross-origin request is the stated Sociobot license API. No sign-in flow exists, so Entra tenant validation is not applicable.
- Rate limiting is now present on the factory unlock endpoint. `npm run verify:billing-rate-limit` produced `{"requests":240,"statusCounts":{"429":240},"retryAfterOn429":240}`. A fresh independent sequence first received one normal invalid-license `200`, then a 40-request rapid wave received `1 × 200` and `39 × 429`, each 429 with `Retry-After: 0`. Throttling began within the first two rapid accepts observed; this resolves the previous report’s upstream rate-limit blocker.
- Response policy/caching: live responses have HTTPS/HSTS, `nosniff`, strict-origin referrer policy, restrictive CSP (`self` plus the billing API connect source), and Permissions-Policy. Hashed JS/CSS use one-year immutable caching; `sw.js` is `no-cache`; the manifest MIME type is correct.
- Budget: initial JS is 34,420 bytes raw / 12.75 KB gzip; CSS is 14,361 bytes raw / 4.04 KB gzip; hero WebP is 25,560 bytes; there are no webfont payloads. These meet the static bundle budgets.

## Required disposition

Do not release. Before re-verification:

1. Add `.factory/claims.json`, a direct isolated demo path, and one clean-state tagged observable test for every public claim; remove any claim that cannot be proved.
2. Replace/reframe the first screen with a plain-language job/target-user statement and a visible **Try it with sample data** action. Add the persistent demo banner, Reset demo/Start for real behavior, `demo:` storage isolation, and `.factory/demo.md`.
3. Fix the populated-mobile `.findings` keyboard-scroll violation and add an axe regression that loads the sample fixture at 390px.
4. Supply the missing crawl/metadata/404 assets.
