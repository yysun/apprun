# Component Architecture

Use this reference when choosing or reviewing AppRun component structure.

## Component Choice

- Use a function component for display-only UI derived from props.
- Use a class component when the component owns state or event handlers.
- Use `mounted(props)` for JSX-embedded class components that initialize from props.
- Use async `state` for top-level routed components that load route data.
- Use custom elements only when the host page needs a web component boundary.

## Class Component Shape

Keep component files easy to test:

```ts
import { app, Component } from 'apprun';

export interface Props {
  id: string;
}

export interface State {
  id: string;
  value: string;
  saving: boolean;
  error: string | null;
}

export const getStateFromProps = (props: Props): State => ({
  id: props.id,
  value: '',
  saving: false,
  error: null,
});

export const save = async function* (state: State): AsyncGenerator<State> {
  if (!state.value.trim()) {
    yield { ...state, error: 'Value is required' };
    return;
  }

  yield { ...state, saving: true, error: null };

  try {
    await api.save(state.id, state.value);
    yield { ...state, saving: false };
    app.run('value-saved', state.id);
  } catch (error) {
    yield {
      ...state,
      saving: false,
      error: error instanceof Error ? error.message : 'Save failed',
    };
  }
};

export default class Editor extends Component<State> {
  declare props: Readonly<Props>;

  mounted = (props: Props): State => getStateFromProps(props);

  view = (state: State) => (
    <form>
      {state.error && <p className="error">{state.error}</p>}
      <input $bind="value" />
      <button $onclick={[save]} disabled={state.saving}>Save</button>
    </form>
  );
}
```

Use this shape when it fits:

- imports
- props/state types
- pure helpers
- exported actions for tests
- component class

## View Rules

- Put loading, empty, error, and permission branches before the main view.
- Keep branch state explicit. A nullable field is not enough if several states can overlap.
- Keep DOM-only event handlers small and local.
- Avoid building app behavior into JSX expressions when an update handler would be clearer.

## Lifecycle Cleanup

Components that allocate resources must release them:

- timers
- animation frames
- observers
- subscriptions
- global event listeners
- pending async callbacks that can complete after unmount

Prefer a named cleanup method when more than one resource is involved. Tests should prove cleanup when the bug is lifecycle-related.

## Custom Elements

For AppRun custom element work:

- Queue attributes set before the component is connected.
- Apply queued attributes after connection.
- Cancel scheduled renders on disconnect.
- Avoid rendering after disconnect.
- Keep host attributes and component state synchronization one-way unless a two-way contract is explicit.
