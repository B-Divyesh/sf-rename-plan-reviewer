# Rename Plan Reviewer — repair 8 handoff

## Status: repaired, verified, and deployed

Release blocker from independent report commit `4c57684`: fixed and covered by
regression test. The repaired product commit is `6e16e19` and is live at
<https://rename-plan-reviewer.sociobot.in/>. Azure Static Web Apps deployment
ID: `529d144e-c80b-4ecc-bc83-ba137e8c1dc7`.

## What changed

- Added a 44 px minimum width to every primary-navigation, footer, inline
  legal, and legal-page link target. Existing 44 px minimum height remains.
- Centered the expanded inline targets without changing their labels or
  destinations. Header and footer navigation retain their 16 px gaps.
- Added a browser regression that measures all eight header, Plus-legal, and
  footer anchors on `/demo/`, requires each bounding box to be at least
  44 × 44 CSS px, and requires at least 8 px between adjacent navigation
  targets. It runs in desktop and 390 × 844 profiles.
- Preserved the researched brief, visual thesis, local-first workflow, demo
  isolation, claims, PWA deployment class, billing behavior, and passing
  product behavior.

## Reproduction and repair evidence

Before the CSS change, the new regression failed on the same measurements as
the verifier: header Demo was 30.03 × 44 px; header Terms 37.55 × 44 px;
inline Terms/Privacy 33.93–41.68 × about 44.1 px; footer Privacy, Terms, and
Source 32.58–40.05 × 44 px.

After the repair, live 390 px measurements are:

- Header: Demo 44 × 44, Privacy 52.56 × 44, Terms 44 × 44 px.
- Inline legal: Terms and Privacy 44.15 × 44.15 px.
- Footer: Privacy, Terms, and Source 44 × 44 px.

## Local verification

- `npm ci`: 51 packages installed, 0 vulnerabilities.
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm run test:unit`: 19/19 pass.
- `npm test`: production build plus 52/52 Playwright checks pass across desktop
  Chromium and 390 × 844 Chromium.
- Every exact command in `.factory/claims.json`: six claims, 2/2 desktop/mobile
  checks each, all pass.
- `npm run test:offline:mobile`: 20/20 controlled 390 px offline reloads pass.
- `/opt/fleet/lib/verify-url.sh`: root, demo, privacy, and terms all return 200
  with no console/page errors; each has a title, `lang=en`, one `h1`, `main`,
  image alt text, and named buttons.
- Playwright Axe: zero serious or critical findings on desktop and populated
  390 px demo, including privacy and terms. Keyboard skip link, tab controls,
  visible focus, findings-region scrolling, reduced motion, no horizontal
  overflow, and service-worker update behavior pass.
- Visual inspection completed for full-page desktop and 390 px demo captures;
  widened targets preserve the intended notebook layout.
- Mobile Lighthouse on the production preview: performance 93, accessibility
  100, best practices 100, SEO 100; LCP 1.5 s, CLS 0.003, TBT 310 ms.
- Static budgets: JS 36,388 bytes raw / 13,298 gzip; CSS 15,515 bytes raw /
  4,242 gzip; hero WebP 25,560 bytes; social WebP 19,800 bytes.
- `npm run verify:billing-rate-limit`: 240 requests produced 30 × 200 and
  210 × 429; every 429 included `Retry-After`.

The standalone `@axe-core/cli` was also attempted. Its downloaded ChromeDriver
152 cannot start the provided Chromium 145. The maintained Playwright Axe
integration ran against that supplied browser and passed; this is a CLI driver
mismatch, not a product finding.

## Live verification

- `RPR_BASE_URL=https://rename-plan-reviewer.sociobot.in npm run test:e2e`:
  52/52 pass in desktop and 390 px profiles.
- Live `verify-url.sh` passes on `/` and `/demo/` with no console/page errors.
- `/`, `/demo/`, `/privacy/`, `/terms/`, manifest, robots, sitemap, and the
  designed 404 route were checked. Unknown routes return HTTP 404.
- HTTPS serves HSTS, `nosniff`, strict-origin referrer policy, restrictive CSP,
  and Permissions-Policy. Hashed assets are one-year immutable; `sw.js` is
  `no-cache`; HTML revalidates.
- Network/privacy coverage confirms ordinary demo review traffic remains
  same-origin. The only allowed cross-origin runtime path is the tested
  Sociobot license verification endpoint. There is no sign-in flow, so tenant
  identity validation is not applicable.
- Rebuilt and live artifact hashes match exactly:
  - `index.html`: `5676969c1871a6e40edd7ae52d80eea858bd696c4692124f770210424f2f2207`
  - `sw.js`: `8b86bb5e8cd9abb600bcda887f7a1cb5e5e861039ad0e4b1be9b88512eaf918f`
  - `manifest.webmanifest`: `cce39d77046a39d0a4d541d6c83291616fd21f8beee2633d2dd4d92618306abe`
  - `assets/main-DCFLyqXe.css`: `2c45867761a49ba81acb31412060459f9e0c6b5b6ecf813e64ea36f193a3be7a`
  - `assets/main-asEGVDlZ.js`: `b00bb0609d6091ba80ea6e8ab9b1d806e30a3a517445f8b0e9595e6f466aeb45`

## Run and verify

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run test:offline:mobile
```

`npm run build` writes the deployable static PWA to `dist/`. Package/consumer
verification does not apply to this static PWA artifact.

## Known gaps

No known product gaps remain from verification report 6.
