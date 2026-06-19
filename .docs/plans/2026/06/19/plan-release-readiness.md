# 6.0.0 Release Readiness Plan

## Goal

Make the repository ready for a `6.0.0` breaking release candidate. The version, CI gates, package dry-run behavior, and release-facing docs must agree with the roadmap implementation already committed.

## Current Context

- `master` was ahead of `origin/master` by four roadmap commits before release-readiness work started.
- `package.json`, `package-lock.json`, and `src/version.ts` now report `6.0.0`.
- `.github/workflows/ci.yml` runs `npm ci`, full Jest, build, lint, and `npm pack --dry-run`.
- The packaging roadmap work removed generated artifacts from git and added `prepack`; release-readiness checks prove packaging still includes generated files.
- The breaking-change roadmap work added `MIGRATION.md` for 4.0-era breaking API changes; release readiness retitles that release boundary to `6.0.0`.
- `CHANGELOG.md`, `WHATSNEW.md`, and `README.md` now describe the completed breaking release boundary and generated package artifact policy.
- This story is release readiness. It does not reopen runtime behavior decisions from earlier phases.

## Decisions

- Use `6.0.0` exactly because the user requested it. Do not pick `4.0.0` even though Phase 4 originally used that wording.
- Commit step by step in four boundaries:
  1. RPD docs and plan.
  2. CI/package gate enforcement.
  3. Version bump plus release-facing docs.
  4. Final release-readiness evidence.
- Add CI steps for `npm run lint` and `npm pack --dry-run` after build. This mirrors local verification and catches package output drift.
- Keep `prepack` as the package generation mechanism. Do not re-track generated package outputs.
- Update migration/release docs to say `6.0.0` while preserving the already documented breaking behaviors.
- Do not create tags, publish, or push in this story.

## Commit Tasks

### Task 1 - RPD contract and first commit

- [x] Create `.docs/reqs/2026/06/19/req-release-readiness.md` with testable release-readiness acceptance criteria.
- [x] Create `.docs/plans/2026/06/19/plan-release-readiness.md` with commit boundaries, validation commands, and risks.
- [x] Run `git diff --check` on the RPD docs and commit only the release-readiness RPD docs.

### Task 2 - CI/package gate commit

- [x] Inspect `.github/workflows/ci.yml` and `package.json` scripts to confirm the CI gate commands exist locally.
- [x] Update `.github/workflows/ci.yml` so CI runs `npm run lint` and `npm pack --dry-run` in addition to install, tests, and build.
- [x] Run `npm run lint`, `npm pack --dry-run`, and `git diff --check`, then commit only the CI gate change.

### Task 3 - Version and release docs commit

- [x] Update `package.json`, `package-lock.json`, and `src/version.ts` to version `6.0.0`.
- [x] Update `CHANGELOG.md`, `WHATSNEW.md`, `MIGRATION.md`, and README package guidance so release-facing docs describe `6.0.0`, breaking API changes, package hygiene, and optional `immer`.
- [x] Run a focused version consistency check that reads `package.json`, `package-lock.json`, and `src/version.ts`.
- [x] Run `npm test -- --runInBand`, `npm run build`, `npm run lint`, `npm pack --dry-run`, and `git diff --check`, then commit only the version/docs release change.

### Task 4 - Final verification

- [x] Confirm `git log --oneline` shows the release-readiness commits after the roadmap commits.
- [x] Confirm the working tree contains only RPD evidence docs before the final evidence commit.
- [x] Record final evidence in the REQ/AP after the last verification command.

## Validation

- `node -e "const fs=require('fs'); const pkg=require('./package.json'); const lock=require('./package-lock.json'); const version=fs.readFileSync('src/version.ts','utf8'); if(pkg.version!=='6.0.0'||lock.version!=='6.0.0'||lock.packages[''].version!=='6.0.0'||!version.includes(\"APPRUN_VERSION = '6.0.0'\")) process.exit(1); console.log('version ok')"`
- `npm test -- --runInBand`
- `npm run build`
- `npm run lint`
- `npm pack --dry-run`
- `git diff --check`

Expected evidence: version check prints `version ok`; Jest, build, lint, pack dry-run, and diff check pass; CI file includes lint and pack dry-run steps.

Actual evidence:

- Version consistency check printed `version ok`.
- `npm test -- --runInBand` passed: 46 test suites, 565 tests.
- `npm run build` passed for `apprun@6.0.0`.
- `npm run lint` passed with 0 errors and 91 existing warnings.
- `npm pack --dry-run` passed and reported `apprun@6.0.0`, `apprun-6.0.0.tgz`, 72 files.
- `git diff --check` passed.
- `git log --oneline -6` showed:
  - `1203e12 chore: release 6.0.0`
  - `d10be72 ci: verify lint and package dry run`
  - `5eba13f` release-readiness RPD requirements and plan
  - `8d529ec feat: prepare roadmap breaking api`
  - `b9d9aff chore: harden types and package hygiene`
  - `1441829 fix: patch roadmap memory architecture`

## Rollback / Risk

- `6.0.0` is a major-version jump from `3.38.0`. That is intentional per the user request, but it should not be tagged or published by this story.
- `npm pack --dry-run` runs `prepack`, which regenerates ignored build outputs. `.gitignore` must keep those outputs out of source control.
- CI pack checks add build time but catch exactly the artifact drift the packaging roadmap work was designed to prevent.
- Release docs can easily overclaim. Keep them tied to committed roadmap behavior and avoid promising publishing, tags, or future compatibility windows.

## Architecture Review

AR passed: no blocking architecture flaws. The plan has a clear release-readiness scope, preserves the generated-output policy, avoids publishing/tagging side effects, commits changes in reviewable boundaries, and validates the exact version and package gates requested.
