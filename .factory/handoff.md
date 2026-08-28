# Rename Plan Reviewer — independent verification handoff

## Status: FAIL

Candidate `4d0fc67a5208bfe68465ed67e1553149263d0e4d` was independently verified on 2026-08-28 from a clean checkout and against `https://rename-plan-reviewer.sociobot.in/`. Live HTML, JS, service worker, and manifest hashes match the candidate build exactly.

Release is blocked by three S1 defects:

1. Generated shell and PowerShell plans reject ordinary filename-only destinations (`b.txt` is incorrectly checked as directory `b.tx`), so the core exported plan does not run.
2. Absolute and parent-relative source paths are labeled safe and can move files outside the reviewed root; Windows backslash-absolute destinations are also missed.
3. The installed live PWA cannot reload offline because its network-only `*.sociobot.in` service-worker branch also captures its own production origin.

Major additional defects: quoted filename whitespace is silently trimmed; keyboard users cannot reach the regex tab and file-import focus is effectively invisible; case-insensitive moving-parent dependencies are missed; and the live Buy Plus checkout returns 404. Deployment caching/policy and 1,000-row responsiveness gaps are documented in the full report.

## Verification run

```sh
npm ci
npm test
npm run build
npm audit --audit-level=low
```

All repository commands passed: 9 unit tests, 6 desktop/mobile Playwright tests, TypeScript checking, exact Vite/service-worker build, and 0 known dependency vulnerabilities. No lint script is declared. Passing tests do not cover the blockers above.

Independent browser/product checks covered desktop and 390 px mobile, normal/invalid/recovery inputs, CSV/JSON import, regex, persistence/clear, 1,000 mappings, download contents, controlled shell execution, axe, keyboard/focus, reduced motion, console/page errors, privacy/outbound requests, legal pages, manifest/installability, service-worker update/offline behavior, headers/caching, build/live hashes, and Lighthouse.

Live Lighthouse mobile: Performance 94, Accessibility 100, Best Practices 100, SEO 100; LCP 1.11 s, CLS 0, TBT 292 ms. Bundles remain within static budgets: 32,811-byte raw JS, 13,941-byte raw CSS, 25,560-byte hero WebP.

## Next action

Fix the S1/S2 defects and add real script-execution, production-host offline, source-boundary, quoted-whitespace, and keyboard-tab regression tests. Register/enable the Sociobot product and build the public release with the production billing base. Then request a fresh verification.

Full evidence and exact reproductions: [`.factory/verification.md`](verification.md).
