# Adversarial first-read review 1

**Verdict: FAIL**

Reviewed 2026-08-28 against live production at
<https://rename-plan-reviewer.sociobot.in/> and repository base
`20d53bf01c621b3d767af6b1e7fbc87d3e7717c3`.

There are 32 findings: 1 blocking, 14 major, and 17 minor. The first landing
screen is clear, the sandbox isolation works, and all listed claim tests pass.
The demo-first-screen requirement does not pass, and several live claims are
absent from `.factory/claims.json`.

## Cold first read

Fresh contexts were opened without scrolling at 390 × 844 and 1440 × 900.

| Question | 390 px answer | Desktop answer |
| --- | --- | --- |
| What does this do? | It reviews a batch file-rename plan before files are renamed. | Same. |
| For whom? | People preparing risky spreadsheet or regex batch renames. | Same. |
| What should I click first? | **Try it with sample data.** | Same. |

The exact first-screen copy that supplied those answers was “Review batch
renames before you run them.”, “For people preparing risky spreadsheet or
regex batch renames.”, and “Try it with sample data”. All three answers are
available above the fold at both sizes, so the cold landing screen is not a
blocking finding.

## Findings

### Blocking

#### F-1-1 — The demo opens above the product, not with the product in use

- **Location/quote:** `/demo/`, immediately after selecting “Try it with
  sample data”: “Demo — sample data, nothing is saved” and the entire landing
  hero are visible, but the sample mappings and findings are not.
- **Evidence:** at 390 × 844 the populated `#mapping-input` begins at y=1,320
  and `#report` begins at y=2,063. At 1440 × 900 they begin at y=1,069 and
  y=980. Neither is in the first viewport. The first mobile screen contains a
  second hero and “Reset sample plan”, not an example of the reviewer doing
  its job.
- **Why this fails:** the required one-click path must make the first screen
  after the click already look like the product being used with realistic
  data. Loading data below one to two screens of repeated landing content is a
  weak demo even though the data is present.
- **Concrete fix:** make `/demo/` lead with a compact demo header followed
  immediately by the populated input and “Plan needs correction” findings.
  Remove or collapse the duplicate hero in demo mode. Add a 390px and desktop
  test that asserts a sample mapping and the findings verdict intersect the
  initial viewport.

### Major

#### F-1-2 — Unlisted claim: collision and unsafe-path detection

- **Location/quote:** root meta description: “Find collisions and unsafe paths
  in a local browser app.”
- **Why this fails:** `.factory/claims.json` has no claim entry whose test
  proves collision and unsafe-path detection. Untagged unit/E2E coverage does
  not satisfy the claims manifest.
- **Concrete fix:** add a `collision-and-path-risks` entry and one tagged test
  that feeds a duplicate destination, a root escape, and an absolute path,
  then asserts each reported risk.

#### F-1-3 — Unlisted claim: three input methods

- **Location/quote:** landing workbench: “Paste two columns, import a file, or
  derive names with a rule.”
- **Why this fails:** no listed claim test exercises all three promised input
  paths.
- **Concrete fix:** add an `input-methods` claim and tagged test that pastes a
  table, imports a fixture, and derives expected output with a regex rule.

#### F-1-4 — Unlisted claim: supported delimited formats

- **Location/quote:** mapping help: “Quoted CSV, tab-separated, and
  semicolon-separated files are supported.”
- **Why this fails:** no claims entry proves quoted values or the three stated
  separators.
- **Concrete fix:** add a `delimited-inputs` claim with fixtures for quoted
  CSV, TSV, and semicolon input, asserting the parsed paths.

#### F-1-5 — Unlisted claim: generated-script preflight

- **Location/quote:** filesystem note: “Scripts therefore preflight existing
  sources, destinations, and temporary paths when run.”
- **Why this fails:** the behavior is a safety promise and has no tagged claim
  test.
