# Phase 1 Safety And Correctness Plan

## Goal

Patch the Phase 1 safety/correctness defects from `IMPROVEMENT_PLAN.md` without changing AppRun's public API. The final state must be enforced by focused regression tests plus CI coverage for install, test, and build.

## Current Context

- `src/app.ts` prunes exact-name `once` subscribers before dispatch but appends wildcard subscribers from their source lists without pruning those source lists. `run()` also contains a dead `return !sub.options.once` inside `forEach`.
- `src/component.ts` resolves promise state by calling `setState(v)` and then assigning `_state` back to the original promise. Existing async tests currently encode stale behavior where an older promise can overwrite newer state.
- `src/apprun.ts` installs a path-routing `document.body` click handler inside `DOMContentLoaded` that intercepts any same-origin anchor with a pathname.
- `src/directive.ts` maps `$bind` for `<textarea>` to `innerHTML`, unlike `<input>` and `<select>` which use value-like properties.
- `src/web-component.ts` defers mount with `requestAnimationFrame`, drops attribute changes before `_component` exists, calls `unload()` without state, and does not cancel the deferred mount after disconnect.
- `src/component.ts` generates unload tracking IDs from `Date.valueOf()`, which can collide in the same millisecond.
- `package.json` exposes `npm test`, `npm run build`, and `npm ci` through the lockfile; there is no `.github/workflows/` directory.
- Relevant test anchors are `tests/app.spec.ts`, `tests/component.spec.tsx`, `tests/router.spec.ts`, `tests/directive.spec.tsx`, and `tests/custom-element.spec.tsx`.

## Decisions

- Treat this as a patch-safe behavior fix. No feature flags, environment variables, compatibility switches, broad refactors, or migration layers.
- Keep wildcard event order unchanged: exact subscribers first, then matching wildcard subscriptions sorted by longest event pattern first.
- Use component-local pending-promise identity to ignore stale promise resolutions. This solves out-of-order promises without invalidating no-op `undefined` state returns.
- Keep router link interception helpers internal to `src/apprun.ts`; tests exercise the delegated body click listener so the public API does not change.
- Use `textarea.value` for `$bind`, matching DOM semantics and avoiding HTML parsing.
- Store custom-element pending mount RAF id and pending attribute changes on the element instance; replay queued changes after `_component._props` exists.
- Use a module-level counter for component tracking IDs. This is deterministic, fast, and does not require UUID or timestamp dependencies.
- CI should call existing project commands: `npm ci`, `npm test -- --runInBand`, and `npm run build`.
- E2E specs are not needed for this story. The behavior is library-level DOM/event code that jsdom unit tests can observe directly.

## Phased Tasks

### Phase 1 - Discovery and scope lock

- [x] Inspect `IMPROVEMENT_PLAN.md` to identify the patch-safe Phase 1 safety/correctness items.
- [x] Inspect `src/app.ts`, `src/component.ts`, `src/apprun.ts`, `src/directive.ts`, and `src/web-component.ts` to confirm the affected implementation paths.
- [x] Inspect `tests/app.spec.ts`, `tests/component.spec.tsx`, `tests/router.spec.ts`, `tests/directive.spec.tsx`, and `tests/custom-element.spec.tsx` to identify focused regression-test locations.
- [x] Record non-goals in the REQ so this patch does not absorb router params, raw HTML removal, global React behavior, key cache work, packaging cleanup, or TypeScript strictness.

### Phase 2 - Foundation changes

- [x] Update `src/app.ts` so `getSubscribers()` removes `once` subscribers from exact and wildcard source lists before handler execution while preserving wildcard event context and ordering.
- [x] Remove the dead `return !sub.options.once` inside the `src/app.ts` `run()` subscriber loop.
- [x] Update `src/component.ts` with a module-level tracking counter for unload tracking IDs.
- [x] Update `src/component.ts` with component-local pending-promise identity so only the latest competing promise resolution calls `setState()`.
- [x] Update `src/apprun.ts` click interception logic so unsupported anchor events fail clearly by falling back to native browser behavior instead of being hijacked.
- [x] Update `src/directive.ts` so textarea `$bind` writes `props.value`.
- [x] Update `src/web-component.ts` with pending RAF cancellation, queued pre-mount attribute changes, stateful `unload`, and safe re-render scheduling.

### Phase 3 - Feature implementation

- [x] Add or update `tests/app.spec.ts` for wildcard `once` pruning and verify exact-name once/delay behavior is unchanged.
- [x] Add or update `tests/component.spec.tsx` for latest-promise-wins state rendering, resolved `_state` storage, and unique unload tracking IDs.
- [x] Add or update `tests/router.spec.ts` or a targeted app-entry test for guarded path-router link interception and normal same-origin routing.
- [x] Add or update `tests/directive.spec.tsx` for textarea `$bind` preserving literal markup through `value`.
- [x] Add or update `tests/custom-element.spec.tsx` for queued attribute changes, disconnect-before-RAF cancellation, and `unload(state)`.
- [x] Confirm no feature flag, fallback mode, or compatibility layer was introduced.

### Phase 4 - CI and verification wiring

- [x] Add `.github/workflows/ci.yml` that runs `npm ci`, `npm test -- --runInBand`, and `npm run build` on pull requests and pushes.
- [x] Run `npm test -- --runInBand tests/app.spec.ts tests/component.spec.tsx tests/router.spec.ts tests/directive.spec.tsx tests/custom-element.spec.tsx tests/stateful-component.spec.tsx` and record the result.
- [x] Run `npm run build` and record the result.
- [x] Run `npm test -- --runInBand` and record the result unless a focused failure remains unresolved.

### Phase 5 - Documentation and status

- [x] Update this plan's task checkboxes only after each corresponding code, test, CI, or verification result exists.
- [x] Record final evidence showing every REQ acceptance criterion is satisfied.

## Validation

- Focused regression command:

  ```sh
  npm test -- --runInBand tests/app.spec.ts tests/component.spec.tsx tests/router.spec.ts tests/directive.spec.tsx tests/custom-element.spec.tsx
  ```

- Build command:

  ```sh
  npm run build
  ```

- Full unit command:

  ```sh
  npm test -- --runInBand
  ```

- Expected evidence: focused tests pass, build passes, full unit suite passes or any unrelated/pre-existing failures are identified with exact failing tests.

Final evidence:

- `npm test -- --runInBand tests/app.spec.ts tests/component.spec.tsx tests/router.spec.ts tests/directive.spec.tsx tests/custom-element.spec.tsx tests/stateful-component.spec.tsx` passed: 6 suites / 110 tests.
- `npm test -- --runInBand` passed: 47 suites / 548 tests.
- `npm run build` passed: `tsc -p src`, Rollup, and Webpack completed successfully.
- `git diff --check` passed with no whitespace errors.

## Rollback / Risk

- Router interception is high-impact because it runs on every body click in path-routing mode. The guarded behavior must keep plain same-origin links working while leaving native browser behaviors alone.
- Async state ordering intentionally changes stale behavior currently represented in an existing test. The test must be updated to the required latest-state-wins contract.
- Web-component lifecycle tests depend on `requestAnimationFrame`; use fake RAF control or a deterministic mock so tests do not become timer-flaky.
- CI may expose pre-existing full-suite or build issues. Report those separately instead of weakening the workflow.
