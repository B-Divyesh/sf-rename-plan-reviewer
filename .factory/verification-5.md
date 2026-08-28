# Independent product verification 5 — FAIL

Verified 2026-08-28 against candidate commit
`9b9a2f1c80497d72c34990d65d4e8ecc45109f5d` and the live deployment
<https://rename-plan-reviewer.sociobot.in/>.

## Verdict

**FAIL — do not release.** The candidate is deployed exactly and all declared
claim tests, local automated tests, and live automated tests pass. Independent
end-to-end execution found that the default, supposedly portable path handling
can generate a shell plan that renames a file to the wrong pathname. This
violates the core requirement to validate portable mappings and emit a safe,
reversible shell/PowerShell plan before files are touched.

## First-read test — pass

I opened the live site in a fresh browser context with no stored data. The
first screen says:

- **What:** “Review batch renames before you run them.”
- **For whom:** “For people preparing risky spreadsheet or regex batch
  renames.”
- **What to click first:** **Try it with sample data**, with the adjacent plain
  explanation “Loads a risky sample plan to inspect.”

That link reaches `/demo/` in one click. The populated demo displays the
persistent “Demo — sample data, nothing is saved” banner and has **Reset demo**
and **Start for real** controls. The first-read/demo-sandbox release gate
passes.

## Release-blocking defect

### S1 — accepted portable backslash paths generate the wrong POSIX rename

Reproduced against the rebuilt candidate through the actual UI, with default
**portable** filesystem assumptions:

```csv
current,new
a.txt,folder\b.txt
```

The reviewer reports **“No blocking risks found”**, enables **Export shell
plan**, and its live plan prints `Applied 1 renames.` when run in a temporary
directory containing `a.txt` and `folder/`. The actual result is:

```text
root entries: ["folder", "folder\\b.txt", "plan.sh"]
folder/b.txt exists: false
folder\\b.txt exists: true
```

The UI and analysis treat `\` as a path separator (`pathParts` normalizes it),
but `shellPlan` quotes and emits the original target unchanged. On macOS/Linux
that creates a literal backslash in a filename instead of using the intended
directory separator. The default portable mode therefore silently produces a
different, non-portable plan while claiming the mapping is safe.

Related normalization evidence: this accepted clean plan also fails before
staging, even though its second source is the same path as its first target:

```csv
current,new
a.txt,folder//b.txt
folder/b.txt,c.txt
```

The generated live shell plan exits `Destination already exists:
folder//b.txt`. Dependency and preflight keys do not canonicalize repeated
separators consistently. This is the same path-canonicalization defect.

Repair by either rejecting ambiguous/mixed-separator mappings before export,
or canonicalizing paths consistently for validation, dependency ordering,
preflight checks, and platform-specific emitted commands. Add executable
integration coverage for both cases; at minimum, assert that a portable
backslash mapping exports `folder/b.txt` for the shell plan (or is blocked with
a clear finding) and never creates a literal-backslash filename.

### S2 — commercial/availability statements are not registered as claims

The live landing page states “One-time US $12,” describes what Plus adds, and
states “New Plus purchases are temporarily unavailable. Existing licenses can
still be restored below.” None is represented in `.factory/claims.json` with
one tagged demo/sandbox test, as required by the claims contract. Either add
observable tagged tests where the statement is supportable, or remove/soften
the untestable visitor-facing statements. This did not cause the S1 verdict,
but is a release-required claims-contract gap.

## Required claims — all pass

From the clean candidate after `npm ci` (51 packages, 0 vulnerabilities), I
ran every command listed in `.factory/claims.json` before broader QA. Each
passed in both desktop Chromium and the 390px project through the direct demo
entry point. Each claim has exactly one matching tag in `tests/`.

| Claim | Result |
| --- | --- |
| `risky-sample-review` | pass — 2/2; direct `/demo/` displays the reserved-name error |
| `demo-isolated` | pass — 2/2; demo edits do not change the real draft |
| `local-only` | pass — 2/2; demo review traffic is same-origin only |
| `offline-reload` | pass — 2/2; controlled demo reload works offline after first visit |
| `dry-run-export` | pass — 2/2; generated shell output prints commands rather than renaming |

