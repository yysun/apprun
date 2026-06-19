# Migration Guide

## 6.0 Breaking API Changes

### `_html:` String Prefix Removed

Old behavior:

```ts
const view = () => <div>{'_html:<b>trusted</b>'}</div>;
```

In 6.0, string children render as text. The example above displays `_html:<b>trusted</b>` literally.

New behavior:

```ts
import { trustedHTML } from 'apprun';

const view = () => <div>{trustedHTML('<b>trusted</b>')}</div>;
```

Only pass caller-owned trusted markup. AppRun does not sanitize HTML.

### `safeHTML()` Renamed To `trustedHTML()`

`safeHTML()` never sanitized input. It parsed HTML into elements. The preferred API is now `trustedHTML()` because the trust decision belongs to the caller.

```ts
import { trustedHTML } from 'apprun';

const nodes = trustedHTML('<p>trusted markup</p>');
```

`safeHTML()` remains as a deprecated alias for one minor migration window.

### Browser Globals Are Explicit

Old behavior: importing AppRun wrote globals such as `window.React`, `window.Component`, `window.on`, `window.customElement`, and `window.safeHTML`.

New behavior: imports do not mutate browser globals. Script-tag users can opt in:

```ts
import app from 'apprun';

app.use_globals();
```

`app.use_globals()` preserves the existing `window.React` value under `window._React`, then installs the legacy AppRun globals intentionally.

### `query()` Removed

`app.query()` and `component.query()` have been removed. Use `runAsync()`.

```ts
const results = await app.runAsync('event-name', payload);
const componentResults = await component.runAsync('local-event', payload);
```

### Router `:param` And `*` Patterns

The router now supports the syntax previously documented in comments:

```ts
app.on('/users/:id', id => {
  // /users/123 -> id === '123'
});

app.on('/files/*', path => {
  // /files/a/b/c -> path === 'a/b/c'
});
```

Exact routes still win before patterns. If no exact or pattern route matches, AppRun keeps the existing hierarchical fallback behavior.
