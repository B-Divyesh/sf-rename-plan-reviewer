# Rename Plan Reviewer — polish round 1 handoff

## Status: repaired, deployed, and live-checked

This repair resolves every blocking, major, and minor item in
`.factory/review-1.md` (F-1-1 through F-1-32), while retaining the warm
graph-paper rename-laboratory identity documented in `.factory/design.md`.
The detailed finding-to-change mapping is in `.factory/polish-1.md`.

## What changed

- `/demo/` and `/?demo=1` now open an isolated, populated reviewer instead of
  a duplicate landing hero. The banner remains visible and provides Reset demo
  and Start for real; demo storage remains `demo:rename-plan-reviewer`.
- Added 12 missing concrete capability claims and their tagged browser tests,
  bringing the manifest to 18 one-to-one claim tests.
- Completed demo/legal/404 metadata, heading focus and route announcements,
  external-link labeling, README product links, footer attribution, and all
  plain-language rewrites from the adversarial review.
- Preserved existing safety repairs, including portable paths, staged cycles,
  script preflight, export gating, PWA offline reload, touch targets, and the
  Plus packet safety gate.

## Verification

Local verification completed before commit:

```sh
npm ci
npm run typecheck
npm run lint
npm run test:unit
npm test
npm run test:offline:mobile
```

- `typecheck` and `lint`: pass.
- Unit tests: 19/19 pass.
- Full Playwright suite: 78/78 pass across desktop Chromium and 390 × 844.
- Repeated 390 px offline suite: 20/20 pass.
- Build output: `dist/`; initial JS 37.79 KB raw / 13.74 KB gzip and CSS
  16.92 KB raw / 4.51 KB gzip, both within budget.
- Route verifier evidence is committed in `.factory/evidence/polish-1/`;
  root, demo, privacy, and terms have no console errors, one h1, one main,
  `lang=en`, useful titles, and complete image alt text.

Clean-clone verification was run at commit
`49281283be42f9082a58a0af52c6437097734e3c` in
`/tmp/rpr-clean-nti5vE` after `npm ci` (51 packages, zero vulnerabilities):

- Every one of the 18 exact commands from `.factory/claims.json` passed in
  both browser projects. The complete command output is
  `.factory/evidence/polish-1/clean-claims.txt`.
- `typecheck`, `lint`, and 19/19 unit tests passed; `npm test` passed 78/78
  browser tests; `npm run test:offline:mobile` passed 20/20 repeated reloads.
  The complete output is `.factory/evidence/polish-1/clean-full-suite.txt`.
- `npm run verify:billing-rate-limit` observed 30 HTTP 200 responses followed
  by 210 HTTP 429 responses, all 210 with `Retry-After`.

## Run locally

```sh
npm ci
npm test
npm run test:offline:mobile
npm run build
```

## Known gaps

## Deployment and cold live re-check

- Azure Static Web Apps deployment: `aa20c6d9-0259-4803-92be-796477421e7a`.
- The production host now serves the repaired asset
  `main-CiJ8jX0n.js`; an unknown route returns HTTP 404 with the designed
  404 document.
- Rebuilt/local and live SHA-256 values match: `index.html`
  `5965fdaab7a2499b969881d32232643012768209e67b432b9408ceff21381851`;
  `sw.js` `2beae3cb2df8f2fb3b79ffeb5da01092d5ab98a81c786cfcd792acc5c0e646b6`.
- `RPR_BASE_URL=https://rename-plan-reviewer.sociobot.in npm run test:e2e`:
  78/78 pass. Output: `.factory/evidence/polish-1/live-e2e.txt`.
- `/opt/fleet/lib/verify-url.sh` cold checks passed for `/`, `/demo/`,
  `/?demo=1`, `/privacy/`, and `/terms/`: HTTP 200, no console/page errors,
  route title, `lang=en`, one h1, one main, alt text, and named buttons.
  Desktop and 390 px captures/JSON are in `.factory/evidence/polish-1/live-*`.
- Cold mobile inspection of `/demo/` confirms the banner, seeded paths,
  “Plan needs correction” verdict, findings, no horizontal overflow, and
  usable 44 px controls in the first screen. The capture is
  `.factory/evidence/polish-1/live-demo/screenshot-mobile.png`.

## Known gaps

None.
