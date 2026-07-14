# Plan: First-render DOM class reconciliation

## Goal

Restore correct class cleanup when AppRun 6.0.0 first renders a null- or undefined-props vnode over server or placeholder markup, without broadening attribute cleanup or changing later render behavior.

## Current Context

- `src/vdom-my.ts` reuses same-tag DOM children and delegates prop changes to `updateProps`.
- `src/vdom-my-prop-attr.ts` normalizes `className` only when `newProps` is truthy. A null-props vnode therefore returns an empty patch before the attribute setter receives a `class` removal signal.
- Commit `3536c45abace4a050218ed8b9960d0cbd58081b1` corrects the same defect on the 3.38.1 line, but it is not an ancestor of `master` or the repository's `6.0.0` release snapshot.
- `tests/vdom-my-dom-contamination.spec.tsx` owns DOM/VDOM exact-matching and property-cache regression coverage.
- The repository uses Jest with jsdom through `npm test`, and `npm run build` runs TypeScript, Rollup, Webpack, and the Pages asset sync.
- This is renderer-internal behavior with direct jsdom coverage; no separate E2E specification is needed.

## Decisions

- Normalize null or undefined `newProps` through an empty object before `className` conversion, restoring the `class: undefined` removal signal.
- Keep `mergeProps` as the single diff policy and keep actual removal in `setAttributeOrProperty`.
- Reapply the functional behavior of `3536c45` to `master` instead of merging the side branch and its unrelated release ancestry.
- Preserve unrelated existing DOM attributes because seeding the VDOM cache from arbitrary DOM state would broaden the contract and risk removing server-owned metadata.
- Reject an application-specific spinner rule, feature flag, fallback, compatibility mode, hydration mode, and changes to child/key reconciliation.

## Phased Tasks

### Phase 1 - Reproduce and lock the scope

- [x] Add null- and undefined-props cases to `tests/vdom-my-dom-contamination.spec.tsx` that render over a `loader-ripple spinner` placeholder and require the stale class to be removed.
- [x] Add an explicit `className` case proving the first vnode replaces the server class while unrelated server-owned attributes survive.
- [x] Run `npm test -- --runInBand tests/vdom-my-dom-contamination.spec.tsx` before the source fix; 2 cases failed because `loader-ripple spinner` remained, while 12 cases passed.
- [x] Confirm the regression is limited to first-render class reconciliation and does not require DOM attribute hydration or a renderer-wide rewrite.

### Phase 2 - Repair the shared reconciliation boundary

- [x] Update the top comment block and `mergeProps` in `src/vdom-my-prop-attr.ts` so null or undefined new props produce the class-removal signal.
- [x] Preserve the cached-prop diff path for subsequent renders so property nullification, styles, datasets, events, and form behavior remain stable.
- [x] Keep focus, selection, scroll, media skip logic, and unrelated DOM attributes outside the change.
- [x] Update the top comment block in `tests/vdom-my-dom-contamination.spec.tsx` to describe the new regression coverage.

### Phase 3 - Focused verification and code review

- [x] Run `npm test -- --runInBand tests/vdom-my-dom-contamination.spec.tsx`; 1 suite and 14 tests passed.
- [x] Run `npm test -- --runInBand tests/vdom-my-dom-contamination.spec.tsx tests/vdom-my-attribute-normalization.spec.tsx tests/vdom-my-boolean-attributes.spec.tsx tests/vdom-my-dataset-handling.spec.tsx tests/style.spec.tsx tests/vdom-my-skip-logic.spec.tsx tests/vdom-my-ssr.spec.tsx`; 7 suites and 90 tests passed.
- [x] Review `git diff` against the REQ for scope, class semantics, preservation of unrelated attributes, and accidental compatibility behavior; CR passed with no major flaws.
- [x] Run `git diff --check`; no diff hygiene failures were reported.

### Phase 4 - Full verification

- [x] Run `npm test -- --runInBand`; all 47 suites and 623 tests passed, with existing expected console warnings/assertions remaining non-failing.
- [x] Run `npm run build`; TypeScript, Rollup, Webpack, and the post-build Pages asset sync succeeded.
- [x] Inspect generated-file changes from the build; `demo/app.js` and the tracked `docs/assets` HTML/Play bundles and maps are intentional release-surface outputs, and both maps embed the updated source.
- [x] Compare every REQ acceptance criterion with code, tests, and verification evidence; VR found every criterion complete with no blocking review issue.

### Phase 5 - Completion artifacts

- [x] Mark plan tasks complete only after the corresponding change or evidence exists.
- [x] Create `.docs/done/2026/07/14/first-render-dom-attributes.md` with the implemented contract, exact verification commands, results, and concrete residual risks.
- [x] Stage only the REQ, plan, renderer, regression test, intentional generated assets, and done document.
- [x] Commit the completed story with a conventional message describing the first-render class reconciliation fix.

## Validation

- Pre-fix proof: `npm test -- --runInBand tests/vdom-my-dom-contamination.spec.tsx` must fail because inherited first-render classes remain.
- Focused regression: `npm test -- --runInBand tests/vdom-my-dom-contamination.spec.tsx`.
- Adjacent VDOM coverage: `npm test -- --runInBand tests/vdom-my-dom-contamination.spec.tsx tests/vdom-my-attribute-normalization.spec.tsx tests/vdom-my-boolean-attributes.spec.tsx tests/vdom-my-dataset-handling.spec.tsx tests/style.spec.tsx tests/vdom-my-skip-logic.spec.tsx tests/vdom-my-ssr.spec.tsx`.
- Full suite: `npm test -- --runInBand`.
- Production build: `npm run build`.
- Diff hygiene and review: `git diff --check`, `git status --short`, and requirement-focused inspection of `git diff`.

## Rollback / Risk

- Any application that intentionally relies on a stale server class surviving a null-props first render will return to the established cleanup behavior; this is the intended compatibility correction.
- The patch must not read browser-managed state or arbitrary HTML attributes into the VDOM cache.
- The build syncs generated browser assets into `docs/assets`; those changes must be inspected rather than accepted mechanically.
- Rollback is limited to the null-props normalization change, its regression coverage, and corresponding generated bundles; no schema, migration, or persisted data is involved.
