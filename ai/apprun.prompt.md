# AppRun Development Guide for AI Coding Assistants

## Quick Decision Tree: What Component Should I Create?

**START HERE:** Ask yourself these questions in order:

1. **Does it manage its own state and handle user interactions?**
   - YES → Use **Stateful Class Component** (Pattern A)
   - NO → Go to question 2

2. **Is it a popup/modal/overlay that appears on demand?**
   - YES → Use **Popup Component** (Pattern B) 
   - NO → Go to question 3

3. **Does it only display data passed from parent?**
   - YES → Use **Functional Component** (Pattern C)
   - NO → You might need a combination - start with Pattern A

---

## Pattern A: Stateful Class Component (Self-Contained)

**Use for:** Forms, interactive widgets, components with internal logic

### Template Structure
```typescript
// 1. IMPORTS
import { app, Component } from 'apprun';
import type { YourDataType } from '../types';
import api from '../api';

// 2. INTERFACES (Always define these first)
interface ComponentProps {
  requiredProp: string;
  optionalProp?: string;
  parentComponent?: any;
}

export interface ComponentState {
  // Always include these three
  loading: boolean;
  error: string | null;
  successMessage?: string | null;
  
  // Your specific state
  formData: Partial<YourDataType>;
  mode: 'create' | 'edit' | 'delete';
}

// 3. HELPER FUNCTIONS (Export for testing)
const getStateFromProps = (props: ComponentProps): ComponentState => ({
  loading: false,
  error: null,
  formData: props.data || {},
  mode: props.mode || 'create'
});

// 4. ACTION FUNCTIONS (Export for $onclick references)
export const saveData = async function* (state: ComponentState): AsyncGenerator<ComponentState> {
  // Validation first
  if (!state.formData.name?.trim()) {
    yield { ...state, error: 'Name is required' };
    return;
  }

  yield { ...state, loading: true, error: null };

  try {
    if (state.mode === 'create') {
      await api.create(state.formData);
    } else {
      await api.update(state.formData.id, state.formData);
    }

    yield { ...state, loading: false, successMessage: 'Saved successfully!' };
    
    // Notify parent after 2 seconds
    setTimeout(() => {
      state.parentComponent?.run('data-saved');
    }, 2000);

  } catch (error: any) {
    yield { ...state, loading: false, error: error.message || 'Save failed' };
  }
};

export const deleteData = async function* (state: ComponentState): AsyncGenerator<ComponentState> {
  yield { ...state, loading: true, error: null };
  try {
    await api.delete(state.formData.id);
    yield { ...state, loading: false, successMessage: 'Deleted successfully!' };
    setTimeout(() => state.parentComponent?.run('data-deleted'), 2000);
  } catch (error: any) {
    yield { ...state, loading: false, error: error.message || 'Delete failed' };
  }
};

export const closeComponent = (): void => {
  app.run('close-component');
};

// 5. COMPONENT CLASS
export default class YourComponent extends Component<ComponentState> {
  declare props: Readonly<ComponentProps>;
  mounted = (props: ComponentProps): ComponentState => getStateFromProps(props);

  view = (state: ComponentState) => {
    // GUARD CLAUSES FIRST (early returns)
    if (state.successMessage) {
      return (
        <div className="success-view">
          <p>{state.successMessage}</p>
          <div>Closing...</div>
        </div>
      );
    }

    if (state.error) {
      return (
        <div className="error-view">
          <p>Error: {state.error}</p>
          <button $onclick="retry">Retry</button>
        </div>
      );
    }

    if (state.loading) {
      return <div className="loading-view">Loading...</div>;
    }

    // MAIN CONTENT
    return (
      <div className="component-container">
        <form className="component-form">
          <div className="form-group">
            <label>Name *</label>
            <input 
              type="text"
              value={state.formData.name || ''}
              $bind="formData.name"
              disabled={state.loading}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" $onclick={[closeComponent]}>Cancel</button>
            <button 
              type="button" 
              $onclick={[saveData]} 
              disabled={state.loading || !state.formData.name?.trim()}
            >
              {state.loading ? 'Saving...' : state.mode === 'create' ? 'Create' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    );
  };
}
```

---

## Pattern B: Popup Component (Modal)

