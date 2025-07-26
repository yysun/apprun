# AppRun Component Creation Guide

## Core Architecture Patterns

AppRun follows the State-View-Update architecture with TypeScript support. Choose the appropriate component pattern based on your needs:

### **Stateful Class Components (Self-Contained)**
Use for components that manage their own state internally, handle side effects, and coordinate with parents via global events. Modern pattern using `mounted` lifecycle.

### **Container Class Components (Legacy)**
Use for components that manage state, handle side effects, and coordinate data flow using traditional state initialization.

### **Functional Components (Presentation/Dumb Components)**
Use for components that only render UI based on props with minimal logic.

## Component Patterns

### **Pattern 1: Stateful Class Component (Modern - Recommended)**

Use `mounted` lifecycle to receive props and convert to initial state. Functions defined at module level for better testing.

#### **Module-Level Functions (separate file)**
```typescript
// component-functions.ts
export interface ComponentState {
  mode: 'create' | 'edit' | 'delete';
  formData: FormType;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

export interface ComponentProps {
  mode?: string;
  initialData?: FormType;
}

export const initializeState = (props: ComponentProps): ComponentState => ({
  mode: props.mode || 'create',
  formData: props.initialData || getDefaultFormData(),
  loading: false,
  error: null,
  successMessage: null
});

export const saveData = async function* (state: ComponentState): AsyncGenerator<ComponentState> {
  yield { ...state, loading: true, error: null };
  try {
    await performSave(state.formData);
    yield { 
      ...state, 
      loading: false, 
      successMessage: 'Data saved successfully!' 
    };
    setTimeout(() => app.run('data-saved'), 2000);
  } catch (error) {
    yield { ...state, loading: false, error: error.message };
  }
};

export const closeModal = (): void => {
  app.run('close-modal');
};
```

#### **Component Structure**
```typescript
// component.tsx
import { initializeState, saveData, closeModal, type ComponentState, type ComponentProps } from './component-functions';

export default class MyComponent extends Component<ComponentState> {
  declare props: Readonly<ComponentProps>;
  mounted = (props: ComponentProps): ComponentState => initializeState(props);

  view = (state: ComponentState) => {
    // Guard clauses
    if (state.successMessage) {
      return (
        <div className="modal-backdrop" $onclick={[closeModal]}>
          <div className="success-message">
            <p>{state.successMessage}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="modal-backdrop" $onclick={[closeModal]}>
        <form>
          <input
            value={state.formData.name}
            $bind="formData.name"
            disabled={state.loading}
          />
          <button 
            $onclick={[saveData]} 
            disabled={state.loading}
          >
            {state.loading ? 'Saving...' : 'Save'}
          </button>
          <button $onclick={[closeModal]}>Cancel</button>
        </form>
      </div>
    );
  };
}
```

### **Pattern 2: Legacy Container Component**

Traditional pattern with state initialization function.

#### **Component Structure**
```typescript
export default class MyComponent extends Component<ComponentState> {
  state = async (): Promise<ComponentState> => {
    // Initial state with async data loading
    try {
      const data = await loadData();
      return {
        data,
        loading: false,
        error: null,
        selectedItem: null,
        isEditing: false
      };
    } catch (error) {
      return {
        data: [],
        loading: false,
        error: error.message,
        selectedItem: null,
        isEditing: false
      };
    }
  };

  view = (state: ComponentState) => {
    // Guard clauses for early returns
    if (state.loading) return <div>Loading...</div>;
    if (state.error) return <div>Error: {state.error}</div>;
    if (state.data.length === 0) return <div>No data</div>;
    
    // Main content
    return (
      <div>
        {/* Render main UI */}
        <PresentationComponent
          data={state.data}
          selectedItem={state.selectedItem}
          onSelect={(item) => this.run('select-item', item)}
        />
      </div>
    );
  };

  update = {
    'select-item': (state: ComponentState, item: DataType): ComponentState => ({
      ...state,
      selectedItem: item
    }),

    'async-action': async function* (state: ComponentState): AsyncGenerator<ComponentState> {
      try {
        yield { ...state, loading: true, error: null };
        const result = await performAsyncAction();
        yield { ...state, loading: false, data: result };
      } catch (error) {
        yield { ...state, loading: false, error: error.message };
      }
    },

    'side-effect-action': (state: ComponentState): void => {
      // No return value = no re-render
      window.location.href = '/new-page';
    }
  };
}
```

### **Pattern 3: Functional Presentation Component**

```typescript
interface ComponentProps {
  data: DataType[];
  selectedItem: DataType | null;
  loading?: boolean;
  error?: string | null;
  // Event handlers
  onSelect?: (item: DataType) => void;
  onDelete?: (id: string) => void;
}

export default function MyPresentationComponent(props: ComponentProps) {
  const {
    data,
    selectedItem,
    loading = false,
    error = null,
    onSelect,
    onDelete
  } = props;

  // Guard clauses
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (data.length === 0) return <div>No data</div>;

  return (
    <div>
      {data.map(item => (
        <div 
          key={item.id}
          $onclick={['select-item', item]}
          className={selectedItem?.id === item.id ? 'selected' : ''}
        >
          {item.name}
          <button $onclick={['delete-item', item.id]}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

## Event Handling Rules

### **✅ DO: Use $on Directives for State Updates**

```typescript
// String actions (handled in parent's update object)
$onclick="action-name"
$oninput="update-field"

