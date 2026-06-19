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

### Browser Globals Are Smaller

Old behavior: loading the browser bundles wrote a broad set of globals, including `window.React`, `window.Component`, `window.on`, `window.customElement`, and `window.safeHTML`.

New behavior: the script-tag `apprun-html` build keeps the no-build authoring globals:

```html
<script src="https://unpkg.com/apprun/dist/apprun-html.js"></script>
<script>
  app.start(document.body, 0, state => html`<div>${state}</div>`);
</script>
```

The supported browser globals are `app`, `html`, `run`, and `svg`. Use module imports for everything else:

```ts
import app, { Component, customElement, trustedHTML } from 'apprun';
```

AppRun no longer aliases itself to `window.React` or installs the decorator and HTML helper APIs as globals. That avoids collisions while preserving the script-tag workflow most existing examples use.

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