- **Concrete fix:** add a `script-preflight` claim and execute a generated
  live script in a temporary directory for missing-source, occupied-target,
  and occupied-temporary-path cases. Assert that no rename occurs.

#### F-1-6 — Unlisted claim: errors block scripts

- **Location/quote:** review heading: “Errors block scripts.”
- **Why this fails:** `dry-run-export` starts from a safe plan and does not
  prove the unsafe-plan gate.
- **Concrete fix:** add an `errors-block-scripts` entry and tagged demo test
  that retains the reserved-name error and confirms both script exports remain
  disabled.

#### F-1-7 — Unlisted claim: destination comparison

- **Location/quote:** empty state: “We compare destinations.”
- **Why this fails:** this is a core analysis claim with no manifest entry.
- **Concrete fix:** add a tagged test that supplies two sources with the same
  normalized destination and asserts the collision finding, or remove the
  sentence.

#### F-1-8 — Unlisted claim: portability checks

- **Location/quote:** empty state: “We circle portability risks.”
- **Why this fails:** no claim entry defines which portability risks are
  promised or tests an observable set.
- **Concrete fix:** rewrite to a precise promise such as “Checks Windows
  reserved names and trailing dots or spaces”, then list and test those cases.

#### F-1-9 — Unlisted claim: reversible staging

- **Location/quote:** empty state: “We stage a reversible order.”
- **Why this fails:** no listed test proves that a cycle is staged into an
  executable reversible order.
- **Concrete fix:** add a `reversible-cycle-order` claim whose tagged test runs
  a swap in a temporary directory, applies the undo plan, and verifies the
  original contents are restored.

#### F-1-10 — Unlisted claim: PowerShell export

- **Location/quote:** export control: “Export PowerShell”.
- **Why this fails:** controls can make claims; no claim entry verifies the
  PowerShell output. The listed dry-run test covers only the shell download.
- **Concrete fix:** add a `powershell-export` entry and assert the downloaded
  plan contains the mappings, safe staging, and dry-run behavior.

#### F-1-11 — Unlisted claim: undo manifest export

- **Location/quote:** export control: “Export undo manifest”.
- **Why this fails:** no listed test validates the manifest or its direction.
- **Concrete fix:** add an `undo-export` claim and assert valid JSON with every
  destination mapped back to its original source.

#### F-1-12 — Unlisted claim: reviewed CSV export

- **Location/quote:** export control: “Export reviewed mapping”.
- **Why this fails:** no listed test validates this download.
- **Concrete fix:** add a `reviewed-csv-export` claim and assert its header,
  quoting, and one output row per reviewed mapping.

#### F-1-13 — Unlisted claim: draft persistence mechanism

- **Location/quote:** README: “Drafts use IndexedDB on this device.”
- **Why this fails:** `local-only` checks network traffic, not persistence in
  IndexedDB. `demo-isolated` proves separation but does not list this claim.
- **Concrete fix:** add a `draft-persistence` entry that saves a real draft,
  reloads, and asserts both the restored value and the `rename-plan-reviewer`
  database; or remove the implementation detail from README.

#### F-1-14 — README product links go to unrelated GitHub pages

- **Location/quote:** README links “the demo”, “privacy policy”, and “terms”
  use `/demo/`, `/privacy/`, and `/terms/`.
- **Why this fails:** on GitHub these resolve to `github.com/demo/`,
  `github.com/privacy/`, and GitHub’s own terms, rather than this product. The
  required README demo entry is therefore not a one-click product demo.
- **Concrete fix:** use absolute URLs under
  `https://rename-plan-reviewer.sociobot.in/` for all three.

#### F-1-15 — README incorrectly says every claim is mapped

- **Location/quote:** README: “Each visitor-facing claim is mapped to an
  observable demo test in `.factory/claims.json`.”
