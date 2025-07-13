# VDOM-MY Improvements Implementation Plan

## Phase 1: Foundation & Setup
- [x] **1.1** Create backup of current `vdom-my.ts` implementation
- [x] **1.2** Set up comprehensive test suite for current functionality
- [x] **1.3** Add performance benchmarking infrastructure
- [x] **1.4** Document current API surface and behavior expectations

## Phase 2: Core Algorithm Replacement
### 2.1 Simple Greedy Diff Algorithm
- [x] **2.1.1** Implement Map-based key lookup system
- [x] **2.1.2** Create new `reconcileKeyedChildren()` function with greedy diff
- [x] **2.1.3** Add support for `key === null` fallback (treat as replaceable)
- [x] **2.1.4** Implement efficient `insertBefore`/`replaceChild` operations
- [x] **2.1.5** Replace current "nuke and rebuild" keyed logic
- [x] **2.1.6** Add unit tests for keyed reconciliation edge cases

### 2.2 Keyed Element Optimization
- [x] **2.2.1** Cache existing keyed elements in Map structure
- [x] **2.2.2** Implement node reuse strategy to preserve DOM state
- [x] **2.2.3** Add support for mixed keyed/unkeyed children
- [x] **2.2.4** Handle dynamic key changes gracefully
- [x] **2.2.5** Test with complex nested structures

## Phase 3: Property Management Simplification
### 3.1 Remove Complex Diffing
- [ ] **3.1.1** Remove `mergeProps` function entirely
- [ ] **3.1.2** Eliminate `ATTR_PROPS` caching mechanism
- [ ] **3.1.3** Simplify `updateProps` to direct property setting
- [ ] **3.1.4** Remove cached property comparisons

### 3.2 Active Element Protection System
- [ ] **3.2.1** Create `getProtectedProperties()` helper function
- [ ] **3.2.2** Implement element type detection (input, textarea, select, etc.)
- [ ] **3.2.3** Add protection for interactive properties:
  - [ ] Form values: `value`, `checked`, `selected`, `selectedIndex`
  - [ ] Selection state: `selectionStart`, `selectionEnd`, `selectionDirection`
  - [ ] Scroll state: `scrollTop`, `scrollLeft`
  - [ ] Focus state preservation
- [ ] **3.2.4** Add `document.activeElement` check logic
- [ ] **3.2.5** Test UX scenarios (typing, selecting, scrolling during updates)

## Phase 4: Comprehensive Attribute Handling
### 4.1 Attribute Normalization
- [ ] **4.1.1** Create attribute normalization map (`className` → `class`, `htmlFor` → `for`)
- [ ] **4.1.2** Implement regex-based attribute categorization `/^data-|^aria-|^xlink:|^on|style|class|id|value$/`
- [ ] **4.1.3** Add proper SVG namespace handling with `setAttributeNS`
- [ ] **4.1.4** Handle boolean attributes correctly (`checked`, `disabled`, `readonly`)

### 4.2 Special Property Handlers
- [ ] **4.2.1** Enhance style property handling (cssText + object styles)
- [ ] **4.2.2** Improve dataset attribute processing
- [ ] **4.2.3** Optimize event handler assignment
- [ ] **4.2.4** Add comprehensive attribute coverage testing

## Phase 5: Component-Level Batching
### 5.1 Batching Infrastructure
- [ ] **5.1.1** Create `ComponentBatcher` class/utility
- [ ] **5.1.2** Implement batch queue for DOM operations within component scope
- [ ] **5.1.3** Use `DocumentFragment` for grouped child operations
- [ ] **5.1.4** Defer `appendChild(fragment)` until after props/styles/events

### 5.2 Integration with AppRun Components
- [ ] **5.2.1** Integrate batching with `updateElement` function
- [ ] **5.2.2** Maintain component lifecycle during batched updates
- [ ] **5.2.3** Preserve component isolation and state
- [ ] **5.2.4** Add optional `requestAnimationFrame` throttling for large updates

## Phase 6: Performance Optimization
### 6.1 Memory & Speed Optimizations
- [ ] **6.1.1** Minimize memory allocations in hot paths
- [ ] **6.1.2** Optimize frequent DOM property access
- [ ] **6.1.3** Cache commonly used DOM references
- [ ] **6.1.4** Profile and optimize critical reconciliation paths

### 6.2 Advanced Features
- [ ] **6.2.1** Add micro-task batching option
- [ ] **6.2.2** Implement frame budget management (16ms target)
- [ ] **6.2.3** Add performance monitoring hooks
- [ ] **6.2.4** Create fallback strategies for edge cases

## Phase 7: Testing & Validation
### 7.1 Comprehensive Testing
- [ ] **7.1.1** Unit tests for all new algorithms
- [ ] **7.1.2** Integration tests with AppRun components
- [ ] **7.1.3** Performance regression tests
- [ ] **7.1.4** Browser compatibility testing
- [ ] **7.1.5** Edge case stress testing (large lists, complex nesting)

### 7.2 UX Validation
- [ ] **7.2.1** Test active element scenarios (typing, selecting, scrolling)
- [ ] **7.2.2** Validate focus management across updates
- [ ] **7.2.3** Test scroll position preservation
- [ ] **7.2.4** Verify component state maintenance

## Phase 8: Documentation & Cleanup
### 8.1 Code Documentation
- [ ] **8.1.1** Add comprehensive inline documentation
- [ ] **8.1.2** Update TypeScript type definitions
- [ ] **8.1.3** Add file header comment block with features summary
- [ ] **8.1.4** Document breaking changes (if any)

### 8.2 Performance Documentation
- [ ] **8.2.1** Document performance improvements achieved
- [ ] **8.2.2** Add usage guidelines for optimal performance
- [ ] **8.2.3** Create migration guide from old implementation
- [ ] **8.2.4** Update README with new capabilities

## Future Enhancement Path (Phase 9)
### 9.1 Advanced Algorithm Upgrade (Optional)
- [ ] **9.1.1** Implement LIS (Longest Increasing Subsequence) algorithm
- [ ] **9.1.2** Add heuristics to choose between greedy vs LIS based on list size
- [ ] **9.1.3** Performance comparison and optimization
- [ ] **9.1.4** Gradual rollout strategy

## Success Metrics
- [ ] **Performance**: 60-80% reduction in DOM operations for keyed lists
- [ ] **UX**: Zero cursor jumps or focus loss during updates
- [ ] **Compatibility**: 100% backward compatibility with existing AppRun apps
- [ ] **Maintainability**: Simplified codebase with better error handling
- [ ] **Memory**: Reduced allocations during reconciliation

## Risk Mitigation Checkpoints
- [ ] **Checkpoint 1**: After Phase 2 - Validate keyed reconciliation works correctly
- [ ] **Checkpoint 2**: After Phase 3 - Confirm UX protection doesn't break functionality
- [ ] **Checkpoint 3**: After Phase 5 - Verify batching maintains component isolation
- [ ] **Checkpoint 4**: After Phase 7 - Full regression testing before merge

## Dependencies & Prerequisites
- [ ] Current `vdom-my.ts` functionality fully understood
- [ ] Test suite infrastructure in place
- [ ] Performance baseline established
- [ ] AppRun component lifecycle documented
