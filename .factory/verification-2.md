# Independent product verification — FAIL

Verified 2026-08-28 against candidate commit `07a946c204baf69b00333fbe0e97cd549cb97693` and <https://rename-plan-reviewer.sociobot.in/>.

## Verdict

**FAIL — do not release.** The deployed files exactly match this candidate and the core local workflow is otherwise in good shape, but two release-blocking acceptance failures remain: the only live product API endpoint did not rate-limit a controlled rapid-request check, and the paid combined review packet includes executable live scripts even when the review has blocking path-safety findings.

Severity: S1 = release blocker/core safety or explicit contract failure; S2 = major workflow failure; S3 = non-blocking quality issue.

## Candidate and deployment identity

- Clean detached worktree created at the requested SHA; `npm ci` installed 51 packages with 0 audit vulnerabilities.
- Fresh local/live SHA-256 equality was confirmed for every application artifact checked:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `e17fb972a61a82ceabb50d0fdb07b643097d402791e5ca23e4f2fa004a9d8e68` |
| `sw.js` | `5a8daea3c8db9d2c7586fc6e8d0a79602d9f346b5d52aa0a4ac2ffa040f33b56` |
| `manifest.webmanifest` | `cce39d77046a39d0a4d541d6c83291616fd21f8beee2633d2dd4d92618306abe` |
| `assets/main-CMUGl-Ty.js` | `6572e1377a749835321b047db522e61ddc4b87a0ef988cd2c1e8811b0add9a46` |
| `assets/main-BklMHtBq.css` | `b1fa728b163f87b6998142098e024e9fa4ab0fbad2d09c41bdc767fff789e4a7` |
| `assets/rename-ledger.webp` | `b811c60ac0825ad093de2108c6537807f3755d79cfe19a94a96a45fb1501cc8d` |

The defects below therefore apply to the requested candidate as deployed, not an older deployment.

## S1 defects

### Product license-verification API has no observed rate limit

The static product has no server routes of its own. Its one server-side dependency is the factory product-unlock request:

`GET https://api.sociobot.in/api/v1/products/rename-plan-reviewer/verify?license=<token>`

The acceptance contract explicitly includes factory product-unlock calls in the rate-limit check. Two immediate concurrent QA waves, 80 then 160 distinct invalid license values, returned **240/240 HTTP 200** responses. No response was HTTP 429 and no `Retry-After` header was observed. The threshold was therefore **not observed at 240 rapid requests**.

This fails the requirement that a burst must begin returning HTTP 429 with `Retry-After`. The endpoint returns the expected `200`, `Cache-Control: no-store`, and `{ valid: false, reason: "invalid" }` for a single invalid token, but it needs a rate limit before release.

### A blocked plan can still yield a live executable script in the Plus review packet

The ordinary shell and PowerShell buttons correctly disable when a review has errors. The Plus-only `Export Plus review packet` handler does not apply the same safety gate.

Reproduction on the live app:

1. Use a valid cached Plus verdict (the intended offline-first licensed state), enter `../outside.txt,safe.txt`, and enable **Generate live commands**.
2. The reviewer correctly reports **Source path leaves the working folder** and the normal shell export is disabled.
3. Select **Export Plus review packet**. The Markdown packet nevertheless contains a live shell plan with `../outside.txt` and its two-phase move commands.
4. In a controlled temporary folder, that emitted shell plan moved the parent-folder fixture into the reviewed folder and printed `Applied 1 renames.`

This violates the UI's stated rule, **“Errors block scripts,”** and the brief's reviewed-root safety requirement. A paid convenience export must preserve the same error gate, or omit executable plans and clearly render a non-runnable report while errors exist.

## Functional coverage that passed

- Normal CSV mapping, safe quoted-name swap, shell dry run/live two-phase execution, and undo/reviewed-mapping downloads. The live quoted swap exchanged the exact temporary fixture contents and preserved reversibility.
- Collision, duplicate destination, cycle/swap staging, Windows reserved name, portable invalid character, case-only change, Unicode collision, numbering gap, parent traversal, POSIX/Windows absolute paths, quoted trailing whitespace, and case-insensitive moving-parent findings. Unsafe ordinary script exports were disabled.
- 1,000-mapping live browser fixture: all rows reviewed, first 100 previewed, and the repository check completed its input event within the stated 200 ms threshold.
- Regex workflow normal conversion, malformed-regex error, and recovery to a valid rule.
- Malformed structural JSON import showed its recovery message with no uncaught page error.
- Local IndexedDB draft persisted across reload and **Clear desk** removed it after confirmation.
- License callback token handling removed `license` from the URL and only used the production Sociobot API. There is no sign-in flow, so an Entra tenant check is not applicable.

## PWA, privacy, browser, and visual checks that passed

- On the live `*.sociobot.in` hostname, the service worker controlled the page; after an online load, an offline reload retained the app heading and showed **Offline · on-device**, with no page error. The live suite’s controlled update registration showed **A fresh notebook is ready** and successfully activated the waiting worker.
- Chromium reported no manifest errors. It has `display: standalone`, a versioned `start_url`, 192/512/maskable icons, and the visual-token theme/background colours.
- Main/privacy/terms checks on desktop and 390 × 844 mobile: `lang=en`, descriptive title, exactly one `h1`, one `main`, no horizontal overflow, keyboard skip link/tabs/import focus visible, and reduced-motion state with findings animation disabled.
- Axe found zero serious or critical findings on the main (empty and populated) and legal pages at both viewports. Online console/page-error collections were empty.
- Direct normal workflows made no third-party requests. Source review confirms no analytics, CDNs, remote fonts, or path upload. Drafts use IndexedDB; license state/verdict only use localStorage. Privacy and terms pages correctly disclose this.
- Production headers: CSP limits network to self and `https://api.sociobot.in`; HSTS, `nosniff`, strict-origin referrer policy, and Permissions-Policy are present. `manifest.webmanifest` is `application/manifest+json`; hashed JS has `public, max-age=31536000, immutable`; `sw.js` is `no-cache`.
- Initial static payloads meet declared budgets: JS 33,904 bytes raw / 12.62 KB gzip; CSS 14,361 bytes raw / 4.04 KB gzip; hero WebP 25,560 bytes; no webfont payload.

## Local quality-gate evidence

Environment: Node `v22.23.2`, npm `10.9.8`, TypeScript `5.9.3`, Playwright `1.58.2`, Chromium build 1208.

- `npm ci`: passed, 0 vulnerabilities.
- `npm run typecheck`: passed.
- `npm run lint`: passed; this repository defines lint as the same zero-error TypeScript check.
- `npm run test:unit`: passed, 2 files / 15 tests.
- `npm run build`: passed; `dist/` was produced, including the generated service worker.
- Repository Playwright suite: passed locally and again with `RPR_BASE_URL=https://rename-plan-reviewer.sociobot.in`, 16 tests across desktop Chromium and 390 px mobile. A further independent 12-check live Playwright pass exercised executable output, JSON recovery, responsive/a11y/motion/focus state, and manifest installation parsing.
- A fresh Lighthouse CLI run could not complete because the container’s preinstalled Chromium crashed or could not accept the Lighthouse connection. This environmental limitation does not affect the bundle, axe, or browser measurements above; no Lighthouse score is claimed in this report.

## Required disposition

Do not release this candidate. Add a rate limiter with a documented threshold and `Retry-After` to the Sociobot verification endpoint, then enforce the review safety gate for every output that embeds scripts, including the Plus packet. Add regressions for both conditions and rerun independent verification.
