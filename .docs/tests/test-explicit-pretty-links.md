# E2E: Explicit pretty-link routing

## Scenario 1 - Default browser navigation is not intercepted

1. Load a page that imports the built AppRun browser bundle without calling `app.use_prettyLink`.
2. Register observable hash and path route handlers.
3. Click a same-origin anchor that points to a second server-served page.
4. Confirm the click is not prevented by AppRun and the browser loads the second page normally.
5. Navigate to a hash URL and confirm AppRun dispatches the hash route.

## Scenario 2 - Explicit pretty links use SPA path navigation

1. Load a page that imports the built AppRun browser bundle and calls `app.use_prettyLink()` before `DOMContentLoaded`.
2. Register a path route handler and a same-origin anchor for that path.
3. Click the anchor.
4. Confirm AppRun prevents full-page navigation, updates the URL through `history.pushState`, and dispatches the path route.
5. Use browser Back and confirm AppRun dispatches the restored pathname through the `popstate` listener.

## Scenario 3 - Explicit opt-out wins before initialization

1. Load a page that calls `app.use_prettyLink(true)` and then `app.use_prettyLink(false)` before `DOMContentLoaded`.
2. Click a same-origin anchor to a server-served page.
3. Confirm AppRun does not intercept the click and the browser performs normal navigation.

## Scenario 4 - Initial-route suppression is independent

1. Load opt-in and default-mode pages whose body has `apprun-no-init`.
2. Confirm neither page dispatches an initial route on `DOMContentLoaded`.
3. Confirm subsequent hash navigation works on the default-mode page.
4. Confirm subsequent click and Back navigation work through AppRun on the opt-in page.

## Scenario 5 - Play mount-options example opts into path routing

1. Build AppRun and open the local Playground at `http://localhost:8080/#play`.
2. Select `Routing (mount options)`.
3. Confirm the example source calls `app.use_prettyLink()` before rendering or mounting its path-routed components.
4. Click the Contact and About links in the preview.
5. Confirm each link updates the preview URL and content without navigating the outer Playground page or performing a full-page load.
6. Select `Routing (component event)` and confirm it remains a hash-routing example without a pretty-link opt-in.

## Scenario 6 - Standalone add-components demo uses its base path

1. Open `/demo-html/add-components/` from the local AppRun server.
2. Confirm the Home component renders at the configured base path.
3. Click About.
4. Confirm the URL becomes `/demo-html/add-components/about` and the About component renders without a full-page load.

## Execution - 2026-07-13

- Scenario 5 passed on `http://localhost:8081/#play/20` because port 8080 was already occupied: Contact and About rendered in-place, and the hash-routing example still rendered Contact through `#contact`.
- Scenario 6 passed: About rendered in-place at `/demo-html/add-components/about`.
