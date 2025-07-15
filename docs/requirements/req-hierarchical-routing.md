# Requirements: Hierarchical Route Matching

## Overview
Modify the route function to support hierarchical path matching where the router attempts to find event handlers by progressively shortening the path from most specific to least specific.

## Functional Requirements

### 1. Path-based Routing (`/a/b/c/d`)
- Try to find event handlers in order: `/a/b/c/d` → `/a/b/c` → `/a/b` → `/a` → **404**
- If handler found at any level, pass remaining path segments as individual parameters (spread)
- Example: For `/a/b/c/d` with handler at `/a/b`, call handler with `('c', 'd')`

### 2. Hash-based Routing (`#a/b/c/d`)
- Try to find event handlers in order: `#a/b/c/d` → `#a/b/c` → `#a/b` → `#a` → **404**
- If handler found at any level, pass remaining path segments as individual parameters (spread)
- Example: For `#a/b/c/d` with handler at `#a/b`, call handler with `('c', 'd')`

### 3. Hash-slash Routing (`#/a/b/c/d`)
- Try to find event handlers in order: `#/a/b/c/d` → `#/a/b/c` → `#/a/b` → `#/a` → **404**
- If handler found at any level, pass remaining path segments as individual parameters (spread)
- Example: For `#/a/b/c/d` with handler at `#/a/b`, call handler with `('c', 'd')`

### 4. Non-prefixed Routing (`a/b/c/d`)
- Try to find event handlers in order: `a/b/c/d` → `a/b/c` → `a/b` → `a` → **404**
- If handler found at any level, pass remaining path segments as individual parameters (spread)
- Example: For `a/b/c/d` with handler at `a/b`, call handler with `('c', 'd')`

### 5. Fallback Behavior
- Fire 404 **only at minimal level**: `/a`, `#a`, `#/a`, or `a`
- **Never** try root handlers (`/`, `#`, `#/`) in hierarchical matching
- **404 Event**: Fire ROUTER_404_EVENT with the **original URL** (not minimal route)
- **Warning Log**: Log warning with the minimal route that was tried last
- Maintain existing duplicate routing prevention
- Preserve existing ROUTER_EVENT and ROUTER_404_EVENT behavior

### 6. Edge Cases
- **Trailing slash normalization**: `/a/` === `/a`
- **Empty segments**: `/a//b` → `/a` with parameters `('', 'b')`
- **Single-level paths**: `/a` → try `/a` only, then 404 (no `/` fallback)
- **Empty path handling**: `""` → try `#` if exists, try `/` if exists, try `#/` if exists

### 7. Base Path Support
- Add `app.basePath` configuration for sub-directory deployments
- Example: `app.basePath = '/myapp'` for `https://example.com/myapp`
- Strip base path before hierarchical matching
- Ensure `history.pushState` works with base paths for navigation

## Technical Requirements

### 1. Route Function Signature
- Maintain existing `route(url: string)` signature
- Ensure backward compatibility with existing routing behavior
- Add optional `app.basePath` property to IApp interface

### 2. Event Handler Discovery
- Use `app.find(name)` to check for existing subscribers
- Process paths from most specific to least specific
- Stop at first found handler

### 3. Parameter Passing
- Pass remaining path segments as individual parameters (spread), not as array
- Pass ALL remaining segments (no truncation)
- Include empty strings for missing segments in paths like `/a//b`
- Empty parameter list if matched at exact path level
- Maintain existing parameter spreading behavior for backward compatibility

### 4. Base Path Handling
- Strip configured base path before processing routes
- Apply base path to `history.pushState` calls for proper navigation
- Handle both absolute and relative base paths
- Default to empty string if not configured

### 5. Testing Requirements
- Unit tests for all four routing patterns (path, hash, hash-slash, non-prefixed)
- Test cases for various nesting levels
- Edge cases: empty paths, single segments, deep nesting, trailing slashes
- Base path configuration tests
- Backward compatibility tests

## Examples

### Example 1: Path Routing
```typescript
// Handler registered for '/api'
app.on('/api', (operation, id) => { /* handle */ });

// URL: '/api/users/123'
// Should match '/api' handler with parameters: 'users', '123'
```

### Example 2: Hash Routing
```typescript
// Handler registered for '#home'
app.on('#home', (section) => { /* handle */ });

// URL: '#home/settings'
// Should match '#home' handler with parameters: 'settings'
```

### Example 4: Non-prefixed Routing
```typescript
// Handler registered for 'api'
app.on('api', (operation, id) => { /* handle */ });

// URL: 'api/users/123'
// Should match 'api' handler with parameters: 'users', '123'
```

### Example 5: Base Path Configuration
```typescript
// Configure base path for sub-directory deployment
app.basePath = '/myapp';

// Handler registered for '/users'
app.on('/users', (id) => { /* handle */ });

// URL: '/myapp/users/123'
// Should strip base path and match '/users' handler with parameters: '123'
```

### Example 6: Edge Cases
```typescript
// Empty path handling
app.on('#', () => { /* handle root hash */ });
app.on('/', () => { /* handle root path */ });

// URL: ''
// Should try '#' if exists, '/' if exists, '#/' if exists

// Trailing slash normalization
app.on('/api', (action) => { /* handle */ });

// URL: '/api/'
// Should normalize to '/api' and match handler with empty parameters

// Empty segments
app.on('/api', (service, action) => { /* handle */ });

// URL: '/api//delete'
// Should match '/api' handler with parameters: '', 'delete'
```

## Non-Requirements
- No changes to existing event registration (`app.on`)
- No changes to existing route navigation APIs
- No performance optimization requirements beyond current implementation
- No new routing patterns beyond the four specified (path, hash, hash-slash, non-prefixed)
- No automatic base path detection (must be manually configured)
