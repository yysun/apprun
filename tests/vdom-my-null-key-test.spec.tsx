// Test for key === null fallback behavior
import { createElement, updateElement } from '../src/vdom-my';

describe('key === null fallback behavior', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  const render = (vdom) => {
    updateElement(container, vdom);
    return container.firstChild as HTMLElement;
  };

  it('should treat key === null as unkeyed (replaceable)', () => {
    // Initial render with key === null
    let element = render(createElement('div', null, [
      createElement('span', { key: null }, 'null-key-1'),
      createElement('span', { key: 'keyed' }, 'keyed-element'),
      createElement('span', { key: null }, 'null-key-2')
    ]));

    expect(element.children.length).toBe(3);
    expect(element.children[0].textContent).toBe('null-key-1');
    expect(element.children[1].textContent).toBe('keyed-element');
    expect(element.children[2].textContent).toBe('null-key-2');

    // Update - null key elements should be replaceable
    element = render(createElement('div', null, [
      createElement('p', { key: null }, 'replaced-1'), // Different tag, key=null
      createElement('span', { key: 'keyed' }, 'keyed-updated'), // Same key
      createElement('div', { key: null }, 'replaced-2') // Different tag, key=null
    ]));

    expect(element.children.length).toBe(3);
    expect(element.children[0].tagName).toBe('P'); // Should be replaced
    expect(element.children[0].textContent).toBe('replaced-1');
    expect(element.children[1].tagName).toBe('SPAN'); // Should be preserved (keyed)
    expect(element.children[1].textContent).toBe('keyed-updated');
    expect(element.children[2].tagName).toBe('DIV'); // Should be replaced
    expect(element.children[2].textContent).toBe('replaced-2');
  });

  it('should handle mixed null keys, real keys, and no keys', () => {
    const element = render(createElement('div', null, [
      createElement('span', null, 'no-key'),           // no key
      createElement('span', { key: null }, 'null-key'), // null key  
      createElement('span', { key: 'real' }, 'real-key'), // real key
      createElement('span', { key: '' }, 'empty-key')   // empty string key
    ]));

    expect(element.children.length).toBe(4);
    expect(element.children[0].textContent).toBe('no-key');
    expect(element.children[1].textContent).toBe('null-key');
    expect(element.children[2].textContent).toBe('real-key');
    expect(element.children[3].textContent).toBe('empty-key');
  });
});
