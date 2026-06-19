# AppRun Improvement Plan

**Date:** 2026-06-10
**Version reviewed:** 3.38.0 (branch `master`, commit `b56dae0`)
**Test baseline:** 47 suites / 541 tests, all passing

This plan is based on a review of the core source (`src/`), build/packaging configuration,
test setup, and repository hygiene. Items are grouped by category and then prioritized
into phases at the end. Each item lists the affected file(s) and a suggested fix.

---

## 1. Correctness Bugs (P0)

### 1.1 `once` wildcard subscribers are never removed
`src/app.ts:141-157` — `getSubscribers()` prunes `once` subscribers only from the
exact-name list (`events[name]`). Wildcard subscriptions (e.g. `app.once('user/*', fn)`)
are appended to the result but their source list is never filtered, so a `once` wildcard
handler fires forever.

Also, `src/app.ts:92` — `return !sub.options.once;` inside `subscribers.forEach(...)` is
dead code (`forEach` ignores return values). It suggests the once-removal was meant to
happen here; remove it or convert to the intended semantics.

**Fix:** prune `once` subscribers from wildcard lists inside `getSubscribers()`, and add
a regression test (`app.once('a/*', ...)` fired twice should run once).

### 1.2 `setState` leaves `_state` pointing at the unresolved Promise
`src/component.ts:165-171` — after a Promise state resolves, the code calls
`this.setState(v)` (which sets `_state = v`) and then immediately overwrites
`this._state = state` (the Promise). `_state` and `state` diverge. There is also no
guard against out-of-order resolution: two rapid async actions can render stale state
if the first Promise resolves last.

**Fix:** drop the `this._state = state` re-assignment; add a monotonic token (or store
the latest pending Promise and ignore resolutions that are no longer current). Add tests
for interleaved async actions.

### 1.3 Router intercepts clicks it must not intercept
`src/apprun.ts:157-174` — the document-level click handler hijacks **every**
same-origin anchor click in path-routing mode. It does not check:
- modifier keys (`ctrl`/`cmd`/`shift`/`alt` click → open in new tab is broken),
- `e.defaultPrevented`,
- `target="_blank"` / non-self targets,
- `download` attribute,
- `rel="external"`,
- mouse button (middle-click via `auxclick` is fine, but `button !== 0` should be ignored).

**Fix:** add the standard SPA link-interception guard clauses. This is a one-screen
change with high user impact.

### 1.4 Router docs promise `:id` parameter matching that does not exist
`src/router.ts:36` documents `app.on('#/users/:id', (id) => ...)`, but the
implementation only does hierarchical segment matching — there is no pattern/parameter
matching anywhere in `router.ts`. Parameters are only passed positionally to parent
routes.

**Fix:** either implement `:param` (and `*` wildcard) pattern matching in
`findHandlerInHierarchy`, or correct the documentation. Decide deliberately; today users
following the doc comment get a silent 404.

