# Plan: AppRun 3.38.1 release documentation

## Goal

Make the public release documents accurately describe the fixes included after AppRun 3.38.0 and give path-routing users the migration instruction they need before 3.38.1 is versioned or published.

## Current Context

- `package.json` and `src/version.ts` still report `3.38.0`; this task prepares documentation only and must not imply that the release has already been cut.
- Commit `668e291` is the 3.38.0 release baseline. The four commits after it are `3536c45` (first-render class cleanup), `b48df38` (explicit pretty-link routing), `001263f` (pinned Play TypeScript runtime), and `f7f8f3b` (pretty-link example alignment, Play startup timing, and SVG example repair).
- `WHATSNEW.md` uses dated blockquote headings and longer user-oriented explanations. Its current top entry is `V3.38.0` dated July 26, 2025.
- `WHATSNEW.md` currently contains the restored-routing bullet under `V3.38.0`, but that fix was implemented by post-release commit `b48df38`; leaving it there would make the published 3.38.0 history false.
- `CHANGELOG.md` uses `## Vx.y.z` headings and concise bullets. Its current top entry is `V3.38.0`.
- The routing change intentionally restores pre-3.35 behavior: hash routing and ordinary browser navigation are default; applications that want SPA `/path` interception must call `app.use_prettyLink()` before `DOMContentLoaded`.
- Existing RPD done docs provide verified wording and evidence for the first-render and pretty-link fixes. The Play runtime requirement/plan records the pinned TypeScript browser bundle and successful browser verification.

## Decisions

- Add a new top-level 3.38.1 section to both public release documents and move the misplaced restored-routing bullet out of the historical 3.38.0 section. Preserve all other historical content.
- Lead with the navigation compatibility correction because it changes how applications using ordinary path links must configure AppRun.
- Include one compact migration snippet in `WHATSNEW.md`: `app.use_prettyLink();` before application startup. `CHANGELOG.md` will state the same contract without duplicating the full example.
- Describe the DOM fix in user-visible terms—stale server/loading classes no longer survive the first client render—while retaining the null/undefined-props boundary for precision.
- Group the Play runtime, startup timing, and example corrections into one coherent Play reliability item instead of presenting internal bundling details as separate features.
- Do not add a feature flag, compatibility layer, separate migration document, package bump, publication step, or generated artifact change.
- No E2E spec is needed: this is a documentation-only change over behavior already covered and verified by the completed implementation stories.

## Phased Tasks

### Phase 1 - Release scope and claim verification

- [x] Compare commits `3536c45`, `b48df38`, `001263f`, and `f7f8f3b` with the 3.38.0 baseline so every proposed release-note claim has a concrete implementation source.
- [x] Reconcile `.docs/done/2026/07/13/first-render-dom-attributes.md`, `.docs/done/2026/07/13/explicit-pretty-links.md`, and `.docs/plans/2026/07/13/plan-play-typescript-runtime.md` into a non-duplicative 3.38.1 change list.
- [x] Confirm `package.json` remains `3.38.0` and record that versioning, tagging, and publication are excluded from this documentation task.

### Phase 2 - User-oriented release notes

- [x] Add a dated `V3.38.1` section at the top of `WHATSNEW.md` with the navigation compatibility correction, first-render class cleanup, and Play reliability fixes.
- [x] Include an explicit `app.use_prettyLink()` migration example in `WHATSNEW.md` before describing SPA `/path` links as intercepted by AppRun.
- [x] Move the unpublished restored-routing bullet from `V3.38.0` into `V3.38.1`, keeping all other historical `WHATSNEW.md` content intact.

### Phase 3 - Concise changelog

- [x] Add a `V3.38.1` section at the top of `CHANGELOG.md` with concise bullets matching the verified public behavior in `WHATSNEW.md`.
- [x] State the restored routing default and opt-in requirement directly in `CHANGELOG.md` so the compatibility impact remains visible in abbreviated release views.
- [x] Confirm the changelog does not claim a package bump, npm publication, git tag, or unrelated fixes.

### Phase 4 - Documentation verification and completion

- [x] Run a focused text check over `WHATSNEW.md` and `CHANGELOG.md` for `V3.38.1`, `use_prettyLink`, first-render class behavior, and Play runtime/example wording.
- [x] Run `git diff --check` and review the documentation diff against every acceptance criterion and the four post-3.38.0 commits.
- [x] Confirm `package.json`, lockfiles, `src/version.ts`, source files, tests, and generated bundles remain unchanged.
- [x] Update the REQ and this plan only after the corresponding release-document edits and verification evidence exist.

## Validation

- `rg -n "V3\\.38\\.1|use_prettyLink|first render|TypeScript|Play" WHATSNEW.md CHANGELOG.md` must find the version heading and each required user-facing topic in the new sections.
- `git diff --check` must pass.
- `git diff --name-only` must contain only `WHATSNEW.md`, `CHANGELOG.md`, and the matching RPD documentation artifacts.
- Review the final wording against `git log --oneline 668e291..HEAD` and the completed story docs; every claim must map to one of the four release commits.
- No build, unit test, or E2E rerun is required because this task changes only Markdown release documentation and cites already-verified behavior.

## Rollback / Risk

- The main risk is release-note drift: describing 3.38.1 as already published or omitting the pretty-link opt-in would mislead users. Keep publication status and migration wording explicit.
- Overly terse wording could hide the compatibility consequence; overly detailed wording could expose internal implementation noise. Use `WHATSNEW.md` for the explanation and `CHANGELOG.md` for the compact contract.
- Rollback is limited to removing the new 3.38.1 sections and matching RPD docs; no runtime or package state changes are involved.

## Execution Evidence

- The focused `rg` check found the new 3.38.1 headings, `app.use_prettyLink()` migration guidance, first-render class fix, pinned TypeScript Play runtime, and repaired examples in both release documents.
- `git diff --check` passed.
- `git log --oneline 668e291..HEAD` contains exactly the four documented fix commits: `3536c45`, `b48df38`, `001263f`, and `f7f8f3b`.
- Scope inspection found only `WHATSNEW.md`, `CHANGELOG.md`, and the matching RPD requirement/plan documents changed; `package.json`, `package-lock.json`, `src/version.ts`, source, tests, and generated bundles remain untouched.
- CR passed with no blocking findings. No build, unit test, or E2E rerun was needed for this Markdown-only change.
