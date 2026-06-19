# Phase 4 Breaking API Plan

## Goal

Make AppRun's 4.0 API surface honest: no implicit raw-HTML text magic, no import-time global pollution, no deprecated `query()` runtime API, documented router pattern syntax that actually works, and a trusted-HTML helper name that does not imply sanitization.

## Current Context

- `src/vdom-my.ts` parses any text child beginning with `_html:` through `insertAdjacentHTML()`. `src/vdom-to-html.tsx` mirrors that behavior for HTML rendering.
- `src/vdom-my.ts` exports `safeHTML()`, `src/vdom.ts` re-exports it, `src/apprun.ts` installs it on `app`, and `apprun.d.ts` declares it as public API.
- `src/apprun.ts` currently assigns `window.Component`, `window._React`, `window.React`, `window.on`, `window.customElement`, and `window.safeHTML` during module initialization.
- `src/apprun-html.ts` also assigns lit-renderer globals and reads `_React` when assigning `React`.
- `src/app.ts`, `src/component.ts`, `src/apprun.ts`, `src/types.ts`, and `apprun.d.ts` still expose deprecated `query()`.
- `src/router.ts` headers document `:param` and `*`, but `findHandlerInHierarchy()` only checks exact event names generated from the route hierarchy.
- Existing router tests cover exact matching, hierarchical fallback, 404 behavior, base path, and duplicate route prevention. New tests should extend these rather than replace them.
- `webpack.config.cjs` builds UMD bundles from the same `src/apprun.ts` entry, so automatic script-tag global installation cannot be introduced through a separate source path without build-level work. This story will provide explicit opt-in globals instead of trying to infer script-tag usage.

## Decisions

- Remove `_html:` parsing from text rendering. Raw HTML must come from a helper, not a string prefix.
- Introduce `trustedHTML(html)` as the preferred helper. Keep `safeHTML(html)` as a deprecated alias for one migration window because removing both the unsafe name and the helper call at once creates needless churn.
- Update source headers to call the helper trusted HTML, not safe or sanitized HTML.
- Add `app.use_globals()` as the explicit opt-in global installer. It writes the legacy globals intentionally and preserves existing `window.React` under `_React`.
- Do not automatically call `use_globals()` from `src/apprun.ts` or `src/apprun-html.ts`. Script-tag users can call it explicitly; bundler consumers get no import-time global pollution.
- Remove `query()` methods from `App` and `Component`, remove singleton `app.query` assignment, and remove query declarations. Users must call `runAsync()`.
- Implement pattern matching before hierarchical fallback, after exact matching. Exact routes keep priority. Pattern routes are tried from most specific to least specific by segment count, with `:param` values and `*` rest parameters passed to handlers.
- Preserve existing hierarchical fallback when no exact or pattern route matches.
- Use unit/jsdom tests only. These are library API contracts; no browser E2E spec is needed.
- Add `MIGRATION.md` if missing and document each breaking item concisely.

## Phased Tasks

### Phase 1 - Discovery and scope lock

- [x] Inspect `IMPROVEMENT_PLAN.md` Phase 4 to identify the five breaking API items and their intended replacements.
- [x] Inspect `src/vdom-my.ts`, `src/vdom-to-html.tsx`, `src/vdom.ts`, `src/apprun.ts`, and `src/apprun-html.ts` to confirm current raw/trusted HTML and global behavior.
- [x] Inspect `src/app.ts`, `src/component.ts`, `src/types.ts`, and `apprun.d.ts` to confirm all `query()` runtime and declaration surfaces.
- [x] Inspect `src/router.ts` and existing router specs to confirm current exact and hierarchical matching behavior.
- [x] Record non-goals so this story does not absorb package exports, strict TypeScript, ESLint, sanitization, or dead-file cleanup.

### Phase 2 - Trusted HTML contract

- [x] Update `src/vdom-my.ts` so text nodes render `_html:` strings literally.
- [x] Add `trustedHTML(html)` in `src/vdom-my.ts` and keep `safeHTML(html)` as a deprecated alias.
- [x] Update `src/vdom.ts`, `src/apprun.ts`, `src/apprun-html.ts`, `src/types.ts`, and `apprun.d.ts` exports/declarations so `trustedHTML` is first-class and `safeHTML` is compatibility-only.
- [x] Update `src/vdom-to-html.tsx` so server/html rendering treats `_html:` strings literally.
- [x] Add or update `tests/vdom-my.spec.tsx` or nearby VDOM tests for literal `_html:` text, `trustedHTML()`, and the `safeHTML()` alias.

