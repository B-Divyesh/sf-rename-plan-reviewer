# Rename Plan Reviewer — polish round 1 handoff

## Status: repaired and ready to deploy

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

After this commit, a clean clone must run every exact command in
`.factory/claims.json`, then the deployed site must be cold-checked at
`https://rename-plan-reviewer.sociobot.in/` before release confirmation.

## Run locally

```sh
npm ci
npm test
npm run test:offline:mobile
npm run build
```

## Known gaps

None. Deployment and the final cold live re-check are recorded after the
work-order static deploy completes.