// Tuple actions (pass data to handler)
$onclick={['action-name', data]}
$oninput={['update-field', 'fieldName']}
$onchange={['update-dropdown', 'provider']}

// Direct function references (modern pattern - recommended)
$onclick={[saveFunction]}
$onclick={[deleteFunction]}
$onclick={[closeModal]}
```

### **✅ DO: Use $bind for Two-Way Data Binding**

```typescript
// Automatic form field binding (modern pattern)
<input 
  value={state.formData.name}
  $bind="formData.name"
/>

<textarea 
  value={state.formData.description}
  $bind="formData.description"
/>

<select 
  value={state.formData.provider}
  $bind="formData.provider"
>
  <option value="openai">OpenAI</option>
  <option value="anthropic">Anthropic</option>
</select>
```

### **✅ DO: Use Regular Properties for Non-State Actions**

```typescript
// DOM manipulation only
onclick={(e) => e.stopPropagation()}
onmouseenter={(e) => e.target.focus()}

// Side effects (functions that call app.run() or navigate)
onclick={handleSideEffect}  // function calls app.run() internally
onclick={() => window.open('/new-page')}

// Event prevention
onsubmit={(e) => e.preventDefault()}
```

### **❌ DON'T: Mix Patterns Incorrectly**

```typescript
// ❌ Don't use $on with app.run() calls
$onclick={() => app.run('action')}
$onclick={(e) => this.run('action', e.target.value)}

// ❌ Don't use regular props for state updates
onclick="action-name"  // Use $onclick for state updates

// ❌ Don't use arrow functions for simple state updates
$onclick={(e) => ({ ...state, field: e.target.value })}

// ❌ Don't use manual form handlers when $bind is available
$oninput={(e) => updateField('name', e)}  // Use $bind="formData.name" instead
```

## Update Function Patterns

### **Module-Level State Update Functions (Modern - Recommended)**
```typescript
// Export functions for direct references in $on directives
export const saveData = async function* (state: State): AsyncGenerator<State> {
  yield { ...state, loading: true, error: null };
  try {
    await performSave(state.formData);
    yield { 
      ...state, 
      loading: false, 
      successMessage: 'Data saved successfully!' 
    };
    // Global event for parent coordination
    setTimeout(() => app.run('data-saved'), 2000);
  } catch (error) {
    yield { ...state, loading: false, error: error.message };
  }
};

export const deleteData = async function* (state: State): AsyncGenerator<State> {
  yield { ...state, loading: true, error: null };
  try {
    await performDelete(state.formData.id);
    yield { 
      ...state, 
      loading: false, 
      successMessage: 'Data deleted successfully!' 
    };
    setTimeout(() => app.run('data-deleted'), 2000);
  } catch (error) {
    yield { ...state, loading: false, error: error.message };
  }
};

export const closeModal = (): void => {
  app.run('close-modal');  // Global event for parent
};
```

### **Legacy Update Functions (Traditional Pattern)**
```typescript
// Synchronous state update
'action-name': (state: State, payload?: any): State => ({
  ...state,
  // immutable updates
  field: newValue
}),

// Async progressive updates
'async-action': async function* (state: State, payload?: any): AsyncGenerator<State> {
  try {
    yield { ...state, loading: true, error: null };
    const result = await asyncOperation(payload);
    yield { ...state, loading: false, data: result };
  } catch (error) {
    yield { ...state, loading: false, error: error.message };
  }
},

// Side effect (no re-render)
'navigate-action': (state: State, path: string): void => {
  window.location.href = path;
},

// Form field updates (common pattern)
'update-form-field': (state: State, field: string, event: Event): State => {
  const target = event.target as HTMLInputElement;
  const value = target.type === 'number' ? parseFloat(target.value) || 0 : target.value;
  
  return {
    ...state,
    formData: {
      ...state.formData,
      [field]: value
    }
  };
}
```

## Component Composition Patterns

### **Parent-Child with Global Events (Modern - Recommended)**
```typescript
// Parent Component (simplified state)
export default class WorldComponent extends Component<WorldState> {
  view = (state: WorldState) => (
    <div>
      {/* Core world UI */}
      <div className="world-content">
        {state.agents.map(agent => (
          <div key={agent.id} $onclick={['open-agent-edit', agent]}>
            {agent.name}
          </div>
        ))}
      </div>

      {/* Conditional modal rendering */}
      {state.showAgentEdit && 
        <AgentEdit 
          agent={state.selectedAgent} 
          mode={state.editMode}
          worldName={state.worldName}
        />
      }
    </div>
  );

