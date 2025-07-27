# 🛠️ Building a SPA Using AppRun: Step-by-Step + Design Thinking

---

## 1. 📁 Set Up Project Structure

### ✅ Step:

* Initialize a project using Vite, Parcel, or Webpack (Vite preferred for modern ESM + fast dev)
* Install dependencies:

  ```bash
  npm install apprun
  ```

### 💡 Thinking:

* AppRun is minimal and doesn't require React-like runtime overhead.
* Vite gives fast refresh and native TypeScript/JSX support.
* Project structure encourages modularization:

  ```
  src/
    main.tsx
    components/
    pages/
    api/
    styles/
  ```

---

## 2. 🧠 Define App Layout and Routing

### ✅ Step:

* Create a root `Layout` component:

  ```tsx
  export default () => <div id="pages"></div>;
  ```
* Mount it in `main.tsx`:

  ```tsx
  app.render('#root', <Layout />);
  app.addComponents('#pages', {
    '/': HomePage,
    '/about': AboutPage,
    '/dashboard': DashboardPage,
  });
  ```

### 💡 Thinking:

* AppRun’s `app.addComponents()` uses declarative route-to-component mapping.
* Avoid global layout logic inside each page—separation of layout and logic helps reusability.

---

## 3. 🧱 Choose the Right Component Patterns

### ✅ Step:

* Use **functional components** for stateless/pure UI (e.g., display panels).
* Use **class components** for stateful, self-contained features (e.g., modals, forms).
* Use **`mounted(props)` lifecycle** to initialize state from props.

### 💡 Thinking:

* Avoid mixing patterns—follow:

  * 📦 *Stateless display* → `function Component()`
  * 🧠 *Stateful logic with events, lifecycle, props → state* → `class Component`
* This keeps components predictable and testable.

---

## 4. 🔁 Implement State-View-Update Pattern

### ✅ Step:

Each class component should implement:

```tsx
export default class ExampleComponent extends Component<State> {
  state = { loading: false, data: [], error: null };

  view = (state: State) => {
    if (state.loading) return <p>Loading...</p>;
    if (state.error) return <p>{state.error}</p>;
    return <ul>{state.data.map(d => <li>{d}</li>)}</ul>;
  };

  update = {
    'load-data': async function* (state) {
      yield { ...state, loading: true };
      try {
        const data = await fetchData();
        yield { ...state, loading: false, data };
      } catch (e) {
        yield { ...state, loading: false, error: e.message };
      }
    }
  };
}
```

### 💡 Thinking:

* State → View → Update loop makes mental model simple.
* Async generator functions in `update` give progressive loading/error flows.
* Always use immutable updates (`...state`).

---

## 5. 🎛️ Bind Form Fields and Handle Events

### ✅ Step:

* Use `$bind` for form inputs:

  ```tsx
  <input $bind="formData.name" />
  ```
* Use `$onclick`, `$oninput`, and tuple events:

  ```tsx
  <button $onclick={[saveItem]} />
  <select $onchange={['change-option', 'fieldName']} />
  ```

### 💡 Thinking:

* `$bind` eliminates manual `onInput` handlers → less boilerplate.
* `$onclick={[fn]}` is preferred over `$onclick={() => fn()}` for performance and debugging.
* Tuple actions pass parameters without closure overhead.

---

## 6. 🧩 Design Modal Components with Parent Coordination

### ✅ Step:

* Use class components for modals:

  ```tsx
  <MyModal parentComponent={this} mode="edit" />
  ```
* Inside modal, send events to parent:

  ```ts
  state.parentComponent.run('item-saved');
  ```

### 💡 Thinking:

* Use `mounted(props)` to init modal state.
* Emit global events for parent-child coordination.
* Auto-close modals after success using `setTimeout`.

---

## 7. ⚙️ Centralize Complex Logic with Extracted Handlers

### ✅ Step:

* Extract `update` logic to separate modules:

  ```ts
  export const dashboardHandlers = {
    'load-users': async function* (state) { ... },
    'apply-filter': (state, filter) => ({ ...state, filter })
  };
  ```

### 💡 Thinking:

* Keeps page components clean and readable.
* Enables easy testing and reuse of update logic.
* Improves team collaboration by decoupling UI and logic.

---

## 8. 🌐 Handle API and Error Flow Properly

### ✅ Step:

* Centralize API calls in `api/` folder.
* Always wrap API logic in `try/catch` inside update functions.
* Show loading and error states in UI.

### 💡 Thinking:

* Error-first UI is a critical SPA feature.
* Try/catch inside `async function*` ensures no unhandled exceptions.
* Global `loading`, `error`, and `successMessage` fields in state are a best practice.

---

## 9. 🎨 Apply Styling and Theming

### ✅ Step:

* Use any CSS framework (Tailwind, Bootstrap, doodle.css).
* Organize styles in `/styles`.
* Add responsive classes directly in JSX.

### 💡 Thinking:

* CSS class composition in JSX matches AppRun’s declarative rendering.
* Avoid inline styles where possible for theming flexibility.
* Match modals, inputs, layout to consistent design system.

---

## 10. 🧪 Test and Reload

### ✅ Step:

* Use browser reload (`location.reload()`) for simple refresh after mutations.
* Add basic dev/test harness:

  ```ts
  app.run('load-data');
  ```

### 💡 Thinking:

* In small apps, `location.reload()` is a simple and safe way to sync app state after mutation.
* If needed, replace later with fine-grained re-fetches.

---

## ✅ Recap: Best Practices

| Area             | Best Practice                                               |
| ---------------- | ----------------------------------------------------------- |
| Component Types  | Functional for UI, Class for stateful/modals                |
| State Management | Immutable, typed, with `loading`, `error`, `successMessage` |
| Event Binding    | Use `$bind`, tuple `$onclick`, and direct function refs     |
| Routing          | AppRun router via `app.addComponents()`                     |
| Parent-Child     | Use `parentComponent.run()` for modal coordination          |
| Styling          | Modular CSS or utility frameworks                           |
| Async Updates    | Use `async function*` for progressive state updates         |
| File Structure   | `/pages`, `/components`, `/api`, `/types`, `/styles`        |


