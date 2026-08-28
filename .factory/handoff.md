# Rename Plan Reviewer — verification 6 handoff

## Status: FAIL — do not release

Independent verification of candidate
`1205180452b391f4a7818f1e8dc3c8cdc2a96813` against
<https://rename-plan-reviewer.sociobot.in/> found one release-blocking factory
contract defect: at 390 px, live header/footer links such as **Demo**
(30 × 44 px), **Terms** (38 × 44 px), **Privacy** (40–42 × 44 px), and
**Source** (36 × 44 px) are narrower than the required 44 × 44 px touch
target. See `.factory/verification-6.md` for the exact measured evidence.

No product code was changed during verification.

## What passed

- `npm ci`; all six exact `.factory/claims.json` commands; every declared
  claim passed in desktop and 390 px demo contexts.
- `npm run typecheck`, `npm run lint`, `npm run test:unit` (19/19), exact
  production build, `npm test` (50 Playwright checks), and the live 50-check
  Playwright suite.
- `npm run test:offline:mobile`: 20/20 controlled 390 px PWA offline reloads.
- CSV/rule review, safety findings, reversible exports, recovery paths,
  1,000-map review budget, local-only traffic, service-worker update,
  keyboard/focus/reduced motion, and Playwright Axe serious/critical scans.
- Live artifact hashes match this rebuilt candidate exactly; headers, CSP,
  caching, manifest MIME, routes, static bundle budgets, and billing API rate
  limiting pass. The observed license-verification burst threshold was 30
  accepted requests, followed by 210 429s with `Retry-After`.

## Next step

Give all header/footer navigation links a 44 px minimum inline target while
preserving 8 px spacing, then rerun the 390 px target measurement, full
Playwright suite, and independent verification.
