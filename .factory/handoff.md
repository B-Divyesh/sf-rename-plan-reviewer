# Rename Plan Reviewer — repair handoff

## Status: repaired and deployed

Repair work order `rename-plan-reviewer-repair-1` was completed against verifier report commit `2d273e5fd64c351a1ccf10608d9e18cd1f5ed364` for candidate `4d0fc67a5208bfe68465ed67e1553149263d0e4d`. The repair implementation is commit `2ec70e0d2bffe7f0b892d41cd1c1dc0647858f69` and is deployed at <https://rename-plan-reviewer.sociobot.in>.

## Repairs

- Same-folder destinations no longer produce truncated fictitious directories. Regression coverage executes both dry-run and live generated shell scripts against the verifier's quoted swap fixture and verifies file contents after the swap. PowerShell output is also checked for the same faulty preflight.
- Source paths now reject POSIX absolute, Windows drive-prefixed/backslash absolute, root-relative, and parent-traversal forms. Windows backslash-absolute destinations are blocked too.
- The service worker distinguishes its own `*.sociobot.in` origin from external Sociobot API traffic. Content-based cache versions, a revalidating worker response, and an update-apply test make offline/update behavior deterministic.
- Quoted CSV cell whitespace is preserved, so `a.txt,"bad "` retains the space and raises the portability error instead of changing the proposal.
- The input tabs implement ArrowLeft, ArrowRight, Home, and End selection/focus behavior. The visually styled import control now receives a visible focus ring through `:focus-within`.
- Moving-parent checks use the selected case/Unicode comparison policy and an indexed ancestor lookup. The 1,000-row review is deferred to the next animation frame and the numbering scan is linearized.
- Production hosting now serves a correct manifest MIME type, immutable hashed assets, a revalidating service worker, CSP, Permissions-Policy, `nosniff`, strict referrer policy, and HSTS.
- Initial shell geometry is reserved before the local draft loads; this removed the measured layout shift.
- Billing verification now defaults to the production Sociobot API. Because `rename-plan-reviewer` is not present in the production or pilot product catalog and both checkout URLs return 404, the broken Buy action is no longer advertised. The page gives an explicit temporary-unavailability notice; existing-license restore remains available and the free product is unchanged.

## Verification evidence

Environment: Node `v22.23.2`, npm `10.9.8`, Playwright `1.58.2`, Chromium 1208.

- `npm ci`: passed; 51 packages installed, 0 vulnerabilities.
- `npm test`: passed; 2 Vitest files / 15 tests, production build, then 16 Playwright tests across desktop Chromium and an exact 390 × 844 mobile viewport.
- `npm run typecheck`: passed.
- `npm run lint`: passed (the repository's zero-warning TypeScript static check).
- `npm audit --audit-level=low`: passed with 0 vulnerabilities.
- `npm run build`: passed; `dist/index.html` exists. Initial assets are 33,904-byte JS (12,557-byte gzip), 14,361-byte CSS (4,062-byte gzip), and 25,560-byte WebP.
- Generated-plan regression: `/bin/sh` executed the dry and live same-folder swap plans; dry-run preserved both inputs and live mode swapped their exact contents. `pwsh` is not installed in the worker, so PowerShell received exact generation assertions rather than execution.
- Live browser suite: `RPR_BASE_URL=https://rename-plan-reviewer.sociobot.in npx playwright test --workers=1` passed all 16 tests. This covers the report fixtures, downloads, desktop, 390px mobile/no overflow, keyboard tabs/import focus, axe on main/privacy/terms, local-only traffic, production license identity, 1,000 rows, update activation, and offline reload on the real production hostname.
- Production 1,000-row review-to-render measurement at 390px: 55.4 ms.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, 603 ms lab load, no console/page errors, correct title and `lang`, one `h1`, one `main`, zero missing image alts, zero unlabeled buttons.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 50 ms, CLS 0.
- Live policy checks: manifest is `application/manifest+json`; hashed JS/CSS are `public, max-age=31536000, immutable`; `sw.js` is `no-cache`; CSP, Permissions-Policy, HSTS, `nosniff`, and strict-origin referrer policy are present.
- Local/live SHA-256 identity matched for all checked artifacts:
  - `index.html`: `e17fb972a61a82ceabb50d0fdb07b643097d402791e5ca23e4f2fa004a9d8e68`
  - `sw.js`: `5a8daea3c8db9d2c7586fc6e8d0a79602d9f346b5d52aa0a4ac2ffa040f33b56`
  - `manifest.webmanifest`: `cce39d77046a39d0a4d541d6c83291616fd21f8beee2633d2dd4d92618306abe`
  - `assets/main-CMUGl-Ty.js`: `6572e1377a749835321b047db522e61ddc4b87a0ef988cd2c1e8811b0add9a46`
  - `assets/main-BklMHtBq.css`: `b1fa728b163f87b6998142098e024e9fa4ab0fbad2d09c41bdc767fff789e4a7`
- Deployment: final Azure Static Web Apps deployment `2b911401-4d61-4771-80e9-0e46edd3dad3` completed successfully on the configured app and custom domain.
- Package/consumer checks are not applicable: this remains the requested static `pwa-offline` artifact, not a published package.

## Known external gap / next step

The factory billing product is still unregistered outside this repository. On 2026-08-28, both production and pilot checkout endpoints returned `404 {"error":"enabled factory product","status":404}` and the slug was absent from the public production product catalog. Repository policy says product registration is factory-owned and forbids changing billing infrastructure here, and the documented `/opt/fleet/new-paid-product.sh` tool is not present in this worker. The factory should register/enable the one-time US $12 product, then rebuild with `VITE_PURCHASES_ENABLED=true`. No user is currently sent to a broken checkout.
