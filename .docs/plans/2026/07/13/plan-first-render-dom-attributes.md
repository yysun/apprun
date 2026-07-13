# Plan: First-render DOM class reconciliation

## Goal

Restore AppRun 3.30.2 class cleanup when AppRun first renders a null-props vnode over server or placeholder markup, without broadening attribute cleanup or changing later render behavior.

## Current Context

- `src/vdom-my.ts` reuses same-tag DOM children and delegates prop changes to `updateProps`.
- `src/vdom-my-prop-attr.ts` normalizes `className` only when `newProps` is truthy. A null-props vnode therefore returns `{}` before the patcher receives a `class` key.
- AppRun 3.30.2 normalized null props through an empty object and synthesized `class: undefined`, causing the shared attribute setter to remove a stale DOM class. AppRun 3.38.0 lost only that null-props class cleanup in this merge path.
- `tests/vdom-my-dom-contamination.spec.tsx` owns DOM/VDOM exact-matching and property-cache regression coverage.
- The repository uses Jest with jsdom, `npm test`, and `npm run build`. This is a renderer-internal change, so no separate E2E specification is needed.

## Decisions

- Normalize null or undefined `newProps` through an empty object before `className` conversion, restoring the legacy `class: undefined` removal signal.
- Keep `mergeProps` as the single diff policy and keep actual removal in `setAttributeOrProperty`.
- Do not seed the cache from DOM attributes; that would broaden behavior beyond the regression and could remove internal or intentionally preserved markup.
- Reject an application-specific spinner rule, a feature flag, a hydration mode, and changes to child/key reconciliation.

## Phased Tasks

### Phase 1 - Reproduce and scope the regression

- [x] Add a failing case to `tests/vdom-my-dom-contamination.spec.tsx` that renders a null-props vnode over a `loader-ripple spinner` placeholder and proves the stale class is removed.
- [x] Add a same-tag placeholder case proving explicit `className` replaces the server class, and confirm existing `class`/`className` normalization coverage remains intact.
- [x] Run `npm test -- --runInBand tests/vdom-my-dom-contamination.spec.tsx` and record the pre-fix failure: both null and undefined cases retained `loader-ripple spinner` while the explicit `className` replacement case passed.

### Phase 2 - Repair the shared reconciliation boundary

- [x] Update `src/vdom-my-prop-attr.ts` so null or undefined new props still produce the legacy class-removal signal.
- [x] Preserve the existing cached-prop path for all subsequent renders so property nullification, style replacement, dataset cleanup, and event cleanup remain stable.
- [x] Confirm the fix does not inspect or remove unrelated existing DOM attributes and does not weaken focus, selection, scroll, or media skip logic; the regression test preserves representative `data-*` and `title` attributes.

### Phase 3 - Audit adjacent attribute families

- [x] Compare the 3.30.2 and 3.38.0 merge paths and record whether any behavior besides null-props class cleanup changed: the null guard removed only the synthesized `class: undefined` key; cached and non-class prop paths are unchanged.
- [x] Run the focused DOM-contamination, attribute-normalization, boolean-attribute, dataset, style, skip-logic, and SSR test files: 7 suites and 90 tests passed.
- [x] Confirm no router, keyed-child, lifecycle, or application-specific behavior was introduced; the diff is limited to the shared prop merge and its regression coverage.

### Phase 4 - Full verification and review

- [x] Run `npm test -- --runInBand`: 47 suites and 544 tests passed; existing expected console warnings/assertions remained non-failing.
- [x] Run `npm run build`: TypeScript, Rollup, and Webpack completed successfully.
- [x] Run `git diff --check` and review the final diff for scope, correctness, performance, and compatibility risks; no blocking code-review findings remain.

### Phase 5 - Completion artifacts

- [x] Update this plan with completed task state only after corresponding code and evidence exist.
- [x] Create `.docs/done/2026/07/13/first-render-dom-attributes.md` with the implemented contract, verification commands, and any concrete residual risk.
- [x] Commit only the requirement, plan, test, renderer, and done-document changes with a user-visible conventional commit message.

## Validation

- Pre-fix proof: `npm test -- --runInBand tests/vdom-my-dom-contamination.spec.tsx` must fail on inherited first-render attributes.
- Focused regression: `npm test -- --runInBand tests/vdom-my-dom-contamination.spec.tsx tests/vdom-my-attribute-normalization.spec.tsx tests/vdom-my-boolean-attributes.spec.tsx tests/vdom-my-dataset-handling.spec.tsx tests/style.spec.tsx tests/vdom-my-skip-logic.spec.tsx tests/vdom-my-ssr.spec.tsx`.
- Full suite: `npm test -- --runInBand`.
- Build: `npm run build`.
- Diff hygiene: `git diff --check` and a requirement-focused code review.

## Rollback / Risk

- Restoring the legacy synthesized `class` key is narrow, but any code that intentionally relied on a stale server class surviving a null-props render will change back to the pre-3.38 behavior.
- The fix must not read browser-managed state or arbitrary HTML attributes.
- Rollback is limited to the null-props normalization change and its targeted test; no schema, migration, or persisted data is involved.
