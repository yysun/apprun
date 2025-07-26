# Typed props (and children) in AppRun — React-style ergonomics, zero runtime cost

You can give AppRun class components **strongly typed props and children**—just like React—without changing how your app runs. All you do is **declare a `props` field** on the class. It’s type-only, so nothing is emitted to JavaScript. Children are received separately in the `mounted` lifecycle function.

---

## Quick start

```ts
import { Component } from 'apprun';

type WorldEditProps = {
  worldId: string;        // required
  editable?: boolean;     // optional
};

export default class WorldEdit extends Component<unknown, unknown> {
  // type-only: no JS emitted
  declare props: Readonly<WorldEditProps>;

  // ...
}
```

```tsx
// ✅ OK
<WorldEdit worldId="abc" editable />

// ❌ Type error: 'worldId' is required
<WorldEdit />
```

`declare` makes the field compile-time only — **no runtime property is created**.

---

## Mapping props to state in `mounted`

A common pattern is to **initialize component state from props**. Use the `mounted` lifecycle function, which runs **after** the component instance is mounted and may **return a new state**. ([apprun.js.org][3])

Signature (simplified):

```
mounted(props, children, state) => state | void
```

* Return a state value to set the initial state.
* If you return `void`, the existing state is kept.
* Note: `mounted` is **called for child components created via JSX**, not for a root created directly with `new Component()`. ([apprun.js.org][3])

### Example: merge props into state

```ts
type WorldEditState = {
  worldId: string;
  canEdit: boolean;
};

type WorldEditProps = {
  worldId: string;
  editable?: boolean;
};

export default class WorldEdit extends Component<State, unknown> {
  declare props: Readonly<Props>;

  state: State = { worldId: '', canEdit: false };

  view = (s: State) => <div>{s.worldId} — {s.canEdit ? 'edit' : 'view'}</div>;

  mounted = (props: WorldEditProps, _children: any[], state: State): State => {
    // derive initial state from props (one shot)
    return {
      ...state,
      worldId: props.worldId,
      canEdit: props.editable ?? false,
    };
  };
}
```

The docs explicitly encourage using `mounted` to “set the initialize state,” and show merging props into state in a child component. ([apprun.js.org][3])

---

### Default values

Keep props optional and default them in code:

```ts
const step = this.props.step ?? 1;
```
---


## Typing **children** (passed to `mounted`)

AppRun passes children as the **second parameter** to `mounted(props, children, state)`.
To type children, define a `Children` type and use it in the `mounted` signature. If you want to render children later in `view`, **store them in state** (or on a field) inside `mounted`.

### Patterns

#### 1) Text-only children

```ts
type TitleChildren = string;

class Title extends Component<{ text?: never }, unknown> {
  declare props: Readonly<{ text?: never }>;
  private _children: TitleChildren = '';

  view = () => <h1>{this._children}</h1>;

  mounted = (_props: {}, children: TitleChildren[], _state: {}): {} => {
    // AppRun supplies children as an array; enforce the shape you want
    this._children = children.join(''); // require plain text
    return {};
  };
}

// ✅
<Title>Hello</Title>

// ❌ error if non-text provided (based on your typing/validation)
<Title><span>Hi</span></Title>
```

#### 2) Single element child

```ts
type OneChild = Element;

class Slot extends Component<{}, unknown> {
  declare props: Readonly<{}>;
  private child?: OneChild;

  view = () => <section>{this.child}</section>;

  mounted = (_: {}, children: OneChild[], state: {}): {} => {
    if (children.length !== 1) {
      throw new Error('Slot expects exactly one child');
    }
    this.child = children[0];
    return state;
  };
}
```

#### 3) Multiple children (elements or text)

```ts
type StackChild = Element | string;

class Stack extends Component<{}, unknown> {
  declare props: Readonly<{}>;
  private children: StackChild[] = [];

  view = () => <div>{this.children}</div>;

  mounted = (_: {}, children: StackChild[], state: {}): {} => {
    this.children = children;
    return state;
  };
}
```

#### 4) Forbid children

If you want to disallow any children, just validate in `mounted`:

```ts
class Button extends Component<{ label: string }, unknown> {
  declare props: Readonly<{ label: string }>;

  view = () => <button>{this.props.label}</button>;

  mounted = (_: { label: string }, children: unknown[]): void => {
    if (children.length) throw new Error('<Button> does not accept children');
  };
}
```

---

## Why this is safe and fast

* **Zero runtime cost.** `declare props` is erased during emit; it’s purely for type-checking. ([typescriptlang.org][1], [Stack Overflow][2])
* **Lifecycle built for this.** `mounted(props, children, state)` lets you compute and return the initial state, and `rendered` is available for post-render effects. ([apprun.js.org][3])

---

## Summary

1. Declare `props` with your prop type: `declare props: Readonly<MyProps>;`.
2. Type children via the **`children` parameter** of `mounted`.
3. If you need to use children in `view`, capture them (or a processed form) in state or a field inside `mounted`.
4. Return a new state from `mounted` to seed initial state from props/children.

You now get **React-style typed props and children** in AppRun, with the same lean runtime. If you share one of your components, I can convert it to this pattern end-to-end.
