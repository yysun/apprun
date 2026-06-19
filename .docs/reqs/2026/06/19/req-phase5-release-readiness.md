# Phase 5 Release Readiness Requirements

## Problem

Phases 1-4 changed AppRun's runtime contract, package shape, generated artifact policy, and public API. The repository now has the code for a breaking release, but the release boundary is not explicit enough: CI does not yet enforce every package gate, docs still describe the previous version stream, and the version is still `3.38.0`.

That is a bad release posture. A breaking package can be built locally while CI misses packaging regressions, and consumers can read stale version/docs language that contradicts the package they install.

## Requirement

Phase 5 must turn the completed implementation work into a coherent release candidate. The package version must move to `6.0.0`, the runtime version constant must match it, CI must verify test/build/lint/pack gates, and release-facing docs must describe the breaking API, package output policy, and optional `immer` dependency clearly.

## Acceptance Criteria

- [x] `package.json`, `package-lock.json`, and `src/version.ts` all report version `6.0.0`.
- [x] CI runs install, tests, build, lint, and package dry-run checks.
- [x] Changelog/release docs describe the 6.0.0 breaking API changes, package hygiene changes, explicit globals, router pattern support, and optional `immer` dependency.
- [x] README release-facing package guidance does not contradict the untracked generated artifact policy or the package export/prepack flow.
- [x] RPD docs record Phase 5 scope, validation, commit boundaries, and final evidence.
- [x] Changes are committed step by step instead of as one large mixed commit.
- [x] Verification evidence includes focused version checks, CI gate commands, `npm pack --dry-run`, and `git diff --check`.

## Constraints

- Do not add new runtime behavior beyond the explicit version constant update.
- Do not re-track generated `dist`, `esm`, `jsx-runtime.js`, or `demo/app.js` files.
- Do not create a release tag or publish to npm.
- Do not rewrite the already committed Phase 1-4 behavior work.
- Keep CI lightweight and aligned with local package scripts.

## Non-Goals

- Publishing `6.0.0` to npm.
- Creating GitHub releases or release notes outside the repository.
- Adding coverage thresholds, browser E2E, benchmark gates, or deployment automation.
- Redesigning the README or rewriting historical changelog entries.

## Final Evidence

- Version consistency check printed `version ok`.
- `npm test -- --runInBand` passed: 46 test suites, 565 tests.
- `npm run build` passed for `apprun@6.0.0`.
- `npm run lint` passed with 0 errors and 91 existing warnings.
- `npm pack --dry-run` passed and reported `apprun@6.0.0`, `apprun-6.0.0.tgz`, 72 files.
- `git diff --check` passed.
- Phase 5 commit boundaries:
  - `5eba13f docs: plan phase 5 release readiness`
  - `d10be72 ci: verify lint and package dry run`
  - `1203e12 chore: release 6.0.0`
  - final RPD evidence commit
