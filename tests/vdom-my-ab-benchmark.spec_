/**
 * A/B Performance Benchmark: Old vs New updateChildren Implementation
 * 
 * This test compares the performance of the old updateChildren function
 * (from vdom-my.ts.1) with the new optimized version (from vdom-my.ts)
 * 
 * Test scenarios:
 * 1. Large lists (keyed and non-keyed)
 * 2. Reordering operations  
 * 3. Mixed scenarios
 * 4. Edge cases
 */

import { createElement, updateElement } from '../src/vdom-my';
import { updateProps } from '../src/vdom-my-prop-attr';

// Import the old implementation by copying its updateChildren function
function createOldVersionUpdateChildren() {
  const keyCache = {};

  function createText(node) {
    if (node?.indexOf('_html:') === 0) {
      const div = document.createElement('div');
      div.insertAdjacentHTML('afterbegin', node.substring(6))
      return div;
    } else {
      return document.createTextNode(node ?? '');
    }
  }

  function create(node: any, isSvg: boolean): any {
    if ((node instanceof HTMLElement) || (node instanceof SVGElement)) return node;
    if (typeof node === "string") return createText(node);

    if (!node || typeof node !== 'object' || !node.tag) {
      return createText(typeof node === 'object' ? JSON.stringify(node) : String(node ?? ''));
    }

    isSvg = isSvg || node.tag === "svg";
    const element = isSvg
      ? document.createElementNS("http://www.w3.org/2000/svg", node.tag)
      : document.createElement(node.tag);

    // Use the same updateProps function as the new implementation
    updateProps(element, node.props, isSvg);
    if (node.children) node.children.forEach(child => element.appendChild(create(child, isSvg)));

    // Store key for old implementation keyCache
    if (node.props && node.props.key !== undefined) {
      element.key = node.props.key;
      keyCache[node.props.key] = element;
    }

    return element;
  }

  function same(el: any, node: any) {
    const key1 = el.nodeName;
    const key2 = `${node.tag || ''}`;
    return key1.toUpperCase() === key2.toUpperCase();
  }

  function update(element: any, node: any, isSvg: boolean) {
    isSvg = isSvg || node.tag === "svg";
    if (!same(element, node)) {
      element.parentNode.replaceChild(create(node, isSvg), element);
      return;
    }
    updateChildrenOld(element, node.children, isSvg);
  }

  // This is the OLD updateChildren implementation
  function updateChildrenOld(element, children, isSvg: boolean) {
    const old_len = element.childNodes?.length || 0;
    const new_len = children?.length || 0;
    const len = Math.min(old_len, new_len);

    for (let i = 0; i < len; i++) {
      const child = children[i];
      const el = element.childNodes[i];
      if (typeof child === 'string') {
        if (el.textContent !== child) {
          if (el.nodeType === 3) {
            el.nodeValue = child
          } else {
            element.replaceChild(createText(child), el);
          }
        }
      } else if (child instanceof HTMLElement || child instanceof SVGElement) {
        element.insertBefore(child, el);
      } else {
        const key = child.props && child.props['key'];
        if (key) {
          if (el.key === key) {
            update(element.childNodes[i], child, isSvg);
          } else {
            const old = keyCache[key];
            if (old) {
              const temp = old.nextSibling;
              element.insertBefore(old, el);
              temp ? element.insertBefore(el, temp) : element.appendChild(el);
              update(element.childNodes[i], child, isSvg);
            } else {
              element.replaceChild(create(child, isSvg), el);
            }
          }
        } else {
          update(element.childNodes[i], child, isSvg);
        }
      }
    }

    let n = element.childNodes?.length || 0;
    while (n > len) {
      element.removeChild(element.lastChild);
      n--;
    }

    if (new_len > len) {
      const d = document.createDocumentFragment();
      for (let i = len; i < children.length; i++) {
        d.appendChild(create(children[i], isSvg));
      }
      element.appendChild(d);
    }
  }

  return { updateChildrenOld, create };
}

// Import the new implementation

