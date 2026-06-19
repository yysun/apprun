# Phase 4 Breaking API Requirement

## Problem

The Phase 4 items in `IMPROVEMENT_PLAN.md` are breaking changes because the old behavior is actively misleading or unsafe:

- Text beginning with `_html:` is silently parsed as markup, so ordinary user text can become DOM.
- The main AppRun entry replaces `window.React` and writes browser globals on import, which breaks coexistence with React and surprises bundler consumers.
- `query()` remains in the public runtime and typings even though `runAsync()` is the replacement.
- Router comments promise `:param` and `*` matching, but the implementation only does exact and hierarchical event matching.
- `safeHTML()` sounds sanitized even though it only parses trusted HTML.

Leaving these as warnings keeps bad API contracts alive. Phase 4 must make the 4.0 behavior explicit in runtime, typings, tests, and migration notes.

## Requirement

AppRun must implement the Phase 4 breaking API contracts for a 4.0-ready surface:

- Render string children literally; do not treat `_html:` as a magic raw-HTML prefix.
- Expose a clearly named trusted-HTML helper and stop implying sanitization through the primary API name.
- Keep `safeHTML` only as a compatibility alias for one minor migration window, while introducing `trustedHTML` as the preferred name.
- Stop assigning framework globals on normal module import, including `window.React`.
- Provide an explicit opt-in global installer for script-tag users and any application that still wants the legacy globals.
- Remove `query()` from `App`, `Component`, the initialized singleton, and public declarations.
- Implement router `:param` and `*` pattern matching so the documented route syntax works.
- Update migration documentation so users can move from `_html:`, implicit globals, `query()`, and `safeHTML()`.

## Acceptance Criteria

- [x] Rendering a text child such as `_html:<b>x</b>` produces text, not a `<b>` element.
- [x] Existing trusted HTML insertion still works through `trustedHTML(html)`.
- [x] `safeHTML(html)` remains callable as an alias for `trustedHTML(html)` for the migration window and is documented as deprecated/trusted-only.
- [x] Importing `src/apprun.ts` no longer overwrites `window.React`, `window.Component`, `window.on`, `window.customElement`, or `window.safeHTML`.
- [x] Calling the explicit global installer writes the legacy globals intentionally and preserves the prior `window.React` value under `_React`.
- [x] `app.query` and `component.query` are absent at runtime.
- [x] Public declarations no longer advertise `query()`, and they do advertise `trustedHTML()`.
- [x] Routes registered with `:param` receive the matched segment values in declaration order.
- [x] Routes registered with `*` receive the remaining path as a parameter.
- [x] Exact routes still win over pattern routes, and existing hierarchical fallback behavior still works when no pattern route matches.
- [x] Migration documentation names the old behavior, the new behavior, and the replacement API for each breaking item.
- [x] Focused regression tests, full unit tests, build, and diff hygiene pass, or unrelated/pre-existing failures are explicitly reported.

## Constraints

- Do not add feature flags or environment variables to preserve the old behavior by default.
- Do not remove `safeHTML` in this story; keep it as a deprecated alias for one minor migration window.
- Do not change the core `runAsync()` return shape while removing `query()`.
- Do not remove script-tag usability; legacy globals must remain available through an explicit opt-in call.
- Do not weaken existing router hierarchical matching or route event publication.
- Keep generated `dist/`, `esm/`, `demo/app.js`, and `jsx-runtime.js` synchronized after source changes.

## Non-Goals

- Do not redesign the router beyond `:param` and `*` matching.
- Do not add sanitization or DOMPurify; trusted HTML remains caller-owned trusted HTML.
- Do not implement package `exports`, file whitelist, strict TypeScript, ESLint, or dead-file cleanup.
- Do not remove `safeHTML` entirely until a later breaking-removal story.
- Do not change `apprun-html` lit renderer semantics except where exports must follow the new trusted-HTML naming.

## Evidence

- Focused regression command passed: `npm test -- --runInBand tests/vdom-my.spec.tsx tests/router.spec.ts tests/router-existing-behavior.spec.ts tests/router-hierarchical-behavior.spec.ts tests/typescript-declarations.spec.ts tests/react-compatibility.spec.ts` (`6` suites, `149` tests).
- Full unit command passed: `npm test -- --runInBand` (`47` suites, `566` tests).
- Build command passed: `npm run build`.
- Diff hygiene command passed: `git diff --check`.
