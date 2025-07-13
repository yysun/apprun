# AppRun.ts Bug Fixes Implementation Plan

## Overview
This plan addresses the critical bugs and issues identified in the AppRun framework, focusing on the main `apprun.ts` file and related dependencies. The fixes are prioritized by severity and impact.

## High Priority Fixes (Critical Bugs)

### 1. TypeScript Declaration File Mismatches
- [x] **CRITICAL**: Fix `IApp.use_react` signature mismatch
  - d.ts: `use_react(React, ReactDOM)` 
  - Implementation: `use_react(createRoot)` - Fixed parameter signature!
- [x] Fix missing `once` method in `IApp` interface implementation
- [x] Fix missing `query` method in `IApp` interface (marked obsolete but still exists)
- [x] Fix missing `version` property in IApp interface implementation
- [x] Fix missing `mounted` callback in `AppStartOptions<T>` interface

### 2. Version Synchronization
- [ ] Fix version mismatch between `apprun.ts` (3.35.0) and `app.ts` (3.3.11)
- [ ] Establish single source of truth for version management
- [ ] Update version constants to match across all files

### 3. Router Logic Correction
- [ ] Fix inverted router initialization logic in `apprun.ts` lines 103-108
- [ ] Correct `init_load` boolean logic to properly respect no-init flags
- [ ] Test router behavior with and without init flags

### 4. React 18+ Integration Fix
- [ ] Fix missing `ReactDOM` parameter in `use_react` method (matches d.ts issue above)
- [ ] Ensure React 18+ createRoot functionality works correctly
- [ ] Add proper parameter validation for React integration

## Medium Priority Fixes (Type Safety & Reliability)

### 5. Additional TypeScript Declaration Mismatches
- [x] Fix `Component.render` method signature mismatch
  - d.ts: `render(element: HTMLElement, node: any): void`
  - Implementation: No public render method found - Removed from d.ts
- [x] Fix `AppStartOptions` missing `mounted` callback parameter
- [ ] Add missing `unmount` method in Component d.ts (exists as `unmount` not `unload`)
- [x] Sync VNode type definition between d.ts and types.ts

### 6. Type Safety Improvements
- [ ] Add null checks before type assertions in event handlers
- [ ] Improve generic type constraints for window object assignments
- [ ] Add proper TypeScript types for global assignments

### 7. Memory Leak Prevention
- [ ] Implement cleanup mechanism for DOM event listeners
- [ ] Add component cache cleanup strategy
- [ ] Create proper unsubscribe methods for router events

### 8. Global State Management
- [ ] Preserve existing React global before overwriting
- [ ] Add safety checks for global object modifications
- [ ] Implement proper global state restoration

## Low Priority Fixes (Performance & Edge Cases)

### 9. Document Ready State Handling
- [ ] Add check for document.readyState === 'complete'
- [ ] Handle late script loading scenarios
- [ ] Ensure initialization occurs regardless of load timing

### 10. Router Edge Cases
- [ ] Add validation for malformed URLs
- [ ] Implement error boundaries for routing failures
- [ ] Handle empty/undefined route scenarios

### 11. Performance Optimizations
- [ ] Cache expensive DOM queries (`app.find('#')`, `app.find('#/')`)
- [ ] Optimize repeated lookups in router logic
- [ ] Reduce unnecessary event listener registrations

## Testing & Validation

### 12. Test Coverage
- [ ] Create unit tests for fixed router logic
- [ ] Add integration tests for React compatibility
- [ ] Test memory leak scenarios with repeated component mounting
- [ ] Validate version consistency across builds
- [ ] Test TypeScript declaration file accuracy

### 13. Regression Testing
- [ ] Test existing functionality after each fix
- [ ] Verify backward compatibility
- [ ] Check for any breaking changes in public API

## Implementation Strategy

### Phase 1: Critical Fixes
1. TypeScript declaration file mismatches
2. Version synchronization
3. Router logic correction
4. React integration fix

### Phase 2: Safety & Reliability
5. Additional TypeScript declaration mismatches
6. Type safety improvements
7. Memory leak prevention
8. Global state management

### Phase 3: Polish & Optimization
9. Document ready state handling
10. Router edge cases
11. Performance optimizations
12. Testing & validation

## Files to be Modified

### Primary Files
- [ ] `/src/apprun.ts` - Main entry point fixes
- [ ] `/src/app.ts` - Version constant update
- [ ] `/src/router.ts` - Edge case handling
- [ ] `/apprun.d.ts` - TypeScript declaration fixes

### Secondary Files
- [ ] `/src/types.ts` - Type safety improvements
- [ ] `/src/component.ts` - Memory management fixes

### New Files
- [ ] Create version management utility
- [ ] Add cleanup utility functions
- [ ] Create router validation helpers

## Risk Assessment

### Low Risk
- Version synchronization
- Type safety improvements
- Performance optimizations
- TypeScript declaration fixes

### Medium Risk
- Router logic changes
- Memory management modifications
- Global state handling

### High Risk
- React integration changes (potential breaking changes)
- Event listener cleanup (could affect existing apps)

## Rollback Strategy
- [ ] Create backup of current working version
- [ ] Implement feature flags for major changes
- [ ] Maintain backward compatibility where possible
- [ ] Document any breaking changes clearly

## Success Criteria
- [ ] All identified bugs fixed without introducing new issues
- [ ] No breaking changes to public API
- [ ] Memory usage remains stable or improves
- [ ] Router functionality works correctly in all scenarios
- [ ] React integration works with all supported versions
- [ ] All tests pass including new regression tests

## Timeline Estimate
- Phase 1 (Critical): 2-3 days
- Phase 2 (Safety): 2-3 days  
- Phase 3 (Polish): 1-2 days
- Testing & Validation: 1-2 days
- **Total Estimated Time: 6-10 days**

## Dependencies
- No external dependencies for core fixes
- May need to update build scripts for version management
- Testing framework should be available for validation

---

**Note**: This plan should be reviewed and approved before implementation begins. Each checkbox represents a discrete task that can be implemented and tested independently.
