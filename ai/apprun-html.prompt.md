---
mode: agent
---

# AppRun Component Creation Rules

When creating AppRun components, follow these guidelines for consistent, maintainable code.

## Core Component Architecture
- **HTML templates**: Always use `html` tagged literals for UI rendering
- **State management**: Handle state through event handlers that return new state objects
- **Event handling**: Use `event-name` syntax in templates with handlers `(state, param) => newState`
- **Local events**: Use `run()` for component-local events (no registration needed)
- **Immutable updates**: Always return new state objects, never mutate existing state

## Component Creation Patterns

### 1. Functional Components (Pure UI Components)
**When to use**: For reusable UI pieces that don't manage their own state.

```js
// Create pure function components that take props and return HTML
export const AgentModal = (agent, onClose) => {
  return html`
    <div class="modal-overlay" @click=${run(onClose, false)}>
      <div class="modal-content" @click=${(e) => e.stopPropagation()}>
        <!-- Use conditional rendering for dynamic content -->
        ${agent.status ? html`<h2>${agent.name}</h2>` : html`
          <input value="${agent.name || ''}" @input=${(e) => agent.name = e.target.value}>
        `}
      </div>
    </div>
  `;
};
```

**Rules for functional components**:
- Export as pure functions
- Accept props as parameters
- Return HTML template literals
- Handle events through callback props
- No internal state management

### 2. Stateful Page Components (Full Components)
**When to use**: For main application views that manage state and handle complex interactions.

**Step 1: Create async state initialization**
```js
// Always use async state function for API calls and data loading
const state = async () => {
  const data = await api.getData();
  return { 
    ...initialState, 
    data,
    loading: false 
  };
};
```

**Step 2: Define event handlers as separate functions**
```js
// Create specific handlers for each user interaction
const selectWorld = async (state, worldName) => {
  if (worldName === state.worldName) return state;
  const agents = await api.getAgents(worldName);
  return ({ ...state, worldName, agents });
};

const openModal = (state, item = null) => {
  return ({
    ...state,
    editingItem: item || { name: 'New Item' },
    showModal: true
  });
};
```

**Step 3: Create view function with proper rendering patterns**
```js
// View function should be pure - only render, never mutate
const view = (state) => {
  return html`
    <div class="container">
      ${state.items.map(item => html`
        <div class="item" @click=${run(openModal, item)}>
          ${item.name}
        </div>
      `)}
      ${state.showModal ? ModalComponent(state.editingItem, closeModal) : ''}
    </div>
  `;
};
```

**Step 4: Define minimal update object for routing**
```js
// Keep update object minimal - most events handled by run()
const update = {
  '/,#': state => state,
  // Only add global events or routing here
};
```

**Step 5: Export Component instance**
```js
// Create and export component instance without class syntax
// enable global events with {global_event: true}
export default new Component(state, view, update, {global_event: true});

// Mount to DOM element
component.start('#main'); // For visible components
component.mount('#modal'); // For modal/hidden components
```

## Event Handling Best Practices

### Using run() for Local Events
**✅ Correct patterns**:
```js
// Simple event with parameter
@click=${run(selectWorld, world.name)}

// Event with callback function  
@click=${run(closeModal, false)}

// Global event
@input=${run('updateModalAgentName')}
```

**❌ Common mistakes to avoid**:
```js
// DON'T wrap run() in arrow function - prevents re-rendering
@click=${() => run(selectWorld, world.name)}

// DON'T manually pass event in arrow function
@click=${(e) => run(updateName, e)}
```

### Event Handler Function Rules
```js
// Event handlers automatically receive event as last parameter
const updateModalAgentName = (state, eventParam) => {
  const name = eventParam.target.value;
  return ({...state, agentName: name });
};

// Handle event.stopPropagation() in handler when needed
const openAgentModal = (state, agent, e) => {
  e.stopPropagation();
  return ({...state, editingAgent: agent, showModal: true });
};
```


## Template Rendering Guidelines

