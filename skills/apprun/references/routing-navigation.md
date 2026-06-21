# Routing And Navigation

Use this reference when work touches AppRun routing, links, route params, or navigation guards.

## Route Registration

Prefer clear central registration when an app has routed pages:

```ts
import app from 'apprun';
import Layout from './components/Layout';
import Home from './pages/Home';
import Details from './pages/Details';

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