**Use for:** Any overlay that appears on demand

```typescript
export default class ModalComponent extends Component<ModalState> {
  declare props: Readonly<ModalProps>;
  mounted = (props: ModalProps): ModalState => getStateFromProps(props);

  view = (state: ModalState) => {
    // Success message auto-closes
    if (state.successMessage) {
      return (
        <div className="modal-backdrop" $onclick={closeModal}>
          <div className="modal-content" onclick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Success!</h2>
              <button className="modal-close-btn" $onclick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p>{state.successMessage}</p>
              <div>Closing...</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="modal-backdrop" $onclick={closeModal}>
        <div className="modal-content" onclick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{state.title}</h2>
            <button className="modal-close-btn" $onclick={closeModal}>×</button>
          </div>

          <div className="modal-body">
            {state.error && <div className="error-message">{state.error}</div>}
            
            <form>
              <input $bind="formData.name" />
              {/* Form fields */}
            </form>
          </div>

          <div className="modal-footer">
            <button className="btn-secondary" $onclick={closeModal}>Cancel</button>
            <button className="btn-primary" $onclick={[saveData]} disabled={state.loading}>
              {state.loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  };
}
```

## Pattern C: Functional Component (Display Only)

**Use for:** Components that only render data from props

```typescript
export interface ComponentProps {
  data: DataType[];
  selectedItem?: DataType | null;
  loading?: boolean;
  onItemClick?: (item: DataType) => void;
}

export default function DisplayComponent(props: ComponentProps) {
  // Destructure with defaults
  const { 
    data = [], 
    selectedItem = null, 
    loading = false,
    onItemClick 
  } = props;

  // Guard clauses
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (data.length === 0) {
    return <div className="empty-state">No data available</div>;
  }

  // Main render
  return (
    <div className="display-component">
      {data.map((item, index) => {
        const isSelected = selectedItem?.id === item.id;
        
        return (
          <div 
            key={item.id || index}
            className={`item ${isSelected ? 'selected' : ''}`}
            onclick={() => onItemClick?.(item)}
          >
            <div className="item-name">{item.name}</div>
            <div className="item-description">{item.description}</div>
          </div>
        );
      })}
    </div>
  );
}
```

---

## Parent-Child Integration Patterns

### Parent Component (Coordinates Children)
```typescript
export default class ParentComponent extends Component<ParentState> {
  view = (state: ParentState) => (
    <div className="parent-container">
      {/* Main content */}
      <DisplayComponent 
        data={state.items}
        selectedItem={state.selectedItem}
        onItemClick={(item) => this.run('select-item', item)}
      />
      
      <button $onclick="open-create-modal">Create New</button>
      
      {/* Conditional popup rendering */}
      {state.showModal && 
        <ModalComponent 
          data={state.selectedItemForEdit}
          mode={state.modalMode}
          parentComponent={this}
        />
      }
    </div>
  );

  update = {
    'select-item': (state, item) => ({
      ...state,
      selectedItem: item
    }),

    'open-create-modal': (state) => ({
      ...state,
      showModal: true,
      modalMode: 'create',
      selectedItemForEdit: null
    }),

    'close-modal': (state) => ({
      ...state,
      showModal: false
    }),

    // Global events from children
    'data-saved': (state) => {
      location.reload(); // Simple refresh
    }
  };
}
```

---

## Essential Rules & Checklists

### Event Handling Rules (Critical)

| Pattern | Use Case | Example |
|---------|----------|---------|
| `$bind="field"` | Form fields (preferred) | `<input $bind="formData.name" />` |
| `$onclick={[func]}` | Direct function call | `<button $onclick={[saveData]} />` |
| `$onclick="action"` | String action in update | `<button $onclick="save-data" />` |
| `$onclick={['action', data]}` | Action with data | `<button $onclick={['select-item', item]} />` |
| `onclick={(e) => ...}` | DOM manipulation only | `onclick={(e) => e.stopPropagation()}` |

**❌ NEVER DO:** `$onclick={() => app.run('action')}` - This breaks AppRun patterns

### State Update Rules (Critical)

**✅ ALWAYS DO:**
```typescript
// Immutable updates
{ ...state, field: newValue }

// Nested updates
{ ...state, nested: { ...state.nested, field: newValue } }

// Array updates
{ ...state, items: [...state.items, newItem] }
```

