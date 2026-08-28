# Rename Plan Reviewer — repair handoff

## Status

Release-blocking findings from independent verification 3 are repaired. This
handoff is for the repair of candidate `fb8013ed03dd7f3c67b7a784d26fecce22917f0b`
against report `705490ebc2fd09c3cbf83cb3a91047650dbf31df`.

## What changed

- Added `.factory/claims.json` with five observable browser claims and exactly
  one `@claim:<id>` Playwright test for each.
- Added `/demo/` and `/?demo=1`: a risky, immediately populated sample plan,
  persistent demo banner, Reset demo, and Start for real. Demo drafts use the
  isolated `demo:rename-plan-reviewer` IndexedDB database and never restore or
  overwrite the real draft. `.factory/demo.md` documents the contract.
- Rewrote the first screen in plain language: “Review batch renames before you
  run them,” names the intended person, and adds the visible sample-data action.
- Made the scrollable findings list keyboard focusable, with a designed focus
  ring. The regression uses the populated sample at 390 × 844 with reduced
  motion and runs axe against that exact state.
- Added direct demo, legal metadata, canonical/OG/Twitter/apple metadata on the
  landing page, `robots.txt`, `sitemap.xml`, real 404 document/configuration,
  and an in-product primary nav.

## Verification evidence

Clean install and local verification on 2026-08-28:

```sh
npm ci                         # 51 packages; 0 vulnerabilities
npm run typecheck              # pass
npm run lint                   # pass
npm run test:unit              # 17 tests pass
npm test                       # 40 desktop/mobile Playwright tests pass
npm run build                  # pass; dist/ generated
npm run verify:billing-rate-limit
# {"requests":240,"statusCounts":{"200":30,"429":210},"retryAfterOn429":210}
```

The full Playwright run covers desktop and 390px mobile, keyboard navigation,
screen-reader semantics, console/page-error checks, axe serious/critical checks,
privacy request capture, downloads, service-worker update, offline reload, and
the complete core rename workflows. The populated-demo 390px axe test passes.
Claim tests use the direct demo path and prove sample review, storage isolation,
same-origin-only review traffic, offline reload, and dry-run shell export.

Production output: `dist/` contains index, demo, privacy, terms, 404,
manifest/service worker, crawl assets, and static deployment configuration. The
initial JS is 36.28 KB raw / 13.33 KB gzip; CSS is 15.34 KB raw / 4.19 KB gzip.

## Deploy

Static deployment uses `dist/` and `public/staticwebapp.config.json`. Live
deployment identity is checked after push/deployment.

## Known gaps

None for the verifier findings. Lighthouse was not installed in this worker;
the bundle budgets and browser accessibility checks above were run locally.
