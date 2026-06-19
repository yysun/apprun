# Phase 3 Types, Packaging, and Repo Hygiene Requirements

## Problem

AppRun is currently easier to ship incorrectly than to review correctly. Public TypeScript types include `any` escape hatches, Jest hides type diagnostics that should fail, package publishing depends on old ignore rules and tracked generated output, and obsolete lint/dead files keep stale code in the repository.

The consequence is practical: consumers can install unnecessary dependencies, import paths work by accident, generated bundles can drift from source, and type regressions can pass in tests.

## Requirement

Phase 3 must make the library's type contract, package boundary, and repository hygiene explicit. Public options must have concrete types, test-time TypeScript diagnostics must fail instead of warn, package exports/files/side-effect metadata must describe the supported distribution, build artifacts must be generated instead of committed, and linting must move from TSLint to ESLint with a minimal enforceable baseline.

## Acceptance Criteria

- [x] `EventOptions`, history options, and component element/state/view/update members are typed without collapsing public APIs to `any`.
- [x] Incremental strict TypeScript checks are enabled in the active project configs, and Jest no longer suppresses assignability or implicit-any diagnostics with `warnOnly`.
- [x] `package.json` defines an explicit `exports` map, `files` whitelist, and `sideEffects` metadata for the supported runtime and subpath entries.
- [x] `immer` is no longer installed for every consumer of the main package; it is represented as an optional peer for the opt-in `createState` entry.
- [x] Dead experimental files and tracked generated artifacts called out by Phase 3 are removed from git, and `.gitignore` prevents generated output/log churn from returning.
- [x] TSLint is removed and replaced with ESLint plus TypeScript support, with a runnable script and a minimal baseline that can run in CI.
- [x] Package generation remains deterministic: a clean checkout can build the `dist`/`esm` package outputs before packing or publishing.
- [x] Verification evidence records typecheck, Jest, lint, package-build/pack checks, and `git diff --check`.

## Constraints

- Do not change runtime behavior except where type-safety repairs require preserving the existing behavior more explicitly.
- Do not introduce compatibility flags, fallback publishing modes, or duplicate lint systems.
- Keep package subpaths aligned with files the build actually emits.
- Do not publish or commit generated `dist`, `esm`, `coverage`, or log artifacts as source truth.
- Keep the change scoped to Phase 3; do not take on Phase 5 docs/CI/versioning work unless required to keep Phase 3 verifiable.

## Non-Goals

- Full `strict: true` migration across every source and test file.
- Automatic declaration generation replacing the hand-written `apprun.d.ts`.
- CI workflow creation, coverage thresholds, release automation, or package version bumping.
- Runtime feature work from earlier or later phases.

## Evidence

- `npm test -- --runInBand tests/typescript-declarations.spec.ts tests/component.spec.ts tests/app.spec.ts` passed: `3` suites, `85` tests.
- `npm test -- --runInBand` passed: `46` suites, `565` tests.
- `npm run build` passed and regenerated ignored package/demo outputs from source.
- `npm run lint` passed with `0` errors and `91` legacy unused warnings.
- `npm pack --dry-run` passed after `prepack`; dry-run package listed `72` files with required runtime/type/CLI outputs and without repo-only tests/docs/plans.
- `git diff --check` passed.
