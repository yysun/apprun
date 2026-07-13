# First-render DOM class reconciliation

## Problem

AppRun 3.38.0 can reuse a server-rendered or placeholder element without removing its class when the first VDOM node has null or undefined props. Loading classes can therefore leak into the rendered application and turn loading UI into persistent application behavior. AppRun 3.30.2 removed that stale class in the same render path.

## Requirement

On the first reconciliation of an existing same-tag DOM element, AppRun must restore the legacy class contract: a vnode with null or undefined props removes a stale DOM class, while explicit `class` or `className` props replace it. Other property families and later render cycles must retain their current behavior.

## Acceptance Criteria

- [x] A first same-tag VDOM render with null or undefined props removes a stale server-rendered class from the reused element.
- [x] A first VDOM render with explicit `class` or `className` replaces the server-rendered class.
- [x] Dataset handling, boolean attributes, styles, event handlers, and form properties retain their current behavior.
- [x] Subsequent VDOM updates still remove props omitted from later renders without accumulating DOM state.
- [x] A targeted regression test reproduces the loading-spinner failure mode, and an audit confirms whether the null-props merge change caused any other behavioral regression.
- [x] The focused VDOM tests, complete unit suite, and production build pass.

## Constraints

- Restore AppRun 3.30.2 class behavior without broadening first-render cleanup semantics.
- Preserve focus, selection, scroll, and media-property skip logic.
- Keep the fix inside the shared property/attribute reconciliation boundary.

## Non-Goals

- Removing arbitrary server-rendered attributes that AppRun 3.30.2 also preserved.
- Introducing a hydration mode or reading existing DOM attributes into the VDOM property cache.
- Changing keyed-child reconciliation, routing, component lifecycle, or rendering-engine selection.
- Adding an application-specific spinner exception or compatibility flag.