- **Why this fails:** F-1-2 through F-1-13 demonstrate otherwise.
- **Concrete fix:** add the missing manifest entries and tests, then retain the
  sentence; otherwise rewrite it to describe only the claims actually listed.

### Minor

#### F-1-16 — Route metadata is incomplete

- **Location:** `/demo/` lacks Open Graph and Twitter metadata. `/privacy/`
  and `/terms/` also lack favicon, apple-touch icon, manifest, Open Graph, and
  Twitter metadata. The designed 404 lacks canonical, favicon, apple-touch
  icon, manifest, Open Graph, and Twitter metadata.
- **Why this fails:** the route-specific titles and canonical links that exist
  are correct, but the requested metadata set is not present per route.
- **Concrete fix:** add the product favicon/manifest and route-specific OG and
  Twitter title, description, URL, and 1200 × 630 image to every HTML entry;
  add an intentional 404 canonical policy and test the resulting tags.

#### F-1-17 — Route changes do not move focus to the new heading

- **Location:** header links between `/`, `/demo/`, `/privacy/`, and `/terms/`.
- **Evidence:** after selecting “Demo” and after browser Back,
  `document.activeElement` is `<body>`; the new `h1` has no `tabindex`. The
  existing live region is the findings region, not a route announcement.
- **Why this fails:** keyboard and screen-reader users do not receive the
  required focus placement/route announcement.
- **Concrete fix:** focus a `tabindex="-1"` page heading after each route load
  and add an E2E navigation/back test that asserts the heading is focused and
  announced.

#### F-1-18 — The external Source link is not identified as external

- **Location/quote:** footer link “Source”.
- **Why this fails:** it leaves the product for GitHub without saying so.
- **Concrete fix:** rename it “Source on GitHub (external)” and supply a
  screen-reader-visible external destination cue.

#### F-1-19 — The footer omits the product one-liner and required attribution

- **Location/quote:** footer: “A Param Factory utility.”
- **Why this fails:** it neither explains this product nor uses the required
  “Built by Param Factory” attribution.
- **Concrete fix:** use “Review batch renames before files change. Built by
  Param Factory.”

#### F-1-20 — “Pre-flight” is unexplained jargon

- **Location/quote:** landing eyebrow: “BATCH RENAME / PRE-FLIGHT”.
- **Why this fails:** a cold visitor should not have to translate an aviation
  metaphor.
- **Concrete fix:** “BATCH RENAME / SAFETY CHECK”.

#### F-1-21 — “Clear desk” hides a destructive result

- **Location/quote:** button “Clear desk”.
- **Why this fails:** it does not name the local draft that will be erased.
- **Concrete fix:** “Delete local draft” (or “Clear rename plan” if deletion
  is not permanent).

#### F-1-22 — Finding-filter buttons are nouns, not result-naming actions

- **Location/quote:** buttons “All”, “Errors”, “Warnings”, and “Notes”.
- **Why this fails:** the labels do not say that they filter the report.
- **Concrete fix:** use accessible names “Show all findings”, “Show errors”,
  “Show warnings”, and “Show notes”; the visible short labels may remain with
  the action exposed to assistive technology.

#### F-1-23 — “Verify” does not name what will be verified

- **Location/quote:** Plus form button “Verify”.
- **Why this fails:** the action is ambiguous out of form context.
- **Concrete fix:** “Verify license”.

#### F-1-24 — “Example” conflicts with the established “sample plan” term

- **Location/quote:** button “Load risky example”; elsewhere the UI uses
  “sample data” and “sample plan”.
- **Why this fails:** one concept has multiple names.
- **Concrete fix:** “Load risky sample plan”.

#### F-1-25 — The filesystem heading and helper are jargon-heavy

- **Location/quote:** “Filesystem assumptions” and “Conservative defaults for
  portable plans”.
- **Why this fails:** neither tells a first-time visitor what choice is being
  made.
- **Concrete fix:** “Choose file-name rules” and “Starts with rules that work
  on Windows, macOS, and Linux.”

