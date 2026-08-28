# Polish round 1 — adversarial review repair

This repair starts from review commit `3391d4119043b6a5a2b5aab3782924514352ad34`.
Evidence paths are committed under `.factory/evidence/polish-1/`. The direct
sample URL is `/?demo=1`; the catalog and landing action use `/demo/`.
All rows also have the cold live browser evidence in `live-e2e.txt` and the
route captures in `live-root/`, `live-demo/`, `live-query-demo/`,
`live-privacy/`, and `live-terms/`; those captures include desktop and 390 px
screenshots plus console/a11y reports.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Demo mode replaces the landing hero with the populated sample input and risk verdict; mobile collapses nonessential controls. | `@claim:risky-sample-review`; `local-demo/screenshot-mobile.png`; live `/demo/` and `/?demo=1`. |
| F-1-2 | Added the collision-and-path-risks claim and observed duplicate, traversal, and absolute-path findings. | `@claim:collision-and-path-risks`; live `/demo/`. |
| F-1-3 | Added the input-methods claim covering paste, import, and regex-derived names. | `@claim:input-methods`; live `/demo/`. |
| F-1-4 | Added the delimited-inputs claim for quoted CSV, TSV, and semicolon data. | `@claim:delimited-inputs`; live `/demo/`. |
| F-1-5 | Made script preflight wording specific and tested missing source, occupied destination, and occupied staging paths. | `@claim:script-preflight`; live `/demo/`. |
| F-1-6 | Registered and tested the script-export error gate. | `@claim:errors-block-scripts`; live `/demo/`. |
| F-1-7 | Replaced vague destination wording and registered duplicate-destination evidence. | `@claim:destination-comparison`; live `/demo/`. |
| F-1-8 | Replaced vague portability wording with the exact checked cases and registered them. | `@claim:portability-checks`; live `/demo/`. |
| F-1-9 | Registered executable staged swap and undo restoration coverage. | `@claim:reversible-cycle-order`; live `/demo/`. |
| F-1-10 | Registered a PowerShell-export claim with mapping, staging, preflight, and dry-run assertions. | `@claim:powershell-export`; live `/demo/`. |
| F-1-11 | Registered undo-manifest direction and JSON assertions. | `@claim:undo-export`; live `/demo/`. |
| F-1-12 | Registered reviewed-CSV header, quoting, and row-count assertions. | `@claim:reviewed-csv-export`; live `/demo/`. |
| F-1-13 | Registered IndexedDB draft persistence and reload coverage. | `@claim:draft-persistence`; live `/`. |
| F-1-14 | Changed README demo, privacy, and terms links to absolute product URLs. | route/link E2E; live README links and `/demo/`, `/privacy/`, `/terms/`. |
| F-1-15 | Expanded `claims.json` to map every capability identified by this review to one tagged sandbox test. | clean-clone claim sweep; `.factory/claims.json`. |
| F-1-16 | Added manifest, icons, canonical, Open Graph, and Twitter tags to demo, legal, and 404 entries. | route metadata E2E; `local-demo/verify.json`; live routes and unknown-route 404. |
| F-1-17 | Added heading focus and polite route announcement after navigation and back/forward restoration. | route focus E2E; live `/demo/` then Back. |
| F-1-18 | Renamed the external footer link and added a screen-reader external cue. | full E2E link crawl; live footer. |
| F-1-19 | Replaced the footer with the product one-liner and exact Param Factory attribution. | `local-root/screenshot-desktop.png`; live `/`. |
| F-1-20 | Rewrote the eyebrow as “BATCH RENAME / SAFETY CHECK.” | `.factory/copy-audit.md`; `local-root/screenshot-mobile.png`; live `/`. |
| F-1-21 | Renamed the destructive action “Delete local draft” and retained specific confirmation text. | full E2E draft-clear coverage; live `/`. |
| F-1-22 | Kept concise visible counters and exposed action names for each finding filter. | full E2E keyboard/a11y coverage; live `/demo/`. |
| F-1-23 | Renamed the license action “Verify license.” | `@claim:plus-offer-status`; live `/`. |
| F-1-24 | Standardized on “sample plan,” including “Load risky sample plan.” | `.factory/copy-audit.md`; full E2E; live `/`. |
| F-1-25 | Renamed the section “Choose file-name rules” and replaced jargon-heavy helper copy with a direct default instruction. | `.factory/copy-audit.md`; live `/`. |
| F-1-26 | Renamed the review heading “Review rename risks.” | `.factory/copy-audit.md`; live `/`. |
| F-1-27 | Renamed the export heading “Export a reversible rename plan.” | `.factory/copy-audit.md`; live `/`. |
| F-1-28 | Rewrote the Plus eyebrow “OPTIONAL PLUS UPGRADE.” | `.factory/copy-audit.md`; live `/`. |
| F-1-29 | Replaced the metaphorical Plus heading with the concrete packet result. | `.factory/copy-audit.md`; `@claim:plus-offer-status`; live `/`. |
| F-1-30 | Rewrote the reviewed-CSV helper as “CSV of the paths you reviewed.” | `.factory/copy-audit.md`; `@claim:reviewed-csv-export`; live `/`. |
| F-1-31 | Rewrote the billing sentence to explain who handles sale, payment, and refund. | `.factory/copy-audit.md`; `@claim:plus-offer-status`; live `/terms/`. |
| F-1-32 | Replaced the hero caption with a direct safety instruction. | `.factory/copy-audit.md`; `local-root/screenshot-desktop.png`; live `/`. |

## Cumulative earlier verification findings

The earlier records are `verification.md` through `verification-7.md`; no
earlier `review-*` or `polish-*` file exists. Their safety, PWA, path,
offline, keyboard, billing-rate-limit, social image, build-id, and touch-target
findings remain covered by the full suite and the focused claims above. The
new code preserves their prior fixes; the regression suite includes executable
script preflight and staged-cycle checks, offline demo reload, Arrow-key tabs,
route metadata/focus, and 44 px target measurements.
