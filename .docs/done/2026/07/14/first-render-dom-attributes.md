# First-render DOM class reconciliation

## Summary

- Restored first-render cleanup when a null- or undefined-props vnode reuses an element with a stale server class.
- Kept the correction inside `mergeProps`; no spinner-specific rule, hydration mode, feature flag, or broad attribute cleanup was introduced.
- Added regression coverage for the loading-spinner failure, explicit `className` replacement, and preservation of unrelated server-owned attributes.

## Verification

- Pre-fix `npm test -- --runInBand tests/vdom-my-dom-contamination.spec.tsx` failed the null and undefined cases because `loader-ripple spinner` remained; after the fix, all 14 tests passed.
- The adjacent VDOM command passed 7 suites and 90 tests covering normalization, booleans, datasets, styles, skip logic, SSR, and contamination cleanup.
- `npm test -- --runInBand` passed all 47 suites and 623 tests; existing console warnings/assertions remained non-failing.
- `npm run build` completed TypeScript, Rollup, Webpack, and the tracked GitHub Pages asset sync successfully.

## Notes

- The tracked `demo/app.js` and `docs/assets` HTML/Play bundles were rebuilt because they are part of the repository-owned browser release surface.
- Code review and requirement verification found no blocking issue; applications intentionally relying on stale server classes will return to the established cleanup behavior.
