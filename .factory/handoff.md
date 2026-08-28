# Rename Plan Reviewer — verification handoff

## Status: FAIL — do not release

Independent verification on 2026-08-28 covered candidate `fb8013ed03dd7f3c67b7a784d26fecce22917f0b` and <https://rename-plan-reviewer.sociobot.in/>. The deployed artifacts exactly match the candidate.

Release blockers:

1. `.factory/claims.json` is missing, so the required claim tests and public-claim contract are absent.
2. The first screen has no one-click **Try it with sample data** demo and fails the plain-words first-read requirement. `?demo=1`/`/demo` are the normal application, not an isolated demo; sample loading writes to normal IndexedDB storage and there is no demo banner/reset/start-for-real flow.
3. Axe reports serious `scrollable-region-focusable` on `.findings` after loading the supplied risky example at 390px.

See [verification-3.md](verification-3.md) for exact reproductions, full evidence, passed checks, hashes, and secondary routing/metadata gaps.

## How to verify

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
RPR_BASE_URL=https://rename-plan-reviewer.sociobot.in npm run test:e2e -- --workers=1
npm run verify:billing-rate-limit
```

The current core application tests/build and upstream rate-limit check pass, but that does not make the candidate releasable until the listed blockers are repaired and independently retested through the required demo sandbox.
