# Adversarial first-read review 2

**Verdict: PASS**

Reviewed 2026-08-28 against the cold live deployment at
<https://rename-plan-reviewer.sociobot.in/> and clean clone
`b534e933de230703cebf1fae4274b13a89d14d00`.

There are no findings. The first-read, demo, core workflow, routing,
accessibility, privacy, claims contract, and all findings from review 1 were
rechecked.

## Cold first read

Fresh Chromium contexts opened the root URL at 390 × 844 and 1440 × 900 with
no scrolling. Both showed the same first-screen answers.

| Question | Answer from the first screen | Exact supporting copy |
| --- | --- | --- |
| What does this do? | It reviews a batch rename plan before it runs. | “Review batch renames before you run them.” |
| For whom? | People preparing a risky spreadsheet or regex batch rename. | “For people preparing risky spreadsheet or regex batch renames.” |
| What should I click first? | Try the supplied risky plan. | “Try it with sample data” and “Loads a risky sample plan to inspect.” |

The primary action was visible at y=482 on phone and y=635 on desktop, with a
48 px height. This passes the cold first-screen gate. The warm graph-paper,
pencil, collision-circle, and proof-tick system is visibly distinct and fits
the pre-execution safety-review job; it does not read as a generic SaaS page.

## Findings

None. The live copy is clear and bounded; all product behavior a visitor can
rely on maps to a claim test. The live-command statement is exercised by the
`reversible-cycle-order` test, which exports and runs a live staged swap and
undoes it. The Sociobot/Dodo sentence is a legal merchant disclosure, and the
footer sentence is required original-asset provenance, documented in more
detail in `.factory/design.md`; neither promises an additional product result.

## Copy audit

Word counts use whitespace-delimited visible words. Labels, file extensions,
and sentence fragments such as “macOS / Linux” are listed as controls rather
than treated as sentences. No audited sentence exceeds 22 words. No banned
marketing adjective is present. `regex`, `CSV`, `JSON`, and `IndexedDB` are
necessary terms for the stated technical job or README setup; their nearby
copy explains their role. The terminology remains consistent: **mapping**,
**sample plan**, **demo**, **draft**, **plan**, and **review packet**.

### Landing page sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Review batch renames before you run them. | 7 | Pass |
| For people preparing risky spreadsheet or regex batch renames. | 9 | Pass |
| Loads a risky sample plan to inspect. | 7 | Pass |
| Data stays in this browser. | 5 | Listed: `local-only` |
| Works offline after first visit. | 5 | Listed: `offline-reload` |
| Exports start as dry runs. | 5 | Listed: `dry-run-export` |
| Review the rename plan before it changes files. | 9 | Pass — instruction |
| Paste two columns, import a file, or derive names with a rule. | 12 | Listed: `input-methods` |
| Header optional. | 2 | Pass — input instruction |
| Quoted CSV, tab-separated, and semicolon-separated files are supported. | 8 | Listed: `delimited-inputs` |
| Default: use the Portable option below. | 6 | Pass — setting instruction |
| This browser cannot see the destination folder. | 7 | Pass — product limit |
| Generated scripts check existing sources, destinations, and temporary paths before any rename. | 12 | Listed: `script-preflight` |
| Drafts stay on this device. | 5 | Listed: `draft-persistence` |
| Errors block script exports. | 4 | Listed: `errors-block-scripts` |
| Warnings need your judgment. | 4 | Pass — instruction |
| The page is clean. | 4 | Pass — empty-state status |
| Add a mapping on the left. | 6 | Pass — empty-state instruction |
| Checks run here as you type. | 6 | Pass — immediate-state explanation |
| Checks duplicate destinations. | 3 | Listed: `destination-comparison` |
| Checks Windows reserved names and trailing dots or spaces. | 9 | Listed: `portability-checks` |
| Builds a two-phase order for swaps and cycles. | 8 | Listed: `reversible-cycle-order` |
| Add mappings to prepare exports. | 5 | Pass — empty-state instruction |
| Resolve error findings before generating a script. | 7 | Pass — safety instruction |
| Off by default. | 3 | Listed: `dry-run-export` |
| Leave off until the printed dry run is correct. | 9 | Pass — safety instruction |
| Live mode: exported scripts will rename files. | 7 | Listed: `reversible-cycle-order` executes a live plan |
| Back up first. | 3 | Pass — safety instruction |
| CSV of the paths you reviewed. | 6 | Listed: `reviewed-csv-export` |
| The reviewer is free. | 4 | Listed: `plus-offer-status` |
| Plus exports one combined review packet. | 6 | Listed: `plus-offer-status` |
| Plus is priced at US $12 once. | 7 | Listed: `plus-offer-status` |
| It adds a combined Markdown review packet with findings and both scripts. | 12 | Listed: `plus-offer-status` |
| Every safety check, dry run, CSV and undo export stays free. | 11 | Listed: `plus-offer-status` |
| Sociobot/Dodo handles the sale, payment, and refund. | 7 | Pass — required merchant disclosure |
| Checkout is not available right now. | 6 | Listed: `plus-offer-status` |
| Verify an existing license below. | 5 | Listed: `plus-offer-status` |
| Free reviewer active. | 3 | Listed: `plus-offer-status` |
| Plus is optional. | 3 | Pass — status |
| Review batch renames before files change. | 6 | Pass — footer one-liner |
| Built by Param Factory. | 4 | Pass — attribution |
| Notebook illustration generated for this product with the factory image model. | 11 | Pass — required asset provenance |

