# Play TypeScript Runtime E2E

## Scenario: compile and run the default Play example

1. Start the repository development server with `npm start` and open `http://localhost:8080/#play`.
2. Wait for the `<apprun-code>` editor and preview iframe to finish rendering.
3. Inspect the iframe's TypeScript script request.
   - Expected: `https://cdn.jsdelivr.net/npm/typescript@5.8.3/lib/typescript.js` returns HTTP 200.
4. Inspect the top-level page and preview iframe consoles.
   - Expected: neither contains `ReferenceError: ts is not defined`.
5. Inspect the default preview.
   - Expected: the `Hello World ($bind)` example renders an input and a `Hello` heading.
6. Enter `AppRun` in the preview input.
   - Expected: the heading updates to `Hello AppRun`.

## Failure Evidence

Record the failing step, requested TypeScript URL and status, full console error, displayed preview state, and whether entering text changed the greeting.
