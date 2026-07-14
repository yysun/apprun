# Routing And Navigation

Use this reference when work touches AppRun routing, links, route params, or navigation guards.

## Routing Mode

AppRun 6.0 keeps hash routing and native browser links by default, matching 3.38.1. No call or `app.use_prettyLink(false)` keeps that mode. Call `app.use_prettyLink()` or `app.use_prettyLink(true)` to enable pretty-link path routing.

Select the mode once in the application startup entry point before `DOMContentLoaded`. The last call before that event wins; calls after it do not rewire listeners. Do not infer mode from `#` route registration—hash handlers no longer switch the browser-routing mode.

Generic components and examples do not need this call. Add it where the application owns routing or where routing behavior is the point of the example.

## Route Registration

Prefer clear central registration when an app has routed pages:

```ts
import app from 'apprun';
import Layout from './components/Layout';
import Home from './pages/Home';
import Details from './pages/Details';

app.use_prettyLink(true); // required when browser /path links use SPA navigation
app.render('#root', <Layout />);

app.addComponents('#pages', {
  '/': Home,
  '/details': Details,
});
```

Do not add an external router unless the user asks or the existing app already uses one.

## Anchors

Plain anchors are the default navigation surface:

```tsx
<a href={`/details/${encodeURIComponent(id)}`}>Open</a>
```

AppRun should not break native browser expectations. Preserve:

- command/control-click
- shift-click
- middle click
- right click
- `target="_blank"`
- downloads
- external URLs
- hash-only behavior when the app does not own it

When the browser should own ordinary same-origin links, select `false` at startup instead of fighting AppRun's path-link interceptor with another click handler.

If fixing router click handling in the AppRun library, add tests for native behavior.

## Programmatic Navigation

Programmatic navigation is a side effect:

```ts
'open-details': (_state, id: string): void => {
  window.location.href = `/details/${encodeURIComponent(id)}`;
}
```

Do not also return state unless the component must render an intermediate local change before navigation.

## Route Params

Decode and validate params near the route handler:

```ts
update = {
  '/details': async (state: State, rawId: string): Promise<State> => {
    const id = decodeURIComponent(rawId);
    const item = await api.getItem(id);
    return { ...state, id, item, loading: false };
  },
};
```

Avoid scattering `window.location.pathname.split(...)` through views. If existing code does it, localize the parsing before expanding behavior.

## Route-Level Async State

Use route-level async loading for pages where the route itself defines the data:

```ts
export default class DetailsPage extends Component<State> {
  state = async (): Promise<State> => {
    const item = await api.getItemFromCurrentRoute();
    return { item, loading: false, error: null };
  };
}
```

Guard stale completion if a route can change before the first load resolves.