**❌ NEVER DO:**
```typescript
state.field = newValue;        // Mutation
state.items.push(newItem);     // Mutation
state.nested.field = value;    // Mutation
```

### Required State Properties

**✅ ALWAYS INCLUDE in component state:**
```typescript
interface ComponentState {
  loading: boolean;           // For async operations
  error: string | null;       // For error display
  successMessage?: string | null; // For success feedback
}
```

### TypeScript Interface Checklist

**✅ ALWAYS DEFINE:**
- [ ] Props interface with optional properties marked `?`
- [ ] State interface exported for testing
- [ ] Generic types: `Component<StateType>`
- [ ] Async generator return types: `AsyncGenerator<StateType>`

### Component Structure Checklist

**✅ REQUIRED ORDER:**
1. [ ] Imports
2. [ ] Props interface
3. [ ] State interface (exported)
4. [ ] Helper functions
5. [ ] Action functions (exported)
6. [ ] Component class with proper generics

### View Method Checklist

**✅ REQUIRED PATTERN:**
1. [ ] Guard clauses first (error, loading, success)
2. [ ] Early returns for special states
3. [ ] Main content last
4. [ ] Defensive programming (default values, safe access)

### Popup Component Checklist

**✅ REQUIRED FEATURES:**
- [ ] Backdrop click to close: `<div className="backdrop" $onclick={close}>`
- [ ] Content click prevention: `onclick={(e) => e.stopPropagation()}`
- [ ] Position calculation with viewport bounds
- [ ] Parent component coordination via global events
- [ ] Keyboard support (Escape to close)

### Error Handling Checklist

**✅ REQUIRED PATTERNS:**
- [ ] Try-catch in all async functions
- [ ] Error state in component interface
- [ ] Error display in view guard clauses
- [ ] Loading states during async operations
- [ ] Success message with auto-close

---

## Quick Reference: Common Tasks

### Creating a Form Component
1. Use Pattern A (Stateful Class Component)
2. Include loading/error/success states
3. Use `$bind` for form fields
4. Export save/delete functions for `$onclick` references
5. Add form validation before API calls

### Creating a Modal
1. Use Pattern B (Modal template)
2. Include backdrop click handling
3. Support success message auto-close
4. Coordinate with parent via global events
5. Position with viewport boundary checks

### Creating a List Display
1. Use Pattern C (Functional Component)
2. Destructure props with defaults
3. Add guard clauses for empty/loading states
4. Use callback props for parent communication

### Integrating Components
1. Parent manages popup visibility with boolean flags
2. Pass `parentComponent={this}` to children
3. Use global events for child-to-parent communication
4. Simple `location.reload()` for data refresh after CRUD

## Common Anti-Patterns to Avoid

**❌ DON'T: Use these patterns**
```typescript
// ❌ Don't mutate state
state.field = value;

// ❌ Don't use $on with side effects
$onclick={() => app.run('action')}

// ❌ Don't forget error handling
async function save() {
  await api.save(); // No try/catch
}

// ❌ Don't use manual form handling when $bind is available
$oninput={(e) => setState({...state, field: e.target.value})}

// ❌ Don't mix component responsibilities
// A single component doing display + state + API calls + routing

// ❌ Don't forget defensive programming
messages.map() // messages might be undefined

// ❌ Don't use synchronous updates for async operations
'save-data': (state) => {
  api.save(state.data); // Should be async generator
  return { ...state, saved: true };
}
```

## Summary Checklist

Before submitting AppRun components, verify:

- [ ] Used correct component pattern (stateful class vs functional)
- [ ] Included loading, error, and successMessage in state
- [ ] Used $bind for form fields
- [ ] Used direct function references or string actions for $on directives
- [ ] All state updates are immutable with spread operator
- [ ] Included defensive programming with defaults
- [ ] Added proper error handling with try/catch
- [ ] Created TypeScript interfaces for props and state
- [ ] Used global events for parent-child coordination
- [ ] Followed modal structure pattern if applicable
- [ ] Extracted complex update handlers if needed
- [ ] Added guard clauses for loading/error states
- [ ] No state mutation or anti-patterns present