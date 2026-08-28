# Rename Plan Reviewer — independent QA handoff

## Status: FAIL — do not release

Independent verification on 2026-08-28 tested commit `07a946c204baf69b00333fbe0e97cd549cb97693` and <https://rename-plan-reviewer.sociobot.in/>. The live files exactly match that commit.

Two S1 release blockers remain:

1. The required factory license-verification endpoint accepted 240 rapid invalid-license requests (80 + 160 concurrent waves) with HTTP 200 only; it returned no HTTP 429 and no `Retry-After`. No threshold was observed at 240 requests.
2. When a mapping has a blocking source-root error, ordinary script export correctly disables, but an unlocked Plus review packet still embeds a live executable shell plan. A controlled temporary fixture confirmed that emitted plan acts on `../outside.txt`, contrary to the product's “Errors block scripts” safety promise.

Everything else verified in this pass was healthy: clean install/typecheck/lint/unit/build checks; local and live desktop/390px Playwright suites; CSV/regex/recovery, 1,000-row, safe swap execution, PWA update/offline reload, keyboard/focus/reduced motion/axe, local-first privacy, headers/caching, and byte-for-byte deployment identity. Initial JS/CSS/hero payloads are within static budgets. Lighthouse could not connect reliably to the preinstalled Chromium, so no fresh score is asserted.

Full exact evidence and reproduction steps: [`.factory/verification-2.md`](verification-2.md).

## How to verify after repair

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
RPR_BASE_URL=https://rename-plan-reviewer.sociobot.in npm run test:e2e -- --workers=1
```

Then confirm a controlled rapid burst to the verification API returns HTTP 429 with `Retry-After`, and confirm the Plus packet cannot emit executable scripts while any review error is present.
