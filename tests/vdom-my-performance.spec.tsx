/**
 * Performance Tests for VDOM Property Management
 * 
 * Tests performance characteristics of:
 * - mergeProps pattern with property caching
 * - Property nullification and application
 * - Memory usage of ATTR_PROPS caching
 * - Fast-path optimizations
 */

import app from '../src/apprun';
import { updateProps } from '../src/vdom-my-prop-attr';

describe('VDOM Property Management Performance', () => {
  const ITERATIONS = 1000;
  const PROPERTY_COUNT = 20;

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  /**
   * Test 3.1.1: Profile property update performance vs original
   */
  it('should handle frequent property updates efficiently', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    // Generate test properties
    const generateProps = (iteration: number) => {
      const props: any = {};
      for (let i = 0; i < PROPERTY_COUNT; i++) {
        props[`prop${i}`] = `value${iteration}-${i}`;
        props[`data-test${i}`] = `data${iteration}-${i}`;
      }
      return props;
    };

    const startTime = performance.now();

    // Simulate frequent updates
    for (let i = 0; i < ITERATIONS; i++) {
      const props = generateProps(i);
      updateProps(element, props, false);
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const timePerUpdate = totalTime / ITERATIONS;

    console.log(`Performance Results:
      Total time: ${totalTime.toFixed(2)}ms
      Time per update: ${timePerUpdate.toFixed(4)}ms
      Updates per second: ${(1000 / timePerUpdate).toFixed(0)}
    `);

    // Performance assertion: Should complete within reasonable time
    // Allow 1ms per update as baseline (can be optimized)
    expect(timePerUpdate).toBeLessThan(1.0);
  });

  /**
   * Test 3.1.2: Memory usage of ATTR_PROPS caching
   */
  it('should not leak memory with property caching', () => {
    const elements: HTMLElement[] = [];

    // Create many elements with cached properties
    for (let i = 0; i < 100; i++) {
      const element = document.createElement('div');
      document.body.appendChild(element);
      elements.push(element);

      // Apply properties to trigger caching
      updateProps(element, {
        id: `element-${i}`,
        className: `class-${i}`,
        'data-index': i.toString(),
        title: `Title ${i}`
      }, false);
    }

    // Update properties multiple times
    for (let update = 0; update < 10; update++) {
      elements.forEach((element, i) => {
        updateProps(element, {
          id: `element-${i}-updated-${update}`,
          className: `class-${i}-new-${update}`,
          'data-update': update.toString()
        }, false);
      });
    }

    // Verify cached properties exist and are reasonable
    elements.forEach((element, i) => {
      const cached = (element as any)['_props'];
      expect(cached).toBeDefined();
      expect(Object.keys(cached).length).toBeGreaterThan(0);
      expect(Object.keys(cached).length).toBeLessThan(20); // Reasonable size
    });

    // Clean up - remove elements
    elements.forEach(element => {
      element.remove();
    });
  });

  /**
   * Test 3.1.3: Fast-path for elements with no cached properties
   */
  it('should optimize first-time property application', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    // First update - no cached properties
    const startTime1 = performance.now();
    updateProps(element, {
      id: 'test',
      className: 'first-update',
      'data-test': 'value'
    }, false);
    const firstUpdateTime = performance.now() - startTime1;

    // Second update - has cached properties  
    const startTime2 = performance.now();
    updateProps(element, {
      id: 'test-2',
      className: 'second-update',
      'data-test': 'value-2'
    }, false);
    const secondUpdateTime = performance.now() - startTime2;

    console.log(`Fast-path Results:
      First update (no cache): ${firstUpdateTime.toFixed(4)}ms
      Second update (with cache): ${secondUpdateTime.toFixed(4)}ms
      Ratio: ${(secondUpdateTime / firstUpdateTime).toFixed(2)}x
    `);

    // Both should be reasonably fast
    expect(firstUpdateTime).toBeLessThan(1.0);
    expect(secondUpdateTime).toBeLessThan(2.0);
  });

  /**
   * Test 3.1.4: Object creation optimization in mergeProps
   */
  it('should minimize object creation overhead', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const testProps = {
      id: 'test',
      className: 'optimization-test',
      'data-value': 'test-value',
      title: 'Test Title'
    };

    // Initial assignment
    updateProps(element, testProps, false);

    // Multiple updates with same properties - should be efficient
    const startTime = performance.now();

    for (let i = 0; i < 100; i++) {
      updateProps(element, {
        ...testProps,
        'data-iteration': i.toString()
      }, false);
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    console.log(`Object creation optimization: ${totalTime.toFixed(2)}ms for 100 updates`);

    // Should complete quickly even with many updates
    expect(totalTime).toBeLessThan(50); // 50ms for 100 updates
  });

  /**
   * Test 3.1.5: Stress test with complex property scenarios
   */
  it('should handle complex property scenarios efficiently', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const scenarios = [
      // Scenario 1: Many simple properties
      {
        name: 'many-simple',
        props: Object.fromEntries(
          Array.from({ length: 50 }, (_, i) => [`prop${i}`, `value${i}`])
        )
      },
      // Scenario 2: Complex style object
      {
        name: 'complex-style',
        props: {
          style: {
            backgroundColor: 'red',
            fontSize: '14px',
            margin: '10px',
            padding: '5px',
            border: '1px solid black',
            borderRadius: '5px',
            color: 'white',
            textAlign: 'center',
            width: '200px',
            height: '100px'
          }
        }
      },
      // Scenario 3: Mixed attribute types
      {
        name: 'mixed-types',
        props: {
          id: 'mixed-test',
          className: 'test-class',
          'data-string': 'string-value',
          'data-number': '42',
          'data-boolean': 'true',
          disabled: false,
          hidden: false,
          draggable: true,
          contentEditable: false
        }
      }
    ];

    scenarios.forEach(scenario => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        updateProps(element, scenario.props, false);
      }

      const endTime = performance.now();
      const scenarioTime = endTime - startTime;

      console.log(`Scenario ${scenario.name}: ${scenarioTime.toFixed(2)}ms`);
      expect(scenarioTime).toBeLessThan(100); // 100ms per scenario
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });
});