### Phase 3 - Remove implicit globals and query

- [x] Update `src/apprun.ts` so module initialization does not assign browser globals by default.
- [x] Add `app.use_globals()` in `src/apprun.ts` to install `Component`, `_React`, `React`, `on`, `customElement`, `trustedHTML`, and deprecated `safeHTML` intentionally.
- [x] Update `src/apprun-html.ts` so lit globals are not assigned on import and the renderer can still be installed explicitly through `app.use_globals()` or another clear opt-in path.
- [x] Remove `query()` from `src/app.ts` and `src/component.ts`.
- [x] Remove singleton `app.query` assignment from `src/apprun.ts`.
- [x] Update `src/types.ts`, `apprun.d.ts`, and `tests/typescript-declarations.spec.ts` so runtime and declaration tests reflect `runAsync()` without `query()`.
- [x] Add or update tests that importing AppRun does not overwrite `window.React` and that `app.use_globals()` installs globals intentionally.

### Phase 4 - Router pattern matching

- [x] Update `src/router.ts` route matching helpers to recognize `:param` and `*` pattern segments.
- [x] Preserve exact-route priority before pattern matching in `src/router.ts`.
- [x] Preserve hierarchical fallback when no exact or pattern route matches.
- [x] Add or update router tests for `:param`, `*`, exact-over-pattern priority, and hierarchical fallback after pattern misses.
- [x] Confirm `ROUTER_EVENT` receives the matched pattern event name plus extracted parameters.

### Phase 5 - Migration docs and generated output

- [x] Create or update `MIGRATION.md` with `_html:` removal, `trustedHTML()`, `safeHTML()` alias status, explicit globals, `query()` removal, and router pattern matching.
- [x] Run focused tests for VDOM, router, globals, and declaration coverage and record the result.
- [x] Run `npm test -- --runInBand` and record the result.
- [x] Run `npm run build` and record the result.
- [x] Run `git diff --check` and record the result.
- [x] Review generated `esm/`, `dist/`, `demo/app.js`, and `jsx-runtime.js` output for expected source-derived changes only.

### Phase 6 - Documentation and status

- [x] Update this plan's task checkboxes only after the corresponding source, test, doc, or verification evidence exists.
- [x] Update the REQ acceptance criteria after verification evidence exists.
- [x] Record final evidence showing every Phase 4 breaking API contract is satisfied.

## Validation

- Focused regression command:

  ```sh
  npm test -- --runInBand tests/vdom-my.spec.tsx tests/router.spec.ts tests/router-existing-behavior.spec.ts tests/router-hierarchical-behavior.spec.ts tests/typescript-declarations.spec.ts tests/react-compatibility.spec.ts
  ```

- Full unit command:

  ```sh
  npm test -- --runInBand
  ```

- Build command:

  ```sh
  npm run build
  ```

- Diff hygiene:

  ```sh
  git diff --check
  ```

## Rollback / Risk

- Removing `_html:` is intentionally breaking. Rollback is limited to `src/vdom-my.ts`, `src/vdom-to-html.tsx`, trusted-HTML exports, generated output, and migration notes.
- Removing implicit globals can break script-tag users who relied on import-time globals. The explicit `app.use_globals()` path must be documented and tested.
- Removing `query()` breaks any runtime or typings consumer that has not migrated to `runAsync()`.
- Router pattern matching can accidentally change existing hierarchical behavior. Exact routes must remain first, and hierarchical fallback tests must stay green.
- Generated bundles are tracked in this repo, so source changes must be followed by `npm run build`.

## Final Evidence

- Focused regression command passed: `npm test -- --runInBand tests/vdom-my.spec.tsx tests/router.spec.ts tests/router-existing-behavior.spec.ts tests/router-hierarchical-behavior.spec.ts tests/typescript-declarations.spec.ts tests/react-compatibility.spec.ts` (`6` suites, `149` tests).
- Full unit command passed: `npm test -- --runInBand` (`47` suites, `566` tests).
- Build command passed: `npm run build`.
- Diff hygiene command passed: `git diff --check`.
