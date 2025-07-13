/**
 * @jest-environment jsdom
 */

import { createElement, updateElement } from '../src/vdom-my';
import { updateProps } from '../src/vdom-my-prop-attr';

describe('VDOM Enhanced Style Handling Tests', () => {

  function render(vdom: any): Element {
    const container = document.createElement('div');
    updateElement(container, vdom);
    return container.firstElementChild!;
  }

  describe('String Style Values', () => {
    it('should handle CSS text string correctly', () => {
      const element = render(
        createElement('div', {
          style: 'color: red; background: blue; font-size: 14px;'
        })
      );

      const div = element as HTMLDivElement;
      expect(div.style.color).toBe('red');
      expect(div.style.background).toBe('blue');
      expect(div.style.fontSize).toBe('14px');
    });

    it('should clear previous styles when setting new string style', () => {
      const element = render(
        createElement('div', {
          style: 'color: red; background: blue;'
        })
      );

      const div = element as HTMLDivElement;
      expect(div.style.color).toBe('red');
      expect(div.style.background).toBe('blue');

      // Update with new style string
      updateProps(div, {
        style: 'font-size: 16px; margin: 10px;'
      }, false);

      // Old styles should be cleared
      expect(div.style.color).toBe('');
      expect(div.style.background).toBe('');
      // New styles should be set
      expect(div.style.fontSize).toBe('16px');
      expect(div.style.margin).toBe('10px');
    });

    it('should handle empty string style', () => {
      const element = render(
        createElement('div', {
          style: 'color: red; background: blue;'
        })
      );

      const div = element as HTMLDivElement;
      expect(div.style.color).toBe('red');

      // Clear styles with empty string
      updateProps(div, {
        style: ''
      }, false);

      expect(div.style.color).toBe('');
      expect(div.style.background).toBe('');
      expect(div.style.cssText).toBe('');
    });
  });

  describe('Object Style Values', () => {
    it('should handle style object correctly', () => {
      const element = render(
        createElement('div', {
          style: {
            color: 'red',
            backgroundColor: 'blue',
            fontSize: '14px',
            marginTop: '10px'
          }
        })
      );

      const div = element as HTMLDivElement;
      expect(div.style.color).toBe('red');
      expect(div.style.backgroundColor).toBe('blue');
      expect(div.style.fontSize).toBe('14px');
      expect(div.style.marginTop).toBe('10px');
    });

    it('should handle camelCase to kebab-case conversion', () => {
      const element = render(
        createElement('div', {
          style: {
            backgroundColor: 'red',
            borderTopWidth: '2px',
            fontFamily: 'Arial',
            textDecoration: 'underline'
          }
        })
      );

      const div = element as HTMLDivElement;
      expect(div.style.backgroundColor).toBe('red');
      expect(div.style.borderTopWidth).toBe('2px');
      expect(div.style.fontFamily).toBe('Arial');
      expect(div.style.textDecoration).toBe('underline');
    });

    it('should handle CSS custom properties (variables)', () => {
      const element = render(
        createElement('div', {
          style: {
            '--main-color': 'red',
            '--font-size': '16px',
            color: 'blue' // Use a regular color instead of CSS var for jsdom compatibility
          }
        })
      );

      const div = element as HTMLDivElement;
      expect(div.style.getPropertyValue('--main-color')).toBe('red');
      expect(div.style.getPropertyValue('--font-size')).toBe('16px');
      expect(div.style.color).toBe('blue');

      // Test that CSS variables are in cssText (our actual functionality)
      expect(div.style.cssText).toContain('--main-color: red');
      expect(div.style.cssText).toContain('--font-size: 16px');
    });

    it('should clear previous styles when setting new object style', () => {
      const element = render(
        createElement('div', {
          style: {
            color: 'red',
            backgroundColor: 'blue',
            fontSize: '14px'
          }
        })
      );

      const div = element as HTMLDivElement;
      expect(div.style.color).toBe('red');
      expect(div.style.backgroundColor).toBe('blue');

      // Update with new style object
      updateProps(div, {
        style: {
          margin: '10px',
          padding: '5px'
        }
      }, false);

      // Old styles should be cleared
      expect(div.style.color).toBe('');
      expect(div.style.backgroundColor).toBe('');
      expect(div.style.fontSize).toBe('');
      // New styles should be set
      expect(div.style.margin).toBe('10px');
      expect(div.style.padding).toBe('5px');
    });
  });

  describe('Mixed and Edge Cases', () => {
    it('should handle null and undefined style values', () => {
      const element = render(
        createElement('div', {
          style: {
            color: 'red',
            backgroundColor: null,
            fontSize: undefined,
            margin: '10px'
          }
        })
      );

      const div = element as HTMLDivElement;
      expect(div.style.color).toBe('red');
      expect(div.style.backgroundColor).toBe('');
      expect(div.style.fontSize).toBe('');
      expect(div.style.margin).toBe('10px');
    });

    it('should handle numeric values with automatic px units', () => {
      const element = render(
        createElement('div', {
          style: {
            width: 100,
            height: 200,
            top: 0,
            opacity: 0.5,
            zIndex: 10
          }
        })
      );

      const div = element as HTMLDivElement;
      // These should get 'px' automatically
      expect(div.style.width).toBe('100px');
      expect(div.style.height).toBe('200px');
      expect(div.style.top).toBe('0px');
      // These should remain numeric
      expect(div.style.opacity).toBe('0.5');
      expect(div.style.zIndex).toBe('10');
    });

    it('should handle style transitions between string and object', () => {
      const element = render(
        createElement('div', {
          style: 'color: red; background: blue;'
        })
      );

      const div = element as HTMLDivElement;
      expect(div.style.color).toBe('red');
      expect(div.style.background).toBe('blue');

      // Switch to object style
      updateProps(div, {
        style: {
          fontSize: '16px',
          margin: '10px'
        }
      }, false);

      // Previous string styles should be cleared
      expect(div.style.color).toBe('');
      expect(div.style.background).toBe('');
      // New object styles should be set
      expect(div.style.fontSize).toBe('16px');
      expect(div.style.margin).toBe('10px');

      // Switch back to string style
      updateProps(div, {
        style: 'border: 1px solid black; padding: 5px;'
      }, false);

      // Previous object styles should be cleared
      expect(div.style.fontSize).toBe('');
      expect(div.style.margin).toBe('');
      // New string styles should be set
      expect(div.style.border).toBe('1px solid black');
      expect(div.style.padding).toBe('5px');
    });

    it('should handle empty object style', () => {
      const element = render(
        createElement('div', {
          style: {
            color: 'red',
            backgroundColor: 'blue'
          }
        })
      );

      const div = element as HTMLDivElement;
      expect(div.style.color).toBe('red');

      // Clear styles with empty object
      updateProps(div, {
        style: {}
      }, false);

      expect(div.style.color).toBe('');
      expect(div.style.backgroundColor).toBe('');
      expect(div.style.cssText).toBe('');
    });
  });

  describe('Performance and Memory', () => {
    it('should efficiently handle repeated style updates', () => {
      const element = render(
        createElement('div', { style: {} })
      );

      const div = element as HTMLDivElement;

      // Simulate rapid style updates
      for (let i = 0; i < 100; i++) {
        updateProps(div, {
          style: {
            left: `${i}px`,
            top: `${i * 2}px`,
            opacity: i / 100
          }
        }, false);
      }

      expect(div.style.left).toBe('99px');
      expect(div.style.top).toBe('198px');
      expect(div.style.opacity).toBe('0.99');
    });

    it('should not leak memory on style property resets', () => {
      const element = render(
        createElement('div', { style: {} })
      );

      const div = element as HTMLDivElement;

      // Set many style properties
      const largeStyleObject = {};
      for (let i = 0; i < 50; i++) {
        largeStyleObject[`--custom-${i}`] = `value-${i}`;
      }

      updateProps(div, { style: largeStyleObject }, false);
      expect(div.style.getPropertyValue('--custom-0')).toBe('value-0');
      expect(div.style.getPropertyValue('--custom-49')).toBe('value-49');

      // Clear all styles
      updateProps(div, { style: {} }, false);
      expect(div.style.getPropertyValue('--custom-0')).toBe('');
      expect(div.style.cssText).toBe('');
    });
  });
});