### README sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Review batch renames before you run them. | 7 | Pass |
| For people preparing risky spreadsheet or regex batch renames. | 9 | Pass |
| Paste current and new paths, then inspect the findings before exporting a plan. | 13 | Pass |
| Try the isolated sample at the demo. | 7 | Pass — absolute product URL |
| The demo contains a swap, a numbering gap, and a reserved Windows name. | 13 | Listed: `risky-sample-review` |
| Data stays in this browser. | 5 | Listed: `local-only` |
| Works offline after the first visit. | 6 | Listed: `offline-reload` |
| Exports start as dry runs. | 5 | Listed: `dry-run-export` |
| Requires Node.js 20 or newer. | 5 | Pass — setup requirement |
| `npm run build` writes the static PWA to `dist/`. | 9 | Pass — build instruction |
| Deploy that directory with the included `staticwebapp.config.json` configuration. | 8 | Pass — deploy instruction |
| Each visitor-facing claim is mapped to an observable demo test in `.factory/claims.json`. | 12 | Pass |
| Run a listed command after `npm ci` to verify one claim. | 11 | Pass — verification instruction |
| Drafts use IndexedDB on this device. | 6 | Listed: `draft-persistence` |
| The demo uses a separate `demo:` database. | 7 | Listed: `demo-isolated` |
| See the privacy policy and terms. | 6 | Pass — absolute product URLs |
| MIT licensed. | 2 | Pass — LICENSE-backed fact |
| See LICENSE. | 2 | Pass — documentation link |

Controls use result-naming verbs: “Try it with sample data”, “Import CSV or
JSON”, “Load risky sample plan”, “Delete local draft”, “Verify license”, and
the four explicitly named exports. The compact visible finding tabs expose
“Show all findings”, “Show errors”, “Show warnings”, and “Show notes” as
accessible names. Headings are understandable out of context.

## Demo and sandbox check

- The landing action opens `/demo/` in one click; `/?demo=1` also enters the
  sandbox directly.
- On fresh live phone and desktop contexts, the persistent “Demo — sample
  data, nothing is saved” banner, seeded mappings, and “Plan needs correction”
  verdict were all inside the first viewport. On phone, the mapping starts at
  y=497 and the verdict at y=685; on desktop they start at y=564 and y=475.
- The banner supplies **Reset demo** and **Start for real**. The
  `demo-isolated` test saves a real draft, changes/reset demo data, and proves
  the real draft remains after leaving demo.
- A fresh live demo request log contained only same-origin URLs. The
  `local-only` claim test independently asserts this during editing. The live
  full suite passed its controlled offline demo reload.

## Claims and quality evidence

`.factory/claims.json` has 18 entries, each with exactly one
`@claim:<id>` test across `tests/e2e/`. From clean clone
`/tmp/rpr-review-2-pYifwZ`, `npm ci` passed with zero vulnerabilities, then
every manifest command was run exactly as written. The 18 commands completed
without a test failure. A subsequent live run

```sh
RPR_BASE_URL=https://rename-plan-reviewer.sociobot.in npm run test:e2e
```

passed all 78 tests; Playwright recorded `{"status":"passed","failedTests":[]}`.
The clean clone also passed `npm run build` and `npm run test:unit` (19 tests).
The build produced `dist/` with 37.77 KB raw / 13.73 KB gzip JavaScript and
16.92 KB raw / 4.51 KB gzip CSS.

