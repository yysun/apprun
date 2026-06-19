# Phase 2 Memory And Architecture Plan

## Goal

Replace Phase 2's shared memory and event-system weak points with direct ownership boundaries: keyed nodes scoped to their parent, child components scoped to the latest render, unload observation shared across components, errors routed through one application event, delay timers owned by subscriptions, and wildcard dispatch indexed directly.

## Current Context

- `src/vdom-my.ts` stores keyed DOM nodes in a module-level `keyCache` and reuses nodes by raw key in `updateChildren()`. The `clearKeyCache()` export exists and must remain callable, but the global cache should stop being the reconciliation authority.
- `src/vdom-my.ts` stores child components in `parent.__componentCache` and never removes entries when a child disappears from the view. `render_component()` uses `id` or index-derived keys; `createComponent()` has enough traversal context to mark used keys.
- `src/component.ts` currently creates one `MutationObserver` per component with `unload`, observing `document.body` with subtree and attribute tracking. Phase 1 already changed tracking IDs to a counter.
- `src/app.ts` catches handler errors and logs to `console.error`, but there is no application-level error event. `component.ts` catches action errors separately and logs directly.
- `src/app.ts` stores delayed timer state as `options._t`, mutating caller-owned options and causing shared options objects to collide.
- `src/app.ts` discovers wildcard handlers by scanning `Object.keys(events)` on every dispatch, then sorting matches by pattern length.
- Existing tests cover many VDOM edge cases and Phase 1 regressions. Gaps remain for cross-parent key reuse, child component cache eviction, shared observer behavior, error event routing, private delay timers, and wildcard index behavior.

## Decisions

- Keep `clearKeyCache()` exported for compatibility, but make it a no-op cleanup hook once reconciliation no longer uses a module-level key cache.
- Build keyed lookup from `element.childNodes` inside each `updateChildren()` call. Reuse only nodes whose `.key` is present under that same parent.
- Track child component cache usage with a per-render mark set on each parent component and sweep unused cache entries after each top-level render pass.
- Preserve the existing component cache key rules (`id` first, index fallback) except where cleanup needs an explicit used-key marker.
- Use one module-level `MutationObserver` registry in `src/component.ts`. Components register their rendered element, tracking ID, and unload callback; `unmount()` unregisters them.
- Add an `error` event channel in `src/app.ts` with default console reporting only when no application error subscriber exists. Avoid recursive error reporting if an error handler itself fails.
- Keep handler error swallowing behavior compatible: errors are reported and `run()` continues through other subscribers; `runAsync()` still rejects for thrown async-handler errors after reporting.
- Store delayed timer IDs on the subscription object instead of `options`. Do not expose timer internals through the user-provided options object.
- Maintain a wildcard subscription index in `App`, updated by `on()` and `off()`, sorted by longest wildcard prefix first. Exact event lists remain in `_events`.
- E2E specs are not needed. All acceptance criteria are observable through Jest/jsdom unit tests.

## Phased Tasks

### Phase 1 - Discovery and scope lock

- [x] Inspect `IMPROVEMENT_PLAN.md` Phase 2 to identify the six memory/architecture items.
- [x] Inspect `src/vdom-my.ts` to confirm global key cache and child component cache behavior.
- [x] Inspect `src/component.ts` to confirm per-component `MutationObserver` behavior and current action error handling.
- [x] Inspect `src/app.ts` to confirm delay timer mutation, wildcard scanning, and error logging paths.
- [x] Inspect `tests/memory-leak.spec.ts`, `tests/vdom-my-bug-tests.spec.tsx`, `tests/vdom-my-advanced-keyed.spec.tsx`, and `tests/nested-components.spec.tsx` to identify focused regression locations.
- [x] Record non-goals in the REQ so this story does not absorb route, raw HTML, global React, type-strictness, packaging, or generated-artifact policy work.

### Phase 2 - VDOM memory boundaries

- [x] Update `src/vdom-my.ts` header comments so they describe parent-scoped keyed lookup rather than global `keyCache` cleanup.
- [x] Replace `src/vdom-my.ts` module-level keyed reconciliation state with a parent-local key map built from `element.childNodes` during `updateChildren()`.
- [x] Preserve `clearKeyCache()` as a compatible exported function that cannot affect rendering correctness.
- [x] Update `src/vdom-my.ts` component rendering so parent components mark which `__componentCache` keys were used during the current render.
- [x] Add a `src/vdom-my.ts` sweep after each component render traversal that calls `unmount()` and deletes unused child cache entries.

