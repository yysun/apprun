# VDOM-MY Current API Documentation

## Overview
Current implementation of `vdom-my.ts` - AppRun's lightweight virtual DOM implementation with basic keyed reconciliation.

## Public API Surface

### Core Functions

#### `createElement(tag, props, ...children)`
- **Purpose**: Creates virtual DOM nodes
- **Parameters**:
  - `tag`: string | Function | [] - Element tag name, component function, or fragment
  - `props`: object - Element properties and attributes
  - `children`: any[] - Child elements (flattened automatically)
- **Returns**: VNode object `{ tag, props, children }`
- **Behavior**: 
  - Handles JSX fragments (babel: array, typescript: undefined tag)
  - Supports AppRun components via prototype detection
  - Function tags are executed immediately

#### `updateElement(element, nodes, component)`
- **Purpose**: Updates DOM element to match virtual DOM
- **Parameters**:
  - `element`: Element | string - DOM element or selector
  - `nodes`: VDOM - Virtual DOM tree to render
  - `component`: object - AppRun component context (optional)
- **Returns**: void
- **Behavior**: 
  - Processes directives before rendering
  - Handles both single nodes and arrays
  - Maintains component hierarchy

#### `Fragment(props, ...children)`
- **Purpose**: JSX Fragment implementation
- **Returns**: Flattened array of children
- **Behavior**: Filters out null/undefined/false/empty values

#### `safeHTML(html)`
- **Purpose**: Safely inject HTML strings into DOM
- **Parameters**: `html` - HTML string to parse
- **Returns**: Array of DOM elements
- **Behavior**: Uses `insertAdjacentHTML` for parsing

### Internal Functions

#### `updateChildren(element, children, isSvg)`
- **Current Algorithm**: 
  - **Keyed Elements**: Clear and rebuild entire DOM structure
  - **Non-keyed**: Update in-place with minimal DOM operations
- **Issues**: Inefficient keyed reconciliation, loses DOM state

#### `updateProps(element, props, isSvg)`
- **Current Algorithm**: 
  - Merges old/new props with null assignments
  - Uses cached property comparison
  - Special handling for style, events, data attributes
- **Issues**: Complex caching logic, unnecessary comparisons

## Current Behavior Expectations

### Keyed Reconciliation
```typescript
// Current (inefficient) behavior:
// 1. Detects if any children have keys
// 2. If yes: clears entire DOM and rebuilds from scratch
// 3. Sets element.key property on DOM nodes
// 4. Updates keyCache global object
```

### Property Management
```typescript
// Current behavior:
// 1. Merges cached props with new props (sets old to null)
// 2. Iterates through merged object
// 3. Compares cached[name] === value (commented out)
// 4. Updates property/attribute based on type
```

### Special Property Handling
- **style**: Object styles merge, string styles replace
- **className/class**: Normalized to 'class' attribute
- **data-\***: Converted to dataset properties with camelCase
- **events (on\*)**: Set as DOM properties or attributes
- **SVG**: Uses setAttributeNS for xlink attributes
- **Boolean attrs**: checked, disabled, readonly handled specially

### Component Lifecycle
- **Component Caching**: Uses `__componentCache` on parent object
- **Rendering**: Calls component.mount() for new instances
- **Updates**: Calls component.mounted() hook if available
- **Props**: Applied to component.element after rendering

## Known Issues & Limitations

### Performance Issues
1. **O(n²) keyed reconciliation** - rebuilds entire DOM
2. **Unnecessary property diffing** - complex merge/compare logic  
3. **Memory leaks** - keyCache not cleaned up
4. **No batching** - immediate DOM operations

### UX Issues
1. **State loss** - keyed elements lose focus/scroll/input state
2. **Event handler loss** - elements recreated unnecessarily
3. **Cursor jumps** - no protection for active input elements

### Technical Debt
1. **Mixed algorithms** - different logic for keyed vs non-keyed
2. **Global state** - keyCache shared across components
3. **Type safety** - loose typing for Element interface
4. **Code complexity** - mergeProps and caching logic

## Edge Cases Handled
- Mixed keyed/non-keyed children (poorly)
- Null/undefined/false children (filtered)
- Function components and fragments
- SVG namespace handling
- HTML injection via _html: prefix
- Component lifecycle preservation

## Performance Characteristics
- **Small updates**: Good performance
- **Large lists**: Poor performance (O(n²))
- **Keyed updates**: Very poor (full rebuild)
- **Property updates**: Acceptable but suboptimal

## Backward Compatibility Requirements
- Must maintain all current public APIs
- Component lifecycle must work identically  
- Event handling behavior must be preserved
- SVG rendering must continue working
- Fragment support must be maintained
