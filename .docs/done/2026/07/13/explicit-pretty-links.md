# Explicit pretty-link routing

## Summary

- Restored hash routing and ordinary browser navigation as AppRun's default, reversing the automatic anchor interception introduced after 3.30.2.
- Restored the historical `app.use_prettyLink(enabled = true)` API so SPA path routing is explicit and can be disabled before startup.
- Kept `apprun-no-init`, `app['no-init-route']`, `basePath`, route events, `pushState`, and `popstate` behavior within their existing boundaries.
- Replaced a copied-conditional router test file with behavior-level coverage that executes AppRun's real browser listener wiring.
- Updated source/package declarations and `WHATSNEW.md` with the public configuration contract.

## Verification

- Pre-fix `npm test -- --runInBand tests/apprun-routing-bootstrap.spec.ts`: failed 6 of 8 tests on automatic path mode and the missing API.
- Focused `npm test -- --runInBand tests/apprun-routing-bootstrap.spec.ts tests/router.spec.ts tests/typescript-declarations.spec.ts`: 3 suites and 45 tests passed.
- Full `npm test -- --runInBand`: 47 suites and 538 tests passed.
- `npm run build`: TypeScript, Rollup, and Webpack completed successfully.
- Browser E2E: default full-page and hash navigation, opt-in click and Back routing, explicit opt-out, and both no-init modes passed against the built UMD bundle.
- rlp-com compatibility proof: its remaining Jest suite passed and all eight entries built with the shim temporarily removed against the corrected local AppRun checkout.
- CR and VR passed with no blocking findings; `git diff --check` passed in both repositories.

## Notes

- Routing mode is locked at `DOMContentLoaded`; live mode switching remains out of scope.
- rlp-com's shim remains committed until a fixed AppRun version is published and consumed. Removing it while the dependency still resolves the broken published 3.38.0 would make clean builds regress.
- Generated AppRun build outputs were used for E2E and consumer verification, then restored according to repository convention.