#### F-1-26 — “Review the evidence” is vague out of context

- **Location/quote:** section heading “Review the evidence”.
- **Why this fails:** a headings list does not reveal that this section shows
  rename risks.
- **Concrete fix:** “Review rename risks”.

#### F-1-27 — “Take away” does not name the export action

- **Location/quote:** section heading “Take away a reversible plan”.
- **Why this fails:** it is indirect and less clear than the action users take.
- **Concrete fix:** “Export a reversible rename plan”.

#### F-1-28 — The Plus eyebrow makes no sense out of context

- **Location/quote:** “OPTIONAL BENCH UPGRADE”.
- **Why this fails:** “bench” is decorative notebook language, not a product
  or pricing term.
- **Concrete fix:** “OPTIONAL PLUS UPGRADE”.

#### F-1-29 — The Plus heading uses two metaphors instead of the result

- **Location/quote:** “Keep the reviewer free. Pack the paperwork with Plus.”
- **Why this fails:** “keep” suggests the visitor controls whether the tool is
  free, and “pack the paperwork” does not name the combined export.
- **Concrete fix:** “The reviewer is free. Plus exports one combined review
  packet.”

#### F-1-30 — “Source of truth” is jargon

- **Location/quote:** reviewed CSV helper: “Your portable source of truth”.
- **Why this fails:** it does not describe the downloaded file.
- **Concrete fix:** “CSV of the paths you reviewed”.

#### F-1-31 — “Merchant of record” is unexplained legal jargon

- **Location/quote:** “Sociobot/Dodo is merchant of record.”
- **Why this fails:** the sentence does not explain the practical consequence
  for the buyer.
- **Concrete fix:** “Sociobot/Dodo handles the sale, payment, and refund.”

#### F-1-32 — The hero caption uses an unnecessary metaphor

- **Location/quote:** “A rename is a hypothesis until you run it.”
- **Why this fails:** it adds laboratory language where a safety instruction
  would be clearer.
- **Concrete fix:** “Review the rename plan before it changes files.”

## Copy audit

Word counts use visible words separated by whitespace. The landing list covers
the cold root state, including its visible empty state. Control labels and
headings are audited separately below. No sentence exceeds 22 words and no
banned marketing adjective appears.

### Landing sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Review batch renames before you run them. | 7 | Pass |
| For people preparing risky spreadsheet or regex batch renames. | 9 | Pass |
| Loads a risky sample plan to inspect. | 7 | Pass |
| Data stays in this browser. | 5 | Pass |
| Works offline after first visit. | 5 | Pass |
| Exports start as dry runs. | 5 | Pass |
| A rename is a hypothesis until you run it. | 9 | F-1-32 |
| Paste two columns, import a file, or derive names with a rule. | 12 | F-1-3 |
| Header optional. | 2 | Pass |
| Quoted CSV, tab-separated, and semicolon-separated files are supported. | 8 | F-1-4 |
| This browser cannot see the destination folder. | 7 | Pass |
| Scripts therefore preflight existing sources, destinations, and temporary paths when run. | 11 | F-1-5 |
| Conservative defaults for portable plans. | 5 | F-1-25 |
| Drafts stay on this device. | 5 | Covered by `local-only`; wording passes |
| Errors block scripts. | 3 | F-1-6 |
| Warnings need your judgment. | 4 | Pass |
| The page is clean. | 4 | Pass |
| Add a mapping on the left. | 6 | Pass |
| Checks run here as you type. | 6 | Pass |
| We compare destinations. | 3 | F-1-7 |
| We circle portability risks. | 4 | F-1-8 |
| We stage a reversible order. | 5 | F-1-9 |
| Resolve error findings before generating a script. | 7 | Pass |
| Off by default. | 3 | Pass |
| Leave off until the printed dry run is correct. | 9 | Pass |
| Your portable source of truth. | 5 | F-1-30 |
| Keep the reviewer free. | 4 | F-1-29 |
| Pack the paperwork with Plus. | 5 | F-1-29 |
| Plus is priced at US $12 once. | 7 | Pass; listed claim |
| It adds a combined Markdown review packet with findings and both scripts. | 12 | Pass; listed claim |
| Every safety check, dry run, CSV and undo export stays free. | 11 | Pass; listed claim |
| Sociobot/Dodo is merchant of record. | 5 | F-1-31 |
| Checkout is not available right now. | 6 | Pass; listed claim |
| Verify an existing license below. | 5 | Pass; listed claim |
| Free reviewer active. | 3 | Pass |
| Plus is optional. | 3 | Pass |
| A Param Factory utility. | 4 | F-1-19 |
| Notebook illustration generated for this product with the factory image model. | 11 | Pass |

