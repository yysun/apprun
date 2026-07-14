# First-render DOM class reconciliation

## Problem

AppRun 6.0.0 can reuse a server-rendered or placeholder element without removing its class when the first VDOM node has null or undefined props. Loading classes can therefore leak into the rendered application and turn temporary loading UI into persistent application behavior. The correction exists on the 3.38.1 release line but is absent from `master` and `6.0.0-rc.0`.

## Requirement

On the first reconciliation of an existing same-tag DOM element, AppRun must restore the established class contract: a vnode with null or undefined props removes a stale DOM class, while explicit `class` or `className` props replace it. Other property families and later render cycles must retain their current behavior.

## Acceptance Criteria

- [x] A first same-tag VDOM render with null or undefined props removes a stale server-rendered class from the reused element.
- [x] A first VDOM render with explicit `class` or `className` replaces the server-rendered class.
- [x] Dataset handling, boolean attributes, styles, event handlers, and form properties retain their current behavior.
- [x] Subsequent VDOM updates still remove props omitted from later renders without accumulating DOM state.
- [x] A targeted regression test reproduces the loading-spinner failure mode.
- [x] The focused VDOM tests, complete unit suite, and production build pass.

## Constraints

- Restore the 3.38.1 correction on the 6.0.0 release line without broadening first-render cleanup semantics.
- Preserve focus, selection, scroll, and media-property skip logic.
- Keep the fix inside the shared property/attribute reconciliation boundary.
- Preserve unrelated server-rendered attributes that are not represented by the first vnode.

## Non-Goals

- Removing arbitrary server-rendered attributes.
- Introducing a hydration mode or reading existing DOM attributes into the VDOM property cache.
- Changing keyed-child reconciliation, routing, component lifecycle, or rendering-engine selection.
- Adding an application-specific spinner exception, feature flag, fallback, or compatibility mode.