### Phase 3 - Component unload observer

- [x] Update `src/component.ts` header comments so unload tracking describes a shared observer registry.
- [x] Add module-level observer registry helpers in `src/component.ts` that register, unregister, and notify tracked component elements.
- [x] Replace per-component `this.observer` lifecycle in `src/component.ts` with shared registry calls from `renderState()` and `unmount()`.
- [x] Ensure `src/component.ts` calls `unload(state)` once when a tracked element is removed or its tracking attribute is replaced.

### Phase 4 - App event architecture

- [x] Update `src/app.ts` header comments so they describe error events, private delay timers, and wildcard indexing.
- [x] Update `src/app.ts` subscription shape so each subscription can own private delay timer state without mutating `options`.
- [x] Add `src/app.ts` error reporting helper that publishes `error` event payloads and defaults to `console.error` when no user error subscriber exists.
- [x] Update `src/app.ts` `run()`, delayed handlers, and `runAsync()` error paths to report through the error helper while preserving current execution/rejection behavior.
- [x] Update `src/component.ts` component action catch blocks to publish `error` with component and event context while preserving debug reporting.
- [x] Add and maintain a `src/app.ts` wildcard subscription index in `on()` and `off()`, and use it in `getSubscribers()` instead of scanning all `_events` keys.
- [x] Preserve wildcard dispatch ordering, event context, and `once` cleanup semantics.

### Phase 5 - Regression tests

- [x] Add or update `tests/vdom-my-advanced-keyed.spec.tsx` for same-key sibling or unrelated parent lists that must not steal DOM nodes from each other.
- [x] Add or update `tests/nested-components.spec.tsx` or `tests/memory-leak.spec.ts` for child component cache eviction and `unmount()` after disappearance.
- [x] Add or update `tests/component.spec.tsx` for shared unload observer behavior and single `unload(state)` on DOM removal.
- [x] Add or update `tests/app.spec.ts` for error event payloads from `run()`, `runAsync()`, delayed handlers, private delay timers, and wildcard index behavior.
- [x] Confirm Phase 1 regression tests still pass.

### Phase 6 - Verification and generated output

- [x] Run `npm test -- --runInBand tests/app.spec.ts tests/component.spec.tsx tests/vdom-my-advanced-keyed.spec.tsx tests/nested-components.spec.tsx tests/memory-leak.spec.ts` and record the result.
- [x] Run `npm test -- --runInBand` and record the result.
- [x] Run `npm run build` and record the result.
- [x] Run `git diff --check` and record the result.
- [x] Review generated `esm/`, `dist/`, `demo/app.js`, and `jsx-runtime.js` output for expected source-derived changes only.

### Phase 7 - Documentation and status

- [x] Update this plan's task checkboxes only after each corresponding code, test, or verification result exists.
- [x] Record final evidence showing every REQ acceptance criterion is satisfied.

## Validation

- Focused regression command:

  ```sh
  npm test -- --runInBand tests/app.spec.ts tests/component.spec.tsx tests/vdom-my-advanced-keyed.spec.tsx tests/nested-components.spec.tsx tests/memory-leak.spec.ts
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

## Final Evidence

- Focused regression command passed: `npm test -- --runInBand tests/app.spec.ts tests/component.spec.tsx tests/vdom-my-advanced-keyed.spec.tsx tests/nested-components.spec.tsx tests/memory-leak.spec.ts` (`5` suites, `88` tests).
- Full unit command passed: `npm test -- --runInBand` (`47` suites, `559` tests).
- Build command passed: `npm run build`.
- Diff hygiene command passed: `git diff --check`.
- Source review found and fixed a null-key regression before final verification: `0` and `""` remain valid keys, while `null` and missing props stay unkeyed.

## Rollback / Risk

- Keyed reconciliation is shared rendering infrastructure. The safest rollback is reverting `src/vdom-my.ts` plus generated outputs if keyed list regressions appear.
- Child cache eviction can expose components that relied on stale subscriptions after removal. That behavior is a bug, not a compatibility target.
- Error event routing must avoid recursion if an `error` handler throws.
- Shared observer cleanup must disconnect when the registry is empty to avoid keeping document references alive.
- Wildcard indexing must stay in sync with `on()` and `off()` or handlers will silently stop firing.
- Generated bundles are tracked in this repo, so source changes must be followed by `npm run build`.
