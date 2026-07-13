# Explicit pretty-link routing

## Problem

AppRun 3.35.0 through 3.38.0 automatically switches to path routing when no hash-route handler is registered. In that mode it installs a body-level click handler that prevents normal navigation for every same-origin anchor and replaces it with `history.pushState` plus an AppRun route event. This is a breaking change for multi-page applications such as rlp-com: ordinary links stop loading their server-rendered destination, and applications have no supported way to disable the interception.

## Requirement

AppRun must preserve normal browser navigation and legacy hash routing by default. SPA-style path routing and same-origin anchor interception must activate only when an application explicitly opts in through the restored `app.use_prettyLink` API. Applications must be able to opt out explicitly before AppRun initializes, and existing initial-route suppression and base-path behavior must remain intact.

## Acceptance Criteria

- [x] Without an explicit opt-in, AppRun initializes hash routing and does not attach a body-level anchor click interceptor.
- [x] `app.use_prettyLink()` and `app.use_prettyLink(true)` enable path initialization, path `popstate` routing, and the existing same-origin anchor `pushState` behavior.
- [x] `app.use_prettyLink(false)` disables pretty-link routing, including when it follows an earlier opt-in before initialization.
- [x] `apprun-no-init` and `app['no-init-route']` continue to suppress only the initial route call in either routing mode.
- [x] Path-mode base-path stripping and pushed navigation paths retain their current behavior.
- [x] The public TypeScript declarations expose `use_prettyLink(enabled?: boolean): void`.
- [x] Targeted tests execute AppRun's real `DOMContentLoaded`, click, hashchange, and popstate wiring rather than duplicating the implementation logic inside the test.
- [x] With its workaround temporarily removed, rlp-com's production build succeeds against the corrected local AppRun package, proving the workaround can be deleted after a fixed AppRun version is published and consumed.
- [x] AppRun's focused router tests, full unit suite, and production build pass.

## Constraints

- Restore the historical `use_prettyLink` name so applications that used the earlier opt-in API remain source-compatible.
- Treat the routing mode as startup configuration; callers must configure it before `DOMContentLoaded`.
- Keep the event bus and direct `app.run('route', ...)` behavior available in both modes.
- Preserve the existing `basePath`, router-event, and 404 contracts.
- Keep changes surgical across the AppRun routing bootstrap and the obsolete rlp-com build shim.
- Do not commit an rlp-com cleanup that still resolves the broken published `apprun@3.38.0`; consumer cleanup must follow a fixed package release.

## Non-Goals

- Supporting live routing-mode changes after AppRun has initialized.
- Redesigning anchor eligibility for modifier keys, targets, downloads, query strings, or fragments.
- Introducing a general configuration framework, environment variable, compatibility package, or application-specific click handler.
- Changing hierarchical route matching or component route registration.
- Publishing AppRun or changing rlp-com to an unpublished dependency during this implementation task.
