/**
 * @jest-environment jsdom
 */

import { createElement, updateElement } from '../src/vdom-my';

describe('VDOM SVG Namespace Handling Tests', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  const render = (vdom: any) => {
    updateElement(container, vdom);
    return container.firstChild as Element;
  };

  describe('SVG Namespace Attributes', () => {
    it('should handle SVG elements with basic attributes', () => {
      const element = render(
        createElement('svg', {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 100 100',
          width: '100',
          height: '100'
        }, [
          createElement('circle', {
            cx: '50',
            cy: '50',
            r: '40',
            fill: 'red'
          })
        ])
      );

      const svg = element as SVGSVGElement;
      expect(svg.tagName.toLowerCase()).toBe('svg');
      expect(svg.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
      expect(svg.getAttribute('viewBox')).toBe('0 0 100 100');

      const circle = svg.children[0] as SVGCircleElement;
      expect(circle.tagName.toLowerCase()).toBe('circle');
      expect(circle.getAttribute('cx')).toBe('50');
      expect(circle.getAttribute('cy')).toBe('50');
      expect(circle.getAttribute('r')).toBe('40');
      expect(circle.getAttribute('fill')).toBe('red');
    });

    it('should handle XLink attributes with proper namespace', () => {
      const element = render(
        createElement('svg', {
          xmlns: 'http://www.w3.org/2000/svg'
        }, [
          createElement('use', {
            'xlinkhref': '#pattern1'
          })
        ])
      );

      const svg = element as SVGSVGElement;
      const use = svg.querySelector('use') as SVGUseElement;

      expect(use.getAttributeNS('http://www.w3.org/1999/xlink', 'href')).toBe('#pattern1');
    });
  });

  describe('Namespace Error Prevention', () => {
    it('should handle invalid attribute names gracefully in SVG', () => {
      expect(() => {
        render(
          createElement('svg', {
            'invalid attr name': 'should-be-ignored',
            'valid-attr': 'should-work',
            xmlns: 'http://www.w3.org/2000/svg'
          })
        );
      }).not.toThrow();

      const svg = render(
        createElement('svg', {
          'invalid attr name': 'should-be-ignored',
          'valid-attr': 'should-work',
          xmlns: 'http://www.w3.org/2000/svg'
        })
      ) as SVGSVGElement;

      // Invalid attribute should be skipped
      expect(svg.getAttribute('invalid attr name')).toBeNull();

      // Valid attributes should work
      expect(svg.getAttribute('valid-attr')).toBe('should-work');
      expect(svg.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
    });
  });
});