### README sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Review batch renames before you run them. | 7 | Pass |
| For people preparing risky spreadsheet or regex batch renames. | 9 | Pass |
| Paste current and new paths, then inspect the findings before exporting a plan. | 13 | Pass |
| Try the isolated sample at the demo. | 7 | F-1-14 (link target) |
| The demo contains a swap, a numbering gap, and a reserved Windows name. | 13 | Pass; listed claim |
| Data stays in this browser. | 5 | Pass; listed claim |
| Works offline after the first visit. | 6 | Pass; listed claim |
| Exports start as dry runs. | 5 | Pass; listed claim |
| Requires Node.js 20 or newer. | 5 | Pass |
| `npm run build` writes the static PWA to `dist/`. | 9 | Pass |
| Deploy that directory with the included `staticwebapp.config.json` configuration. | 8 | Pass |
| Each visitor-facing claim is mapped to an observable demo test in `.factory/claims.json`. | 12 | F-1-15 |
| Run a listed command after `npm ci` to verify one claim. | 11 | Pass |
| Drafts use IndexedDB on this device. | 6 | F-1-13 |
| The demo uses a separate `demo:` database. | 7 | Pass; tested by `demo-isolated` |
| See the privacy policy and terms. | 6 | F-1-14 (link targets) |
| MIT licensed. | 2 | Pass |
| See LICENSE. | 2 | Pass |

### Headings, terminology, and controls

| Copy | Kind | Result |
| --- | --- | --- |
| BATCH RENAME / PRE-FLIGHT | Eyebrow | F-1-20 |
| Review batch renames before you run them. | H1 | Pass |
| Add the proposed names | H2 | Pass |
| Filesystem assumptions | Details heading | F-1-25 |
| Review the evidence | H2 | F-1-26 |
| The page is clean. | H3 | Pass |
| Take away a reversible plan | H2 | F-1-27 |
| OPTIONAL BENCH UPGRADE | Eyebrow | F-1-28 |
| Keep the reviewer free. Pack the paperwork with Plus. | H2 | F-1-29 |
| Try it with sample data | Primary link | Pass |
| Import CSV or JSON | File action | Pass |
| Load risky example | Button | F-1-24 |
| Clear desk | Button | F-1-21 |
| All / Errors / Warnings / Notes | Filter buttons | F-1-22 |
| Generate live commands | Checkbox action | Pass |
| Export shell plan | Button | Pass; listed claim |
| Export PowerShell | Button | F-1-10 |
| Export undo manifest | Button | F-1-11 |
| Export reviewed mapping | Button | F-1-12 |
| Verify | Button | F-1-23 |
| Export Plus review packet | Button | Pass; listed claim |

Terminology otherwise stays consistent: **mapping** for a current-to-new row,
**sample plan** for demo data, **demo** for the isolated mode, **draft** for
browser-persisted real work, and **plan** for exported commands. F-1-24 is the
one terminology exception.

## Demo and sandbox evidence

