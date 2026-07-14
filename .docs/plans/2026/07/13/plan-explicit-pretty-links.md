# Plan: Configurable pretty-link routing for 6.0.0

## Goal

Align AppRun 6.0.0 with the 3.38.1 routing boundary: hash/native behavior without configuration, explicit `use_prettyLink()` or `true` for `/path` SPA navigation, and no false-mode boilerplate across ordinary examples and generated documentation.

## Current Context

- The uncommitted implementation already exposes `app.use_prettyLink(enabled = true)`, uses mutually exclusive listener wiring, removes hash-handler inference, and updates public declarations.
- `src/apprun.ts` currently initializes its internal `prettyLinks` flag to `true`; this is the single framework control point that must return to the 3.38.1 value of `false`.
- The default-on decision caused explicit false calls in Play iframe wrappers, complete HTML examples, `demo/main.ts`, `demo/apprun-play.html`, and 40 generated `docs/**/*.html` hosts.
- `tests/apprun-routing-bootstrap.spec.ts` currently asserts default pathname routing and must be inverted to verify default hash/native routing plus explicit true.
- `tests/pretty-link-examples.spec.ts` currently requires false calls in preview wrappers and generated documentation hosts; the revised policy must reject that boilerplate instead.
- `README.md`, `WHATSNEW.md`, `MIGRATION.md`, routing references, and public type comments currently describe default-on behavior and must distinguish no call from the argument-free method call.
- The TypeScript browser URL, sibling AppRun iframe runtime, synchronous compiled-script execution, CodeMirror selector fix, balanced invocation scanner, tracked Play bundle, and Play source map are independent fixes and remain in scope.
- Verification remains Jest through `npm test`, the TypeScript/Rollup/Webpack pipeline through `npm run build`, ESLint through `npm run lint`, and the browser scenarios in `.docs/tests/test-explicit-pretty-links.md`.

## Decisions

- Initialize the internal `prettyLinks` flag to `false`; keep `app.use_prettyLink(enabled = true)` so `app.use_prettyLink()` is an explicit enable operation exactly like 3.38.1.
- Install only hash initialization and `hashchange` when no call or false is selected. Install pathname initialization, `popstate`, and guarded anchor interception only after argument-free or explicit-true configuration.
- Keep routing mode independent of registered `#` handlers and retain last-call-wins behavior before `DOMContentLoaded`.
- Remove explicit false calls that exist only to counter the abandoned default-on policy: Play wrappers and hosts, generated documentation pages, complete non-routing examples, and the shared hash demo bootstrap.
- Keep explicit routing calls where they teach or own routing: false in the hash-routing example, true in the path-routing example, CLI path SPA, add-components path SPA, and routing documentation.
- Keep reusable Play bundles neutral about host routing. Under default-off, loading them must naturally preserve native host navigation without a host opt-out.
- Preserve pinned TypeScript, sibling runtime resolution, classic compiled-script execution, editable CodeMirror input, `apprun-play.js` publishing, and its source map.
- Do not add a feature flag, fallback detector, compatibility branch, or environment-specific routing mode.

## Phased Tasks

### Phase 1 - Reconcile the reversed default

- [x] Update `.docs/reqs/2026/07/13/req-explicit-pretty-links.md` so no call or false means hash/native and argument-free or true means pretty links.
- [x] Update `.docs/tests/test-explicit-pretty-links.md` so browser scenarios exercise default-off behavior and explicit enablement.
- [x] Review the revised REQ, AP, and E2E spec together and confirm the 3.38.1 compatibility boundary is unambiguous.

### Phase 2 - Restore the 3.38.1 framework default

- [x] Update `src/apprun.ts` so `prettyLinks` initializes to `false` while `use_prettyLink(enabled = true)` remains unchanged.
- [x] Update source and declaration comments in `src/apprun.ts`, `src/router.ts`, `src/types.ts`, and `apprun.d.ts` to describe default hash/native mode and explicit pretty-link enablement.
- [x] Preserve mutually exclusive listeners, last-call precedence, no-init behavior, base-path normalization, and removal of hash-handler inference.

