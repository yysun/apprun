# AppRun 3.38.1 release documentation

## Problem

AppRun contains four fixes after 3.38.0, but its public release documents still stop at 3.38.0. Without a 3.38.1 entry, users cannot see that normal browser navigation is restored by default, path-routing applications must opt in explicitly, stale first-render classes are removed again, and the Play examples have been repaired.

## Requirement

Prepare the public AppRun release documentation for version 3.38.1. The documentation must accurately summarize the user-visible changes already present after the 3.38.0 release commit, make the pretty-link migration requirement explicit, and avoid claiming that 3.38.1 has already been versioned or published.

## Acceptance Criteria

- [x] `WHATSNEW.md` begins with a dated `V3.38.1` section above `V3.38.0`.
- [x] `CHANGELOG.md` begins with a `V3.38.1` section above `V3.38.0`.
- [x] Both release documents state that hash routing and normal browser navigation are the default again, and that SPA `/path` interception requires `app.use_prettyLink()` before AppRun initializes.
- [x] The release notes mention the restored first-render removal of stale DOM classes when the new vnode has null or undefined props.
- [x] The release notes mention the fixed Play TypeScript runtime and the repaired routing/examples behavior without overstating implementation detail.
- [x] The release notes distinguish compatibility guidance from feature marketing and do not describe the 3.38.0 auto-interception behavior as still current.
- [x] All release-note claims are traceable to commits after the 3.38.0 release commit.

## Constraints

- Keep `WHATSNEW.md` explanatory and user-oriented; keep `CHANGELOG.md` concise and scannable.
- Use the repository's existing version-heading and chronological ordering conventions.
- Preserve historical 3.38.0 and earlier entries except for moving the unpublished restored-routing bullet from 3.38.0 into its correct 3.38.1 section.
- Do not edit source code, tests, generated bundles, dependency files, or package metadata.
- Do not claim that npm publication, tagging, or a package-version bump has happened.

## Non-Goals

- Bumping `package.json`, lockfiles, or runtime version constants to 3.38.1.
- Publishing to npm, creating a git tag, or drafting a GitHub release.
- Rewriting historical release entries beyond correcting the misplaced 3.38.1 routing bullet, or documenting unrelated repository work.
- Adding a separate migration guide when the required compatibility guidance fits directly in the release notes.
