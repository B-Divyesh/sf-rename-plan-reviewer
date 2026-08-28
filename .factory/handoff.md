# Rename Plan Reviewer — repair 5 handoff

## Status

All release-blocking and required product-QA findings in verifier report commit
`83b046446877bf0e5a8ce560659e62e638cdab4e` for candidate
`82fc214325c1f0dfdb60ab342758451fc55895d2` are repaired. The researched
scope, static PWA artifact class, isolated demo, local-first storage, existing
claims, and rename-plan safety behavior are unchanged.

## Findings repaired

1. **390px demo touch targets:** `.demo-banner` forced both persistent actions
   to 36px high. They now have a 44px minimum in both dimensions, with the
   existing 16px banner gap retained. Measured at 390 × 844: **Reset demo
   106.52 × 44px** and **Start for real 131.52 × 44px**.
2. **Social preview dimensions:** Open Graph and Twitter used the 960 × 640
   in-page hero. They now use a dedicated, locally derived
   `rename-ledger-social.webp`, measured at exactly **1200 × 630**, 19,800
   bytes. Explicit OG width and height metadata is present. The original hero
   remains unchanged; provenance for the crop is in `.factory/design.md`.
3. **Visible build identifier:** every rendered footer now shows **Version
   1.0.1**, sourced from `package.json` at build time. The main, demo, privacy,
   terms, and designed 404 views share that footer.

Exact browser regressions in `tests/e2e/app.spec.ts` assert the control boxes,
minimum adjacent spacing, metadata URL, decoded image dimensions, and visible
version. Legal-route coverage also checks the version. Response-policy unit
coverage asserts the new non-hashed social asset is not incorrectly cached as
immutable.

## Local verification evidence

Run on 2026-08-28 with Node 22.23.2, npm 10.9.8, Playwright 1.58.2, and the
preinstalled Chromium:

```sh
npm ci
# 51 packages installed; 0 vulnerabilities

npm run typecheck
npm run lint
npm run test:unit
# pass; 17/17 tests

npm test
# pass; production build plus 46/46 Playwright tests across desktop and 390px

npm run test:offline:mobile
# pass; 20/20 controlled 390px offline reloads

npm run verify:billing-rate-limit
# 240 requests: 30 × 200, 210 × 429; all 210 throttles had Retry-After

/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ /tmp/rpr-verify-local
# HTTP 200; 598ms; no console/page errors; title/lang/one h1/main/alt/labels pass

npx @axe-core/cli http://127.0.0.1:4173/demo/ ...
# axe-core 4.13.0: 0 violations

lighthouse http://127.0.0.1:4173/ ...
# Performance 100; Accessibility 100; Best Practices 100; SEO 100
# FCP 1.0s; LCP 1.4s; TBT 60ms; CLS 0
```

All five `.factory/claims.json` entries still have exactly one matching tagged
browser test. The full suite executes every claim in both browser projects:
risky sample review, demo isolation, same-origin-only review traffic, offline
reload, and dry-run export.

Browser coverage also rechecks executable shell swaps and undo, PowerShell
generation, unsafe-path and collision gates, malformed input recovery, 1,000
mappings under the interaction budget, keyboard tabs and skip link, visible
focus, reduced motion, serious/critical axe findings, legal and 404 routes,
service-worker update, installability, privacy, response policy, console/page
errors, and horizontal overflow. Screenshots were inspected at 1440px and
390px. The 390px page had `scrollWidth=390` and no console errors.

Production output remains within budget:

- JavaScript: 36,338 bytes raw / 13,355 bytes gzip.
- CSS: 15,462 bytes raw / 4,209 bytes gzip.
- Hero WebP: 25,560 bytes; social WebP: 19,800 bytes.
- Service worker: `rpr-9724095bd2`, 17 precached files.

## Deploy and live identity

Static deployment uses `dist/` and
`public/staticwebapp.config.json`:

```sh
/opt/fleet/lib/deploy-static.sh rename-plan-reviewer dist
```

Repair commit `64452bf` was pushed to `origin/main`, then deployment
`2ca6d198-9126-41fa-aeec-c6cd84706a62` completed successfully. The custom
domain is Ready and <https://rename-plan-reviewer.sociobot.in/> returns HTTPS
200 with managed TLS.

```sh
/opt/fleet/lib/verify-url.sh https://rename-plan-reviewer.sociobot.in/ /tmp/rpr-verify-live
# HTTP 200; 895ms; no console/page errors; title/lang/one h1/main/alt/labels pass

RPR_BASE_URL=https://rename-plan-reviewer.sociobot.in npm run test:e2e
# pass; 46/46 live desktop and 390px tests

npx @axe-core/cli https://rename-plan-reviewer.sociobot.in/demo/ ...
# axe-core 4.13.0: 0 violations
```

Local production output and live response bodies are byte-identical:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `fefdb29efa411bc35af29f0f995c5d37cc9a5b237e52c33b802abe76961948dc` |
| `assets/main-BSq2Hg9x.js` | `9d57055ef657dd0a5654078b2ccb33168b57aaa70b1c89dd4292e9b19b131764` |
| `assets/main-DWHg--M3.css` | `99ab1ae0f374b0954af60f9df952bd7efda30c35407d4977b9fb510cc60e6780` |
| `sw.js` | `1147745e876a06e858e86e298e45a1c2e95f13c398d278ba5f548e40bcc26f28` |
| `manifest.webmanifest` | `cce39d77046a39d0a4d541d6c83291616fd21f8beee2633d2dd4d92618306abe` |
| `assets/rename-ledger-social.webp` | `96bc3eeee4d2282ab4aba1ff814e244c532a5a239c96c804bbcb68f593c01ea7` |

Live response policy is correct: HSTS, `nosniff`, strict-origin referrer
policy, restrictive CSP, and Permissions-Policy are present; hashed assets are
one-year immutable; the social image is `image/webp` with a one-day cache; the
manifest is `application/manifest+json`; and `sw.js` remains revalidatable.
`/demo/`, `/privacy/`, `/terms/`, `robots.txt`, `sitemap.xml`, and the manifest
return 200. An unknown route returns the designed HTML 404.

## Known gaps

None for the verifier findings. New Plus purchases remain intentionally paused
because the factory checkout product is unavailable; existing license restore
and the complete free workflow remain functional, as in the accepted candidate
behavior.
