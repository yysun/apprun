# Explicit pretty-link routing

## Summary

- Restored hash routing and ordinary browser navigation as AppRun's default, reversing the automatic anchor interception introduced after 3.30.2.
- Restored the historical `app.use_prettyLink(enabled = true)` API so SPA path routing is explicit and can be disabled before startup.
- Kept `apprun-no-init`, `app['no-init-route']`, `basePath`, route events, `pushState`, and `popstate` behavior within their existing boundaries.
- Replaced a copied-conditional router test file with behavior-level coverage that executes AppRun's real browser listener wiring.
- Updated source/package declarations and `WHATSNEW.md` with the public configuration contract.
- Audited maintained examples by actual navigation behavior. README, What's New, the CLI starter, the standalone add-components demo, and the Play path-routing example now opt in; hash routing, direct route dispatch, historical plans, and deliberate full-page navigation remain unchanged.
- Fixed both TypeScript-backed Play renderers so browser-global examples execute synchronously before `DOMContentLoaded`, removing the race that made a correct `app.use_prettyLink()` call arrive too late.
- Added catalog-wide compilation coverage and fixed the existing `SVG - xlink` JSX parse error it exposed.

## Verification

- Pre-fix `npm test -- --runInBand tests/apprun-routing-bootstrap.spec.ts`: failed 6 of 8 tests on automatic path mode and the missing API.
- Focused `npm test -- --runInBand tests/apprun-routing-bootstrap.spec.ts tests/router.spec.ts tests/typescript-declarations.spec.ts`: 3 suites and 45 tests passed.
- Example-focused `npm test -- --runInBand tests/pretty-link-examples.spec.ts tests/apprun-routing-bootstrap.spec.ts tests/router.spec.ts`: 3 suites and 33 tests passed, including compilation of every Play catalog entry.
- Full `npm test -- --runInBand`: 48 suites and 548 tests passed.
- `npm run build`: TypeScript, Rollup, and Webpack completed successfully.
- Generated bundle inspection found `app.use_prettyLink()` in `demo/app.js` and synchronous `module: none` / `text/javascript` execution in both Play bundles before generated outputs were restored.
- Browser E2E: default full-page and hash navigation, opt-in click and Back routing, explicit opt-out, and both no-init modes passed against the built UMD bundle.
- Example browser E2E: Playground Contact and About links rendered in-place, the hash example remained hash-routed, and the standalone add-components About link rendered at `/demo-html/add-components/about` under its base path.
- rlp-com compatibility proof: its remaining Jest suite passed and all eight entries built with the shim temporarily removed against the corrected local AppRun checkout.
- CR and VR passed with no blocking findings; `git diff --check` passed in both repositories.

## Notes

- Routing mode is locked at `DOMContentLoaded`; live mode switching remains out of scope.
- rlp-com's shim remains committed until a fixed AppRun version is published and consumed. Removing it while the dependency still resolves the broken published 3.38.0 would make clean builds regress.
- Generated AppRun build outputs were used for E2E and consumer verification, then restored according to repository convention.
- Play snippets are intentionally browser-global script examples. Import/export module snippets are outside these Play surfaces' current example contract.
