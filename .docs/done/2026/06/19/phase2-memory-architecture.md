# Phase 2 Memory And Architecture Done

## Summary

- Repaired the shared memory and event architecture defects from `IMPROVEMENT_PLAN.md` Phase 2.
- Keyed VDOM reconciliation is now scoped to the parent being updated instead of using a global node cache.
- Removed child components are unmounted and removed from parent caches so stale subscriptions do not survive view removal.
- Component unload tracking now uses a shared observer path instead of one full-document observer per component.
- Event errors can flow through an application-level `error` event while preserving console reporting for apps without an error handler.
- Delayed event timers are owned by subscriptions, and wildcard dispatch uses a maintained wildcard index.

## Verification

- `npm test -- --runInBand tests/app.spec.ts tests/component.spec.tsx tests/vdom-my-advanced-keyed.spec.tsx tests/nested-components.spec.tsx tests/memory-leak.spec.ts` passed: 5 suites, 88 tests.
- `npm test -- --runInBand` passed: 47 suites, 559 tests.
- `npm run build` passed.
- `git diff --check` passed.

## Notes

- Committed as `1441829 fix: patch phase 2 memory architecture`.
- A null-key regression was found and fixed before final verification: `0` and `""` remain valid keys; `null` and missing props stay unkeyed.
- Router pattern matching, raw HTML removal, package exports, and lint migration stayed out of scope.
