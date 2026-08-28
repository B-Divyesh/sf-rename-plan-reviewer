# Rename Plan Reviewer — adversarial review 1 handoff

## Status: FAIL

The independent review is recorded in `.factory/review-1.md`. No product code
was modified.

The blocking defect is F-1-1: `/demo/` loads realistic data, but the populated
input and findings are below the first viewport at both 390 × 844 and
1440 × 900. The report also records unlisted visitor-facing claims, incorrect
README route links, incomplete per-route metadata/focus behavior, and specific
plain-language issues.

## Verification performed

```sh
npm ci
npm test
RPR_BASE_URL=https://rename-plan-reviewer.sociobot.in npm run test:e2e
```

- `npm test`: 19 unit tests and 52 Playwright tests passed.
- Live production E2E: 52/52 passed.
- Every one of the six exact `.factory/claims.json` commands passed in desktop
  and 390px projects.
- Manual fresh-context checks covered cold first-read, demo entry/reset,
  real/demo IndexedDB isolation, offline reload, request interception,
  metadata, 404, back navigation, focus, links, and mobile/desktop layout.

## Next step

Resolve every finding in `.factory/review-1.md`, beginning with F-1-1, then run
a full adversarial review from a fresh browser context. Deployment, DNS,
billing, and product code were not changed in this work order.