  update = {
    'open-agent-edit': (state, agent) => ({
      ...state,
      showAgentEdit: true,
      editMode: 'edit',
      selectedAgent: agent
    }),

    'close-agent-edit': (state) => ({
      ...state,
      showAgentEdit: false
    }),

    // Global events from child components
    'agent-saved': async (state) => {
      const agents = await getAgents(state.worldName);
      return { ...state, agents, showAgentEdit: false };
    },

    'agent-deleted': async (state) => {
      const agents = await getAgents(state.worldName);
      return { ...state, agents, showAgentEdit: false };
    }
  };
}

// Self-contained child component
export default class AgentEdit extends Component<AgentEditState> {
  mounted = (props) => initializeState(props);

  view = (state) => (
    <div className="modal-backdrop" $onclick={[closeModal]}>
      <form>
        <input $bind="formData.name" />
        <button $onclick={[saveAgent]}>Save</button>
      </form>
    </div>
  );
}
```

### **Container + Presentation Pattern (Legacy)**
```typescript
// Container Component (manages state)
export default class WorldComponent extends Component<WorldState> {
  view = (state: WorldState) => (
    <div>
      <WorldChat
        messages={state.messages}
        userInput={state.userInput}
        onSendMessage={(text) => this.run('send-message', text)}
      />
      <WorldSettings
        world={state.world}
        selectedAgent={state.selectedAgent}
        onEditAgent={(agent) => this.run('edit-agent', agent)}
      />
    </div>
  );
}

// Presentation Components (stateless)
function WorldChat(props: WorldChatProps) { /* render only */ }
function WorldSettings(props: WorldSettingsProps) { /* render only */ }
```

## State Management Rules

### **✅ DO: Immutable Updates**
```typescript
// Spread operator for updates
{ ...state, field: newValue }

// Nested object updates
{
  ...state,
  nested: {
    ...state.nested,
    field: newValue
  }
}

// Array updates
{
  ...state,
  items: [...state.items, newItem],
  filteredItems: state.items.filter(item => item.id !== deletedId)
}
```

### **✅ DO: Defensive Programming**
```typescript
// Safe array operations
messages: state.messages || []
count: (state.items || []).length

// Safe object access
selectedItem: state.selectedItem?.name || 'None'

// Default props in functional components
const { data = [], loading = false } = props;
```

### **❌ DON'T: Mutate State**
```typescript
// ❌ Don't mutate existing state
state.field = newValue;
state.items.push(newItem);
state.nested.field = value;

// ❌ Don't use non-immutable array methods
state.items.sort();
state.items.reverse();
```

## Error Handling Patterns

### **Component Error States**
```typescript
// State interface includes error
interface State {
  data: DataType[];
  loading: boolean;
  error: string | null;
}

// View handles error states
view = (state: State) => {
  if (state.error) {
    return (
      <div className="error-state">
        <p>Error: {state.error}</p>
        <button $onclick="retry-action">Retry</button>
      </div>
    );
  }
  // ... rest of view
};

// Update functions handle errors
'load-data': async function* (state: State): AsyncGenerator<State> {
  try {
    yield { ...state, loading: true, error: null };
    const data = await fetchData();
    yield { ...state, loading: false, data, error: null };
  } catch (error: any) {
    yield { ...state, loading: false, error: error.message || 'Unknown error' };
  }
}
```

## Best Practices Summary

### **Component Design (Modern Patterns)**
- **Prefer stateful class components** with `mounted` lifecycle for self-contained components
- **Use module-level functions** for state updates to enable easy testing
- **Use $bind for form fields** instead of manual event handlers
- **Use direct function references** in $on directives: `$onclick={[saveFunction]}`
- **Use global events** for parent-child coordination
- Implement guard clauses for loading/error/empty states
- Follow single responsibility principle

### **Event Handling (Updated Rules)**
- **$bind for two-way data binding**: `$bind="formData.fieldName"`
- **$on directives with direct function references**: `$onclick={[functionRef]}`
- **String/tuple actions for legacy patterns**: `$onclick="action-name"` or `$onclick={['action', data]}`
- **Regular properties for DOM manipulation**: `onclick={(e) => e.stopPropagation()}`
- **Global events for coordination**: `app.run('component-saved')`

### **State Management (Enhanced)**
- **Module-level functions** return new state or use async generators
- **$bind automatically handles** form field updates
- **Global events coordinate** between parent and child components
- Always use immutable updates with spread operator
- Include loading, error, and success message states
- Use async generators for progressive updates
- Implement defensive programming with null checks

### **Architecture Patterns**
- **Self-contained components** manage their own form state using `mounted`
- **Parent components** use simple boolean flags for conditional rendering
- **Module-level functions** enable easy unit testing
- **Global events** provide loose coupling between components
- **Success messages** with auto-close functionality
- **Modal patterns** with backdrop click to close

### **Type Safety**
- Define comprehensive state interfaces with success message states
- Use proper TypeScript types for all module-level functions
- Type component props correctly for mounted pattern
- Provide default values for optional props

This guide covers modern AppRun patterns with emphasis on stateful components, module-level functions, $bind for forms, and global event coordination.
