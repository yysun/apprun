import { createElement, updateElement } from '../src/vdom-my';

describe('VDOM Attribute Normalization Tests', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const render = (vdom) => {
    updateElement(container, vdom);
    return container.firstChild as HTMLElement;
  };

  describe('React-style Attribute Normalization', () => {
    it('should normalize className to class', () => {
      const element = render(createElement('div', {
        className: 'my-class'
      }));

      expect(element.className).toBe('my-class');
      expect(element.getAttribute('class')).toBe('my-class');
    });

    it('should normalize htmlFor to for', () => {
      const element = render(createElement('label', {
        htmlFor: 'my-input'
      }));

      expect(element.getAttribute('for')).toBe('my-input');
      expect((element as HTMLLabelElement).htmlFor).toBe('my-input');
    });

    it('should normalize acceptCharset to accept-charset', () => {
      const element = render(createElement('form', {
        acceptCharset: 'UTF-8'
      }));

      expect(element.getAttribute('accept-charset')).toBe('UTF-8');
    });

    it('should normalize autoComplete to autocomplete', () => {
      const element = render(createElement('input', {
        autoComplete: 'name'
      }));

      expect(element.getAttribute('autocomplete')).toBe('name');
    });

    it('should normalize autoFocus to autofocus', () => {
      const element = render(createElement('input', {
        autoFocus: true
      }));

      expect(element.hasAttribute('autofocus')).toBe(true);
    });

    it('should normalize tabIndex to tabindex', () => {
      const element = render(createElement('div', {
        tabIndex: 0
      }));

      expect(element.getAttribute('tabindex')).toBe('0');
      expect((element as HTMLElement).tabIndex).toBe(0);
    });

    it('should normalize readOnly to readonly', () => {
      const element = render(createElement('input', {
        readOnly: true
      }));

      expect(element.hasAttribute('readonly')).toBe(true);
    });

    it('should normalize contentEditable to contenteditable', () => {
      const element = render(createElement('div', {
        contentEditable: 'true'
      }));

      expect(element.getAttribute('contenteditable')).toBe('true');
    });

    it('should normalize spellCheck to spellcheck', () => {
      const element = render(createElement('input', {
        spellCheck: false
      }));

      expect(element.getAttribute('spellcheck')).toBe('false');
    });

    it('should normalize maxLength to maxlength', () => {
      const element = render(createElement('input', {
        maxLength: 10
      }));

      expect(element.getAttribute('maxlength')).toBe('10');
    });
  });

  describe('Multiple Attribute Normalization', () => {
    it('should normalize multiple React-style attributes simultaneously', () => {
      const element = render(createElement('input', {
        className: 'form-input',
        htmlFor: 'unused', // Will be ignored on input
        autoComplete: 'email',
        autoFocus: true,
        tabIndex: 1,
        readOnly: false,
        maxLength: 50,
        spellCheck: true
      }));

      expect(element.className).toBe('form-input');
      expect(element.getAttribute('autocomplete')).toBe('email');
      expect(element.hasAttribute('autofocus')).toBe(true);
      expect(element.getAttribute('tabindex')).toBe('1');
      expect(element.getAttribute('maxlength')).toBe('50');
      expect(element.getAttribute('spellcheck')).toBe('true');
    });
  });

  describe('Data and Aria Attribute Handling', () => {
    it('should handle data- attributes correctly', () => {
      const element = render(createElement('div', {
        'data-testid': 'my-component',
        'data-value': 'test-value'
      }));

      expect(element.getAttribute('data-testid')).toBe('my-component');
      expect(element.getAttribute('data-value')).toBe('test-value');
      expect(element.dataset.testid).toBe('my-component');
      expect(element.dataset.value).toBe('test-value');
    });

    it('should handle aria- attributes correctly', () => {
      const element = render(createElement('button', {
        'aria-label': 'Close dialog',
        'aria-expanded': 'false',
        'aria-hidden': 'true'
      }));

      expect(element.getAttribute('aria-label')).toBe('Close dialog');
      expect(element.getAttribute('aria-expanded')).toBe('false');
      expect(element.getAttribute('aria-hidden')).toBe('true');
    });

    it('should normalize mixed React and standard attributes', () => {
      const element = render(createElement('div', {
        className: 'container',
        'data-component': 'test',
        'aria-label': 'Main content',
        tabIndex: 0,
        role: 'main'
      }));

      expect(element.className).toBe('container');
      expect(element.getAttribute('data-component')).toBe('test');
      expect(element.getAttribute('aria-label')).toBe('Main content');
      expect(element.getAttribute('tabindex')).toBe('0');
      expect(element.getAttribute('role')).toBe('main');
    });
  });

  describe('SVG Attribute Handling', () => {
    it('should handle SVG-specific attributes', () => {
      const element = render(createElement('svg', {
        viewBox: '0 0 100 100',
        xmlns: 'http://www.w3.org/2000/svg'
      }));

      expect(element.getAttribute('viewBox')).toBe('0 0 100 100');
      expect(element.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined values correctly', () => {
      const element = render(createElement('div', {
        className: null,
        tabIndex: undefined,
        'data-value': ''
      }));

      // null/undefined className should not set class attribute
      expect(element.hasAttribute('class')).toBe(false);
      expect(element.hasAttribute('tabindex')).toBe(false);

      // Empty string should still set the attribute
      expect(element.getAttribute('data-value')).toBe('');
    });

    it('should handle attribute updates correctly', () => {
      // Initial render
      let element = render(createElement('div', {
        className: 'initial'
      }));

      expect(element.className).toBe('initial');

      // Update with normalized attribute
      element = render(createElement('div', {
        className: 'updated'
      }));

      expect(element.className).toBe('updated');
    });

    it('should not break with empty props', () => {
      const element = render(createElement('div', {}));
      expect(element.tagName).toBe('DIV');
      expect(element.attributes.length).toBe(0);
    });

    it('should not break with null props', () => {
      const element = render(createElement('div', null));
      expect(element.tagName).toBe('DIV');
      expect(element.attributes.length).toBe(0);
    });
  });

  describe('Backward Compatibility', () => {
    it('should still work with standard HTML attributes', () => {
      const element = render(createElement('input', {
        type: 'text',
        value: 'test',
        class: 'standard-class',
        id: 'my-input'
      }));

      expect(element.getAttribute('type')).toBe('text');
      expect((element as HTMLInputElement).value).toBe('test');
      expect(element.className).toBe('standard-class');
      expect(element.id).toBe('my-input');
    });
  });
});