### Phase 3 - Remove default-on configuration churn

- [x] Remove preview-level false calls from `src/apprun-code.tsx`, `src/apprun-play.tsx`, and ordinary new-tab generation in `demo/components/play.tsx` without changing TypeScript loading or compiled-script timing.
- [x] Remove false calls added solely for default-on behavior from `demo/main.ts`, `demo/apprun-play.html`, complete non-routing README/What's New examples, and all tracked generated documentation hosts.
- [x] Keep false only in deliberate hash-routing guidance/examples and keep true in deliberate `/path` applications and examples.
- [x] Remove the generated-host opt-out explanation from `docs/about/index.html` because reusable Play now inherits the framework's native-navigation default.

### Phase 4 - Rewrite regression policy around opt-in pretty links

- [x] Update `tests/apprun-routing-bootstrap.spec.ts` to execute default hash/native listeners and explicit argument-free/true path listeners.
- [x] Update `tests/pretty-link-examples.spec.ts` so generic examples, Play wrappers, hash-default hosts, and generated docs contain no unnecessary false call.
- [x] Retain coverage for multiline/nested/semicolonless invocation discovery, Play runtime alignment, source-map publishing, editor input, and the two explicit routing examples.
- [x] Add built-bundle assertions that loading Play without configuration leaves native host links alone and that explicit true enables path interception.

### Phase 5 - Align public guidance

- [x] Update `README.md`, `WHATSNEW.md`, and `MIGRATION.md` to state that no call or false preserves hash/native behavior while argument-free or true enables pretty links.
- [x] Update `ai/building-apprun-spa.md` and `skills/apprun/references/routing-navigation.md` so `/path` SPAs explicitly call true and generic examples remain configuration-free.
- [x] Confirm documentation never describes argument-free `use_prettyLink()` as equivalent to making no call.

### Phase 6 - Rebuild, verify, and review

- [x] Run `npm test -- --runInBand tests/apprun-routing-bootstrap.spec.ts tests/router.spec.ts tests/typescript-declarations.spec.ts tests/pretty-link-examples.spec.ts` and record focused evidence.
- [x] Run `npm test -- --runInBand`, `npm run build`, and `npm run lint`; retain generated Pages bundles and report only actual warnings or failures.
- [x] Execute the built-bundle routing and Play scenarios from `.docs/tests/test-explicit-pretty-links.md`.
- [x] Run `git diff --check` and repeated code review until no default-on wording, unnecessary false calls, stale generated-host changes, or major findings remain.

## Validation

- Focused routing tests: `npm test -- --runInBand tests/apprun-routing-bootstrap.spec.ts tests/router.spec.ts tests/typescript-declarations.spec.ts tests/pretty-link-examples.spec.ts`.
- Full unit suite: `npm test -- --runInBand`.
- Production build: `npm run build`.
- Static analysis: `npm run lint`, reporting the existing warning baseline separately from errors.
- Browser behavior: execute `.docs/tests/test-explicit-pretty-links.md` against built bundles and inspect click prevention, `pushState`, `hashchange`, `popstate`, compiler availability, and editor input.
- Scope: `git diff --check`, `git status --short`, and a requirement-focused review of every remaining changed file.

## Rollback / Risk

- Applications that relied on the temporary uncommitted default-on behavior must explicitly call `app.use_prettyLink(true)`; this is intentional and matches 3.38.1.
- The argument-free method call enables pretty links even though making no call leaves them disabled. Documentation and tests must keep that distinction explicit.
- Removing false calls must not remove deliberate hash-mode teaching examples or disturb the Play compiler/runtime/editor fixes.
- Generated documentation pages should return to their prior HTML except for independently required runtime asset changes; broad host-page churn is specifically rejected.
- No schema, persisted data, dependency, package version, or release publication is involved.
