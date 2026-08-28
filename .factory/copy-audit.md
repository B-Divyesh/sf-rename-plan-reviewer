# Copy audit — polish round 1

Visible words are counted by whitespace. The cold root state was audited after
the review rewrites. No sentence exceeds 22 words and no sentence contains a
banned marketing word.

## Landing sentences

| Sentence | Words | Claim evidence | Result |
| --- | ---: | --- | --- |
| Review batch renames before you run them. | 7 | Product instruction | Pass |
| For people preparing risky spreadsheet or regex batch renames. | 9 | Audience statement | Pass |
| Loads a risky sample plan to inspect. | 7 | `risky-sample-review` | Pass |
| Data stays in this browser. | 5 | `local-only` | Pass |
| Works offline after first visit. | 5 | `offline-reload` | Pass |
| Exports start as dry runs. | 5 | `dry-run-export` | Pass |
| Review the rename plan before it changes files. | 9 | Safety instruction | Pass |
| Paste two columns, import a file, or derive names with a rule. | 12 | `input-methods` | Pass |
| Header optional. | 2 | Input instruction | Pass |
| Quoted CSV, tab-separated, and semicolon-separated files are supported. | 8 | `delimited-inputs` | Pass |
| Default: use the Portable option below. | 6 | Default-setting instruction | Pass |
| This browser cannot see the destination folder. | 7 | Capability limit | Pass |
| Generated scripts check existing sources, destinations, and temporary paths before any rename. | 12 | `script-preflight` | Pass |
| Drafts stay on this device. | 5 | `draft-persistence` | Pass |
| Errors block script exports. | 4 | `errors-block-scripts` | Pass |
| Warnings need your judgment. | 4 | Product instruction | Pass |
| The page is clean. | 4 | Empty-state status | Pass |
| Add a mapping on the left. | 6 | Empty-state instruction | Pass |
| Checks run here as you type. | 6 | Immediate UI behavior | Pass |
| Checks duplicate destinations. | 3 | `destination-comparison` | Pass |
| Checks Windows reserved names and trailing dots or spaces. | 9 | `portability-checks` | Pass |
| Builds a two-phase order for swaps and cycles. | 8 | `reversible-cycle-order` | Pass |
| Resolve error findings before generating a script. | 7 | Safety instruction | Pass |
| Off by default. | 3 | `dry-run-export` | Pass |
| Leave off until the printed dry run is correct. | 9 | Safety instruction | Pass |
| CSV of the paths you reviewed. | 6 | `reviewed-csv-export` | Pass |
| Plus is priced at US $12 once. | 7 | `plus-offer-status` | Pass |
| It adds a combined Markdown review packet with findings and both scripts. | 12 | `plus-offer-status` | Pass |
| Every safety check, dry run, CSV and undo export stays free. | 11 | `plus-offer-status` | Pass |
| Sociobot/Dodo handles the sale, payment, and refund. | 7 | Legal explanation | Pass |
| Checkout is not available right now. | 6 | `plus-offer-status` | Pass |
| Verify an existing license below. | 5 | `plus-offer-status` | Pass |
| Free reviewer active. | 3 | `plus-offer-status` | Pass |
| Plus is optional. | 3 | `plus-offer-status` | Pass |
| Review batch renames before files change. | 6 | Product one-liner | Pass |
| Built by Param Factory. | 4 | Attribution | Pass |
| Notebook illustration generated for this product with the factory image model. | 11 | Provenance statement | Pass |

## Headings and controls

| Copy | Kind | Result |
| --- | --- | --- |
| BATCH RENAME / SAFETY CHECK | Eyebrow | Pass |
| Review batch renames before you run them. | H1 | Pass |
| Add the proposed names | H2 | Pass |
| Choose file-name rules | Details heading | Pass |
| Review rename risks | H2 | Pass |
| Export a reversible rename plan | H2 | Pass |
| OPTIONAL PLUS UPGRADE | Eyebrow | Pass |
| The reviewer is free. Plus exports one combined review packet. | H2 | Pass |
| Try it with sample data | Primary link | Pass |
| Import CSV or JSON | File action | Pass |
| Load risky sample plan | Button | Pass |
| Delete local draft | Button | Pass |
| Show all findings / Show errors / Show warnings / Show notes | Accessible filter names | Pass |
| Generate live commands | Checkbox action | Pass |
| Export shell plan | Button | Pass |
| Export PowerShell | Button | Pass |
| Export undo manifest | Button | Pass |
| Export reviewed mapping | Button | Pass |
| Verify license | Button | Pass |
| Export Plus review packet | Button | Pass |

## Terminology

| Concept | Product word |
| --- | --- |
| Proposed current-to-new file list | mapping |
| Supplied test dataset | sample plan |
| Isolated try-out | demo |
| Browser-persisted real work | draft |
| Exported shell or PowerShell output | plan |
| Combined paid export | review packet |

The README uses absolute product URLs for the demo, privacy policy, and terms.
The catalog sentence starts with **Review**, contains 14 words and 91
characters, and is within the 120-character limit.
