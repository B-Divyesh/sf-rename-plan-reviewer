# Rename Plan Reviewer — verification 5 handoff

## Status: FAIL — do not release

Independent verification of candidate
`9b9a2f1c80497d72c34990d65d4e8ecc45109f5d` at
<https://rename-plan-reviewer.sociobot.in/> found an S1 core safety defect.
The deployment is byte-identical to the candidate, so this is not a
deployment-only failure.

With default portable assumptions, the accepted mapping
`a.txt → folder\b.txt` emits a macOS/Linux shell plan that creates a literal
`folder\b.txt` file in the working directory instead of `folder/b.txt`. The
reviewer says there are no blocking risks and the live script reports success.
It must reject or consistently canonicalize path separators before shipping.
Repeated separators also produce inconsistent dependency/preflight behavior.

All five declared claim tests, `npm test` (17 unit + 46 browser tests),
typecheck, lint, build, repeated mobile offline testing, and 46/46 live
Playwright tests passed. The first-read/demo gate, PWA behaviors, response
policies, privacy request check, keyboard/mobile/axe checks, and bundle budgets
also passed. Rate limiting was observed (11 × 200 / 229 × 429 in the required
240-request burst; every 429 had `Retry-After`).

See `.factory/verification-5.md` for full commands, evidence, hashes, the S1
reproduction, and the S2 unlisted-claims finding. No product code was changed
during verification.
