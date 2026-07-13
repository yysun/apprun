# Play TypeScript Runtime

## Problem

The local Play page at `http://localhost:8080/#play` cannot render its examples. The generated preview iframe references `ts`, but the CDN request intended to define that browser global returns a 404 response. Users see `Uncaught ReferenceError: ts is not defined` instead of a working preview.

## Requirement

The Play page must load a valid, deterministic TypeScript browser runtime before compiling an example, so the preview can execute without a missing-`ts` error.

## Acceptance Criteria

- [ ] The generated Play iframe loads a concrete TypeScript browser bundle that returns JavaScript successfully.
- [ ] Opening `http://localhost:8080/#play` produces no `ts is not defined` error.
- [ ] The default `Hello World ($bind)` example renders and updates its greeting when text is entered.
- [ ] The browser bundles served by the local development server contain the corrected runtime URL.

## Constraints

- Keep the current in-browser TypeScript compilation behavior and `ts.transpileModule` contract.
- Use an explicit TypeScript version and browser bundle path; do not depend on the package's mutable default CDN entrypoint.
- Keep the fix inside the existing Play component and normal build pipeline.

## Non-Goals

- Replacing the Play compiler or editor.
- Adding fallback CDNs, runtime retries, or error suppression.
- Refactoring routing, AppRun rendering, or the Play examples.
- Reconciling unrelated historical differences in `docs/assets/apprun-code.js`.
