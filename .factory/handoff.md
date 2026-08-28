# Rename Plan Reviewer — repair 6 handoff

## Status

All release-blocking findings in verifier report commit
`482bf4b6c639d5cd11da15e4a4e643ca6cbf6647` for candidate
`9b9a2f1c80497d72c34990d65d4e8ecc45109f5d` are repaired in
`2847e935835071031a29dc6200956de57730ff88`. The researched scope, static
offline PWA artifact class, notebook visual system, isolated demo, local-first
storage, free safety checks, and previously passing behavior are preserved.

## Findings repaired

1. **Portable paths now have one canonical representation.** Both slash styles
   are treated as separators and adjacent separators collapse before
   comparison, dependency analysis, staging, preflight, and export. Shell plans
   emit `/`; PowerShell plans emit `\`. The exact reported
   `a.txt → folder\b.txt` plan now creates `folder/b.txt`, never a
   literal-backslash root filename. The reported
   `a.txt → folder//b.txt → c.txt` dependency now stages and applies both
   renames instead of failing preflight.
2. **Commercial and availability copy is registered and testable.** The page
   now says checkout is unavailable as a direct UI state, without an
   untestable timing claim. `.factory/claims.json` registers the US $12 Plus
   package, combined packet, paused checkout, and existing-license restore
   behavior under `@claim:plus-offer-status`. Its clean browser test starts
   at `/demo/`, checks the displayed offer, follows **Start for real**, mocks
   the documented Sociobot verification response, restores a license, and
   downloads a packet containing both scripts. The terms and copy audit use
   the same wording.

Exact regression coverage exists at two levels:

- `tests/analyze.test.ts` generates platform-specific shell and PowerShell
  paths, executes both verifier shell scenarios in temporary directories, and
  checks contents plus the absence of a literal-backslash filename.
- `tests/e2e/qa-temp.spec.ts` enters both reported CSV inputs through the real
  UI, downloads the live shell plan, executes it, and checks the resulting
  filesystem. It runs in desktop and 390px projects.

## Local verification evidence

Run on 2026-08-28 with Node 22.23.2, npm 10.9.8, and Playwright 1.58.2:

```sh
npm ci
# 51 packages installed; 0 vulnerabilities

npm run typecheck
npm run lint
npm run test:unit
# pass; 19/19 unit tests

npm test
# pass; production build plus 50/50 Playwright tests
# desktop Chromium and mobile Chromium at 390 × 844

npm run test:offline:mobile
# pass; 20/20 repeated controlled mobile offline reloads
```

Every command in `.factory/claims.json` was run separately after the clean
install. All six passed 2/2 across desktop and 390px, and every claim ID occurs
in exactly one tagged test.

Additional release checks:

```sh
/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ /tmp/rpr-repair-verify-local
# HTTP 200; 597ms; no console/page errors
# title, lang=en, one h1, main, alt text, and button names pass

npx @axe-core/cli http://127.0.0.1:4173/demo/ ...
# axe-core 4.13.0: 0 violations

lighthouse http://127.0.0.1:4173/ ...
# Performance 100; Accessibility 100; Best Practices 100; SEO 100
# FCP 0.9s; LCP 1.2s; TBT 70ms; CLS 0

npm run verify:billing-rate-limit
# 240 requests: 30 × 200, 210 × 429
# every 429 included Retry-After
```

The full browser suite also rechecked CSV/JSON recovery, regex input, 1,000
mappings, collision/traversal/reserved-name/Unicode/moving-parent findings,
quoted swaps and undo, safe Plus gating, keyboard tabs and skip link, visible
focus, reduced motion, serious/critical axe findings, labels, touch targets,
legal and 404 routes, service-worker update, installability, privacy traffic,
offline reload, no console/page errors, and no horizontal overflow. Desktop
and 390px screenshots were inspected. The first screen remains immediately
clear and the revised Plus copy has no sentence over 22 words or banned term.

Production output remains inside the static PWA budgets:

- JavaScript: 36,388 bytes raw / 13,299 bytes gzip.
- CSS: 15,462 bytes raw / 4,234 bytes gzip.
- Hero WebP: 25,560 bytes; social WebP: 19,800 bytes.
- Service worker: `rpr-5109d7d4d4`, 17 files precached.

PowerShell output is covered by generation and safety assertions. PowerShell
Core is not installed in this Linux worker, so the `.ps1` was not executed
here. This matches the verifier environment and is not a product gap.

## Deployment and live identity

The repair and evidence commits were pushed to `origin/main`. Static deployment
`2be7db7c-89cb-450a-9097-07641d8f967b` completed successfully from `dist/`
using `public/staticwebapp.config.json`:

```sh
/opt/fleet/lib/deploy-static.sh rename-plan-reviewer dist
# custom domain Ready; managed TLS URL returned HTTP 200
```

Live verification at <https://rename-plan-reviewer.sociobot.in/>:

```sh
/opt/fleet/lib/verify-url.sh https://rename-plan-reviewer.sociobot.in/ ...
# HTTP 200; 939ms; no console/page errors; semantic checks pass

RPR_BASE_URL=https://rename-plan-reviewer.sociobot.in npm run test:e2e
# pass; 50/50 desktop and 390px tests

npx @axe-core/cli https://rename-plan-reviewer.sociobot.in/demo/ ...
# axe-core 4.13.0: 0 violations
```

The live root has HSTS, `nosniff`, strict-origin referrer policy, restrictive
CSP, and Permissions-Policy. Hashed JavaScript is one-year immutable;
`sw.js` is `no-cache`; the manifest has `application/manifest+json`.
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
