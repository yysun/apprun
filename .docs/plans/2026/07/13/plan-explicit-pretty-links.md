# Plan: Explicit pretty-link routing

## Goal

Restore normal browser navigation and hash routing as AppRun's default while making SPA path-link interception an explicit, typed startup choice through `app.use_prettyLink`.

## Current Context

- `src/apprun.ts` currently infers hash mode from `app.find('#')`/`app.find('#/')`; otherwise it initializes from `location.pathname` and installs a body-level same-origin anchor interceptor.
- AppRun v3.30.2 initialized hash routing and did not intercept normal links. Commit `791b17d` introduced an explicit `app.use_prettyLink()` opt-in, while the later auto-routing change removed that API and changed the default.
- AppRun v3.30.2 also registered a `#` no-op fallback. The current `/` no-op fallback alone would make an empty default hash initialization dispatch `/`, so the `#` fallback must be restored without removing the current path fallback.
- `src/types.ts` and `apprun.d.ts` define the public `IApp` contract but currently expose no pretty-link configuration.
- `tests/router-fix.spec.ts` copies the old routing conditionals instead of executing listeners registered by `src/apprun.ts`; the behavior-level bootstrap suite will replace it so stale auto-detection assertions do not survive the fix.
- rlp-com has eight esbuild entry points. `_esbuild.js` injects `src/apprun-disable-pretty-links.ts`, which registers a fake `#` route, and `src/__tests__/apprun-disable-pretty-links.spec.ts` locks in that workaround.
- AppRun uses Jest/jsdom, `npm test`, and `npm run build`. rlp-com uses Jest and `npm run build` with AppRun 3.38.0 from `node_modules`.
- rlp-com's only remaining non-shim unit file is `src/__tests__/search.spec.ts`, so its complete Jest suite is the narrowest honest post-cleanup test command.
- This is a regression-prone routing change, so `.docs/tests/test-explicit-pretty-links.md` defines browser-level scenarios.

## Decisions

- Restore `app.use_prettyLink(enabled = true)` as a startup configuration method. The historical name is intentionally retained despite its casing and singular noun.
- Default to hash routing and normal browser link navigation. Remove route-mode inference from registered `#` handlers; an explicit opt-in selects path mode.
- Lock the selected mode when AppRun handles `DOMContentLoaded`. Dynamic listener installation/removal after initialization is rejected as unnecessary lifecycle complexity.
- In hash mode, install only `hashchange` routing and initialize from `location.hash`. In pretty-link mode, install only path `popstate`, initialize from the normalized pathname, and install the existing body click handler.
- Restore the built-in `#` no-op alongside the current `/` no-op so an empty hash dispatches the hash root without reintroducing handler-based mode inference.
- Keep `apprun-no-init` and `app['no-init-route']` independent of mode selection so they suppress the initial call without disabling later navigation listeners.
- Preserve the existing click eligibility and `basePath` implementation; tightening anchor interception is a separate behavior change.
- Prove the rlp-com injected fake route and its test can be removed by building all entries against the corrected local checkout, then restore the workaround until a fixed AppRun package version is published. Do not commit a consumer state that still resolves the broken published 3.38.0 package.

## Phased Tasks

### Phase 1 - Lock the regression and public contract

- [x] Compare `src/apprun.ts` at v3.30.2, commit `791b17d`, and v3.38.0 to confirm the legacy default, historical API name, and current interception path.
- [x] Add a targeted AppRun routing-bootstrap spec that captures and executes the actual listeners registered by `src/apprun.ts`.
- [x] Record a pre-fix failure proving default startup currently registers path interception and does not expose `use_prettyLink`: the targeted suite failed 6 of 8 tests, with default startup dispatching `/` instead of `#initial` and all opt-in cases reporting `use_prettyLink is not a function`.

### Phase 2 - Restore explicit routing configuration

- [x] Update `src/apprun.ts` with a top-level file comment update and `app.use_prettyLink(enabled = true)` startup state.
- [x] Replace hash-handler inference with explicit mode branching so default startup installs hash routing without a body click interceptor.
- [x] Restore the built-in `#` no-op fallback so empty default hash initialization resolves to `#` while explicit path initialization continues to resolve pathname routes.
- [x] Preserve path-mode initial route normalization, `basePath`, `popstate`, anchor `pushState`, and route dispatch when pretty links are enabled.
- [x] Keep `apprun-no-init` and `app['no-init-route']` limited to the initial route call in both modes.
- [x] Update `src/types.ts` and `apprun.d.ts` so `use_prettyLink(enabled?: boolean): void` is part of the public `IApp` contract.
- [x] Update `WHATSNEW.md` so the public routing example opts in explicitly and the restored default is unambiguous.

