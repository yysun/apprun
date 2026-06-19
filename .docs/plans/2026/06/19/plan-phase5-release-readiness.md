# Phase 5 Release Readiness Plan

## Goal

Make the repository ready for a `6.0.0` breaking release candidate. The version, CI gates, package dry-run behavior, and release-facing docs must agree with the Phase 1-4 implementation already committed.

## Current Context

- `master` is ahead of `origin/master` by four commits: Phase 1, Phase 2, Phase 3, and Phase 4.
- `package.json`, `package-lock.json`, and `src/version.ts` still report `3.38.0`.
- `.github/workflows/ci.yml` already exists and runs `npm ci`, full Jest, and `npm run build`, but does not run `npm run lint` or `npm pack --dry-run`.
- Phase 3 removed generated artifacts from git and added `prepack`; release checks must prove packaging still includes generated files.
- Phase 4 added `MIGRATION.md` for 4.0-era breaking API changes, but the requested release number is now `6.0.0`.
- `CHANGELOG.md`, `WHATSNEW.md`, and `README.md` still lead with the 3.38 stream and do not describe the completed breaking release boundary.
- This story is release readiness. It does not reopen runtime behavior decisions from earlier phases.

## Decisions

- Use `6.0.0` exactly because the user requested it. Do not pick `4.0.0` even though Phase 4 originally used that wording.
- Commit step by step in three boundaries:
  1. RPD docs and plan.
  2. CI/package gate enforcement.
  3. Version bump plus release-facing docs.
- Add CI steps for `npm run lint` and `npm pack --dry-run` after build. This mirrors local verification and catches package output drift.
- Keep `prepack` as the package generation mechanism. Do not re-track generated package outputs.
- Update migration/release docs to say `6.0.0` while preserving the already documented breaking behaviors.
- Do not create tags, publish, or push in this story.

## Phased Tasks

### Phase 1 - RPD contract and first commit

- [ ] Create `.docs/reqs/2026/06/19/req-phase5-release-readiness.md` with testable release-readiness acceptance criteria.
- [ ] Create `.docs/plans/2026/06/19/plan-phase5-release-readiness.md` with commit boundaries, validation commands, and risks.
- [ ] Run `git diff --check` on the RPD docs and commit only the Phase 5 RPD docs.

### Phase 2 - CI/package gate commit

- [ ] Inspect `.github/workflows/ci.yml` and `package.json` scripts to confirm the CI gate commands exist locally.
- [ ] Update `.github/workflows/ci.yml` so CI runs `npm run lint` and `npm pack --dry-run` in addition to install, tests, and build.
- [ ] Run `npm run lint`, `npm pack --dry-run`, and `git diff --check`, then commit only the CI gate change.

### Phase 3 - Version and release docs commit

- [ ] Update `package.json`, `package-lock.json`, and `src/version.ts` to version `6.0.0`.
- [ ] Update `CHANGELOG.md`, `WHATSNEW.md`, `MIGRATION.md`, and README package guidance so release-facing docs describe `6.0.0`, breaking API changes, package hygiene, and optional `immer`.
- [ ] Run a focused version consistency check that reads `package.json`, `package-lock.json`, and `src/version.ts`.
- [ ] Run `npm test -- --runInBand`, `npm run build`, `npm run lint`, `npm pack --dry-run`, and `git diff --check`, then commit only the version/docs release change.

### Phase 4 - Final verification

- [ ] Confirm `git log --oneline` shows the Phase 5 commits after Phase 4.
- [ ] Confirm the working tree is clean.
- [ ] Record final evidence in the REQ/AP after the last verification command.

## Validation

- `node -e "const fs=require('fs'); const pkg=require('./package.json'); const lock=require('./package-lock.json'); const version=fs.readFileSync('src/version.ts','utf8'); if(pkg.version!=='6.0.0'||lock.version!=='6.0.0'||lock.packages[''].version!=='6.0.0'||!version.includes(\"APPRUN_VERSION = '6.0.0'\")) process.exit(1); console.log('version ok')"`
- `npm test -- --runInBand`
- `npm run build`
- `npm run lint`
- `npm pack --dry-run`
- `git diff --check`

Expected evidence: version check prints `version ok`; Jest, build, lint, pack dry-run, and diff check pass; CI file includes lint and pack dry-run steps.

## Rollback / Risk

- `6.0.0` is a major-version jump from `3.38.0`. That is intentional per the user request, but it should not be tagged or published by this story.
- `npm pack --dry-run` runs `prepack`, which regenerates ignored build outputs. `.gitignore` must keep those outputs out of source control.
- CI pack checks add build time but catch exactly the artifact drift Phase 3 was designed to prevent.
- Release docs can easily overclaim. Keep them tied to committed Phase 1-4 behavior and avoid promising publishing, tags, or future compatibility windows.

## Architecture Review

AR passed: no blocking architecture flaws. The plan has a clear release-readiness scope, preserves the generated-output policy, avoids publishing/tagging side effects, commits changes in reviewable boundaries, and validates the exact version and package gates requested.
