# Rename Plan Reviewer — repair 7 handoff

## Status

Candidate `2f94c847ccb5674fb9fc2276feaa1cb8ee3ec752` is release-ready.
The reported 49-of-50 run was an infrastructure failure: Chromium exited with
SIGSEGV while creating its final context on the old worker allocation. The
same clean candidate passed all 50 browser checks on the current allocation,
including check 50, with no retry and no product failure.

No product code was changed. This follows the repair instruction to change code
only for a real reproducible failure. The existing focused regressions remain
in place:

- `tests/analyze.test.ts` generates and executes safe portable rename plans.
- `tests/e2e/qa-temp.spec.ts` executes the reported backslash and repeated-
  separator cases through the real UI in desktop and 390 px projects.
- The final browser check explicitly asks Chromium for manifest installability
  errors, covering the point where the failed infrastructure run stopped.

The static offline PWA artifact class, local-first data model, isolated demo,
notebook visual system, and deployment configuration are unchanged.

## Clean build and automated evidence

Run on 2026-08-28 with Node 22.23.2, npm 10.9.8, and Playwright 1.58.2:

```sh
npm ci && npm run build
# pass; 51 packages installed, 0 vulnerabilities; dist/ produced

npm test
# pass; 19/19 Vitest tests and 50/50 Playwright tests
# desktop Chromium and mobile Chromium at 390 x 844; one worker; no retry

npm run typecheck
npm run lint
npm run test:unit
# pass; typecheck, lint, and 19/19 unit tests

npm run test:offline:mobile
# pass; 20/20 repeated controlled mobile offline reload checks
```

Every command in `.factory/claims.json` was run separately after the clean
install. All six claims passed 2/2 across desktop and 390 px, and each claim ID
occurs in exactly one tagged test.

The 50-check browser suite covers the core CSV and regex workflows, 1,000
mappings, collisions, traversal, reserved names, Unicode and moving-parent
findings, quote-safe swaps and undo, executable portable-path regressions,
malformed import recovery, Plus safety gating, keyboard and skip-link use,
focus visibility, reduced motion, axe checks, labels, touch targets, responsive
overflow, legal and 404 routes, service-worker updates, installability, privacy
traffic, offline reload, and console/page errors.

## Independent local checks

```sh
/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ <evidence-dir>
# HTTP 200 in 580 ms; no console/page errors
# title, lang=en, one h1, main, alt text, and button names passed

npx @axe-core/cli http://127.0.0.1:4173/demo/ ...
# axe-core 4.13.0: 0 violations

lighthouse http://127.0.0.1:4173/ ...
# Performance 100; Accessibility 100; Best Practices 100; SEO 100
# FCP 0.9 s; LCP 1.5 s; TBT 60 ms; CLS 0

npm run verify:billing-rate-limit
# 240 requests: 30 x 200, 210 x 429
# every 429 included Retry-After
```

Production output remains inside the static PWA budgets:

- JavaScript: 36,388 bytes raw / 13,299 bytes gzip (`gzip -9`).
- CSS: 15,462 bytes raw / 4,223 bytes gzip (`gzip -9`).
- Hero WebP: 25,560 bytes; social WebP: 19,800 bytes.
- Service worker: `rpr-5109d7d4d4`, 17 files precached.

## Deployment and live identity

The repair-7 evidence commit `8bcf76b54e5986884198e200e44a789fbd4391e4`
was pushed to `origin/main`. Static deployment
`14a94a67-d6d1-480e-84dc-c4173f56ca9b` completed successfully from `dist/`
using `public/staticwebapp.config.json`:

```sh
/opt/fleet/lib/deploy-static.sh rename-plan-reviewer dist
# deployment succeeded; custom domain Ready; managed TLS URL returned 200

RPR_BASE_URL=https://rename-plan-reviewer.sociobot.in npm run test:e2e
# pass; 50/50 live checks across desktop and 390 px, with no retry

/opt/fleet/lib/verify-url.sh https://rename-plan-reviewer.sociobot.in/ ...
# HTTP 200; no console/page errors; semantic checks passed

npx @axe-core/cli https://rename-plan-reviewer.sociobot.in/demo/ ...
# axe-core 4.13.0: 0 violations
```

The live root has HSTS, `nosniff`, strict-origin referrer policy, restrictive
CSP, and Permissions-Policy. Hashed JavaScript is one-year immutable; `sw.js`
is `no-cache`; the manifest has `application/manifest+json` content type.
`/demo/`, `/privacy/`, `/terms/`, the manifest, robots, and sitemap return 200.
An unknown route returns the designed HTML 404.

Local production files and live response bodies are byte-identical:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `1a973b7280bf6d64f5f24bd4745c188a3a52c3ddc72bce7245f4dfa6529d70af` |
| `assets/main-D1EUE9dW.js` | `c3a6097201ccf8b17d552e9165131c964d32bff0f8154a3925c287ad5747acae` |
| `assets/main-DWHg--M3.css` | `99ab1ae0f374b0954af60f9df952bd7efda30c35407d4977b9fb510cc60e6780` |
| `sw.js` | `b5118a6d52990d996f486bf25982f652c7868ff78bfabaa1104daf73d54e943f` |
| `manifest.webmanifest` | `cce39d77046a39d0a4d541d6c83291616fd21f8beee2633d2dd4d92618306abe` |
| `assets/rename-ledger-social.webp` | `96bc3eeee4d2282ab4aba1ff814e244c532a5a239c96c804bbcb68f593c01ea7` |

## Known gaps

None in product behavior. New checkout remains unavailable because the factory
product is not enabled; the page states this plainly. Existing license restore
and the complete free workflow remain functional.
