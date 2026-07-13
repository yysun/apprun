# Play TypeScript Runtime Plan

## Goal

Restore the local `#play` experience by making its generated iframe load a valid, versioned TypeScript browser bundle before calling `ts.transpileModule`.

## Current Context

- `demo/main.ts` registers `src/apprun-code.tsx`, and `demo/components/play.tsx` creates the `<apprun-code>` element used by `http://localhost:8080/#play`.
- Before this fix, `src/apprun-code.tsx` generated iframe HTML that loaded `https://cdn.jsdelivr.net/npm/typescript@latest` before calling `ts.transpileModule`.
- On 2026-07-13, that mutable CDN package URL returns HTTP 404 with `Couldn't resolve the default file in typescript.`; therefore no `ts` browser global is installed.
- `https://cdn.jsdelivr.net/npm/typescript@5.8.3/lib/typescript.js` returns HTTP 200 and matches the repository's locked TypeScript version.
- `webpack.config.cjs` builds `src/apprun-code.tsx` into `dist/apprun-code.js` and also includes it in `demo/app.js`, which is the bundle served by the local root page.
- `docs/assets/apprun-code.js` is not used by the local root page and has separate historical content, so it is outside this fix.

## Decisions

- Replace the mutable package-root URL with the explicit `typescript@5.8.3/lib/typescript.js` browser bundle. This fixes both sources of nondeterminism: the version and the package entrypoint.
- Preserve `ts.transpileModule`; changing compiler APIs would expand the problem without benefit.
- Regenerate only the normal build outputs required by the repository's build. Do not hand-edit minified bundles.
- Do not add a fallback CDN or a guard around `ts`; either would convert a deterministic dependency failure into a harder-to-diagnose partial failure.
- Add a narrow source assertion if the existing test layout supports it; otherwise rely on build plus browser verification because the failure occurs in generated iframe HTML and external script loading.

## Phased Tasks

### Phase 1 - Discovery and scope lock

- [x] Trace `index.html` through `demo/app.js`, `demo/main.ts`, `demo/components/play.tsx`, and `src/apprun-code.tsx` to identify the generated iframe as the failing control point.
- [x] Reproduce the external dependency failure by confirming that `https://cdn.jsdelivr.net/npm/typescript@latest` returns HTTP 404.
- [x] Confirm that `https://cdn.jsdelivr.net/npm/typescript@5.8.3/lib/typescript.js` returns HTTP 200 and matches `package-lock.json`.
- [x] Exclude router changes, fallback loaders, editor replacement, and `docs/assets/apprun-code.js` reconciliation from scope.

### Phase 2 - Runtime dependency fix

- [x] Add the required source-file comment block to `src/apprun-code.tsx` and record the Play runtime dependency contract there.
- [x] Update `src/apprun-code.tsx` to load the explicit TypeScript 5.8.3 browser bundle before the module script invokes `ts.transpileModule`.
- [x] Confirm the change does not introduce a fallback CDN, environment variable, compatibility mode, or swallowed runtime error.

### Phase 3 - Regression coverage and generated output

- [x] Inspect the existing Jest patterns for a narrow assertion over the generated Play runtime URL; no unit test was added because the suite has no Play iframe seam and exporting the private HTML generator would weaken the module boundary.
- [x] Run `npm run build` so `dist/apprun-code.js` and `demo/app.js` contain the corrected URL, recording any additional generated-file changes for scope review.
- [x] Verify with `rg` that `typescript@latest` is absent from the source and locally served Play bundles, and the explicit browser bundle URL is present.

### Phase 4 - Runtime verification

- [x] Execute `.docs/tests/test-play-typescript-runtime.md` against `http://localhost:8080/#play`.
- [x] Confirm the Play iframe loads the versioned TypeScript script with HTTP 200 and produces no `ts is not defined` console error.
- [x] Confirm the default `Hello World ($bind)` example renders and entering text updates its greeting.

### Phase 5 - Review and completion evidence

- [x] Review the uncommitted diff against `req-play-typescript-runtime.md`, excluding unrelated generated churn.
- [x] Record exact build, test, URL, console, and interaction evidence in the completed plan.
- [x] Mark remaining tasks complete only after their code or verification evidence exists.

## Validation

- `npm run build` must exit successfully and regenerate the local demo/runtime bundles.
- `rg -n "typescript@latest|typescript@5\\.8\\.3/lib/typescript\\.js" src/apprun-code.tsx dist/apprun-code.js demo/app.js` must show no mutable URL and must show the explicit browser bundle URL in each relevant artifact.
- The scenario in `.docs/tests/test-play-typescript-runtime.md` must pass in the browser: no missing-`ts` console error, successful TypeScript request, rendered preview, and a greeting that responds to bound input.
- If a focused Jest regression test is added, run that file with `npx jest <test-file> --runInBand`; otherwise document why browser verification is the direct regression check.

## Rollback / Risk

- The browser runtime remains CDN-dependent. Pinning the exact version and file path makes the dependency stable but does not make Play available offline.
- `npm run build` may regenerate tracked artifacts unrelated to this one-line source change. Review and retain only outputs owned by the corrected Play source path.
- Rollback is the source URL reversal plus regeneration of the same browser bundles; no data or migration rollback is involved.

## Execution Evidence

- `npm run build` passed: TypeScript, Rollup, and Webpack completed successfully; Webpack reported `compiled successfully`.
- The generated-output review retained only `demo/app.js`, `dist/apprun-code.js`, `esm/apprun-code.js`, and their source maps; unrelated build churn was removed.
- The focused `rg` check found `typescript@5.8.3/lib/typescript.js` exactly once in each of `src/apprun-code.tsx`, `esm/apprun-code.js`, `dist/apprun-code.js`, and `demo/app.js`, with no `typescript@latest` match.
- The pinned CDN URL returned HTTP 200 with `application/javascript; charset=utf-8`.
- Browser E2E passed at `http://localhost:8080/#play`: the iframe contained exactly one TypeScript script with the pinned URL, the error console was empty, and entering `AppRun` changed the heading to `Hello AppRun`.
- CR passed: generated source maps parse successfully, the source and generated artifacts contain the pinned URL exactly once, `git diff --check` passes, and no major review flaws remain.
