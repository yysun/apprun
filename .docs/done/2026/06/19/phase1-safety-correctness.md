# Phase 1 Safety And Correctness Done

## Summary

- Fixed the patch-level safety defects from `IMPROVEMENT_PLAN.md` Phase 1.
- Wildcard `once` handlers now clean up after the first matching dispatch.
- Promise-backed component state now keeps latest-resolution semantics and avoids storing unresolved promises as settled state.
- Path-router interception now preserves native browser link behavior for modified, external, download, prevented, non-self, and non-primary clicks.
- `$bind` on `textarea`, custom-element lifecycle handling, and component tracking IDs were repaired without adding compatibility flags.
- Added CI coverage for install, unit tests, and build on pull requests and pushes.

## Verification

- `npm test -- --runInBand tests/app.spec.ts tests/component.spec.tsx tests/router.spec.ts tests/directive.spec.tsx tests/custom-element.spec.tsx tests/stateful-component.spec.tsx` passed: 6 suites, 110 tests.
- `npm test -- --runInBand` passed: 47 suites, 548 tests.
- `npm run build` passed.
- `git diff --check` passed.

## Notes

- Committed as `dcfe1b9 fix: patch phase 1 safety correctness`.
- Router params, raw HTML removal, strict TypeScript, and package cleanup stayed out of scope for this phase.
