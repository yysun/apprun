# E2E: Configurable pretty-link routing for 6.0.0

## Scenario 1 - Hash and native navigation are the default

1. Load a page that imports the built AppRun browser bundle without calling `app.use_prettyLink`.
2. Register observable hash and path route handlers plus an ordinary same-origin anchor.
3. Confirm startup dispatches `location.hash`, installs `hashchange`, and does not install `popstate` or body-level click interception.
4. Click the anchor and confirm AppRun does not prevent native browser navigation.
5. Change the hash and confirm AppRun dispatches the hash route.

## Scenario 2 - Argument-free and true explicitly enable pretty links

1. Load one page that calls `app.use_prettyLink()` and another that calls `app.use_prettyLink(true)` before `DOMContentLoaded`.
2. Register a path route and a same-origin anchor on each page.
3. Confirm pathname initialization, `popstate`, body-level guarded anchor interception, `history.pushState`, and path dispatch on both pages.
4. Use browser Back and confirm the restored pathname is dispatched.

## Scenario 3 - Explicit false matches the default

1. Load a page that calls `app.use_prettyLink(false)` before `DOMContentLoaded`.
2. Confirm its listener set and native-link behavior match an unconfigured page.
3. Confirm false remains useful as explicit documentation for a hash-routing example.

## Scenario 4 - The last pre-startup configuration wins

1. Call false and then true before `DOMContentLoaded`; confirm pretty-link path navigation.
2. Repeat with true followed by false; confirm hash routing and native ordinary links.
3. Call either mode after `DOMContentLoaded`; confirm installed listeners are not rewired.

## Scenario 5 - Hash handlers are not a hidden mode switch

1. Load an unconfigured page with and without `#` handlers; confirm both remain in default hash/native mode.
2. Load an explicit-true page with a `#` handler; confirm it still uses pathname routing and path-link interception.

## Scenario 6 - Initial-route suppression is mode-independent

1. Load default-off and explicit-true pages with `apprun-no-init`, then repeat with `app['no-init-route']`.
2. Confirm no page dispatches an initial route.
3. Confirm later hash navigation still works in default mode and later path/Back navigation works in explicit-true mode.

## Scenario 7 - Play and examples avoid false-mode boilerplate

1. Load all 30 named Play entries.
2. Confirm `Routing (component event)` explicitly demonstrates false and `Routing (mount options)` explicitly demonstrates true.
3. Confirm the other 28 entries contain no routing-mode call.
4. Confirm ordinary preview wrappers, reusable Play bundles, the main hash demo, complete non-routing documents, and generated documentation hosts contain no false call needed solely for startup.
5. Confirm CLI and add-components `/path` applications explicitly call true.
6. Confirm both preview documents load `typescript@5.8.3/lib/typescript.js`, expose `ts.transpileModule`, and load the sibling AppRun HTML runtime without a missing-method error.

## Scenario 8 - Published Play assets preserve host behavior

1. Build the repository and load `docs/assets/apprun-play.js` on an unconfigured host with an ordinary same-origin link.
2. Confirm the link is not prevented because AppRun defaults to hash/native mode.
3. Repeat on a host that calls `app.use_prettyLink(true)` before `DOMContentLoaded`; confirm path interception remains enabled after Play loads.
4. Confirm Play iframes resolve `docs/assets/apprun-html.js` beside the Play bundle.
5. Confirm `docs/assets/apprun-play.js.map` exists beside the bundle referenced by its `sourceMappingURL`.

## Scenario 9 - Play source editor accepts input

1. Load the root Play page and focus the left CodeMirror editor.
2. Type a visible change into the current example.
3. Confirm the editor content changes and the preview reruns with the edited source.
4. Confirm the original source textarea remains hidden without hiding CodeMirror's internal input textarea.

## Verification Evidence

- Focused routing and example-policy tests: 4 suites, 106 tests passed.
- Full unit suite: 47 suites, 620 tests passed.
- Production build: TypeScript, Rollup, Webpack, and Pages asset sync passed.
- Lint: 0 errors; 87 pre-existing warnings.
- Browser catalog sweep: all 30 Play entries loaded one preview iframe with no TypeScript diagnostics or console errors.
- Browser interaction: the left CodeMirror editor accepted input and reran the preview; explicit true intercepted a `/contact` link and rendered the Contact route.
