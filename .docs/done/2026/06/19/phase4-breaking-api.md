# Phase 4 Breaking API Done

## Summary

- Implemented the breaking API contracts from `IMPROVEMENT_PLAN.md` Phase 4.
- String children beginning with `_html:` now render literally instead of silently becoming raw DOM.
- Added `trustedHTML()` as the explicit trusted-markup helper while keeping `safeHTML()` as a deprecated alias for the migration window.
- Removed implicit browser global writes on normal import and added explicit `app.use_globals()` opt-in for legacy script-tag behavior.
- Removed `query()` from runtime and public declarations in favor of `runAsync()`.
- Implemented documented router `:param` and `*` pattern matching while preserving exact-route precedence and hierarchical fallback behavior.
- Added migration documentation for the breaking changes.

## Verification

- `npm test -- --runInBand tests/vdom-my.spec.tsx tests/router.spec.ts tests/router-existing-behavior.spec.ts tests/router-hierarchical-behavior.spec.ts tests/typescript-declarations.spec.ts tests/react-compatibility.spec.ts` passed: 6 suites, 149 tests.
- `npm test -- --runInBand` passed: 47 suites, 566 tests.
- `npm run build` passed.
- `git diff --check` passed.

## Notes

- Committed as `8d529ec feat: prepare phase 4 breaking api`.
- This phase intentionally did not add sanitization, remove `safeHTML()` entirely, redesign routing beyond documented patterns, or take on Phase 3 packaging work.
