/**
 * Test file: vdom-my-dom-contamination.spec.tsx
 * Purpose: Comprehensive testing of DOM contamination prevention
 * Features: Tests property nullification, DOM/VDOM exact matching, and property caching
 * Created: 2024-07-13 - Tests for restored mergeProps pattern
 */

import { createElement, updateElement } from '../src/vdom-my';
import { updateProps } from '../src/vdom-my-prop-attr';

describe('VDOM DOM Contamination Prevention Tests', () => {
  let container: HTMLElement;

  function render(vdom: any): Element {
    const container = document.createElement('div');
    updateElement(container, vdom);
    return container.firstElementChild!;
  }

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Property Nullification (Core Requirement)', () => {
    it('should nullify old properties not in new VDOM', () => {
      const element = render(createElement('div', {
        id: 'test',
        className: 'original',
        title: 'original-title',
        'data-test': 'original-data'
      })) as HTMLDivElement;

      container.appendChild(element);

      // Verify initial properties are set
      expect(element.id).toBe('test');
      expect(element.className).toBe('original');
      expect(element.title).toBe('original-title');
      expect(element.dataset.test).toBe('original-data');

      // Update with subset of properties (missing title and data-test)
      updateProps(element, {
        id: 'test',
        className: 'updated'
        // title and data-test intentionally omitted
      }, false);

      // Verify old properties are nullified/removed
      expect(element.id).toBe('test'); // kept
      expect(element.className).toBe('updated'); // updated
      expect(element.title).toBe(''); // nullified
      expect(element.dataset.test).toBeUndefined(); // nullified
    });

    it('should handle complete property replacement', () => {
      const element = render(createElement('input', {
        type: 'text',
        placeholder: 'old',
        maxLength: 10,
        disabled: true
      })) as HTMLInputElement;

      container.appendChild(element);

      // Verify initial state
      expect(element.type).toBe('text');
      expect(element.placeholder).toBe('old');
      expect(element.maxLength).toBe(10);
      expect(element.disabled).toBe(true);

      // Replace with completely different properties
      updateProps(element, {
        type: 'password',
        required: true,
        autocomplete: 'off'
      }, false);

      // Old properties should be nullified
      expect(element.placeholder).toBe(''); // nullified
      expect(element.maxLength).toBe(524288); // browser default value after nullification
      expect(element.disabled).toBe(false); // nullified

      // New properties should be set
      expect(element.type).toBe('password');
      expect(element.required).toBe(true);
      expect(element.autocomplete).toBe('off');
    });

    it('should handle null and undefined property values correctly', () => {
      const element = render(createElement('div', {
        title: 'test',
        className: 'test-class',
        'data-value': 'test-data'
      })) as HTMLDivElement;

      container.appendChild(element);

      // Update with explicit null/undefined values
      updateProps(element, {
        title: null,
        className: undefined,
        'data-value': '',
        id: 'new-id'
      }, false);

      // Null/undefined should remove attributes
      expect(element.title).toBe('');
      expect(element.className).toBe('');
      expect(element.dataset.value).toBe(''); // empty string should be preserved
      expect(element.id).toBe('new-id');
    });
  });

  describe('Multiple Render Cycles', () => {
    it('should prevent property accumulation over multiple renders', () => {
      let element: HTMLDivElement;

      // Render 1: Initial properties
      element = render(createElement('div', {
        'data-render': '1',
        className: 'render-1',
        title: 'Render 1'
      })) as HTMLDivElement;
      container.appendChild(element);

      expect(element.dataset.render).toBe('1');
      expect(element.className).toBe('render-1');
      expect(element.title).toBe('Render 1');

      // Render 2: Different properties
      updateProps(element, {
        'data-render': '2',
        id: 'render-2',
        'aria-label': 'Second render'
      }, false);

      expect(element.dataset.render).toBe('2');
      expect(element.id).toBe('render-2');
      expect(element.getAttribute('aria-label')).toBe('Second render');
      // Old properties should be gone
      expect(element.className).toBe('');
      expect(element.title).toBe('');

      // Render 3: Completely different properties
      updateProps(element, {
        'data-final': 'true',
        style: { color: 'red' }
      }, false);

      expect(element.dataset.final).toBe('true');
      expect(element.style.color).toBe('red');
      // All previous properties should be gone
      expect(element.dataset.render).toBeUndefined();
      expect(element.id).toBe('');
      expect(element.getAttribute('aria-label')).toBeNull();
    });

    it('should handle rapid property changes without leakage', () => {
      const element = render(createElement('div', {})) as HTMLDivElement;
      container.appendChild(element);

      // Rapidly change properties 10 times
      for (let i = 0; i < 10; i++) {
        updateProps(element, {
          [`data-iteration-${i}`]: `value-${i}`,
          className: `iteration-${i}`,
          title: `Iteration ${i}`
        }, false);

        // Only current iteration properties should exist
        expect(element.dataset[`iteration${i}`]).toBe(`value-${i}`);
        expect(element.className).toBe(`iteration-${i}`);
        expect(element.title).toBe(`Iteration ${i}`);

        // Previous iteration properties should be gone
        for (let j = 0; j < i; j++) {
          expect(element.dataset[`iteration${j}`]).toBeUndefined();
        }
      }
    });
  });

  describe('Event Handler Cleanup', () => {
    it('should clean up old event handlers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      const element = render(createElement('button', {
        onclick: handler1,
        onmouseover: handler1
      })) as HTMLButtonElement;

      container.appendChild(element);

      expect(element.onclick).toBe(handler1);
      expect(element.onmouseover).toBe(handler1);

      // Update with different handlers
      updateProps(element, {
        onclick: handler2,
        ondblclick: handler2
        // onmouseover intentionally omitted
      }, false);

      expect(element.onclick).toBe(handler2);
      expect(element.ondblclick).toBe(handler2);
      expect(element.onmouseover).toBeNull(); // nullified
    });

    it('should handle addEventListener style handlers', () => {
      const customHandler1 = jest.fn();
      const customHandler2 = jest.fn();

      const element = render(createElement('div', {
        'on:custom-event1': customHandler1,
        'on:custom-event2': customHandler1
      })) as HTMLDivElement;

      container.appendChild(element);

      // Test initial handlers work
      element.dispatchEvent(new CustomEvent('custom-event1'));
      element.dispatchEvent(new CustomEvent('custom-event2'));
      expect(customHandler1).toHaveBeenCalledTimes(2);

      // Update handlers
      updateProps(element, {
        'on:custom-event1': customHandler2,
        'on:custom-event3': customHandler2
        // 'on:custom-event2' intentionally omitted
      }, false);

      customHandler1.mockClear();
      customHandler2.mockClear();

      // Test updated handlers
      element.dispatchEvent(new CustomEvent('custom-event1'));
      element.dispatchEvent(new CustomEvent('custom-event2'));
      element.dispatchEvent(new CustomEvent('custom-event3'));

      expect(customHandler2).toHaveBeenCalledTimes(2); // event1 and event3
      expect(customHandler1).not.toHaveBeenCalled(); // event2 handler removed
    });
  });

  describe('Style Property Cleanup', () => {
    it('should clean up old CSS properties', () => {
      const element = render(createElement('div', {
        style: {
          color: 'red',
          backgroundColor: 'blue',
          fontSize: '16px'
        }
      })) as HTMLDivElement;

      container.appendChild(element);

      expect(element.style.color).toBe('red');
      expect(element.style.backgroundColor).toBe('blue');
      expect(element.style.fontSize).toBe('16px');

      // Update with partial style
      updateProps(element, {
        style: {
          color: 'green',
          margin: '10px'
          // backgroundColor and fontSize omitted
        }
      }, false);

      expect(element.style.color).toBe('green');
      expect(element.style.margin).toBe('10px');
      expect(element.style.backgroundColor).toBe(''); // cleaned up
      expect(element.style.fontSize).toBe(''); // cleaned up
    });

    it('should handle CSS custom properties cleanup', () => {
      const element = render(createElement('div', {
        style: {
          '--custom-color': '#ff0000',
          '--custom-size': '20px',
          color: 'var(--custom-color)'
        }
      })) as HTMLDivElement;

      container.appendChild(element);

      expect(element.style.getPropertyValue('--custom-color')).toBe('#ff0000');
      expect(element.style.getPropertyValue('--custom-size')).toBe('20px');

      // Update style with different custom properties
      updateProps(element, {
        style: {
          '--new-color': '#00ff00',
          fontSize: '14px'
          // Old custom properties omitted
        }
      }, false);

      expect(element.style.getPropertyValue('--new-color')).toBe('#00ff00');
      expect(element.style.fontSize).toBe('14px');
      expect(element.style.getPropertyValue('--custom-color')).toBe(''); // cleaned up
      expect(element.style.getPropertyValue('--custom-size')).toBe(''); // cleaned up
      expect(element.style.color).toBe(''); // cleaned up
    });
  });

  describe('Dataset Cleanup', () => {
    it('should clean up old dataset properties', () => {
      const element = render(createElement('div', {
        'data-old-prop': 'old-value',
        'data-another-prop': 'another-value',
        'data-keep-prop': 'keep-value'
      })) as HTMLDivElement;

      container.appendChild(element);

      expect(element.dataset.oldProp).toBe('old-value');
      expect(element.dataset.anotherProp).toBe('another-value');
      expect(element.dataset.keepProp).toBe('keep-value');

      // Update with subset of dataset properties
      updateProps(element, {
        'data-keep-prop': 'updated-value',
        'data-new-prop': 'new-value'
        // old-prop and another-prop omitted
      }, false);

      expect(element.dataset.keepProp).toBe('updated-value');
      expect(element.dataset.newProp).toBe('new-value');
      expect(element.dataset.oldProp).toBeUndefined(); // cleaned up
      expect(element.dataset.anotherProp).toBeUndefined(); // cleaned up
    });
  });

  describe('UX Protection During Cleanup', () => {
    it('should preserve focused element state during cleanup', () => {
      const element = render(createElement('input', {
        type: 'text',
        value: 'test-value',
        placeholder: 'old-placeholder'
      })) as HTMLInputElement;

      container.appendChild(element);
      element.focus();
      element.setSelectionRange(2, 4); // Select "st"

      // Update properties while element is focused
      updateProps(element, {
        type: 'text',
        value: 'test-value',
        maxLength: 50
        // placeholder omitted - should be cleaned up
      }, false);

      // UX state should be preserved
      expect(element.value).toBe('test-value');
      expect(element.selectionStart).toBe(2);
      expect(element.selectionEnd).toBe(4);

      // But non-UX properties should still be cleaned up
      expect(element.placeholder).toBe(''); // cleaned up
      expect(element.maxLength).toBe(50); // new property set
    });
  });

  describe('Performance and Memory', () => {
    it('should not leak memory with property caching', () => {
      const element = render(createElement('div', {})) as HTMLDivElement;
      container.appendChild(element);

      // Add many properties, then remove them
      for (let i = 0; i < 100; i++) {
        updateProps(element, {
          [`data-temp-${i}`]: `value-${i}`,
          className: `temp-class-${i}`
        }, false);
      }

      // Clear all properties
      updateProps(element, {}, false);

      // Element should be clean
      expect(element.className).toBe('');
      expect(Object.keys(element.dataset)).toHaveLength(0);

      // Internal property cache should exist but be manageable
      const cachedProps = (element as any)._props;
      expect(cachedProps).toBeDefined();
      expect(typeof cachedProps).toBe('object');
    });

    it('should handle rapid updates efficiently', () => {
      const element = render(createElement('div', {})) as HTMLDivElement;
      container.appendChild(element);

      const start = performance.now();

      // Perform many rapid updates
      for (let i = 0; i < 1000; i++) {
        updateProps(element, {
          'data-iteration': i.toString(),
          className: `iteration-${i % 10}`,
          title: `Update ${i}`
        }, false);
      }

      const duration = performance.now() - start;

      // Should complete quickly (less than 100ms for 1000 updates)
      expect(duration).toBeLessThan(100);

      // Final state should be correct
      expect(element.dataset.iteration).toBe('999');
      expect(element.className).toBe('iteration-9');
      expect(element.title).toBe('Update 999');
    });
  });
});