The claims tests verify the demo separation, request log, offline reload,
dry-run output, collision/path checks, all input modes, delimited parsing,
script preflight, export gates, normalized destinations, portable-name checks,
cycle/undo execution, PowerShell/undo/CSV output, persistence, and the Plus
status. The cross-check found no unlisted product claim.

## Structure and routing check

- `/`, `/demo/`, `/?demo=1`, `/privacy/`, `/terms/`, manifest, robots,
  sitemap, icons, social image, and source repository returned 200. An unknown
  route returned the designed 404 with HTTP 404.
- Root, demo, legal, and 404 documents have their route-specific title,
  canonical URL, description, favicon, apple icon, manifest, OG/Twitter tags,
  `lang=en`, one h1, and main landmark. The root title is “Rename Plan
  Reviewer — review batch renames”.
- The live suite verifies deep links, browser Back, focus movement to the new
  h1, the polite route announcement, keyboard tabs, visible focus, touch
  targets, reduced motion, no console errors, no mobile horizontal overflow,
  and axe serious/critical findings.
- The header/footer are consistent, include skip navigation, Privacy and
  Terms, the required attribution, a visible build identifier, and an external
  destination cue for the GitHub link.

## History check

Every finding in `review-1.md` was checked on live production and in the
current code; none is merely marked fixed. `polish-1.md`’s repair status is
substantiated as follows.

| Earlier finding | Confirmed live/code evidence |
| --- | --- |
| F-1-1 | Demo starts with populated mappings and verdict in both first viewports. |
| F-1-2 | `collision-and-path-risks` is listed and passes. |
| F-1-3 | `input-methods` is listed and passes. |
| F-1-4 | `delimited-inputs` is listed and passes. |
| F-1-5 | `script-preflight` is listed and executes its temporary-path cases. |
| F-1-6 | `errors-block-scripts` is listed and passes. |
| F-1-7 | `destination-comparison` is listed and passes. |
| F-1-8 | `portability-checks` is listed and passes. |
| F-1-9 | `reversible-cycle-order` runs the staged swap and undo. |
| F-1-10 | `powershell-export` is listed and passes. |
| F-1-11 | `undo-export` is listed and passes. |
| F-1-12 | `reviewed-csv-export` is listed and passes. |
| F-1-13 | `draft-persistence` is listed and passes. |
| F-1-14 | README demo/privacy/terms links are absolute product URLs. |
| F-1-15 | The original capability claims now have entries and tagged tests. |
| F-1-16 | Live route metadata exists for demo, legal pages, and 404. |
| F-1-17 | Live navigation/back focuses the h1 and announces the route. |
| F-1-18 | Footer says “Source on GitHub (external)” with an accessible cue. |
| F-1-19 | Footer has the product one-liner and “Built by Param Factory.” |
| F-1-20 | Eyebrow says “BATCH RENAME / SAFETY CHECK”. |
| F-1-21 | The destructive control says “Delete local draft”. |
| F-1-22 | Finding filters have result-naming accessible names. |
| F-1-23 | License control says “Verify license”. |
| F-1-24 | The product consistently uses “sample plan”. |
| F-1-25 | The section says “Choose file-name rules” with a direct default. |
| F-1-26 | The review heading says “Review rename risks”. |
| F-1-27 | The export heading says “Export a reversible rename plan”. |
| F-1-28 | The Plus eyebrow says “OPTIONAL PLUS UPGRADE”. |
| F-1-29 | The Plus heading names the combined review packet. |
| F-1-30 | CSV helper says “CSV of the paths you reviewed”. |
| F-1-31 | Billing sentence explains sale, payment, and refund in plain language. |
| F-1-32 | Hero caption says “Review the rename plan before it changes files.” |

The prior verification records and handoff were also read. Their safety,
offline, PWA, touch-target, metadata, rate-limit, and build checks are
covered again by the live 78-test run and clean-clone build/unit checks above.

## Missed leverage

No additional product feature is missing from the brief. The reviewer already
offers paste/import/rule input, collision and portability review, safe staged
shell and PowerShell plans, undo/CSV exports, offline local storage, and an
isolated demo. An AI step would add cost and privacy exposure to a deterministic
path-safety task without improving the job; no decorative AI feature or
provider key is present.

## What would make this perfect

Nothing is required for acceptance. Keep the direct first-screen wording,
isolated demo, claim-test mapping, and original-asset provenance intact as the
product evolves; rerun this full review after any copy, storage, export, or
payment change.
