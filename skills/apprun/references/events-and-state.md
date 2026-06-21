# Events And State

Use this reference for AppRun directives, update handlers, and async state transitions.

## Directives

Use AppRun directives when the intent is to run an AppRun update:

```tsx
<input $bind="name" />
<textarea $bind="description" />
<button $onclick="save">Save</button>
<button $onclick={['delete-item', item.id]}>Delete</button>
<button $onclick={[save]}>Save</button>
<input $oninput="validate-email" />
```

Use standard DOM events for DOM-only work:

```tsx
<div onclick={(event) => event.stopPropagation()}>
  ...
</div>
```

Avoid:

```tsx
<button $onclick={() => app.run('save')}>Save</button>
```

That hides an AppRun event behind an unnecessary closure and makes the event contract harder to inspect.

## Handler Results

Return a state to render:

```ts
'rename': (state, name: string): State => ({
  ...state,
  name,
})
```

Return nothing for side effects:

```ts
'go-home': (): void => {
  window.location.href = '/';
}
```

Use async generators for multi-step state:

```ts
export const submit = async function* (state: State): AsyncGenerator<State> {
  if (!state.email.includes('@')) {
    yield { ...state, error: 'Enter a valid email' };
    return;
  }

  yield { ...state, submitting: true, error: null };

  try {
    const result = await api.submit(state.email);
    yield { ...state, submitting: false, result };
  } catch (error) {
    yield {
      ...state,
      submitting: false,
      error: error instanceof Error ? error.message : 'Submit failed',
    };
  }
};
```

## State Shape

State should describe actual UI behavior:

- Use `loading` or `saving` when an async operation is visible to the user.
- Use `error` when the component renders recoverable failure.
- Use `successMessage` only if the component renders a success state.
- Keep route params, selected IDs, form fields, and request status separate.
- Do not mutate nested state unless the existing codebase deliberately relies on mutation.

For nested immutable updates:

```ts
return {
  ...state,
  user: {
    ...state.user,
    profile: {
      ...state.user.profile,
      name,
    },
  },
};
```

## Typed Event Sets

Use typed event names when a component has enough handlers that string drift becomes likely:

```ts
export type EditorEvent =
  | 'save'
  | 'cancel'
  | 'rename'
  | 'delete-item';

export default class Editor extends Component<State, EditorEvent> {
  update = {
    save: submit,
    cancel: (state: State) => ({ ...state, editing: false }),
    rename: (state: State, name: string) => ({ ...state, name }),
    'delete-item': (state: State, id: string) => ({
      ...state,
      items: state.items.filter((item) => item.id !== id),
    }),
  };
}
```

Use a discriminated union only when payload typing needs more precision than event-name typing provides.

## Cross-Component Communication

- Prefer props for parent-to-child data.
- Prefer callbacks for child-to-parent notifications in local component trees.
- Use global events only when components are intentionally decoupled.
- Name global events as public contracts. Treat renames as cross-component changes.
