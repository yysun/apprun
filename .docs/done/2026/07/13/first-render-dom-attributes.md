# First-render DOM class reconciliation

## Summary

- Restored AppRun 3.30.2 behavior when a null- or undefined-props vnode reuses an element with a stale server class.
- Kept the fix inside `mergeProps`; no application-specific spinner logic or DOM-attribute hydration was introduced.
- Added targeted coverage for the loading-spinner failure, undefined/null props, explicit `className` replacement, and preservation of unrelated server attributes.

## Verification

- Pre-fix focused test failed both null and undefined cases by retaining `loader-ripple spinner`; the post-fix file passes all 14 tests.
- Adjacent VDOM audit passed 7 suites and 90 tests covering normalization, booleans, datasets, styles, skip logic, SSR, and contamination cleanup.
- Full `npm test -- --runInBand` passed 47 suites and 544 tests; `npm run build` completed TypeScript, Rollup, and Webpack successfully.

## Notes

- Historical merge-path comparison found no additional 3.38.0 regression from this guard change; only the synthesized null-props class-removal key was lost.
- Existing expected console warnings/assertions remain in the full test output but do not fail the suite.