### Phase 3 - Complete behavior-level routing coverage

- [x] Add tests proving default hash initialization and hashchange routing execute through AppRun's registered listeners.
- [x] Add tests proving `use_prettyLink()` and `use_prettyLink(true)` initialize and navigate paths through `popstate`, click interception, and `basePath` handling.
- [x] Add tests proving `use_prettyLink(false)` overrides an earlier opt-in before initialization.
- [x] Add tests proving `apprun-no-init` and `app['no-init-route']` suppress initial routing without suppressing the active mode's later listeners.
- [x] Remove `tests/router-fix.spec.ts` after its no-init and routing-mode cases are covered through the real AppRun bootstrap.
- [x] Extend `tests/typescript-declarations.spec.ts` to assert the restored public method exists and accepts omitted or boolean arguments.
- [x] Run the focused AppRun routing tests: 3 suites and 45 tests passed.

### Phase 4 - Prove the rlp-com shim is removable after release

- [x] Temporarily remove `inject: ['src/apprun-disable-pretty-links.ts']`, the injected file, and its test from rlp-com without adding a replacement shim.
- [x] Make rlp-com verification consume the corrected local AppRun package through a temporary `node_modules/apprun` symlink without changing its manifests or lockfile.
- [x] Run rlp-com's complete `npm test -- --runInBand` suite (1 suite and 1 test passed) and `npm run build`; all eight entry points built without injected routing configuration.
- [x] Restore rlp-com's workaround after verification because its package manifest still resolves the broken published `apprun@3.38.0`; deletion is a release follow-up, not part of this framework commit.

### Phase 5 - Full verification and review

- [x] Run AppRun's full `npm test -- --runInBand` suite: 47 suites and 538 tests passed, with existing expected console output remaining non-failing.
- [x] Run AppRun's `npm run build`; TypeScript, Rollup, and Webpack passed, and generated build outputs were restored according to repository convention after E2E and local-package verification.
- [x] Execute `.docs/tests/test-explicit-pretty-links.md` against built AppRun browser code: default and explicit opt-out links loaded the server page, hash routing fired, opt-in click and Back routing updated the URL and route state, and both no-init modes skipped only initial dispatch.
- [x] Run `git diff --check` in both repositories and review both diffs against the requirement, plan, compatibility constraints, and non-goals; CR passed after restoring rlp-com to its release-safe state.

### Phase 6 - Completion artifacts and commits

- [x] Update the REQ acceptance criteria and this plan only after corresponding implementation and evidence exist.
- [x] Create `.docs/done/2026/07/13/explicit-pretty-links.md` with the implemented contract, exact verification results, and any concrete residual risk.
- [x] Commit the AppRun framework, tests, declarations, and RPD artifacts with `fix: make pretty-link routing explicit`.

## Validation

- Pre-fix proof: `npm test -- --runInBand tests/apprun-routing-bootstrap.spec.ts` must fail because default startup selects path interception and `use_prettyLink` is absent.
- Focused AppRun verification: `npm test -- --runInBand tests/apprun-routing-bootstrap.spec.ts tests/router.spec.ts tests/typescript-declarations.spec.ts`.
- Full AppRun suite: `npm test -- --runInBand`.
- AppRun build: `npm run build`.
- rlp-com compatibility proof: temporarily remove the shim and its spec, run `npm test -- --runInBand`, temporarily replace `node_modules/apprun` with a symlink to the built local AppRun checkout, run `npm run build`, then restore the installed package and tracked workaround so the repo remains reproducible until release.
- Browser E2E: execute `.docs/tests/test-explicit-pretty-links.md` with built AppRun assets and verify URL, default prevention state, path routing events, and back navigation.
- Diff hygiene: `git diff --check` in both repositories plus requirement-focused code review.

## Rollback / Risk

- Applications that began relying on automatic path interception in 3.35.0-3.38.0 must opt in explicitly. This is intentional restoration of the pre-regression default and must be called out in release notes or completion notes.
- The routing mode is read at `DOMContentLoaded`; calls after initialization do not rewire listeners. Tests and documentation must make that boundary clear.
- Multiple bundles share AppRun's global singleton. Default-off behavior removes rlp-com's import-order dependency rather than adding another one.
- rlp-com cannot safely commit shim removal until a fixed AppRun version is published and its dependency is advanced; local-link verification proves the future cleanup without hiding this release dependency.
- Rollback is limited to the routing bootstrap, public declaration, tests, and docs; no persisted data or schema migration is involved.
