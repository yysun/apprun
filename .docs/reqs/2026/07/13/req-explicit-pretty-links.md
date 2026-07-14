# Configurable pretty-link routing for 6.0.0

## Problem

Making pretty-link routing the 6.0.0 default forces every hash-routed, multi-page, documentation, and non-routing host to add `app.use_prettyLink(false)` merely to preserve normal browser navigation. That creates broad example and generated-page churn for an opt-in SPA feature. AppRun 3.38.1 already established the safer boundary: routing remains hash/native by default, while applications that own `/path` navigation enable pretty links explicitly.

## Requirement

AppRun 6.0.0 must expose the typed `app.use_prettyLink` startup API with the same default-off behavior as 3.38.1. Loading AppRun without a configuration call must use hash initialization and native browser links. Calling `app.use_prettyLink()` or `app.use_prettyLink(true)` before `DOMContentLoaded` must enable pathname initialization, `popstate`, and guarded same-origin anchor interception. Calling `false` must explicitly select the default hash/native mode. Play compiler, runtime-alignment, generated-asset, and editor-input fixes must remain intact without requiring false-mode boilerplate in ordinary examples or hosts.

## Acceptance Criteria

- [x] AppRun 6.0.0 initializes in hash/native mode when the application makes no `use_prettyLink` call.
- [x] Default startup initializes from `location.hash`, listens for `hashchange`, and does not attach the path `popstate` listener or body-level anchor interceptor.
- [x] `app.use_prettyLink()` and `app.use_prettyLink(true)` enable pathname initialization, `popstate`, and eligible same-origin anchor interception with the existing `pushState` and route behavior.
- [x] `app.use_prettyLink(false)` explicitly selects hash initialization, `hashchange`, and native ordinary links.
- [x] The last `use_prettyLink` call before `DOMContentLoaded` determines the mode, and later calls do not rewire installed listeners.
- [x] Registering `#` or `#/` handlers does not silently override the default or an explicit routing choice.
- [x] `apprun-no-init` and `app['no-init-route']` suppress only the initial route call in either mode.
- [x] Public TypeScript declarations expose `use_prettyLink(enabled?: boolean): void`.
- [x] Public routing and migration documentation distinguishes no call or false as hash/native mode from argument-free or true as pretty-link mode.
- [x] Ordinary Play previews, reusable Play bundles, generated documentation hosts, complete non-routing HTML examples, and the main hash-routed demo require no false-mode call.
- [x] The two Play routing examples remain explicit: `Routing (component event)` demonstrates `false`, and `Routing (mount options)` demonstrates `true`.
- [x] Repository examples call `use_prettyLink` only when routing behavior is the subject or when a page intentionally owns `/path` navigation.
- [x] Automated coverage rejects false-mode boilerplate in generic examples and generated hosts while requiring explicit true in deliberate path-routing applications.
- [x] Both Play generators load `typescript@5.8.3/lib/typescript.js` before calling `ts.transpileModule`.
- [x] Play previews load the AppRun HTML runtime from the same local or deployed build as the Play component.
- [x] The Play page hides only its direct source textarea so CodeMirror remains editable.
- [x] Tracked Pages bundles and referenced source maps are published from the current 6.0 build.
- [x] Listener-level routing tests, example-policy tests, the full unit suite, and the production build pass with the default-off contract.

## Constraints

- Preserve the public name and signature: `app.use_prettyLink(enabled?: boolean)`.
- Match 3.38.1 semantics exactly at the configuration boundary: internal mode starts `false`, while an omitted method argument defaults to `true`.
- Treat routing mode as startup configuration selected before `DOMContentLoaded`.
- Preserve direct route events, hierarchical matching, `basePath`, no-init behavior, router events, 404 behavior, and guarded anchor eligibility.
- Do not restore hash-handler detection as a hidden mode switch.
- Remove only configuration and documentation churn made unnecessary by the default-off decision; preserve the Play compiler, runtime, editor, test-quality, and publishing fixes.
- Preserve tracked deployment outputs under `demo/` and `docs/assets/` while keeping `dist/` generated and ignored.

## Non-Goals

- Supporting routing-mode changes after AppRun initializes.
- Redesigning link eligibility, route matching, or component registration.
- Adding an environment variable, compatibility shim, alias, or second routing API.
- Preserving the abandoned 6.0.0 default-on policy through widespread explicit-false calls.
- Changing the package version or publishing a release.
