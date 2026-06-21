---
name: apprun
description: AppRun architecture guidance for building, reviewing, or fixing AppRun applications and the AppRun library itself. Use when work involves AppRun MVU components, state/update lifecycles, async generators, event directives, routing and navigation guards, custom elements, or AppRun test coverage. Focus on AppRun behavior and existing repo contracts, not generic build-tool, CSS-framework, or starter-app setup.
---

# AppRun

Use this skill to make AppRun-specific architecture decisions. Keep the work anchored in the existing codebase before inventing a pattern.

## First Pass

1. Inspect the local source, tests, and package scripts before changing behavior.
2. Identify whether the task is about an application using AppRun or the AppRun library itself.
3. Preserve existing project tooling unless the user explicitly asks to change it.
4. Prefer the smallest change that fixes the AppRun behavior and can be verified with focused tests.
5. Do not add Tailwind, Vite, routing libraries, state libraries, or starter scaffolds unless the user specifically asks for them.

## Core Architecture

- Treat AppRun code as MVU: model/state, view, update/event handlers.
- Keep update logic pure when possible; move side effects to explicit handlers.
- Return a new state when the UI must re-render.
- Return nothing only for side effects that should not re-render.
- Use async generators for multi-step flows that need intermediate renders, such as validation -> loading -> success/error.
- Keep view functions deterministic from state. Avoid hidden DOM reads unless integrating with browser APIs.
- Keep component state shapes specific to the component. Do not force generic `loading`, `error`, or `successMessage` fields into components that do not need them.

For detailed component patterns, read `references/component-architecture.md`.

## Lifecycle Rules

- Use `mounted(props, children, state)` for components embedded in JSX that need props-derived initial state. The hook also receives current children and state; return new state or nothing.
- Use async `state` only for top-level routed components that must load route-level data before rendering.
- Do not mix `mounted()` and async `state` in the same component unless the existing code proves a deliberate local contract.
- Preserve cleanup in the `unload(state)` hook for timers, subscriptions, pending promises, animation frames, custom elements, and global listeners.
- For async state, guard against stale promise completion when a newer state load has started.

## Events And State

- Prefer AppRun directives for AppRun updates: `$bind`, `$onclick`, `$oninput`, and sibling `$on...` directives.
- Use `$bind` for simple form binding, including textarea value binding.
- Use `$oninput` or explicit handlers when validation, parsing, debouncing, or normalization is needed.
- Do not wrap `$onclick` around an arrow function whose only job is `app.run(...)`; use AppRun event binding directly.
- Use standard DOM events only for DOM-only effects, such as stopping propagation or integrating with browser APIs.
- Use global events deliberately. They are a coupling point, not a default.
- Keep event names domain-specific and behavior-specific.

For handler shapes and async examples, read `references/events-and-state.md`.

## Routing And Navigation

- Use AppRun's existing routing behavior before adding any router abstraction.
- Preserve native browser behavior for links: modifier keys, new tabs, downloads, external URLs, and non-left clicks should not be hijacked.
- Register routed components in one clear place when the app structure allows it.
- Route params should be decoded and validated close to the route handler.
- Programmatic navigation is a side effect; make that explicit in update handlers.

For routing contracts and guard details, read `references/routing-navigation.md`.

## AppRun Library Work

When modifying this repository rather than an app:

- Inspect `src/` and the nearby tests before patching.
- Preserve public API shape in `apprun.d.ts`, `esm/`, `dist/`, and runtime exports unless the request is explicitly breaking.
- Add focused regression tests for behavior fixes.
- Use existing Jest patterns in this repo.
- Run the smallest relevant test first, then the broader suite or build when behavior or public API changed.

For repo-specific verification expectations, read `references/testing.md`.

## Reference Routing

- Read `references/component-architecture.md` for component class/function choices, lifecycle, custom elements, and cleanup.
- Read `references/events-and-state.md` for update handler patterns, directives, async generators, and state transitions.
- Read `references/routing-navigation.md` for route registration, anchors, params, navigation side effects, and click guards.
- Read `references/testing.md` for AppRun test strategy, async generator tests, routing tests, and this repo's commands.

## Non-Goals

- Do not teach generic TypeScript, Vite, webpack, Tailwind, CSS Modules, or fetch-client setup in this skill.
- Do not prescribe a directory layout unless the existing repository already has one or the user asks for a new app scaffold.
- Do not replace AppRun idioms with React, Redux, external routers, or framework conventions just because they are familiar.
- Do not turn examples from one app domain into reusable AppRun doctrine.
