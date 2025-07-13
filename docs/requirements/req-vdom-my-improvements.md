# VDOM-MY Improvements Requirements

## Current State Analysis

The current `vdom-my.ts` implementation provides basic virtual DOM functionality but has several performance and efficiency bottlenecks:

### Key Issues Identified:
1. **Inefficient Keyed Element Handling**: Currently clears and rebuilds entire DOM structure for keyed elements
2. **Suboptimal DOM Updates**: No batching mechanism for DOM operations
3. **Unnecessary Property Diffing**: Complex merge and comparison logic that could be simplified
4. **Incomplete Attribute Handling**: Limited set of attributes handled via `setAttribute`
5. **Poor Algorithm Complexity**: O(n²) operations in key management

## Requirements

### R1: Improved Keyed Element Handling
**What**: Implement efficient keyed element reconciliation
- Use `insertBefore` and `replaceChild` for minimal DOM manipulation
- Implement Longest Increasing Subsequence (LIS) algorithm for optimal move operations (or simpler O(n²) greedy diff for maintainability)
- Preserve existing DOM nodes when possible to maintain scroll/input states
- Support `key === null` fallback: treat unkeyed nodes as replaceable
- Cache key → index maps for new/old lists to speed up matching (React-style Map lookup)
- Minimize DOM operations to only necessary changes

### R2: Batch DOM Updates with Aggressive Sync
**What**: Implement batched DOM update mechanism
- Queue DOM operations during reconciliation
- Execute all updates in single batch using `DocumentFragment`
- Use `DocumentFragment` in `updateChildren()` and `create()` for all child operations
- Defer `element.appendChild(fragment)` until all props/styles/events are patched
- Optional: Use `requestAnimationFrame` for multi-frame renders and throttle updates
- Consider micro-task batching for large VDOM updates
- Implement aggressive synchronization strategy

### R3: Simplified Property Management
**What**: Remove property diffing and reset everything to match VDOM
- Eliminate complex property comparison logic (`mergeProps`, cached comparisons)
- Reset all properties to match virtual DOM state
- **Extended UX Protection**: For active elements (`document.activeElement`), protect all interactive properties:
  - Form inputs: `value`, `checked`, `selected`
  - Selection state: `selectionStart`, `selectionEnd`, `selectionDirection`
  - Scroll state: `scrollTop`, `scrollLeft`
  - Focus state: maintain current focus without disruption
- Simplify `updateProps` function logic
- Reduce computational overhead

### R4: Complete Attribute List Support
**What**: Implement comprehensive attribute handling via `setAttribute`
- Create exhaustive list of standard HTML/SVG attributes or use regex pattern `/^data-|^aria-|^xlink:|^on|style|class|id|value$/`
- Normalize attributes before applying:
  - `className` → `class`
  - `htmlFor` → `for`
- Handle special cases separately:
  - **Style**: as `cssText` 
  - **Dataset**: `data-*` attributes
  - **Events**: overwrite or delegate (`on*` handlers)
  - **Boolean attributes**: `checked`, `disabled`, `readonly`
- For SVG: always use `setAttributeNS` where needed
- Consider micro-libs like `is-svg-attribute` or `property-information` for accuracy
- Ensure consistent attribute setting behavior across browsers

### R5: Performance Optimization
**What**: Optimize algorithmic complexity and memory usage
- Reduce O(n²) operations to O(n log n) or O(n)
- Implement efficient key-to-element mapping
- Minimize memory allocations during updates
- Cache frequently accessed DOM properties

## Success Criteria

### Performance Metrics:
- Reduce DOM operations by 60-80% for keyed lists
- Improve update performance for large lists (1000+ items)
- Minimize memory allocations during reconciliation
- Achieve sub-frame update times for typical use cases

### Functional Requirements:
- Maintain backward compatibility with existing API
- Support all current VDOM features
- Handle edge cases correctly (null nodes, fragments, components)
- Preserve event handlers and component state

### Code Quality:
- Maintain TypeScript type safety
- Preserve existing code structure and patterns
- Add comprehensive inline documentation
- Follow AppRun coding conventions

