/**
 * Performance Benchmark for VDOM-MY Improvements
 * Measures current performance baseline before optimizations
 */

import { createElement, updateElement } from '../src/vdom-my';

interface BenchmarkResult {
  testName: string;
  operations: number;
  duration: number;
  opsPerSecond: number;
}

class VDOMBenchmark {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    document.body.appendChild(this.container);
  }

  cleanup() {
    document.body.removeChild(this.container);
  }

  private benchmark(testName: string, operations: number, testFn: () => void): BenchmarkResult {
    // Warm up
    for (let i = 0; i < 10; i++) {
      testFn();
    }

    // Clear container
    this.container.innerHTML = '';

    // Actual benchmark
    const startTime = performance.now();
    for (let i = 0; i < operations; i++) {
      testFn();
    }
    const endTime = performance.now();

    const duration = endTime - startTime;
    const opsPerSecond = Math.round((operations / duration) * 1000);

    return {
      testName,
      operations,
      duration: Math.round(duration * 100) / 100,
      opsPerSecond
    };
  }

  // Benchmark 1: Simple keyed list updates
  benchmarkKeyedListUpdates(listSize: number = 100): BenchmarkResult {
    let counter = 0;
    return this.benchmark(`Keyed List Updates (${listSize} items)`, 100, () => {
      const items = Array.from({ length: listSize }, (_, i) =>
        createElement('div', { key: `item-${i}` }, `Item ${i} - ${counter++}`)
      );
      updateElement(this.container, createElement('div', null, items));
    });
  }

  // Benchmark 2: Keyed list reordering
  benchmarkKeyedListReorder(listSize: number = 100): BenchmarkResult {
    let isReversed = false;
    return this.benchmark(`Keyed List Reorder (${listSize} items)`, 50, () => {
      const items = Array.from({ length: listSize }, (_, i) =>
        createElement('div', { key: `item-${i}` }, `Item ${i}`)
      );
      if (isReversed) items.reverse();
      updateElement(this.container, createElement('div', null, items));
      isReversed = !isReversed;
    });
  }

  // Benchmark 3: Property updates
  benchmarkPropertyUpdates(): BenchmarkResult {
    let counter = 0;
    return this.benchmark('Property Updates', 1000, () => {
      updateElement(this.container, createElement('div', {
        className: `class-${counter}`,
        style: { left: `${counter}px`, top: `${counter}px` },
        'data-value': counter,
        id: `element-${counter}`
      }, `Content ${counter}`));
      counter++;
    });
  }

  // Benchmark 4: Large DOM tree creation
  benchmarkLargeDOMCreation(depth: number = 5, breadth: number = 5): BenchmarkResult {
    const createTree = (currentDepth: number): any => {
      if (currentDepth === 0) return `Leaf ${Math.random()}`;

      const children = Array.from({ length: breadth }, (_, i) =>
        createElement('div', { key: `${currentDepth}-${i}` }, [createTree(currentDepth - 1)])
      );
      return createElement('div', null, children);
    };

    return this.benchmark(`Large DOM Creation (depth: ${depth}, breadth: ${breadth})`, 10, () => {
      updateElement(this.container, createTree(depth));
    });
  }

  // Benchmark 5: Mixed content updates
  benchmarkMixedContent(): BenchmarkResult {
    let counter = 0;
    return this.benchmark('Mixed Content Updates', 200, () => {
      const children = [
        createElement('span', null, `Text ${counter}`),
        createElement('div', { key: 'keyed-div' }, `Keyed content ${counter}`),
        createElement('input', { type: 'text', value: `Input ${counter}` }),
        counter % 2 === 0 ? createElement('p', null, 'Conditional') : null,
        createElement('ul', null,
          Array.from({ length: 3 }, (_, i) =>
            createElement('li', { key: `li-${i}` }, `List item ${i}-${counter}`)
          )
        )
      ].filter(Boolean);

      updateElement(this.container, createElement('div', null, children));
      counter++;
    });
  }

  // Run all benchmarks and return results
  runAllBenchmarks(): BenchmarkResult[] {
    const results: BenchmarkResult[] = [];

    console.log('🚀 Running VDOM-MY Performance Benchmarks...\n');

    results.push(this.benchmarkKeyedListUpdates(50));
    results.push(this.benchmarkKeyedListUpdates(200));
    results.push(this.benchmarkKeyedListReorder(50));
    results.push(this.benchmarkKeyedListReorder(200));
    results.push(this.benchmarkPropertyUpdates());
    results.push(this.benchmarkLargeDOMCreation(4, 4));
    results.push(this.benchmarkLargeDOMCreation(6, 3));
    results.push(this.benchmarkMixedContent());

    return results;
  }

  // Print results in a readable format
  static printResults(results: BenchmarkResult[]): void {
    console.log('\n📊 Benchmark Results:');
    console.log('='.repeat(80));
    console.log('Test Name'.padEnd(35) + 'Ops'.padEnd(8) + 'Duration(ms)'.padEnd(15) + 'Ops/sec');
    console.log('-'.repeat(80));

    results.forEach(result => {
      console.log(
        result.testName.padEnd(35) +
        result.operations.toString().padEnd(8) +
        result.duration.toString().padEnd(15) +
        result.opsPerSecond.toLocaleString()
      );
    });
    console.log('='.repeat(80));

    // Calculate averages
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const avgOpsPerSec = results.reduce((sum, r) => sum + r.opsPerSecond, 0) / results.length;

    console.log(`\n📈 Average Duration: ${avgDuration.toFixed(2)}ms`);
    console.log(`📈 Average Ops/sec: ${Math.round(avgOpsPerSec).toLocaleString()}`);
  }
}

// Export for use in tests
export { VDOMBenchmark, BenchmarkResult };

// Auto-run if this file is executed directly
if (typeof window !== 'undefined' && document.readyState === 'complete') {
  const benchmark = new VDOMBenchmark();
  const results = benchmark.runAllBenchmarks();
  VDOMBenchmark.printResults(results);
  benchmark.cleanup();
}
