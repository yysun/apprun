/**
 * @jest-environment jsdom
 */

import { createElement, updateElement } from '../src/vdom-my';
import { updateProps } from '../src/vdom-my-prop-attr';

describe('VDOM Enhanced Dataset Handling Tests', () => {

  function render(vdom: any): Element {
    const container = document.createElement('div');
    updateElement(container, vdom);
    return container.firstElementChild!;
  }

  describe('Basic Dataset Operations', () => {
    it('should handle simple data attributes correctly', () => {
      const element = render(
        createElement('div', {
          'data-id': '123',
          'data-name': 'test-element',
          'data-active': 'true'
        })
      );

      const div = element as HTMLDivElement;
      expect(div.dataset.id).toBe('123');
      expect(div.dataset.name).toBe('test-element');
      expect(div.dataset.active).toBe('true');

      // Also check via getAttribute
      expect(div.getAttribute('data-id')).toBe('123');
      expect(div.getAttribute('data-name')).toBe('test-element');
      expect(div.getAttribute('data-active')).toBe('true');
    });

    it('should handle kebab-case to camelCase conversion', () => {
      const element = render(
        createElement('div', {
          'data-user-id': '456',
          'data-first-name': 'John',
          'data-last-name': 'Doe',
          'data-is-admin': 'false',
          'data-created-at': '2023-01-01'
        })
      );

      const div = element as HTMLDivElement;
      expect(div.dataset.userId).toBe('456');
      expect(div.dataset.firstName).toBe('John');
      expect(div.dataset.lastName).toBe('Doe');
      expect(div.dataset.isAdmin).toBe('false');
      expect(div.dataset.createdAt).toBe('2023-01-01');
    });

    it('should handle complex kebab-case conversions', () => {
      const element = render(
        createElement('div', {
          'data-very-long-attribute-name': 'value1',
          'data-a-b-c-d-e': 'value2',
          'data-single': 'value3',
          'data-two-words': 'value4'
        })
      );

      const div = element as HTMLDivElement;
      expect(div.dataset.veryLongAttributeName).toBe('value1');
      expect(div.dataset.aBCDE).toBe('value2');
      expect(div.dataset.single).toBe('value3');
      expect(div.dataset.twoWords).toBe('value4');
    });
  });

  describe('Data Type Handling', () => {
    it('should handle various data types as strings', () => {
      const element = render(
        createElement('div', {
          'data-string': 'hello',
          'data-number': 42,
          'data-boolean': true,
          'data-zero': 0,
          'data-false': false,
          'data-object': { key: 'value' }
        })
      );

      const div = element as HTMLDivElement;
      expect(div.dataset.string).toBe('hello');
      expect(div.dataset.number).toBe('42');
      expect(div.dataset.boolean).toBe('true');
      expect(div.dataset.zero).toBe('0');
      expect(div.dataset.false).toBe('false');
      expect(div.dataset.object).toBe('[object Object]');
    });

    it('should handle null and undefined values by removing attributes', () => {
      const element = render(
        createElement('div', {
          'data-keep': 'value',
          'data-remove-null': null,
          'data-remove-undefined': undefined
        })
      );

      const div = element as HTMLDivElement;
      expect(div.dataset.keep).toBe('value');
      expect(div.dataset.removeNull).toBeUndefined();
      expect(div.dataset.removeUndefined).toBeUndefined();
      expect(div.hasAttribute('data-remove-null')).toBe(false);
      expect(div.hasAttribute('data-remove-undefined')).toBe(false);
    });

    it('should handle empty strings correctly', () => {
      const element = render(
        createElement('div', {
          'data-empty': '',
          'data-space': ' ',
          'data-normal': 'value'
        })
      );

      const div = element as HTMLDivElement;
      expect(div.dataset.empty).toBe('');
      expect(div.dataset.space).toBe(' ');
      expect(div.dataset.normal).toBe('value');
      expect(div.hasAttribute('data-empty')).toBe(true);
      expect(div.hasAttribute('data-space')).toBe(true);
    });
  });

  describe('Dynamic Updates', () => {
    it('should handle dataset updates correctly', () => {
      const element = render(
        createElement('div', {
          'data-status': 'pending',
          'data-count': '0'
        })
      );

      const div = element as HTMLDivElement;
      expect(div.dataset.status).toBe('pending');
      expect(div.dataset.count).toBe('0');

      // Update dataset values
      updateProps(div, {
        'data-status': 'completed',
        'data-count': '5',
        'data-new': 'added'
      }, false);

      expect(div.dataset.status).toBe('completed');
      expect(div.dataset.count).toBe('5');
      expect(div.dataset.new).toBe('added');
    });

    it('should remove dataset attributes when set to null', () => {
      const element = render(
        createElement('div', {
          'data-temp': 'value',
          'data-keep': 'value'
        })
      );

      const div = element as HTMLDivElement;
      expect(div.dataset.temp).toBe('value');
      expect(div.dataset.keep).toBe('value');

      // Remove one attribute, keep another
      updateProps(div, {
        'data-temp': null,
        'data-keep': 'updated'
      }, false);

      expect(div.dataset.temp).toBeUndefined();
      expect(div.dataset.keep).toBe('updated');
      expect(div.hasAttribute('data-temp')).toBe(false);
      expect(div.hasAttribute('data-keep')).toBe(true);
    });

    it('should handle adding and removing multiple attributes', () => {
      const element = render(
        createElement('div', {
          'data-a': '1',
          'data-b': '2'
        })
      );

      const div = element as HTMLDivElement;
      expect(Object.keys(div.dataset)).toEqual(['a', 'b']);

      // Add new, remove existing, update existing
      updateProps(div, {
        'data-a': null,      // remove
        'data-b': 'updated', // update
        'data-c': 'new',     // add
        'data-d': 'another'  // add
      }, false);

      expect(div.dataset.a).toBeUndefined();
      expect(div.dataset.b).toBe('updated');
      expect(div.dataset.c).toBe('new');
      expect(div.dataset.d).toBe('another');
      expect(Object.keys(div.dataset).sort()).toEqual(['b', 'c', 'd']);
    });
  });

  describe('Special Characters and Edge Cases', () => {
    it('should handle data attributes with special characters', () => {
      const element = render(
        createElement('div', {
          'data-with-numbers123': 'value1',
          'data-with-dashes': 'value2',
          'data-single-char': 'value3'
        })
      );

      const div = element as HTMLDivElement;
      expect(div.dataset.withNumbers123).toBe('value1');
      expect(div.dataset.withDashes).toBe('value2');
      expect(div.dataset.singleChar).toBe('value3');
    });

    it('should handle unicode and special string values', () => {
      const element = render(
        createElement('div', {
          'data-unicode': '🚀🌟',
          'data-json': '{"key":"value"}',
          'data-html': '<div>content</div>',
          'data-quotes': '"quoted"',
          'data-newlines': 'line1\nline2'
        })
      );

      const div = element as HTMLDivElement;
      expect(div.dataset.unicode).toBe('🚀🌟');
      expect(div.dataset.json).toBe('{"key":"value"}');
      expect(div.dataset.html).toBe('<div>content</div>');
      expect(div.dataset.quotes).toBe('"quoted"');
      expect(div.dataset.newlines).toBe('line1\nline2');
    });

    it('should handle very long attribute names and values', () => {
      const longName = 'very-long-attribute-name-with-many-words-that-tests-conversion';
      const longValue = 'very long value '.repeat(100);

      const props = {};
      props[`data-${longName}`] = longValue;

      const element = render(createElement('div', props));
      const div = element as HTMLDivElement;

      const expectedCamelName = 'veryLongAttributeNameWithManyWordsThatTestsConversion';
      expect(div.dataset[expectedCamelName]).toBe(longValue);
    });
  });

  describe('Integration with Other Attributes', () => {
    it('should work alongside other attributes', () => {
      const element = render(
        createElement('div', {
          id: 'test-div',
          className: 'container',
          'data-id': '123',
          'data-type': 'widget',
          style: { color: 'red' },
          onClick: () => { },
          disabled: false
        })
      );

      const div = element as HTMLDivElement;
      expect(div.id).toBe('test-div');
      expect(div.className).toBe('container');
      expect(div.dataset.id).toBe('123');
      expect(div.dataset.type).toBe('widget');
      expect(div.style.color).toBe('red');
      expect(div.hasAttribute('disabled')).toBe(false);
    });

    it('should handle dataset updates without affecting other attributes', () => {
      const element = render(
        createElement('input', {
          type: 'text',
          value: 'initial',
          'data-validation': 'required'
        })
      );

      const input = element as HTMLInputElement;
      expect(input.type).toBe('text');
      expect(input.value).toBe('initial');
      expect(input.dataset.validation).toBe('required');

      // Update only dataset
      updateProps(input, {
        'data-validation': 'optional',
        'data-format': 'email'
      }, false);

      expect(input.type).toBe('text');      // unchanged
      expect(input.value).toBe('');       // cleared (no input protection)
      expect(input.dataset.validation).toBe('optional');
      expect(input.dataset.format).toBe('email');
    });
  });

  describe('Performance and Memory', () => {
    it('should handle rapid dataset updates efficiently', () => {
      const element = render(
        createElement('div', { 'data-counter': '0' })
      );

      const div = element as HTMLDivElement;

      // Simulate rapid updates
      for (let i = 1; i <= 100; i++) {
        const props = {
          'data-counter': String(i),
          'data-timestamp': Date.now().toString()
        };
        updateProps(div, props, false);
      }

      expect(div.dataset.counter).toBe('100');
      expect(parseInt(div.dataset.timestamp!)).toBeGreaterThan(0);
    });

    it('should not leak memory when removing many dataset attributes', () => {
      const element = render(createElement('div', {}));
      const div = element as HTMLDivElement;

      // Add many dataset attributes
      const props = {};
      for (let i = 0; i < 50; i++) {
        props[`data-attr-${i}`] = `value-${i}`;
      }
      updateProps(div, props, false);

      expect(Object.keys(div.dataset).length).toBe(50);

      // Remove all dataset attributes
      const removeProps = {};
      for (let i = 0; i < 50; i++) {
        removeProps[`data-attr-${i}`] = null;
      }
      updateProps(div, removeProps, false);

      expect(Object.keys(div.dataset).length).toBe(0);
    });
  });
});
