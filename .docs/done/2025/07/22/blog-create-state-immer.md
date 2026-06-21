# Simplify AppRun State Updates with Immer and createState

*Published: July 20, 2025*


AppRun promotes a clean and declarative architecture: all state changes happen through pure functions that return new state objects. This immutable approach ensures predictable state management and enables features like time-travel debugging.

But as your app grows and state gets deeper or more complex, writing verbose immutable update functions becomes cumbersome and error-prone:

```ts
// Traditional AppRun update - verbose and repetitive
const update = {
  '+1': (state, idx) => [
    ...state.slice(0, idx),
    state[idx] + 1,
    ...state.slice(idx + 1)
  ],
  
  'toggle': (model, idx) => ({...model,
    todos: [
      ...model.todos.slice(0, idx),
      {...model.todos[idx], done: !model.todos[idx].done},
      ...model.todos.slice(idx + 1)
    ]
  })
};
```

The spreading syntax gets unwieldy, especially with nested objects and arrays. You spend more time wrestling with immutable updates than focusing on your application logic.

## 😎 Enter Immer

[Immer](https://immerjs.github.io/immer/) is a tiny library that lets you write "mutative" logic while keeping your state updates **fully immutable**. It works by wrapping your state in a `draft` object that you can change freely, and then produces a new immutable state for you behind the scenes.

No more spreading, no more cloning, no more mutability concerns. Just write what you mean!


## ✨ The `createState` Helper

To make this experience feel native in AppRun, we now have a built-in helper: `createState`. It simplifies your update object like this:

```ts
import { createState } from 'apprun/createState';

const update = {
  '+1': createState((state, idx) => {
    state[idx]++;
  }),
};
```

🔥 No spreading, no cloning, no mutability concerns. Just write what you mean.


### Real-World Example: Counter App

Let's look at a practical comparison using a counter list component. Here's the traditional verbose approach:

```ts
// Before: Traditional AppRun updates
const update = {
  'add-counter': (state) => [...state, 0],
  
  'remove-counter': (state, idx) => [
    ...state.slice(0, idx),
    ...state.slice(idx + 1)
  ],
  
  '+1': (state, idx) => [
    ...state.slice(0, idx),
    state[idx] + 1,
    ...state.slice(idx + 1)
  ],
  
  '-1': (state, idx) => [
    ...state.slice(0, idx),
    state[idx] - 1,
    ...state.slice(idx + 1)
  ]
};
```

Now with `createState`, the same logic becomes crystal clear:

```ts
// After: Clean and intuitive with createState
const update = {
  'add-counter': createState((state) => {
    state.push(0);
  }),

  'remove-counter': createState((state, idx) => {
    state.splice(idx, 1);
  }),

  '+1': createState((state, idx) => {
    state[idx]++;
  }),

  '-1': createState((state, idx) => {
    state[idx]--;
  })
};
```

### Complex State Example: Todo App

The benefits become even more apparent with nested state structures. Consider a todo application:

```ts
// Before: Verbose nested updates
const update = {
  'add': (model, value) => ({
    ...model,
    todos: [...model.todos, { value, done: false }]
  }),
  
  'toggle': (model, idx) => ({
    ...model,
    todos: [
      ...model.todos.slice(0, idx),
      { ...model.todos[idx], done: !model.todos[idx].done },
      ...model.todos.slice(idx + 1)
    ]
  }),
  
  'filter': (model, filter) => ({ ...model, filter }),
  
  'clear': (model) => ({ ...model, todos: [] })
};
```

With `createState`, the intent is immediately clear:

```ts
// After: Readable and maintainable
const update = {
  'add': createState((model, value) => {
    model.todos.push({ value, done: false });
  }),
  
  'toggle': createState((model, idx) => {
    model.todos[idx].done = !model.todos[idx].done;
  }),
  
  'filter': createState((model, filter) => {
    model.filter = filter;
  }),
  
  'clear': createState((model) => {
    model.todos.length = 0;
  })
};
```

🔥 **Key Benefits:**
- **Intuitive**: Write code that matches your mental model
- **Less error-prone**: No manual index calculations or spread operations
- **Maintainable**: Easier to read and modify
- **Fully immutable**: All the benefits of immutable updates without the syntax overhead


## 🧠 API Reference

```ts
function createState<T = any>(
  fn: (draft: Draft<T>, ...args: any[]) => void
): (state: T, ...args: any[]) => T
```

**Parameters:**
- `fn`: Your update function that receives a mutable draft
- `draft`: A mutable proxy of your current state (powered by Immer)
- `...args`: Any additional arguments passed from your event (e.g., `idx`, `key`, `value`)

**Returns:** A standard AppRun-compatible reducer function that produces new immutable state

### Usage Patterns

```ts
// Simple state updates
'increment': createState((count) => count + 1),

// Updates with parameters
'set-value': createState((state, key, value) => {
  state[key] = value;
}),

// Complex nested updates
'update-user': createState((state, userId, updates) => {
  const user = state.users.find(u => u.id === userId);
  Object.assign(user, updates);
})
```
#### Deep Dive: Complex Nested State Updates

The `update-user` example demonstrates one of `createState`'s most powerful features: **safe mutation of deeply nested objects**. Let's break down this scenario:

**State Structure:**
```ts
interface AppState {
  users: Array<{
    id: string;
    name: string;
    email: string;
    profile: {
      avatar: string;
      preferences: {
        theme: 'light' | 'dark';
        notifications: boolean;
      }
    }
  }>;
  // ...other state
}
```

**Without `createState` - Traditional Immutable Update:**
```ts
// Verbose and error-prone approach
'update-user': (state, userId, updates) => ({
  ...state,
  users: state.users.map(user => 
    user.id === userId 
      ? { ...user, ...updates }
      : user
  )
})

// For nested updates, it gets even worse:
'update-user-preferences': (state, userId, preferences) => ({
  ...state,
  users: state.users.map(user => 
    user.id === userId 
      ? {
          ...user,
          profile: {
            ...user.profile,
            preferences: {
              ...user.profile.preferences,
              ...preferences
            }
          }
        }
      : user
  )
})
```

**With `createState` - Clean and Intuitive:**
```ts
// Simple and readable
'update-user': createState((state, userId, updates) => {
  const user = state.users.find(u => u.id === userId);
  Object.assign(user, updates);
}),

// Nested updates are just as easy
'update-user-preferences': createState((state, userId, preferences) => {
  const user = state.users.find(u => u.id === userId);
  Object.assign(user.profile.preferences, preferences);
}),

// Or even more granular updates
'toggle-notifications': createState((state, userId) => {
  const user = state.users.find(u => u.id === userId);
  user.profile.preferences.notifications = !user.profile.preferences.notifications;
})
```

**Real-World Usage Examples:**

```ts
// Update user's basic info
app.run('update-user', 'user-123', { 
  name: 'John Doe', 
  email: 'john@example.com' 
});

// Update nested preferences
app.run('update-user-preferences', 'user-123', { 
  theme: 'dark', 
  notifications: false 
});

// Toggle a single preference
app.run('toggle-notifications', 'user-123');
```

**Why This Works Safely:**

1. **Immer's Magic**: Even though we're "mutating" the `user` object, Immer tracks all changes and produces a completely new immutable state tree
2. **No Reference Issues**: The original state remains untouched; only the draft is modified
3. **Structural Sharing**: Immer only creates new objects for the parts that actually changed, keeping performance optimal
4. **Type Safety**: With TypeScript, you get full intellisense and type checking on the draft object

**Common Patterns:**

```ts
// Conditional updates
'update-user-status': createState((state, userId, isActive) => {
  const user = state.users.find(u => u.id === userId);
  if (user) {
    user.isActive = isActive;
    user.lastUpdated = new Date().toISOString();
  }
}),

// Bulk operations
'update-multiple-users': createState((state, userUpdates) => {
  userUpdates.forEach(({ id, updates }) => {
    const user = state.users.find(u => u.id === id);
    if (user) {
      Object.assign(user, updates);
    }
  });
}),

// Array manipulations within objects
'add-user-tag': createState((state, userId, tag) => {
  const user = state.users.find(u => u.id === userId);
  if (user && !user.tags.includes(tag)) {
    user.tags.push(tag);
  }
})
```

This approach transforms complex state management from a careful exercise in spread syntax into intuitive, readable code that directly expresses your intent.


## 🛠 What About Async?

Immer doesn't support `await` inside the `produce()` block, so you can’t use `await` in your `createState` draft updater.

Instead, handle async first, then apply the state update like this:

```ts
update = {
  'add-counter': async (state) => {
    const n = await api_call();

    // Use createState immediately with the result
    return createState((draft) => {
      draft.push(n);
    })(state);
  }
};
```

This pattern keeps your logic clean and separates async effects from pure state updates.


## ✅ Summary

* `createState` lets you write **clean, readable, and immutable** updates using Immer.
* It fits right into AppRun’s event-based architecture.


Give it a try in your next AppRun app — you’ll never want to write another spread-heavy update function again.

Happy coding! 🚀


