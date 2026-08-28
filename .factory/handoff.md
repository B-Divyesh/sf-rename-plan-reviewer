# Rename Plan Reviewer — build handoff

## Shipped

- Complete local-first mapping workflow: CSV/TSV/semicolon import, JSON plan import, and regex-based generation with immediate review.
- Deterministic checks for duplicate sources/targets, case and Unicode normalization collisions, reserved Windows names, invalid/control/trailing characters, absolute paths, traversal, case-only moves, rename cycles, numbering gaps, and destinations nested under another moving path.
- Safe two-phase ordering with deterministic temporary paths. Shell and PowerShell exports quote literal paths, preflight every source, unmanaged destination, temporary path, and destination directory, and print only by default. Live commands require an explicit toggle.
- Reviewed CSV, undo JSON manifest, and optional Plus combined Markdown packet. Free safety checks and individual data/script exports remain ungated.
- Sociobot one-time license flow: pilot checkout link, callback-token capture, local token/verdict storage, daily verify cap, optimistic cached unlock, background reconciliation, and paste-to-restore. Production API base is set through `VITE_BILLING_BASE`; no product ID is hardcoded.
- IndexedDB draft persistence with visible save state and user-controlled clearing. No rename path leaves the device.
- Installable PWA with 192/512/maskable icons, versioned precache, cache-first local assets, network-first navigation/API behavior, offline fallback, and waiting-worker update toast.
- Handwritten lab-notebook interface, original generated/optimized hero, responsive 390px layout, keyboard operation, strong focus states, reduced-motion behavior, semantic legal pages, and no runtime third parties.

## Verification

Run from a clean checkout:

```sh
npm ci
npm test
npm run build
```

Verified 2026-08-28 in Chromium:

- Unit: 9 tests passed, including swaps, duplicate targets, reserved names, unsafe paths, Unicode collision, nested moving parents, regex input, quoting, and 1,000 safe mappings with 1,000 unique temporary paths.
- Browser: 6 tests passed across desktop Chromium and Pixel 5 (keyboard skip path, serious/critical axe scan, risky-to-safe workflow, file download, no console errors, no mobile overflow).
- Offline: service-worker-controlled app reloaded and completed a review with the browser network disabled on desktop and mobile.
- Production build: `dist/index.html` present; initial JS 32.81 KB raw / 12.27 KB gzip; CSS 13.94 KB raw / 3.95 KB gzip; hero WebP 25.6 KB.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 92; LCP 1.5 s, CLS 0, total blocking time 30 ms (local preview, headless Chromium). INP has no meaningful lab sample; TBT is recorded as its lab responsiveness proxy.
- `npm audit`: 0 known vulnerabilities.

## Known limits

- The browser intentionally cannot inspect the real filesystem. A plan can only reason about supplied mappings; exported scripts perform real-state preflight immediately before any move.
- The generated script stops on an unexpected runtime failure but does not automatically roll back a partially completed phase. The deterministic temp names and undo manifest support recovery; keep a backup for irreplaceable data.
- Numbering-gap detection recognizes the final numeric run in a destination and groups equal prefixes/suffixes and digit widths. More domain-specific numbering conventions remain a manual review.
- Checkout stays on the pilot API until deployment supplies the production `VITE_BILLING_BASE` and the factory registers the product.

## Next steps

- Factory: register the paid product, set the production billing base, and deploy `dist/`.
- Optionally add signed checksums to exported review packets if teams begin passing plans between reviewers.
