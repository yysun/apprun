# Phase 2 Memory And Architecture Requirement

## Problem

The Phase 2 items in `IMPROVEMENT_PLAN.md` are not cosmetic cleanup. They are shared architecture defects that let unrelated UI trees interfere with each other, keep dead components subscribed after they leave the view, multiply full-document observers, hide handler failures from application code, mutate caller-owned delay options, and scan every event name for wildcard dispatch.

Those behaviors create real product risk: stale event subscriptions fire after UI removal, keyed nodes can be moved out of the wrong parent, high-churn pages pay avoidable observer and wildcard-dispatch costs, and applications cannot route handler failures into their own reporting path.

## Requirement

AppRun must ship the Phase 2 memory/architecture patch without changing documented public APIs or adding feature flags.

The patch must make these contracts true:

- Keyed virtual DOM reconciliation only reuses keyed nodes that belong to the parent currently being updated.
- Removed stateful child components are unmounted and deleted from their parent component cache during render cleanup.
- Components with `unload` share one DOM removal observer instead of each installing a full-document observer.
- Event handler errors are published through a central `error` event while preserving console reporting when no application handler is installed.
- Delayed event timers are owned privately by the subscription, not written onto the caller's `options` object.
- Wildcard event dispatch uses a maintained wildcard subscription index instead of scanning all event names on every run.

## Acceptance Criteria

- [x] Two sibling or unrelated keyed lists using the same key value do not move DOM nodes between parents during updates.
- [x] `src/vdom-my.ts` no longer uses a module-level keyed DOM cache for reconciliation.
- [x] When a class component disappears from a parent render, its `unmount()` runs and its event subscriptions no longer respond.
- [x] Parent component caches retain components used in the latest render and delete components that were not used.
- [x] Multiple components with `unload` register with one shared observer path, and `unmount()` unregisters them.
- [x] Removing a tracked component element calls `unload(state)` exactly once.
- [x] `app.on('error', handler)` receives errors thrown from `App.run`, `App.runAsync`, delayed handlers, and component actions with enough context to identify the event and component where relevant.
- [x] Existing console error behavior remains for applications that do not subscribe to `error`.
- [x] Reusing the same options object for multiple delayed subscriptions does not make their timers cancel each other, and the options object is not mutated with internal timer state.
- [x] Wildcard event subscriptions still run after exact-name subscribers, still run from longest prefix to shortest prefix, still receive `{ event: actualName }`, and `once` wildcard cleanup still works.
- [x] Wildcard dispatch no longer scans non-wildcard event names to find wildcard subscribers.
- [x] Focused regression tests, full unit tests, and build pass, or unrelated/pre-existing failures are explicitly reported.

## Constraints

- Do not add feature flags, environment variables, fallback modes, or compatibility layers.
- Do not remove public APIs such as `clearKeyCache()` even if the implementation no longer needs a global key cache.
- Do not change documented event ordering for exact, wildcard, delayed, or once handlers.
- Do not change the public `Component.unload(state)` contract.
- Keep the implementation scoped to `src/vdom-my.ts`, `src/component.ts`, `src/app.ts`, tests, RPD docs, and generated build outputs.
- Preserve Phase 1 behavior and tests.

## Non-Goals

- Do not rewrite the full VDOM diffing algorithm beyond parent-scoped keyed lookup.
- Do not implement router `:param` matching or route dedup changes.
- Do not remove `_html:` raw HTML behavior.
- Do not change global `window.React` behavior.
- Do not introduce TypeScript strictness, packaging exports, ESLint, or dependency changes.
- Do not untrack generated `dist/`, `esm/`, `demo`, or `jsx-runtime` files in this story.

## Evidence

- Focused Phase 2 regression command passed: `npm test -- --runInBand tests/app.spec.ts tests/component.spec.tsx tests/vdom-my-advanced-keyed.spec.tsx tests/nested-components.spec.tsx tests/memory-leak.spec.ts` (`5` suites, `88` tests).
- Full unit command passed: `npm test -- --runInBand` (`47` suites, `559` tests).
- Build command passed: `npm run build`.
- Diff hygiene command passed: `git diff --check`.
