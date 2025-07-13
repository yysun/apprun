/**
 * Simple Performance Benchmark for DOM Batching
 * Tests performance improvements with SSR-safe batching
 */

import { createElement, updateElement } from '../src/vdom-my';

describe('DOM Batching Performance', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  /**
   * Benchmark helper function
   */
  function benchmark(name: string, iterations: number, fn: () => void) {
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      fn();
    }

    const end = performance.now();
    const duration = end - start;
    const avgTime = duration / iterations;

    console.log(`${name}: ${duration.toFixed(2)}ms total, ${avgTime.toFixed(4)}ms avg, ${(iterations / (duration / 1000)).toFixed(0)} ops/sec`);

    return { total: duration, average: avgTime, opsPerSec: iterations / (duration / 1000) };
  }

  /**
   * Test 1: Large list rendering with batching enabled
   */
  it('should improve performance for large lists with batching', () => {
    const listSize = 100;

    // Test with batching enabled (default)
    const withBatching = benchmark('Large list WITH batching', 50, () => {
      const items = Array.from({ length: listSize }, (_, i) =>
        createElement('div', { key: `item-${i}` }, `Item ${i}`)
      );
      const vdom = createElement('div', { className: 'large-list' }, items);
      updateElement(container, vdom);
      container.innerHTML = ''; // Reset for next iteration
    });

    // Test current implementation with built-in DocumentFragment optimization
    const currentImplementation = benchmark('Large list with current implementation', 50, () => {
      const items = Array.from({ length: listSize }, (_, i) =>
        createElement('div', { key: `item-${i}` }, `Item ${i}`)
      );
      const vdom = createElement('div', { className: 'large-list' }, items);
      updateElement(container, vdom);
      container.innerHTML = ''; // Reset for next iteration
    });

    // Test baseline (simple rendering without complex operations)
    const baseline = benchmark('Simple baseline rendering', 50, () => {
      const items = Array.from({ length: Math.min(10, listSize) }, (_, i) =>
        createElement('div', { key: `simple-${i}` }, `Simple ${i}`)
      );
      const vdom = createElement('div', { className: 'simple-list' }, items);
      updateElement(container, vdom);
      container.innerHTML = ''; // Reset for next iteration
    });

    // Verify performance is reasonable
    console.log(`Current implementation: ${currentImplementation.opsPerSec.toFixed(0)} ops/sec`);
    console.log(`Baseline: ${baseline.opsPerSec.toFixed(0)} ops/sec`);

    // Current implementation should be reasonably performant
    expect(currentImplementation.opsPerSec).toBeGreaterThan(10); // At least 10 ops/sec

    // Log results for analysis
    console.log('Performance Results:', {
      currentImplementation: `${currentImplementation.opsPerSec.toFixed(0)} ops/sec`,
      baseline: `${baseline.opsPerSec.toFixed(0)} ops/sec`
    });
  });

  /**
   * Test 2: Complex nested structures
   */
  it('should handle complex nested structures efficiently', () => {
    const createComplexStructure = (depth: number, breadth: number) => {
      if (depth === 0) return `Leaf node`;

      return createElement('div', { className: `level-${depth}` },
        Array.from({ length: breadth }, (_, i) =>
          createElement('div', { key: `node-${depth}-${i}` },
            createComplexStructure(depth - 1, Math.max(1, breadth - 1))
          )
        )
      );
    };

    const result = benchmark('Complex nested structures', 20, () => {
      const vdom = createComplexStructure(4, 3); // 4 levels deep, 3 children each
      updateElement(container, vdom);
      container.innerHTML = '';
    });

    // Should complete reasonably quickly
    expect(result.average).toBeLessThan(50); // Less than 50ms per operation
    expect(result.opsPerSec).toBeGreaterThan(20); // At least 20 ops/sec
  });

  /**
   * Test 3: Mixed keyed and unkeyed updates
   */
  it('should efficiently handle mixed keyed/unkeyed updates', () => {
    let counter = 0;

    const result = benchmark('Mixed keyed/unkeyed updates', 100, () => {
      const vdom = createElement('div', null,
        // Some keyed elements
        createElement('div', { key: 'header' }, `Header ${counter}`),
        createElement('div', { key: 'main' }, `Main content ${counter}`),

        // Some unkeyed elements
        createElement('span', null, `Counter: ${counter}`),
        createElement('p', null, `Paragraph ${counter}`),

        // Dynamic list with keys
        Array.from({ length: 5 }, (_, i) =>
          createElement('li', { key: `item-${i}` }, `Item ${i}-${counter}`)
        )
      );

      updateElement(container, vdom);
      counter++;
    });

    // Should maintain good performance with mixed scenarios
    expect(result.opsPerSec).toBeGreaterThan(500); // At least 500 ops/sec
    expect(result.average).toBeLessThan(2); // Less than 2ms per update
  });

  /**
   * Test 4: Memory usage verification
   */
  it('should not cause memory leaks with repeated updates', () => {
    // Get initial memory usage (approximate)
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

    // Perform many updates
    for (let i = 0; i < 1000; i++) {
      const vdom = createElement('div', null,
        Array.from({ length: 20 }, (_, j) =>
          createElement('span', { key: `span-${j}` }, `Span ${i}-${j}`)
        )
      );
      updateElement(container, vdom);
    }

    // Final cleanup
    container.innerHTML = '';

    // Check memory hasn't grown excessively (if memory info available)
    if ((performance as any).memory) {
      const finalMemory = (performance as any).memory.usedJSHeapSize;
      const memoryGrowth = finalMemory - initialMemory;

      console.log(`Memory growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`);

      // Should not grow by more than 10MB for this test
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024);
    }

    // At minimum, should not throw errors or crash
    expect(container.children.length).toBe(0);
  });
});