### 1.5 `route()` dedup blocks legitimate re-navigation
`src/router.ts:305-306` — `if (app['lastUrl'] === url) return;` means clicking the same
link twice never re-fires the route (e.g. to reset a page's state), and the stale
`lastUrl` persists on the global `app` across tests/sessions.

**Fix:** make dedup opt-in (option flag) or reset `lastUrl` on `popstate`/`hashchange`;
expose a way to force re-route.

### 1.6 Web component lifecycle races
`src/web-component.ts:109-124` — the component is mounted inside
`requestAnimationFrame`, so:
- `attributeChangedCallback` calls arriving before the RAF tick are silently dropped
  (`if (this._component)` is false), losing early attribute values;
- `disconnectedCallback` calls `this._component?.unload?.()` with **no state argument**,
  while `Component.unload` is documented/used as `unload(state)`;
- a fast connect→disconnect (e.g. in a router swap) can disconnect before the RAF runs,
  then the RAF mounts into a detached shadow root.

**Fix:** queue attribute changes received before mount and replay them; pass
`this._component.state` to `unload`; cancel the pending RAF in `disconnectedCallback`.

### 1.7 Shared `options` object mutation in delayed events
`src/app.ts:102-111` — `delay()` writes the timer id onto the caller's `options`
object (`options._t`). If one options object is reused for several subscriptions, their
debounce timers collide. The handler also receives the internal `options` (including
`_t`) as a trailing argument whenever any option is set (`src/app.ts:87`), which leaks
implementation details into user handlers.

**Fix:** keep timers in a private `Map` keyed by subscription; stop appending `options`
to handler args (or document it as a real, typed parameter).

### 1.8 Component child-cache grows without bound
`src/vdom-my.ts:242-267` (`render_component`) — child components are cached on
`parent.__componentCache` keyed by `id` or index, with `Date.now()`-based fallback ids.
Entries are never evicted when the child disappears from the view, so dynamic lists of
class components leak component instances (and their event subscriptions — `unmount()`
is never called).

**Fix:** track which cache keys were used during a render pass and `unmount()` + delete
the rest afterward. Add a memory test alongside `tests/memory-leak.spec.ts`.

### 1.9 Global `keyCache` shared across all components
`src/vdom-my.ts:71-93, 229-238` — keyed elements go into a single module-level cache
keyed by the raw user-supplied `key`. Two lists using the same keys (`key="1"` is
common) can steal DOM nodes from each other via `element.insertBefore(old, el)`
(`src/vdom-my.ts:169-174`), moving a node out of an unrelated part of the page. The
size-threshold cleanup (500 ops / 1000 entries) is a band-aid.

**Fix:** scope the key lookup to the parent element being updated (build a key→child map
from `element.childNodes` per `updateChildren` call). This removes the global cache, the
cleanup counters, and the cross-component collision class of bugs in one change.

---

## 2. Security (P0)

### 2.1 `_html:` string prefix is an implicit XSS vector
`src/vdom-my.ts:206-214` — any text node whose string starts with `_html:` is injected
as raw HTML. If user-controlled data ever starts with `_html:`, it becomes markup. This
is an undocumented, always-on escape hatch that bypasses the explicit `safeHTML()` API.

**Fix:** remove the `_html:` prefix behavior (breaking change → major/minor with
migration note) or gate it behind an explicit opt-in flag. `safeHTML()` already covers
the legitimate use case.

### 2.2 `$bind` on `<textarea>` writes `innerHTML`
`src/directive.ts:271-279` — binds state into the textarea via
`props['innerHTML'] = getStateValue(...)`. Bound state containing markup is parsed as
HTML (XSS if state is user-influenced), and entities round-trip incorrectly.

**Fix:** use the `value` property like the `input` branch does.

### 2.3 `safeHTML` name overpromises
`src/vdom-my.ts:200-204` — `safeHTML` performs **no sanitization**; it just parses the
string into elements. The name invites misuse with untrusted input.

**Fix:** document loudly that it is "trusted HTML" (or rename to `unsafeHTML`/`rawHTML`
with a deprecation alias), and point users at DOMPurify for untrusted input.

---

## 3. API & Behavior Cleanups (P1)

### 3.1 Stop replacing `window.React`
Resolved for 6.0.0. AppRun no longer saves `window.React` to `_React`, no longer sets
`window.React = app`, and no longer writes `Component`, `on`, `customElement`, or
`safeHTML` onto `window`.

The remaining browser global contract is deliberately small: core keeps the `app`
singleton, and the `apprun-html` script-tag build adds only `html`, `run`, and `svg`.
Everything else requires imports.

### 3.2 Error handling swallows everything
`src/app.ts:86-91, 123-128` and `src/component.ts:278-301` — every handler error is
caught and `console.error`'d. Applications cannot install their own error handling,
telemetry, or fail-fast behavior.

**Fix:** publish an `app.run('error', {event, error, component})` event (with
console.error as the default subscriber) so apps can opt into central error handling.

### 3.3 `console.assert`/`console.warn` noise in production
`src/app.ts:76,116`, `src/router.ts:225,279,292` — "No subscriber for event" asserts
and warnings fire in normal operation (e.g. any unhandled route) and cannot be silenced.

**Fix:** route diagnostics through a debug flag (`app.debug`) consistently; default to
silent in production builds.

### 3.4 Directives mutate the caller's vdom
`src/directive.ts:285-301` — `directive()` deletes `$`-props in place and replaces them
with `on*` closures. If an app caches/reuses a vnode (a legal optimization), directives
are applied once and then lost. Closures are also recreated on every render, defeating
the event-handler diffing in `vdom-my-prop-attr.ts`.

**Fix:** copy props before transforming, and consider caching directive-generated
handlers per element/event so identity is stable across renders.

### 3.5 `tracking_id` collisions
`src/component.ts:111` — `new Date().valueOf().toString()` collides for components
mounted in the same millisecond, confusing the unload MutationObserver logic.

**Fix:** module-level counter (`(++uid).toString(36)`).

### 3.6 One full-`document.body` MutationObserver per component
`src/component.ts:113-125` — every component with `unload` observes the entire body
subtree with `attributes: true` + `attributeOldValue: true`. Tens of components → tens
of full-document observers; every DOM mutation anywhere fans out to all of them.

**Fix:** a single shared observer that maintains a registry of tracked elements, or
observe only `el.parentNode`. Keep the per-component API unchanged.

### 3.7 Finish the `query()` deprecation
`src/app.ts:136-139`, `src/component.ts:374-377`, `src/apprun.ts:123`. Deprecated since
3.35.x and warns on every call.

**Fix:** schedule removal for the next major; in the interim warn only once per session.

### 3.8 `addComponents` re-assigns its `element` parameter inside the handler
`src/add-components.ts:85-95` — `element` (the loop-shared parameter) is overwritten
with the queried node inside the routed event handler; the "element not found" branch
logs the (now-null) element. Mostly works but is fragile and the error message is wrong.

**Fix:** resolve the selector into a local variable; log the original selector string.

---

## 4. Type Safety (P1)

The codebase advertises TypeScript support, but type checking is effectively off:

- **`EventOptions` is `any`:** `src/types.ts:74-78` — `{...} | any` collapses the whole
  union to `any`. Remove `| any`; add explicit fields (`once`, `delay`, `transition`,
  `global`) plus a documented extension point if needed.
- **`ActionOptions.history?` and `MountOptions.history?` are untyped** (`src/types.ts:71,80`)
  — type as `boolean | { prev?: string; next?: string }` to match actual use in
  `src/component.ts:235-238`.
- **No `strict` mode:** neither `tsconfig.json` nor `src/tsconfig.json` enables `strict`
  (or even `noImplicitAny`). Adopt incrementally: start with `strictBindCallApply`,
  `noImplicitThis`, `strictFunctionTypes`; then `noImplicitAny` file-by-file.
- **Tests ignore type errors:** `jest.config.js` sets `diagnostics.warnOnly: true` and
  ignores 9 error codes including `TS2322`/`TS2345` (real assignability errors). This
  hides regressions in the public typings. Burn down the ignore list and remove
  `warnOnly`.
- **`Component.element`, `state`, `view` are loosely typed** (`src/component.ts:79`,
  `public element;`) — give them concrete types (`HTMLElement | string | null`, etc.).
- **Hand-written `apprun.d.ts`** at the root can drift from `src/types.ts`. Prefer
  generating declarations from source (`declaration: true` in the build) and keep
  `typescript-declarations.spec.ts` as the conformance check.

---

## 5. Dead Code & Repo Hygiene (P2)

- **Unused/experimental files in `src/`:** `vdom-my-new.ts` (311 lines, not imported),
  `vdom-patch.ts` (only referenced by its own spec), `vdom-html.ts_`, `shadow.tsx`
  (not imported), and `tests/*.spec_`/`.ts_` files. Move experiments to a branch or an
  `experiments/` folder excluded from the package, or delete them.
- **`createState.ts` / `immer`:** `createState` is not exported from the main entry —
  it is a separate opt-in module, yet `immer` sits in `dependencies` and is installed by
  every consumer. Make `immer` an optional `peerDependency` of the `apprun/createState`
  entry point, or inline a note and lazy-import.
- **Committed build artifacts:** `dist/`, `esm/`, and `coverage/` are tracked in git.
  Build on publish/CI instead; keeps diffs reviewable and avoids stale-artifact bugs
  (e.g., `esm/` currently shipping whatever was last built locally).
- **`error.log` (empty) is committed** at the root — delete and gitignore.
- **`tslint.json`:** TSLint was EOL'd in 2019. Replace with ESLint +
  `typescript-eslint` (see §7).
- **Giant header comments with "Recent Changes" logs** in every source file
  (e.g. 60+ lines atop `src/apprun.ts`, `src/types.ts`) duplicate CHANGELOG.md and have
  already drifted (router docs in §1.4). Trim headers to a short purpose statement;
  keep history in CHANGELOG.
- **`version.ts` is manually synced** with package.json — inject at build time
  (rollup `replace` plugin) or add a release script that rewrites it.

---

## 6. Packaging & Distribution (P2)

- **No `exports` map in package.json.** Node ESM consumers and modern bundlers rely on
  it; subpath imports like `apprun/createState`, the html/lit renderer, and
  `jsx-runtime` resolve only by accident today. Add:
  `"."`, `"./jsx-runtime"`, `"./createState"`, `"./apprun-html"`, `"./dist/*"` entries
  with `types`/`import`/`require` conditions.
- **No `"files"` whitelist** — publishing relies on `.npmignore` (last touched 2020).
  `skills/`, `ai/`, `apprun-book.jpg`, `logo.png`, `index.html`, webpack/rollup configs
  all ship to npm. Switch to an explicit `"files": ["dist", "esm", "cli", "apprun.d.ts", ...]`.
- **No `sideEffects` flag** — the main entry has real side effects (global app,
  DOMContentLoaded listener), but pure modules (`createState`, `vdom-my`, `types`)
  could be marked for tree-shaking: `"sideEffects": ["./esm/apprun.js", ...]`.
- **Dual-package clarity:** `main` points to a webpack UMD bundle and `module` to ESM,
  with no `"type"` field. Verify `require('apprun')` and `import 'apprun'` get the same
  singleton (the `root.app` guard in `src/app.ts:160-172` helps, but a version-mismatch
  between the two copies only silently reuses the older instance — at least
  `console.warn` when `_AppRunVersions` differs from the importing version).

---

## 7. Tooling, CI & Tests (P2)

- **No CI.** There is no `.github/workflows/`. Add a workflow that runs on PR/push:
  `tsc --noEmit` (with the stricter config), `jest --coverage`, and the rollup/webpack
  build. This is the highest-leverage infrastructure item — everything else in this
  plan needs CI to stay fixed.
- **Linting:** add ESLint + typescript-eslint (replacing `tslint.json`) with a minimal
  rule set first (no-unused-vars, eqeqeq, no-implicit-globals).
- **Coverage thresholds:** coverage artifacts exist but no `coverageThreshold` in
  `jest.config.js`. Capture today's numbers as the floor so coverage can only ratchet up.
- **Test gaps to add** (each maps to a bug above): once+wildcard events (§1.1),
  interleaved async setState (§1.2), modifier-key link clicks (§1.3), duplicate keys in
  sibling lists (§1.9), dynamic component list unmount/leak (§1.8), web component
  attribute-before-mount (§1.6).
- **Benchmarks:** `tests/vdom-my-*benchmark*` exist but run as ordinary specs; move to a
  separate `npm run bench` so timing flakiness never blocks CI.

---

## 8. Performance (P3)

- **Wildcard lookup scans every event name on every dispatch**
  (`src/app.ts:150-155`): `Object.keys(events).filter(...endsWith('*')...)` is O(total
  events) per `run()`. Maintain a small separate list of wildcard subscriptions updated
  in `on`/`off`.
- **Directive walk visits the entire vdom every render** (`src/directive.ts:285-301`)
  even when no `$` props exist. Short-circuit: skip subtrees without props, or mark
  vnodes containing directives at creation time.
- **`updateChildren` keyed path is a partial algorithm** (`src/vdom-my.ts:145-198`):
  forward-only scan plus global cache; reorders trigger replace/move churn. After §1.9's
  scoping fix, consider the standard two-pointer + key-map reconciliation (snabbdom
  style) for keyed lists.
- **`mergeProps` allocates objects per element per render** (`src/vdom-my-prop-attr.ts:15-34`)
  — fine for now; measure before optimizing, the benchmarks in `tests/` can baseline it.

---

## 9. Documentation (P3)

- Fix the router doc comment (§1.4) and the `key` guidance table in `vdom-my.ts` once
  keyed diffing changes.
- Document the actual `$bind` security expectations (§2.2) and `safeHTML` trust model (§2.3).
- `WHATSNEW.md` / `CHANGELOG.md` are maintained — good; add a MIGRATION.md when the
  breaking changes in this plan land (notably §2.1, §3.1, §3.7).

---

## Prioritized Roadmap

### Phase 1 — Safety & correctness (target: 3.38.x patch / 3.39.0)
| # | Item | Files | Size |
|---|------|-------|------|
| 1 | CI workflow (test + build + tsc) | `.github/workflows/` | S |
| 2 | Link-click interception guards (§1.3) | `apprun.ts` | S |
| 3 | `$bind` textarea → `value` (§2.2) | `directive.ts` | XS |
| 4 | once+wildcard pruning + dead `forEach` return (§1.1) | `app.ts` | S |
| 5 | Promise `_state` fix + stale-async guard (§1.2) | `component.ts` | M |
| 6 | Web component lifecycle races (§1.6) | `web-component.ts` | M |
| 7 | `tracking_id` counter (§3.5) | `component.ts` | XS |
| 8 | Regression tests for all of the above | `tests/` | M |

### Phase 2 — Memory & architecture (target: 3.40.0)
| # | Item | Files | Size |
|---|------|-------|------|
| 1 | Scope keyed lookup per parent; delete global `keyCache` (§1.9) | `vdom-my.ts` | M |
| 2 | Component child-cache eviction + unmount (§1.8) | `vdom-my.ts` | M |
| 3 | Shared MutationObserver (§3.6) | `component.ts` | M |
| 4 | Error event channel (§3.2) | `app.ts`, `component.ts` | S |
| 5 | Delay timer ownership (§1.7) | `app.ts` | S |
| 6 | Wildcard dispatch index (§8) | `app.ts` | S |

### Phase 3 — Types, packaging, hygiene (target: 3.41.0)
| # | Item | Files | Size |
|---|------|-------|------|
| 1 | Fix `EventOptions | any`, type `history`, element types (§4) | `types.ts`, `component.ts` | M |
| 2 | Incremental `strict` flags; remove jest `warnOnly` (§4) | tsconfigs, `jest.config.js` | L |
| 3 | `exports` map, `files` whitelist, `sideEffects` (§6) | `package.json` | S |
| 4 | Remove dead files; untrack `dist`/`esm`/`coverage`/`error.log` (§5) | repo | S |
| 5 | ESLint replacing TSLint (§7) | repo | S |
| 6 | `immer` → optional peer dep (§5) | `package.json` | S |

### Phase 4 — Breaking changes (target: 4.0)
| # | Item | Notes |
|---|------|-------|
| 1 | Remove `_html:` prefix (§2.1) | Provide codemod note → `safeHTML` |
| 2 | Opt-in globals; stop replacing `window.React` (§3.1) | Keep behavior in script-tag bundle only |
| 3 | Remove `query()` (§3.7) | Deprecated since 3.35 |
| 4 | Decide and implement router `:param` matching (§1.4) | Or formally document positional-only params |
| 5 | Rename/alias `safeHTML` trust model (§2.3) | Deprecation alias for one minor |

---

## What is in good shape (keep as-is)

- **Test suite breadth:** 541 tests covering vdom edge cases (SVG namespaces, boolean
  attributes, dataset handling, DOM contamination, keyed nulls) is genuinely strong.
- **`vdom-my-prop-attr.ts`:** the `property-information`-backed attribute/property
  resolution with skip logic for focus/scroll/media state is well designed.
- **`$bind` nested-path parser** (`directive.ts`): clean immutable path updates with
  good test coverage.
- **Event-system core:** the pub/sub + component-local `App` instance split is simple
  and effective; improvements above are refinements, not redesigns.
- **Docs volume:** `docs/` and the SKILL.md/guide work are assets worth keeping current.