## Out of Scope

- Changes to public API or component interface
- Major architectural restructuring
- New VDOM features beyond performance optimization
- Breaking changes to existing functionality

## Implementation Priority

1. **High Priority**: Keyed element handling improvements (R1)
2. **High Priority**: Property management simplification (R3)  
3. **Medium Priority**: Batch DOM updates (R2)
4. **Medium Priority**: Complete attribute support (R4)
5. **Low Priority**: Additional performance optimizations (R5)

## Implementation Considerations

### Algorithm Trade-offs
- **LIS vs Simple Greedy**: **DECISION: Start with simpler O(n²) greedy diff first** - easier to maintain, performs well for typical use cases, can upgrade to LIS later if needed
- **Key Mapping Strategy**: Use Map-based lookup for O(1) key access vs linear search
- **Fallback Handling**: Unkeyed nodes should be treated as replaceable for maximum flexibility

### UX Critical Requirements
- **Interactive Element State Preservation**: **DECISION: Extend protection beyond just `value`** - preserve all interactive properties (`checked`, `selected`, `selectionStart`, `selectionEnd`, `scrollTop`, `scrollLeft`) on active elements to prevent UX disruption
- **Input State Preservation**: Never reset interactive properties on `document.activeElement` to prevent cursor jumps, focus loss, and scroll position changes
- **Scroll State Maintenance**: Preserve scroll positions during keyed reconciliation
- **Focus Management**: Maintain focus states across DOM updates

### Performance Targets
- **Key-based Updates**: Target 60-80% reduction in DOM operations for keyed lists
- **Batch Processing**: **DECISION: Component-level batching** - batch all DOM mutations within each component update cycle, maintaining component isolation
- **Memory Efficiency**: Minimize allocations during hot reconciliation paths

### Technical Implementation Notes
- Use `DocumentFragment` consistently for all multi-child operations
- Implement proper SVG namespace handling for all SVG elements
- Consider `requestAnimationFrame` throttling for very large updates (>1000 nodes)
- Maintain backward compatibility with existing AppRun component lifecycle

## Risk Mitigation

### Breaking Changes Prevention
- Preserve all existing public APIs
- Maintain component state during optimizations
- Ensure event handler preservation across updates

### Edge Case Handling
- Handle mixed keyed/unkeyed children gracefully
- Support dynamic key changes without corruption
- Manage component lifecycle correctly during moves

## Implementation Strategy

### Phase 1: Simple Greedy Diff Algorithm
- Implement O(n²) greedy keyed reconciliation as foundation
- Focus on correctness and maintainability over optimal performance
- Use Map-based key lookups for O(1) key access
- Establish solid testing framework for edge cases

### Phase 2: Enhanced UX Protection
- Implement comprehensive active element property protection
- Create whitelist of interactive properties to preserve
- Add detection for various input types and their specific needs
- Ensure seamless user experience during updates

### Phase 3: Component-Level Batching
- Implement batching at component boundary level
- Maintain component isolation while optimizing DOM operations
- Use DocumentFragment for grouped operations within each component
- Preserve component lifecycle and state during batching

### Phase 4: Future Optimization Path
- **Optional**: Upgrade to LIS algorithm if performance requirements demand it
- Profile and optimize hot paths identified in production usage
- Consider more advanced batching strategies if needed

## Active Element Protection Strategy

### Protected Properties by Element Type:
- **Input/Textarea**: `value`, `selectionStart`, `selectionEnd`, `selectionDirection`
- **Select**: `value`, `selectedIndex`
- **Checkbox/Radio**: `checked`, `indeterminate`
- **All Elements**: `scrollTop`, `scrollLeft`, focus state
- **Contenteditable**: `innerHTML` (when actively editing)

### Implementation Pattern:
```typescript
// Pseudo-code for protection logic
if (element === document.activeElement) {
  const protectedProps = getProtectedProperties(element);
  if (protectedProps.includes(propertyName)) {
    // Skip this property update to preserve UX
    continue;
  }
}
```
