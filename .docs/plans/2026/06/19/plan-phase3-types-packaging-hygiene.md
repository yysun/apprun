# Phase 3 Types, Packaging, and Repo Hygiene Plan

## Goal

Make Phase 3's type safety and package hygiene requirements true without changing AppRun's runtime contract. The package should fail obvious type regressions, publish from explicit generated outputs, and stop treating build artifacts and dead experiments as source truth.

## Current Context

- `IMPROVEMENT_PLAN.md` Phase 3 targets `src/types.ts`, `src/component.ts`, tsconfigs, `jest.config.js`, `package.json`, generated artifacts, dead files, TSLint replacement, and `immer`.
- `src/types.ts` currently defines `EventOptions` as `{ ... } | any`, which erases the public option contract. `history?` fields in action/start/mount options are untyped.
- `src/component.ts` has loose members (`element`, `rendered`, `mounted`, `unload`, history arrays, tracking fields, pending state) while using history as both boolean and `{ prev, next }`.
- `tsconfig.jest.json` is already strict, but `jest.config.js` sets `diagnostics.warnOnly: true` and ignores real type errors.
- Root `tsconfig.json` and `src/tsconfig.json` do not enable the incremental strict flags named in the plan.
- `package.json` points `main` to `dist/apprun.js` and `module` to `esm/apprun.js`, has no `exports`, `files`, or `sideEffects`, and lists `immer` in regular `dependencies`.
- `rollup.config.js` consumes `esm/*` and writes `dist/*.esm.js`; `webpack.config.cjs` writes UMD files under `dist/*`, root `jsx-runtime.js`, and demo `demo/app.js`. A package build therefore still needs generated outputs, but they do not need to be tracked.
- `.gitignore` already ignores `coverage` and `*.log`, but tracked files still remain. It does not ignore `dist/` or `esm/`.
- `tslint.json` is present; no ESLint config or lint script exists.
- Phase 3 is internal/tooling-oriented; no browser E2E spec is required.

## Decisions

- Remove the public `any` escape from `EventOptions`; retain an extension point through an index signature rather than erasing the type.
- Model history as `boolean | { prev?: string; next?: string }` and normalize it in `Component.mount` before accessing `prev`/`next`.
- Add the specific incremental strict flags named in the improvement plan instead of forcing a full repo-wide `strict: true` migration in this phase.
- Remove Jest diagnostic suppression entirely after fixing surfaced type errors. Keeping `warnOnly` would make the Phase 3 type work meaningless.
- Add package `exports`, `files`, and `sideEffects` around the current emitted files. Do not change the runtime module format or add `"type": "module"` in this phase.
- Remove tracked `dist/`, `esm/`, generated `jsx-runtime.js`, generated `demo/app.js`, `coverage/`, `error.log`, and named experimental files from git, then add those generated outputs to `.gitignore`. Preserve deterministic publication by adding `prepack` so `npm pack` rebuilds outputs before packaging.
- Move `immer` from `dependencies` to optional peer metadata while keeping it in `devDependencies` so local builds/tests for `src/createState.ts` still resolve.
- Replace TSLint with ESLint flat config and a minimal rule baseline. Do not try to reproduce the old TSLint rule set wholesale.
- Do not add CI, coverage thresholds, declaration generation, or release/version automation in this story.

## Phased Tasks

### Phase 1 - Discovery and scope lock

- [x] Inspect `IMPROVEMENT_PLAN.md`, `src/types.ts`, `src/component.ts`, tsconfigs, `jest.config.js`, `package.json`, `.gitignore`, `.npmignore`, `rollup.config.js`, and `webpack.config.cjs` to confirm Phase 3's real ownership boundaries.
- [x] Identify all tracked `dist/`, `esm/`, `coverage/`, `error.log`, `src/vdom-my-new.ts`, `src/vdom-patch.ts`, `src/vdom-html.ts_`, and ignored benchmark/spec files that must be removed or intentionally preserved.
- [x] Record the non-goals in this AP so implementation does not drift into CI, versioning, declaration generation, or runtime feature work.

### Phase 2 - Public type contract

- [x] Update `src/types.ts` so `EventOptions`, history options, app start/mount options, callbacks, lifecycle hooks, `VNode`, `VDOM`, and component route types avoid avoidable `any` while preserving existing call shapes.
- [x] Update `src/component.ts` so element, state, view, update, options, history, pending state, lifecycle hooks, and event helpers use concrete types and history access is safe for both boolean and object history options.
- [x] Update `apprun.d.ts` so public declarations match the repaired source option types and continue to expose the Phase 4 API.
- [x] Add or update `tests/typescript-declarations.spec.ts` checks that fail if `EventOptions` collapses to `any`, history options are untyped, or removed compatibility APIs return.

### Phase 3 - Strictness and Jest diagnostics

