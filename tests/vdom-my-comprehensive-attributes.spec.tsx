/**
 * Test file: vdom-my-comprehensive-attributes.spec.tsx
 * Purpose: Comprehensive testing of all attribute handling systems working together
 * Features: Integration tests for style, dataset, boolean, and event handling
 * Created: 2024-01-XX
 */

import { createElement, updateElement } from '../src/vdom-my';
import { updateProps } from '../src/vdom-my-prop-attr';

describe('VDOM Comprehensive Attribute Handling Tests', () => {
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

  describe('Multi-System Integration', () => {
    it('should handle all attribute types on a single element', () => {
      const clickHandler = jest.fn();

      const element = render(createElement('input', {
        // Standard attributes
        type: 'text',
        id: 'test-input',
        className: 'form-control',
        placeholder: 'Enter text',

        // Boolean attributes
        required: true,
        disabled: false,
        autofocus: true,

        // Style handling
        style: {
          width: '200px',
          backgroundColor: 'lightblue'
        },

        // Dataset attributes
        'data-validation': 'required',
        'data-test-id': 'input-field',
        'data-component-type': 'form-input',

        // Event handlers
        onclick: clickHandler,

        // Form-specific
        value: 'initial value',
        maxLength: 100
      })) as HTMLInputElement;

      container.appendChild(element);

      // Verify standard attributes
      expect(element.type).toBe('text');
      expect(element.id).toBe('test-input');
      expect(element.className).toBe('form-control');
      expect(element.placeholder).toBe('Enter text');

      // Verify boolean attributes
      expect(element.required).toBe(true);
      expect(element.disabled).toBe(false);
      expect(element.autofocus).toBe(true);

      // Verify style handling
      expect(element.style.width).toBe('200px');
      expect(element.style.backgroundColor).toBe('lightblue');

      // Verify dataset attributes
      expect(element.dataset.validation).toBe('required');
      expect(element.dataset.testId).toBe('input-field');
      expect(element.dataset.componentType).toBe('form-input');

      // Verify event handlers
      expect(element.onclick).toBe(clickHandler);

      // Verify form attributes
      expect(element.value).toBe('initial value');
      expect(element.maxLength).toBe(100);
    });

    it('should handle complex updates across all systems', () => {
      const initialHandler = jest.fn();

      const element = render(createElement('button', {
        className: 'btn',
        disabled: false,
        style: { color: 'blue' },
        'data-version': '1.0',
        onclick: initialHandler
      })) as HTMLButtonElement;

      container.appendChild(element);

      // Verify initial state
      expect(element.className).toBe('btn');
      expect(element.disabled).toBe(false);
      expect(element.style.color).toBe('blue');
      expect(element.dataset.version).toBe('1.0');
      expect(element.onclick).toBe(initialHandler);

      const newHandler = jest.fn();

      // Update all systems at once
      updateProps(element, {
        className: 'btn btn-primary',
        disabled: true,
        style: {
          color: 'white',
          backgroundColor: 'blue',
          fontSize: '16px'
        },
        'data-version': '2.0',
        'data-status': 'active',
        onclick: newHandler
      }, false);

      // Verify updates
      expect(element.className).toBe('btn btn-primary');
      expect(element.disabled).toBe(true);
      expect(element.style.color).toBe('white');
      expect(element.style.backgroundColor).toBe('blue');
      expect(element.style.fontSize).toBe('16px');
      expect(element.dataset.version).toBe('2.0');
      expect(element.dataset.status).toBe('active');
      expect(element.onclick).toBe(newHandler);
      expect(element.onclick).not.toBe(initialHandler);
    });

    it('should handle attribute removal across all systems', () => {
      const handler = jest.fn();

      const element = render(createElement('div', {
        className: 'container',
        hidden: true,
        style: {
          display: 'block',
          color: 'red'
        },
        'data-temp': 'value',
        'data-keep': 'permanent',
        onclick: handler
      })) as HTMLDivElement;

      container.appendChild(element);

      // Remove attributes from all systems
      updateProps(element, {
        className: null,
        hidden: false, // boolean attribute removal
        style: {
          color: null, // remove specific style
          display: 'flex' // keep this one
        },
        'data-temp': null, // remove dataset
        'data-keep': 'permanent', // explicitly keep this one
        onclick: null // remove event handler
      }, false);

      // Verify removals
      expect(element.className).toBe('');
      expect(element.hidden).toBe(false);
      expect(element.style.color).toBe('');
      expect(element.style.display).toBe('flex');
      expect(element.dataset.temp).toBeUndefined();
      expect(element.dataset.keep).toBe('permanent');
      expect(element.onclick).toBeNull();
    });
  });

  describe('Performance with Mixed Attributes', () => {
    it('should efficiently handle many mixed attributes', () => {
      const element = render(createElement('div', {})) as HTMLDivElement;
      container.appendChild(element);

      const start = performance.now();

      // Update with many different attribute types
      const props: { [key: string]: any } = {
        // Standard attributes
        id: 'performance-test',
        className: 'test-class',
        title: 'Performance Test',

        // Boolean attributes
        hidden: false,
        contentEditable: true,

        // Style properties
        style: {
          width: '100px',
          height: '100px',
          margin: '10px',
          padding: '5px',
          '--custom-prop': 'value'
        },

        // Event handlers
        onclick: jest.fn(),
        onmouseover: jest.fn()
      };

      // Add many dataset attributes
      for (let i = 0; i < 20; i++) {
        props[`data-item-${i}`] = `value-${i}`;
      }

      updateProps(element, props, false);

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(20); // Should be very fast even with many attributes

      // Verify a few key attributes were set
      expect(element.id).toBe('performance-test');
      expect(element.style.width).toBe('100px');
      expect(element.dataset.item0).toBe('value-0');
      expect(typeof element.onclick).toBe('function');
    });

    it('should handle rapid mixed attribute updates', () => {
      const element = render(createElement('input', {
        type: 'text',
        value: 'test'
      })) as HTMLInputElement;

      container.appendChild(element);

      // Rapidly update different attribute types
      for (let i = 0; i < 10; i++) {
        updateProps(element, {
          className: `iteration-${i}`,
          disabled: i % 2 === 0,
          style: { borderWidth: `${i}px` },
          'data-iteration': i.toString(),
          onclick: jest.fn()
        }, false);

        expect(element.className).toBe(`iteration-${i}`);
        expect(element.disabled).toBe(i % 2 === 0);
        expect(element.style.borderWidth).toBe(`${i}px`);
        expect(element.dataset.iteration).toBe(i.toString());
        expect(typeof element.onclick).toBe('function');

        // Value should be updated
        expect(element.value).toBe('');
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle mixed valid and invalid attributes gracefully', () => {
      const element = render(createElement('div', {
        // Valid attributes
        id: 'valid',
        className: 'test',

        // Invalid values for specific handlers
        style: 'invalid-string-style', // Should be object
        'data-valid': 'value',
        onclick: 'invalid-string-handler', // Should be function

        // Boolean with non-boolean value
        hidden: 'string-value', // Should be treated as truthy

        // Null/undefined values
        title: null,
        'data-null': null
      })) as HTMLDivElement;

      container.appendChild(element);

      // Valid attributes should work
      expect(element.id).toBe('valid');
      expect(element.className).toBe('test');
      expect(element.dataset.valid).toBe('value');

      // Invalid style should not crash
      expect(typeof element.style).toBe('object');

      // Invalid event handler should not be assigned as string
      expect(typeof element.onclick).not.toBe('string');

      // Hidden should be truthy
      expect(element.hidden).toBe(true);

      // Null values should not cause errors
      expect(element.title).toBe('');
      expect(element.dataset.null).toBeUndefined();
    });

    it('should handle SVG elements with mixed attributes', () => {
      const element = render(createElement('svg', {
        width: '100',
        height: '100',
        viewBox: '0 0 100 100',
        className: 'svg-icon',
        style: { fill: 'red' },
        'data-icon': 'test',
        onclick: jest.fn()
      })) as SVGSVGElement;

      container.appendChild(element);

      // SVG attributes should be set correctly
      expect(element.getAttribute('width')).toBe('100');
      expect(element.getAttribute('height')).toBe('100');
      expect(element.getAttribute('viewBox')).toBe('0 0 100 100');

      // Standard attributes should work
      expect(element.className.baseVal).toBe('svg-icon');
      expect(element.style.fill).toBe('red');
      expect(element.dataset.icon).toBe('test');
      expect(typeof element.onclick).toBe('function');
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory when updating all attribute types', () => {
      const element = render(createElement('div', {})) as HTMLDivElement;
      container.appendChild(element);

      // Create and update many attributes of different types
      for (let i = 0; i < 50; i++) {
        updateProps(element, {
          className: `class-${i}`,
          hidden: i % 2 === 0,
          style: {
            width: `${i}px`,
            color: i % 2 === 0 ? 'red' : 'blue'
          },
          [`data-item-${i}`]: `value-${i}`,
          onclick: jest.fn()
        }, false);

        // Then clear them
        updateProps(element, {
          className: null,
          hidden: false,
          style: {},
          [`data-item-${i}`]: null,
          onclick: null
        }, false);
      }

      // Should not have accumulated any attributes
      expect(element.className).toBe('');
      expect(element.hidden).toBe(false);
      expect(element.style.width).toBe('');
      expect(Object.keys(element.dataset)).toHaveLength(0);
      expect(element.onclick).toBeNull();
    });
  });
});
