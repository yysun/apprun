# Testing

Use this reference when adding or reviewing AppRun tests.

## Test What Changed

- For pure update handlers, assert returned state.
- For async generators, iterate yields and assert each visible transition.
- For routing fixes, assert native browser behavior and AppRun-owned navigation.
- For lifecycle fixes, assert cleanup and stale async completion.
- For directive fixes, include DOM-level tests for the affected element type.

## Async Generator Tests

```ts
it('yields validation failure and stops', async () => {
  const state = { email: '', submitting: false, error: null };
  const gen = submit(state);

  const first = await gen.next();
  expect(first.value).toMatchObject({ error: 'Enter a valid email' });

  const second = await gen.next();
  expect(second.done).toBe(true);
});
```

For success paths, assert the loading yield before the final yield.

## AppRun Repo Commands

This repository currently uses Jest and the package scripts in `package.json`.

Useful commands:

```sh
npm test -- --runInBand
npm run build
git diff --check
```

Use a focused Jest file first when possible, then run the broader suite/build when behavior, generated output, or public API changed.

## Regression Targets From Prior Work

Keep these areas covered when touched:

- wildcard `once` pruning
- async state pending-promise identity
- router native click guards
- textarea `$bind` value behavior
- custom element queued attributes
- custom element render cancellation on disconnect

Do not claim closure on AppRun library behavior without a test that fails for the old behavior or directly exercises the changed contract.