- [x] Update `tsconfig.json` and `src/tsconfig.json` with `strictBindCallApply`, `noImplicitThis`, and `strictFunctionTypes`.
- [x] Remove `diagnostics.warnOnly` and the ignored TypeScript diagnostic list from `jest.config.js`.
- [x] Run the focused TypeScript/Jest checks that exercise public declarations and component typing, then fix any real type errors without weakening tests.

### Phase 4 - Package boundary and dependency hygiene

- [x] Update `package.json` with `exports` entries for `.`, `./jsx-runtime`, `./createState`, `./apprun-html`, and `./dist/*` using emitted files that the build produces.
- [x] Add a `files` whitelist and `sideEffects` metadata to `package.json` that match the supported package contents and tree-shaking boundary.
- [x] Move `immer` from `dependencies` to an optional peer dependency while keeping local development able to build `src/createState.ts`.
- [x] Add a package generation hook such as `prepack` so `npm pack` builds `dist` and `esm` from source even though generated outputs are untracked.
- [x] Verify `npm pack --dry-run` includes required runtime, type, CLI, and subpath files while excluding source-only docs/tests/dead experiments.

### Phase 5 - Repo hygiene and lint replacement

- [x] Remove tracked generated artifacts under `dist/`, `esm/`, generated `jsx-runtime.js`, generated `demo/app.js`, and dead experimental files named by Phase 3 from git.
- [x] Update `.gitignore` so generated `dist/`, `esm/`, demo/JSX outputs, coverage, logs, and local package tarballs do not return as untracked churn after build/pack.
- [x] Remove `tslint.json`, add ESLint TypeScript dependencies/config, and add a runnable `npm run lint` script.
- [x] Run `npm run lint` and fix only Phase 3-relevant lint failures or tune the minimal baseline when a rule is too broad for the current legacy code.

### Phase 6 - Verification and review

- [x] Run `npm test -- --runInBand tests/typescript-declarations.spec.ts tests/component.spec.ts tests/app.spec.ts` and record focused evidence.
- [x] Run `npm test -- --runInBand` and record full Jest evidence with diagnostics failing on type errors.
- [x] Run `npm run build` and record package generation evidence.
- [x] Run `npm run lint` and record lint evidence.
- [x] Run `npm pack --dry-run` and record package contents evidence.
- [x] Run `git diff --check` and record whitespace evidence.
- [x] Review the diff against this REQ/AP, fix high-priority findings, and update final evidence in the REQ/AP.

## Validation

- `npm test -- --runInBand tests/typescript-declarations.spec.ts tests/component.spec.ts tests/app.spec.ts`
- `npm test -- --runInBand`
- `npm run build`
- `npm run lint`
- `npm pack --dry-run`
- `git diff --check`

Expected evidence: focused and full Jest pass without `warnOnly`; build emits package files from source; lint passes under the new ESLint config; dry-run pack includes required package outputs and excludes repo-only material; diff check is clean.

Final evidence:

- `npm test -- --runInBand tests/typescript-declarations.spec.ts tests/component.spec.ts tests/app.spec.ts` passed: `3` suites, `85` tests.
- `npm test -- --runInBand` passed: `46` suites, `565` tests.
- `npm run build` passed: TypeScript, Rollup, and webpack completed; `dist`, `esm`, `jsx-runtime.js`, and `demo/app.js` regenerated from source.
- `npm run lint` passed with `0` errors and `91` legacy unused warnings under the new ESLint baseline.
- `npm pack --dry-run` passed: `prepack` rebuilt outputs and the dry-run tarball listed `72` files including `dist`, `esm`, `jsx-runtime.js`, `cli`, `apprun.d.ts`, `README.md`, `CHANGELOG.md`, `LICENSE`, and excluding repo-only tests/docs/plans.
- `git diff --check` passed.

## Code Review

CR passed: no blocking code-review findings. The main review correction was broadening `Update` to keep the existing `{ event: [action, options] }` shape after strict build exposed the demo usage, and removing the stale Rollup `apprun-play-html` entry that only worked because generated `esm` files were tracked.

## Rollback / Risk

- Removing tracked `dist`/`esm` creates a large deletion diff. The rollback is to restore those directories and remove `prepack`, but that reintroduces stale artifact risk.
- Removing Jest diagnostic suppression can surface legacy type errors. The fix must repair types or tests, not restore `warnOnly`.
- Package `exports` can break undocumented deep imports. This story supports documented/public entries and `./dist/*`; broader deep import compatibility is a non-goal unless tests reveal a supported path.
- Moving `immer` to optional peer can affect consumers importing `apprun/createState` without installing `immer`. That is intentional: `createState` is opt-in, and the package metadata should stop charging main-package consumers for it.

## Architecture Review

AR passed: no blocking architecture flaws. The plan covers every acceptance criterion, preserves deterministic package generation before untracking build outputs, excludes E2E for this internal tooling/package story, and rejects the main risky shortcuts: keeping Jest `warnOnly`, deleting generated files without a package-build hook, and replacing TSLint with an overbroad lint migration.
