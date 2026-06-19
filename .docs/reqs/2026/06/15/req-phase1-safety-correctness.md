# Phase 1 Safety And Correctness Requirement

## Problem

The Phase 1 items in `IMPROVEMENT_PLAN.md` are patch-level defects that can break normal AppRun applications: wildcard `once` handlers repeat, async component state can regress when promises resolve out of order, path-routing hijacks browser-native link behaviors, textarea binding writes user state as HTML, web components can lose early attribute updates or mount after disconnect, and component unload tracking can collide under fast mounts.

The project also has no CI workflow, so these regressions can return without a repository-level test/build gate.

## Requirement

AppRun must ship a focused safety/correctness patch that fixes the Phase 1 defects without changing the public API or introducing compatibility flags.

The patch must preserve existing event, component, directive, router, and custom-element behavior while making the following contracts true:

- `once` subscriptions are removed after the first matching dispatch, including wildcard event names.
- Promise-backed component state only renders the latest pending state resolution and never stores an unresolved promise as the settled internal state.
- Path-routing click interception respects standard browser link behavior and only intercepts plain same-origin primary-button self-target navigations.
- `$bind` on `<textarea>` writes through the `value` property, not `innerHTML`.
- Custom elements replay attribute/property changes that arrive before mount, pass state to `unload`, and do not mount after a disconnect.
- Component unload tracking IDs do not collide for components rendered in the same millisecond.
- CI runs install, test, and build checks on pull requests and pushes.

## Acceptance Criteria

- [ ] A wildcard `app.once('prefix/*', handler)` fires once across repeated matching `app.run('prefix/x')` calls and is removed from its wildcard subscriber list after the first match.
- [ ] Existing exact-name `once`, delayed event, wildcard event ordering, and event context tests continue to pass.
- [ ] When two promise states are scheduled and the older promise resolves last, the older result is ignored and the component still renders the newer result.
- [ ] After a promise state resolves, component internal `_state` matches the resolved state rather than the unresolved `Promise`.
- [ ] Path-router click interception ignores modified clicks, already-prevented events, non-primary buttons, external links, non-self targets, download links, and `rel="external"` links.
- [ ] Plain same-origin path links still call `preventDefault`, push history, and route the path.
- [ ] `$bind` on `<textarea>` renders state as text/value, preserving literal markup rather than parsing it as HTML.
- [ ] Custom elements queue pre-mount attribute changes, replay them after mount, pass current component state to `unload`, and cancel pending mount work after disconnect.
- [ ] Component unload tracking IDs are generated from a process-local counter rather than wall-clock time.
- [ ] A GitHub Actions workflow exists and runs `npm ci`, `npm test -- --runInBand`, and `npm run build`.
- [ ] Focused regression tests and the relevant build/test commands pass, or any unrelated/pre-existing failure is explicitly reported.

## Constraints

- Do not add feature flags, environment variables, fallback modes, or compatibility layers for these fixes.
- Do not remove documented public APIs.
- Keep changes scoped to the Phase 1 roadmap slice plus tests and CI wiring.
- Keep existing jsdom/Jest test style unless a missing capability requires a narrow helper.
- Preserve current package scripts; CI should call existing scripts rather than inventing parallel tooling.

## Non-Goals

- Do not implement router `:param` matching.
- Do not remove `_html:` raw HTML handling.
- Do not change global `window.React` behavior.
- Do not replace the key cache or child component cache.
- Do not introduce ESLint, strict TypeScript, exports maps, or package cleanup in this story.
