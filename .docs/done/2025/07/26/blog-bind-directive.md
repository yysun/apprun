# Effortless Two-Way Data Binding in Apprun with `$bind`

Managing form state in web applications can be tedious, especially when dealing with deeply nested objects or arrays. Apprun’s `$bind` directive makes two-way data binding simple, powerful, and type-safe—so you can focus on building features, not boilerplate.

## What is `$bind`?

The `$bind` directive synchronizes form elements with your component’s state. When a user interacts with an input, select, or textarea, `$bind` automatically updates the corresponding state property. When the state changes, the UI updates instantly.

## Key Features

- **Works with all form elements:** `input`, `select`, `textarea`, and more.
- **Supports all input types:** text, checkbox, radio, number, range, etc.
- **Handles nested state:** Bind to `user.profile.name`, `items[0].title`, or even `users[0].settings.theme`.
- **Automatic type conversion:** Numbers are stored as numbers, checkboxes as booleans.
- **Safe and extensible:** Handles missing paths and creates intermediate objects/arrays as needed.

## Usage Examples

### Simple Binding

```tsx
<input $bind="username" />
<select $bind="selectedCountry">...</select>
```

### Nested Object Binding

```tsx
<input $bind="user.profile.name" />
<input $bind="settings.theme" />
```

### Array Element Binding

```tsx
<input $bind="items[0]" />
<input $bind="todos[1].title" />
```

### Mixed Nested Binding

```tsx
<input $bind="users[0].profile.settings.notifications.email" />
<select $bind="config.display.mode">...</select>
```

## How Does It Work?

The `$bind` directive parses the binding path (e.g., `user.profile.name` or `items[0]`), safely traverses your state object, and updates the value. It supports both dot and bracket notation, so you can bind to any property, no matter how deeply nested.

When a user changes the input, `$bind` updates the state. When the state changes (via `setState`), the input reflects the new value—automatically.

## Why Use `$bind`?

- **Less code:** No need to write repetitive event handlers.
- **Fewer bugs:** State and UI stay in sync.
- **Scalable:** Works for simple and complex forms alike.

## Try It Out!

Replace your manual event handlers with `$bind` and see how much simpler your code becomes. For more advanced usage, check out the [Apprun documentation](https://apprun.js.org/).

---

With `$bind`, Apprun brings you the power and simplicity of modern two-way data binding—no fuss, no boilerplate, just productivity.