### Conditional Rendering Patterns
```js
// Simple boolean conditions
${state.loading ? html`<div>Loading...</div>` : ''}

// Complex conditional with nested HTML blocks
${agent.status ? html`
  <h2>${agent.name}</h2>
  <p>Status: Active</p>
` : html`
  <input value="${agent.name || ''}" @input=${run(updateName)}>
  <button @click=${run(saveAgent)}>Save</button>
`}
```

### List Rendering with map()
```js
// Basic list rendering
${state.items.map(item => html`
  <div class="${item.active ? 'active' : ''}">${item.name}</div>
`)}

// Complex list items with events
${state.agents.map(agent => html`
  <div class="agent-card" @click=${run(selectAgent, agent.id)}>
    <h3>${agent.name}</h3>
    <button @click=${run(editAgent, agent)} 
            @click=${(e) => e.stopPropagation()}>
      Edit
    </button>
  </div>
`)}
```

### Component Composition
```js
// Pass data and callbacks to child components
${state.showModal ? AgentModal(state.editingAgent, closeModal) : ''}

// Conditional component rendering with fallbacks
${state.currentView === 'list' 
  ? AgentList(state.agents, selectAgent)
  : AgentDetail(state.selectedAgent, goBack)
}
```

## State Management Rules

### Immutable State Updates
```js
// ✅ Always spread existing state for updates
return ({ ...state, newProperty: value });

// ✅ Update nested objects immutably
return ({ 
  ...state, 
  user: { ...state.user, name: newName },
  items: [...state.items, newItem]
});

// ❌ Never mutate state directly
state.newProperty = value; // Wrong!
state.items.push(newItem); // Wrong!
```

### Async State Updates
```js
// Standard async handler
const handler = async (state, param) => {
  try {
    const data = await api.call(param);
    return ({ ...state, data, loading: false });
  } catch (error) {
    return ({ ...state, error: error.message, loading: false });
  }
};

// Generator for progressive updates
const handler = async function* (state, param) {
  yield ({ ...state, loading: true });
  try {
    const data = await api.call(param);
    yield ({ ...state, data, loading: false });
  } catch (error) {
    yield ({ ...state, error: error.message, loading: false });
  }
};
```

### Error Handling in Components
```js
// Always handle errors in async operations
const saveData = async (state, data) => {
  try {
    await api.saveData(data);
    return ({ ...state, showModal: false, saved: true });
  } catch (error) {
    return ({ ...state, error: `Save failed: ${error.message}` });
  }
};
```

## Component Creation Checklist

When creating any AppRun component, ensure you follow these rules:

### Essential Requirements
- ✅ **Event handlers must return new state** - No return = no re-render
- ✅ **View functions are pure** - Only render, never mutate state  
- ✅ **Use `run()` for local events** - No registration needed in update object
- ✅ **Use `app.run()` for global events** - Cross-component communication
- ✅ **Immutable state updates** - Always spread existing state `{...state, newProp}`
- ✅ **HTML template literals** - Use `html` tagged templates for all UI
- ✅ **Conditional rendering** - Use ternary operators and template conditionals

### Component Structure Guidelines
- ✅ **Functional components**: Export pure functions that take props and return HTML
- ✅ **Stateful components**: Use async state, separate handlers, Component instance
- ✅ **Error boundaries**: Always handle async errors in try/catch blocks
- ✅ **Component composition**: Pass data and callbacks to child components
- ✅ **Event delegation**: Use event.stopPropagation() when needed in handlers

### File Organization
- ✅ **One component per file** - Keep components focused and reusable
- ✅ **Named exports for functions** - `export const ComponentName = (...) => html`
- ✅ **Default export for pages** - `export default new Component(...)`
- ✅ **Import dependencies** - Use static imports, omit `.js`/`.ts` extensions

### Performance Considerations  
- ✅ **Minimal update object** - Only include routing and global events
- ✅ **Efficient rendering** - Use conditional rendering to avoid unnecessary DOM updates
- ✅ **State normalization** - Keep state flat when possible for easier updates
- ✅ **Event handler optimization** - Define handlers outside render when possible

