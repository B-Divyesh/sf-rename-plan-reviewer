# Visual thesis — the rename laboratory notebook

## Direction and rationale

Rename Plan Reviewer is a handwritten lab notebook for a risky experiment. The page is warm graph paper; mappings read like specimens laid out for inspection; indigo pencil marks denote evidence, vermilion circles flag danger, and green proof marks show checks that passed. This is not nostalgia as decoration: the notebook metaphor makes a reviewable plan feel provisional, inspectable, and safe before it becomes a script.

The experience is deliberately single-mode and light. A paper notebook should not unexpectedly become a black screen, and the warm low-glare ground remains legible in dim environments. Browser `color-scheme` still styles native controls consistently.

## Tokens

- Paper background `#f3eedf`; raised paper `#fffaf0`; graphite text `#24231f`; muted graphite `#625f55`.
- Ink accent `#213f75`, with white text; proof green `#176143`; warning ochre `#815400`; danger vermilion `#a12c24`.
- Rules `#c9bea5`; graph lines are a low-opacity indigo. All body/status pairs meet WCAG AA (4.5:1); interactive boundaries and focus use at least 3:1.
- Spacing follows an 8px rhythm, with 4px only inside tightly related marks. Wide pages use an asymmetric 5/7 workbench grid; phones stack input, summary, then findings and hide only explanatory flourishes.

## Type and marks

Two local/system families only: Georgia for the editorial title and section labels, and ui-monospace/SFMono/Menlo for filenames, figures, labels, and controls. Human warmth comes from slightly irregular underline strokes and a small author-made SVG pencil/check mark, not from an unreadable novelty font. Body text is 16px minimum, 1.55 leading; numbers use tabular figures.

## Interaction grammar

- The primary path is numbered like a lab protocol: add mappings, set assumptions, review, export.
- Controls resemble clipped notes with square-soft corners, while the plan table remains visually open and ruled.
- Errors always pair an icon/word with color and identify the affected rows. Clicking a summary counter filters the findings; Escape clears it.
- Every export is visibly a dry run by default. Enabling live commands is an explicit switch and never weakens the findings.
- Keyboard: Tab follows the protocol order; Enter activates buttons; table rows are readable rather than interactive; focused controls get a double indigo/cream ring.

## Motion policy

Only state changes move: findings settle upward by 6px over 180ms and the update notice slides from its source edge over 220ms. Nothing loops. Under `prefers-reduced-motion: reduce`, transforms and smooth scrolling are removed and changes are instant.

## Original asset plan and provenance

The hero spot illustration is a generated overhead still life: a paper rename ledger, crossing pencil arrows, two file tabs, a red collision circle, and a green proof tick. It explains the product's review-before-action purpose; it contains no UI claims or text. UI icons and logo marks are hand-authored SVG/CSS.

Prompt sheet:

> Use case: stylized-concept. Asset type: compact landing page hero spot illustration. Primary request: overhead editorial still life of a careful batch-file rename plan being reviewed before execution. Scene: warm ivory graph-paper notebook page, two small unlabeled file-tab cards connected by indigo pencil arrows, one vermilion collision circle, one forest-green proof tick, brass binder clip, faint eraser crumbs. Style: tactile cut-paper and colored-pencil editorial illustration, handmade lab notebook, sophisticated and restrained. Composition: horizontal 3:2, objects centered with generous paper around them, readable at small size. Lighting: soft northern-window light, subtle real paper shadows. Palette: warm ivory, graphite, deep indigo, vermilion, proof green, muted brass. Avoid: all text, letters, numbers, logos, brands, watermark, people, hands, screens, glossy 3D, gradients, photoreal file icons, accidental symbols.

Generated with the factory image deployment through `/opt/fleet/lib/gen-image.sh` on 2026-08-28. Original generation; no external source assets. The selected PNG is retained with a JSON sidecar under `assets/src/`; shipped WebP is optimized to under 300 KB. Generated imagery is disclosed in the footer.
