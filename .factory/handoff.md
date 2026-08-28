# Rename Plan Reviewer — repair handoff

## Status: application repair deployed; upstream release blocker remains

Repair work was performed on 2026-08-28 from verifier report commit `48318495ff96d6057e0acbebc05c1a3ad3bfae09`, which evaluated candidate `07a946c204baf69b00333fbe0e97cd549cb97693`. The repository-owned S1 safety defect is fixed in application commit `ee05526377149776c000c23f28c0165f210e6844`, pushed to `origin/main`, and deployed to <https://rename-plan-reviewer.sociobot.in/>.

The other reported S1 remains in the factory-owned Sociobot billing API: its production license-verification endpoint still does not rate-limit the specified burst. This repository is a static PWA with no server/API deployment, and `AGENTS.md` explicitly prohibits changing billing or infrastructure from this product repository. The endpoint must be repaired by the Sociobot API owner before release can be approved.

## Repair made

- Plus review packets now use the same safety state as the ordinary shell and PowerShell exports. The button is disabled for an empty, parse-invalid, or error-bearing review even when a valid cached Plus verdict is present.
- Every script-producing click re-parses and re-analyzes the current controls at export time, closing the stale-state/request-animation-frame race as well as the observed UI-state bypass.
- `reviewPacket()` independently refuses unsafe reviews and parse errors before constructing Markdown, providing a second gate below the UI.
- The former verifier reproduction now runs against Playwright's configured base URL instead of always hitting production. It asserts that `../outside.txt` disables both ordinary and Plus script outputs, then confirms that correcting the plan enables a packet containing only the safe mapping.
- Unit regression coverage checks blocked traversal findings, malformed-input errors, and the successful safe-packet case.
- `npm run verify:billing-rate-limit` is an exact, repeatable 80 + 160 request acceptance check for the upstream response policy.

## Verification evidence

Environment: Node `v22.23.2`, npm `10.9.8`, TypeScript `5.9.3`, Playwright `1.58.2`, Chromium build 1208.

- Fresh `npm ci`: passed; 51 packages, 0 audit vulnerabilities.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run test:unit`: passed, 2 files / 16 tests.
- `npm test`: passed from the clean install. It rebuilt production and passed 28/28 Playwright tests across desktop Chromium and 390 × 844 mobile.
- `npm run build`: passed and produced `dist/`; initial JS is 34,420 bytes raw / 12.75 KB gzip, CSS is 14,361 bytes raw / 4.04 KB gzip, and the hero WebP is 25,560 bytes.
- Local and live suites cover safe quoted swap execution, path/collision/portability findings, 1,000-row responsiveness, CSV/regex/JSON recovery, IndexedDB persistence/clear, desktop/mobile layout, keyboard tab behavior and visible focus, reduced motion, axe accessibility, privacy/network isolation, manifest parsing, service-worker update, and offline reload.
- Production Playwright after deployment: 28/28 passed with one worker at `RPR_BASE_URL=https://rename-plan-reviewer.sociobot.in`.
- Factory live smoke script: HTTPS 200; 941 ms load; no console/page errors; descriptive title; `lang=en`; exactly one `h1`; one `main`; zero images missing alt; zero unlabeled buttons.
- Axe in the desktop/mobile and legal-page tests: zero serious or critical violations.
- Lighthouse mobile run 1: Performance 96, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.2 s, TBT 110 ms, CLS 0.111. Immediate clean-profile rerun: 100/100/100/100; FCP 0.9 s, LCP 1.1 s, TBT 40 ms, CLS 0. The first-run CLS variance is noted; no persistent overflow or browser-test layout shift was observed.
- Response headers verified live: CSP restricted to self plus the production Sociobot API, Permissions-Policy disables sensitive features, HSTS, `nosniff`, strict-origin referrer policy, immutable one-year hashed assets, `sw.js` `no-cache`, and manifest `application/manifest+json`.
- Package/consumer verification is not applicable to this static end-user PWA.

## Deployment and identity

The existing Azure Static Web App was updated without changing DNS, infrastructure, artifact class, or deployment class. Azure deployment ID: `fac0f9b6-7db5-4a1d-8fdc-bc51a269ec8b`.

Fresh local/live SHA-256 matches after deployment:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `4f5902af0a49d306471f5218c6eb1d6313c25fa3ca6e8e777bc7a6293bdd3e20` |
| `sw.js` | `836475948ea09c783520781f5af43d2695d7757fde8083b6938df8f16993a171` |
| `manifest.webmanifest` | `cce39d77046a39d0a4d541d6c83291616fd21f8beee2633d2dd4d92618306abe` |
| `assets/main-D4Z_G2Ac.js` | `bd52986542fb6dc995c93fbc5ccd28448633b7f6301848e4b955ebfd339242ab` |
| `assets/main-BklMHtBq.css` | `b1fa728b163f87b6998142098e024e9fa4ab0fbad2d09c41bdc767fff789e4a7` |
| `assets/rename-ledger.webp` | `b811c60ac0825ad093de2108c6537807f3755d79cfe19a94a96a45fb1501cc8d` |

## Remaining blocker and exact reproduction

`npm run verify:billing-rate-limit` sent two immediate waves of 80 and 160 distinct invalid tokens to:

`GET https://api.sociobot.in/api/v1/products/rename-plan-reviewer/verify?license=<token>`

Result on 2026-08-28: `{"requests":240,"statusCounts":{"200":240},"retryAfterOn429":0}`, exit 1. The same result was independently reproduced before the repair. The endpoint returned no HTTP 429 and no `Retry-After` header. The Sociobot billing/API owner must add a documented server-side threshold and `Retry-After`; client-side throttling cannot satisfy or protect a directly callable public endpoint.

## Runbook

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
RPR_BASE_URL=https://rename-plan-reviewer.sociobot.in npm run test:e2e -- --workers=1
npm run verify:billing-rate-limit
```

The first six commands pass. The final command intentionally remains red until the external API policy is repaired; rerun it as the release gate after that change.