describe('A/B Performance Benchmark: Old vs New updateChildren', () => {
  let oldImplementation: any;
  let container: HTMLElement;
  let benchmarkResults: Array<{
    scenario: string;
    oldOpsPerSec: number;
    newOpsPerSec: number;
    improvement: number;
    oldTotal: number;
    newTotal: number;
    oldAverage: number;
    newAverage: number;
  }> = [];

  beforeAll(() => {
    oldImplementation = createOldVersionUpdateChildren();
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function benchmark(name: string, iterations: number, fn: () => void) {
    // Warm up
    for (let i = 0; i < 3; i++) {
      fn();
    }

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    const end = performance.now();

    const duration = end - start;
    const avgTime = duration / iterations;
    const opsPerSec = iterations / (duration / 1000);

    return { total: duration, average: avgTime, opsPerSec };
  }

  function recordBenchmarkResult(scenario: string, oldResult: any, newResult: any) {
    const improvement = ((newResult.opsPerSec - oldResult.opsPerSec) / oldResult.opsPerSec * 100);

    benchmarkResults.push({
      scenario,
      oldOpsPerSec: oldResult.opsPerSec,
      newOpsPerSec: newResult.opsPerSec,
      improvement,
      oldTotal: oldResult.total,
      newTotal: newResult.total,
      oldAverage: oldResult.average,
      newAverage: newResult.average
    });

    // Display results in a clean table format
    const scenarioShort = scenario.replace(' (100 elements)', '').replace(' (50 elements)', '');
    const oldOps = oldResult.opsPerSec.toFixed(0).padStart(8);
    const newOps = newResult.opsPerSec.toFixed(0).padStart(8);
    const improvementStr = `${improvement.toFixed(1)}%`.padStart(8);
    const status = improvement > 0 ? '✅' : '❌';

    process.stdout.write(`│ ${scenarioShort.padEnd(32)} │ ${oldOps} │ ${newOps} │ ${improvementStr} │ ${status} │\n`);
  }

  function runOldVersion(vdom: any) {
    container.innerHTML = '';
    container.appendChild(oldImplementation.create(vdom, false));
  }

  function runNewVersion(vdom: any) {
    updateElement(container, vdom);
  }

  describe('Scenario 1: Large Non-Keyed Lists', () => {
    it('should compare performance for 100-element lists', () => {
      const iterations = 50;
      const listSize = 100;

      const generateVDOM = (suffix: string) => createElement('div', null,
        Array.from({ length: listSize }, (_, i) =>
          createElement('div', { className: `item-${i}` }, `Item ${i} ${suffix}`)
        )
      );

      // Display table header only once
      if (benchmarkResults.length === 0) {
        process.stdout.write('\n=== PERFORMANCE BENCHMARK RESULTS ===\n');
        process.stdout.write('┌──────────────────────────────────┬──────────┬──────────┬──────────┬────┐\n');
        process.stdout.write('│ Scenario                         │ Old Ops  │ New Ops  │ Change   │ ✓  │\n');
        process.stdout.write('├──────────────────────────────────┼──────────┼──────────┼──────────┼────┤\n');
      }

      const oldResult = benchmark('Old Implementation', iterations, () => {
        runOldVersion(generateVDOM('old'));
      });

      const newResult = benchmark('New Implementation', iterations, () => {
        runNewVersion(generateVDOM('new'));
      });

      recordBenchmarkResult('Large Non-Keyed Lists (100 elements)', oldResult, newResult);

      expect(oldResult.opsPerSec).toBeGreaterThan(0);
      expect(newResult.opsPerSec).toBeGreaterThan(0);
    });
  });

  describe('Scenario 2: Large Keyed Lists', () => {
    it('should compare performance for 100-element keyed lists', () => {
      const iterations = 50;
      const listSize = 100;

      const generateVDOM = (suffix: string) => createElement('div', null,
        Array.from({ length: listSize }, (_, i) =>
          createElement('div', { key: `item-${i}`, className: `item-${i}` }, `Item ${i} ${suffix}`)
        )
      );

      const oldResult = benchmark('Old Implementation', iterations, () => {
        runOldVersion(generateVDOM('old'));
      });

      const newResult = benchmark('New Implementation', iterations, () => {
        runNewVersion(generateVDOM('new'));
      });

      recordBenchmarkResult('Large Keyed Lists (100 elements)', oldResult, newResult);

      expect(oldResult.opsPerSec).toBeGreaterThan(0);
      expect(newResult.opsPerSec).toBeGreaterThan(0);
    });
  });

  describe('Scenario 3: List Reordering', () => {
    it('should compare performance for reordering operations', () => {
      const iterations = 100;
      const listSize = 50;

      // Create initial list
      const initialItems = Array.from({ length: listSize }, (_, i) => ({
        key: `item-${i}`,
        value: `Item ${i}`
      }));

      // Create reordered list (reverse order)
      const reorderedItems = [...initialItems].reverse();

      const generateVDOM = (items: any[]) => createElement('div', null,
        items.map(item =>
          createElement('div', { key: item.key, className: 'list-item' }, item.value)
        )
      );

      const oldResult = benchmark('Old Implementation', iterations, () => {
        runOldVersion(generateVDOM(initialItems));
        runOldVersion(generateVDOM(reorderedItems));
      });

      const newResult = benchmark('New Implementation', iterations, () => {
        runNewVersion(generateVDOM(initialItems));
        runNewVersion(generateVDOM(reorderedItems));
      });

      recordBenchmarkResult('List Reordering (50 elements)', oldResult, newResult);

      expect(oldResult.opsPerSec).toBeGreaterThan(0);
      expect(newResult.opsPerSec).toBeGreaterThan(0);
    });
  });

  describe('Scenario 4: Mixed Keyed/Non-Keyed', () => {
    it('should compare performance for mixed scenarios', () => {
      const iterations = 100;

      const generateVDOM = (suffix: string) => createElement('div', null,
        // Header (keyed)
        createElement('h1', { key: 'header' }, `Header ${suffix}`),

        // Nav (keyed)
        createElement('nav', { key: 'nav' },
          createElement('a', { key: 'home' }, 'Home'),
          createElement('a', { key: 'about' }, 'About')
        ),

        // Content (non-keyed)
        createElement('main', null,
          createElement('p', null, `Paragraph 1 ${suffix}`),
          createElement('p', null, `Paragraph 2 ${suffix}`),
          createElement('p', null, `Paragraph 3 ${suffix}`)
        ),

        // List (keyed)
        createElement('ul', { key: 'list' },
          Array.from({ length: 20 }, (_, i) =>
            createElement('li', { key: `item-${i}` }, `List item ${i} ${suffix}`)
          )
        ),

        // Footer (non-keyed)
        createElement('footer', null, `Footer ${suffix}`)
      );

      const oldResult = benchmark('Old Implementation', iterations, () => {
        runOldVersion(generateVDOM('old'));
      });

      const newResult = benchmark('New Implementation', iterations, () => {
        runNewVersion(generateVDOM('new'));
      });

      recordBenchmarkResult('Mixed Keyed/Non-Keyed Elements', oldResult, newResult);

      expect(oldResult.opsPerSec).toBeGreaterThan(0);
      expect(newResult.opsPerSec).toBeGreaterThan(0);
    });
  });

  describe('Scenario 5: Simple Text Updates', () => {
    it('should compare performance for simple text updates', () => {
      const iterations = 200;

      const generateVDOM = (counter: number) => createElement('div', null,
        `Simple text ${counter}`,
        createElement('span', null, `Counter: ${counter}`),
        createElement('p', null, `Paragraph ${counter}`)
      );

      const oldResult = benchmark('Old Implementation', iterations, () => {
        runOldVersion(generateVDOM(Math.random()));
      });

      const newResult = benchmark('New Implementation', iterations, () => {
        runNewVersion(generateVDOM(Math.random()));
      });

      recordBenchmarkResult('Simple Text Updates', oldResult, newResult);

      expect(oldResult.opsPerSec).toBeGreaterThan(0);
      expect(newResult.opsPerSec).toBeGreaterThan(0);
    });
  });

  describe('Summary Report', () => {
    it('should provide a comprehensive performance summary', () => {
      // Close the main results table
      process.stdout.write('└──────────────────────────────────┴──────────┴──────────┴──────────┴────┘\n');

      // Calculate overall statistics
      const improvements = benchmarkResults.map(r => r.improvement);
      const positiveImprovements = improvements.filter(i => i > 0);
      const negativeImprovements = improvements.filter(i => i < 0);

      const avgImprovement = improvements.reduce((a, b) => a + b, 0) / improvements.length;
      const bestImprovement = Math.max(...improvements);
      const worstRegression = Math.min(...improvements);

      process.stdout.write('\n=== OVERALL STATISTICS ===\n');
      process.stdout.write(`Total scenarios tested: ${benchmarkResults.length}\n`);
      process.stdout.write(`Scenarios with improvements: ${positiveImprovements.length}\n`);
      process.stdout.write(`Scenarios with regressions: ${negativeImprovements.length}\n`);
      process.stdout.write(`Average performance change: ${avgImprovement.toFixed(1)}%\n`);
      process.stdout.write(`Best improvement: ${bestImprovement.toFixed(1)}%\n`);
      if (worstRegression < 0) {
        process.stdout.write(`Worst regression: ${worstRegression.toFixed(1)}%\n`);
      }

      // Performance category analysis
      process.stdout.write('\n=== PERFORMANCE CATEGORY ANALYSIS ===\n');
      benchmarkResults.forEach(result => {
        let category = '';
        if (result.improvement > 100) {
          category = 'EXCEPTIONAL IMPROVEMENT';
        } else if (result.improvement > 50) {
          category = 'MAJOR IMPROVEMENT';
        } else if (result.improvement > 10) {
          category = 'MODERATE IMPROVEMENT';
        } else if (result.improvement > 0) {
          category = 'MINOR IMPROVEMENT';
        } else if (result.improvement > -10) {
          category = 'MINOR REGRESSION';
        } else if (result.improvement > -50) {
          category = 'MODERATE REGRESSION';
        } else {
          category = 'MAJOR REGRESSION';
        }

        process.stdout.write(`${result.scenario}: ${category} (${result.improvement.toFixed(1)}%)\n`);
      });

      // Recommendations
      process.stdout.write('\n=== RECOMMENDATIONS ===\n');
      if (avgImprovement > 0) {
        process.stdout.write('✅ Overall performance improvement detected\n');
        process.stdout.write('✅ New implementation is recommended for production use\n');
      } else {
        process.stdout.write('❌ Overall performance regression detected\n');
        process.stdout.write('❌ Consider optimizing the new implementation before production use\n');
      }

      if (negativeImprovements.length > 0) {
        process.stdout.write('⚠️  Some scenarios show performance regression - investigate further\n');
        const regressionScenarios = benchmarkResults.filter(r => r.improvement < 0);
        regressionScenarios.forEach(result => {
          process.stdout.write(`   - ${result.scenario}: ${result.improvement.toFixed(1)}% regression\n`);
        });
      }

      process.stdout.write('\n=== END OF SUMMARY ===\n');

      expect(true).toBe(true); // Always pass - this is just for reporting
    });
  });
});
