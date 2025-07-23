---
mode: agent
---
# AppRun Component Creation Guide

## Core Concepts

AppRun follows the State-View-Update architecture pattern with TypeScript support for type-safe component development.

## Step 1: Define State Interface

### **State Management**
1. Define typed state interface with all required properties
2. Initialize with sensible defaults including loading/error states
3. Plan for immutable updates using spread operator
4. Include states for: loading, error, data, UI state

```typescript
interface ComponentState {
  data: DataType[];
  currentIndex: number;
  loading: boolean;
  error: string | null;
}
```

## Step 2: Create Component Structure

### **Component-Based Architecture**
- Extend `Component<StateType>` class
- Initialize state with async function for API data loading
- Plan MVU (Model-View-Update) separation
- Use functional design principles

```typescript
export default class MyComponent extends Component<ComponentState> {
  state = async () => {
    const data = await getData();
    return {
      data,
      currentIndex: 0,
      loading: false,
      error: null
    };
  }
}
```

## Step 3: Design View Function

### **View Structure**
```typescript
view = (state: State) => {
  // Guard clauses first (early returns)
  if (state.loading) return loadingView;
  if (state.error) return errorView;
  if (state.empty) return emptyView;
  
  // Main content last
  return mainView;
}
```

### **Multi-State Rendering**
- State-driven conditional rendering with guard clauses
- Early returns for cleaner code flow
- Dedicated views for each state (loading, error, empty, main)

### **Accessibility & Responsive Design**
1. Use semantic HTML elements
2. Add `title` attributes for tooltips
3. Proper button usage over div+click
4. Use conditional rendering based on data size
5. Implement adaptive visibility logic
6. Mobile-first button sizing

## Step 4: Implement Event Handling

### **$onclick Usage Rules**

#### Action Pattern
```typescript
// String actions for simple state updates
$onclick='action-name'

// Tuple actions for data passing
$onclick={['action-name', data]}
```

#### Event Handling Best Practices
1. Use `$onclick` for all click events
2. Simple actions: string literals
3. Data passing: tuple format `[action, data]`
4. Conditional actions: ternary in JSX

#### Action Naming Convention
- Use kebab-case: `'prev-item'`, `'next-item'`
- Be descriptive: `'select-item'`, `'enter-item'`
- Match business logic, not UI elements

## Step 5: Create Update Functions

### **Update Function Signatures**
```typescript
update = {
  // State update (returns new state)
  'action-name': (state: State, payload?: any): State => ({ ...state, changes }),

  // Side effect (no return, no re-render)
  'action-name': (state: State, payload?: any): void => { /* side effects */ },

  // Async operations (generators for progressive updates)
  'action-name': async function* (state: State): AsyncGenerator<State> { /* async logic */ }
}
```

### **State Management Pattern**
- Use immutable state updates with spread operator
- Single source of truth for component state
- Handle all state transitions explicitly

## Step 6: Handle Data Loading

### **Data Loading Patterns**
- Use async state function for initial data loading
- Async generator pattern for progressive updates during user interactions
- Graceful handling of loading transitions

```typescript
// Progressive updates for user interactions
update = {
  'refresh-data': async function* (state: State): AsyncGenerator<State> {
    try {
      yield { ...state, loading: true, error: null };
      const data = await fetchData();
      yield { ...state, data, loading: false, error: null };
    } catch (error: any) {
      yield { ...state, loading: false, error: error.message };
    }
  }
}
```

## Step 7: Error Handling

### **Error Handling Strategy**
1. Wrap async operations in try-catch
2. Yield error states in generators
3. Provide user-friendly error messages
4. Include retry mechanisms
5. Defensive programming with null checks

## Step 8: Navigation & Side Effects

### **Navigation & Side-Effect Actions**
1. Use void actions for navigation (no re-render)
2. Direct `window.location.href` for page changes
3. Use anchor tags `<a href>` for static links
4. Actions with void return indicate no re-render needed

```typescript
'navigate-action': (state: State, data: any): void => {
  window.location.href = '/path/' + data.id;
}
```

