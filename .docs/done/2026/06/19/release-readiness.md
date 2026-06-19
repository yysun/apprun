# 6.0.0 Release Readiness Done

## Summary

- Turned the completed roadmap work into a coherent `6.0.0` release candidate.
- Updated `package.json`, `package-lock.json`, and `src/version.ts` to `6.0.0`.
- Added CI gates for lint and `npm pack --dry-run` so package output drift is caught automatically.
- Updated changelog, what's-new, migration, and README package guidance for the breaking API and generated artifact policy.
- Kept generated `dist`, `esm`, `jsx-runtime.js`, and demo bundle outputs ignored rather than committed as source truth.
- Renamed the RPD release-readiness docs so this work is not misrepresented as an original roadmap Phase 5.

## Verification

- Version consistency check printed `version ok`.
- `npm test -- --runInBand` passed: 46 suites, 565 tests.
- `npm run build` passed for `apprun@6.0.0`.
- `npm run lint` passed with 0 errors and 91 existing warnings.
- `npm pack --dry-run` passed and reported `apprun@6.0.0`, `apprun-6.0.0.tgz`, 72 files.
- `git diff --check` passed.

## Notes

- Relevant commits: `5eba13f`, `d10be72`, `1203e12`, `a794fc6`, and cleanup commit `02258c6`.
- No npm publish, release tag, GitHub release, or push was performed.
