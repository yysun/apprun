/**
 * @jest-environment jsdom
 */

import { createElement, updateElement } from '../src/vdom-my';
import { updateProps } from '../src/vdom-my-prop-attr';

describe('VDOM Boolean Attributes Tests', () => {
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
    return container.firstChild as HTMLElement;
  };

  describe('HTML5 Boolean Attributes', () => {
    it('should handle standard boolean attributes correctly', () => {
      const element = render(
        createElement('input', {
          type: 'checkbox',
          checked: true,
          disabled: false,
          readonly: true,
          required: false
        })
      );

      const input = element as HTMLInputElement;

      // checked=true should set the attribute
      expect(input.hasAttribute('checked')).toBe(true);
      expect(input.getAttribute('checked')).toBe('checked');

      // disabled=false should not set the attribute
      expect(input.hasAttribute('disabled')).toBe(false);

      // readonly=true should set the attribute
      expect(input.hasAttribute('readonly')).toBe(true);
      expect(input.getAttribute('readonly')).toBe('readonly');

      // required=false should not set the attribute
      expect(input.hasAttribute('required')).toBe(false);
    });

    it('should handle string boolean values correctly', () => {
      const element = render(
        createElement('input', {
          type: 'text',
          disabled: 'false',  // String "false" should remove attribute
          readonly: 'true',   // String "true" should set attribute
          required: 'disabled', // Any other string should set attribute
          autofocus: ''       // Empty string should remove attribute
        })
      );

      const input = element as HTMLInputElement;

      expect(input.hasAttribute('disabled')).toBe(false);
      expect(input.hasAttribute('readonly')).toBe(true);
      expect(input.hasAttribute('required')).toBe(true);
      expect(input.hasAttribute('autofocus')).toBe(false);
    });

    it('should handle various falsy values correctly', () => {
      const element = render(
        createElement('input', {
          type: 'checkbox',
          checked: null,      // null should remove attribute
          disabled: undefined, // undefined should remove attribute  
          readonly: 0,        // 0 should remove attribute
          required: '0',      // "0" should remove attribute
          multiple: false     // false should remove attribute
        })
      );

      const input = element as HTMLInputElement;

      expect(input.hasAttribute('checked')).toBe(false);
      expect(input.hasAttribute('disabled')).toBe(false);
      expect(input.hasAttribute('readonly')).toBe(false);
      expect(input.hasAttribute('required')).toBe(false);
      expect(input.hasAttribute('multiple')).toBe(false);
    });

    it('should handle video/audio boolean attributes', () => {
      const element = render(
        createElement('video', {
          controls: true,
          autoplay: false,
          loop: true,
          muted: 'false'
        })
      );

      const video = element as HTMLVideoElement;

      expect(video.hasAttribute('controls')).toBe(true);
      expect(video.hasAttribute('autoplay')).toBe(false);
      expect(video.hasAttribute('loop')).toBe(true);
      expect(video.hasAttribute('muted')).toBe(false); // "false" string should remove
    });

    it('should handle form boolean attributes', () => {
      const element = render(
        createElement('form', {
          novalidate: true  // Note: should be 'formnovalidate' for inputs, 'novalidate' for forms
        }, [
          createElement('input', {
            type: 'submit',
            formnovalidate: true,
            disabled: false
          })
        ])
      );

      const form = element as HTMLFormElement;
      const input = form.querySelector('input') as HTMLInputElement;

      // For form element, novalidate is a boolean attribute per HTML5 spec
      // It should be set to the attribute name when true
      expect(form.hasAttribute('novalidate')).toBe(true);
      expect(form.getAttribute('novalidate')).toBe('novalidate');

      // For input element, formnovalidate is a boolean attribute
      expect(input.hasAttribute('formnovalidate')).toBe(true);
      expect(input.getAttribute('formnovalidate')).toBe('formnovalidate');
      expect(input.hasAttribute('disabled')).toBe(false);
    });

    it('should handle case sensitivity correctly', () => {
      const element = render(
        createElement('input', {
          type: 'checkbox',
          checked: 'FALSE',  // Uppercase FALSE should remove attribute
          disabled: 'False', // Mixed case False should remove attribute
          readonly: 'TRUE'   // Uppercase TRUE should set attribute
        })
      );

      const input = element as HTMLInputElement;

      expect(input.hasAttribute('checked')).toBe(false);
      expect(input.hasAttribute('disabled')).toBe(false);
      expect(input.hasAttribute('readonly')).toBe(true);
    });
  });

  describe('Non-Boolean Attribute Comparison', () => {
    it('should not treat regular attributes as boolean', () => {
      const element = render(
        createElement('div', {
          id: false,        // Should set as string "false"
          title: '',        // Should set as empty string
          'data-value': 0   // Should set as string "0"
        })
      );

      const div = element as HTMLDivElement;

      // These are not boolean attributes, so they should be set as string values
      expect(div.getAttribute('id')).toBe('false');
      expect(div.getAttribute('title')).toBe('');
      expect(div.getAttribute('data-value')).toBe('0');
    });
  });

  describe('Dynamic Boolean Attribute Updates', () => {
    it('should properly update boolean attributes on re-render', () => {
      // Initial render with button (not protected like checkboxes)
      let element = render(
        createElement('button', {
          type: 'button',
          disabled: true,
          hidden: false
        })
      );

      let button = element as HTMLButtonElement;
      expect(button.hasAttribute('disabled')).toBe(true);
      expect(button.hasAttribute('hidden')).toBe(false);

      // Update the same element with new props
      updateProps(button, {
        type: 'button',
        disabled: false,
        hidden: true
      }, false);

      expect(button.hasAttribute('disabled')).toBe(false);
      expect(button.hasAttribute('hidden')).toBe(true);
    });
  });
});
