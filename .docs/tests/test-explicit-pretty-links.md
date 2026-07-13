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