Exact commands were the five `npm run build && npm run test:e2e -- --grep
@claim:<id>` commands declared in the JSON file.

## Automated and functional evidence

- `npm test` passed: **17/17** Vitest tests, production build, and **46/46**
  Playwright tests.
- `npm run typecheck`, `npm run lint`, `npm run test:unit`, and the exact
  `npm run build` all passed independently. The production build produced
  `dist/`.
- `npm run test:offline:mobile` passed its 20 repeated controlled mobile
  offline reloads.
- `RPR_BASE_URL=https://rename-plan-reviewer.sociobot.in npm run test:e2e`
  passed **46/46** against the live deployment (desktop and 390px).
- The passing suite exercises quoted swaps and an executable reversible shell
  plan, dry-run and live commands, CSV/JSON import recovery, traversal,
  reserved-name, collision, case-folding, Unicode, numbering, cycle, and
  moving-parent findings; regex input; 1,000 mappings; license gating; legal
  pages; service-worker update; and offline reload. The S1 inputs above are
  additional independent cases missing from that suite.

## Accessibility, privacy, PWA, response policy, and performance

- The live 46-test run includes axe checks with **zero serious/critical
  findings** at desktop and 390px, keyboard skip-link/tab/focus checks,
  reduced-motion checks, touch-target checks, and no horizontal overflow.
  `verify-url.sh` independently reported 200, no console/page errors,
  `lang=en`, one `h1`, `main`, labels, and no missing image alt text.
- A cold live load made only same-origin requests for HTML, hashed JS/CSS, and
  the locally hosted illustration. There are no analytics or CDN fonts. The
  only permitted external connection in CSP is the Sociobot license API;
  there is no sign-in flow.
- Live headers include HSTS, `X-Content-Type-Options: nosniff`, strict-origin
  referrer policy, restrictive CSP, and Permissions-Policy. Hashed JS is
  one-year immutable and `sw.js` is revalidatable (`no-cache`). `/demo/`,
  legal routes, manifest, robots, sitemap, and the designed 404 have their
  expected 200/404 responses.
- PWA installability, controlled service-worker update, and offline reload are
  covered by the passing live suite. The manifest is valid and has 192/512 and
  maskable icons.
- Build sizes are within budget: JS **36,338 bytes raw / 13,355 gzip**, CSS
  **15,462 / 4,209 gzip**, hero WebP **25,560 bytes**, social WebP **19,800
  bytes**. A fresh Lighthouse invocation could not connect to the container's
  Chromium despite an explicit `CHROME_PATH`; this is an environment/tooling
  limitation, not recorded as a product score. The automated browser checks
  and bundle measurements above completed successfully.

## Rate limiting

`npm run verify:billing-rate-limit` made the required 240-request burst to the
Sociobot license-verification endpoint and returned **11 × 200, 229 × 429**;
all 229 throttled responses included `Retry-After`. A subsequent 60-request
burst while the same IP bucket was still saturated returned **2 × 200, 58 ×
429**, also with `Retry-After` (first returned result was a 429 with
`Retry-After: 1`). Thus rate limiting is confirmed; this run observed 429s
after no more than 11 accepted requests, but concurrent response ordering and
the already-warm bucket do not establish a stable exact threshold.

## Candidate/deployment identity

Fresh local build and live SHA-256 values match exactly:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `fefdb29efa411bc35af29f0f995c5d37cc9a5b237e52c33b802abe76961948dc` |
| `assets/main-BSq2Hg9x.js` | `9d57055ef657dd0a5654078b2ccb33168b57aaa70b1c89dd4292e9b19b131764` |
| `assets/main-DWHg--M3.css` | `99ab1ae0f374b0954af60f9df952bd7efda30c35407d4977b9fb510cc60e6780` |
| `sw.js` | `1147745e876a06e858e86e298e45a1c2e95f13c398d278ba5f548e40bcc26f28` |
| `manifest.webmanifest` | `cce39d77046a39d0a4d541d6c83291616fd21f8beee2633d2dd4d92618306abe` |
| `assets/rename-ledger-social.webp` | `96bc3eeee4d2282ab4aba1ff814e244c532a5a239c96c804bbcb68f593c01ea7` |

The live site is therefore the tested candidate; the S1 is not a stale or
deployment-only discrepancy.