- The landing action reaches `/demo/` in one click.
- The seed has five realistic mappings: a swap, a numbering gap, and a Windows
  reserved destination. The reviewer reports the expected error, warning, and
  safe-cycle note.
- The persistent banner says “Demo — sample data, nothing is saved” and exposes
  **Reset demo** and **Start for real**.
- After an edit, IndexedDB contains `demo:rename-plan-reviewer`. Reset restores
  the exact five-row seed. A separately saved real draft returned unchanged
  after leaving demo mode.
- Network interception during demo load/edit observed zero cross-origin
  requests.
- After service-worker activation, `/demo/` reloaded offline with the banner,
  sample, and reviewer intact.
- These checks pass, but F-1-1 still blocks the demo because the populated
  product is below the initial viewport.

## Claims results

All commands were run exactly as listed after `npm ci` from the clean base
worktree. Each Playwright command ran the same tagged test in desktop and
390px projects.

| Claim ID | Result | Evidence |
| --- | --- | --- |
| `risky-sample-review` | PASS | 2/2 tests |
| `demo-isolated` | PASS | 2/2 tests |
| `local-only` | PASS | 2/2 tests; no external requests |
| `offline-reload` | PASS | 2/2 tests |
| `dry-run-export` | PASS | 2/2 tests; downloaded shell plan remained dry-run |
| `plus-offer-status` | PASS | 2/2 tests; purchase status and mocked restore/export verified |

No listed claim is failing or untested. F-1-2 through F-1-13 are claim-like
copy or controls that have no entry in the manifest.

## Structure, accessibility, and visual check

- Root, demo, privacy, terms, and unknown-route 404 each return the expected
  content, one `h1`, one `main`, and a route-specific title. The unknown route
  returns HTTP 404. Browser Back returns to the correct URL.
- The root title follows “Product — what it does”; demo/privacy/terms titles
  follow the route pattern. Root description, canonical, social image, SVG
  favicon, and apple icon are present. F-1-16 records missing route metadata.
- The sitemap lists root, demo, privacy, and terms. All live internal links
  returned 200; the GitHub source returned 200. F-1-14 records the README’s
  wrong absolute destinations.
- The full local suite passed: 19 unit tests and 52 Playwright tests. The same
  52 Playwright tests passed against production. Axe integration reported no
  serious or critical issue, there was no 390px horizontal overflow, and the
  relevant tests cover focus rings, reduced motion, touch targets, and console
  errors. F-1-17 is a route-focus contract gap not covered by that suite.
- The built first-load assets remain small: 36.39 KB JS raw / 13.38 KB gzip
  and 15.52 KB CSS raw / 4.22 KB gzip.
- The warm graph-paper notebook, indigo pencil marks, vermilion risk marks,
  asymmetrical workbench, and original ledger art form a distinct identity.
  It does not resemble a generic centered-gradient SaaS template.

## History check

No earlier `.factory/review-*.md` or `.factory/polish-*.md` exists. The prior
`.factory/handoff.md` records “No known acceptance gap remains” and no finding
IDs to retest. Its claimed test counts, live artifact identity, offline
behavior, accessibility baseline, links, 404, and sandbox behavior were
rechecked successfully here. Its overall PASS conclusion is not sustained
because F-1-1 and the unlisted claims were outside or missed by those checks.

## Missed leverage

No additional feature finding is raised. The brief’s expected import, regex,
shell/PowerShell export, undo, and reviewed CSV paths are present. An AI step
would add network/privacy/cost complexity without improving the deterministic
rename-safety job, and no provider key or decorative AI runtime feature is
embedded.

## What would make this perfect

Make `/demo/` open directly on the populated reviewer at both target sizes.
Then map every live capability claim to one tagged sandbox test, correct the
README URLs, complete route metadata/focus behavior, and replace every flagged
metaphor, jargon term, and ambiguous action with the proposed plain wording.
After those changes, rerun the entire checklist rather than only the new tests.
