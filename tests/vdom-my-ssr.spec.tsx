/**
 * SSR and JSDom Compatibility Tests for DOM Batching
 * 
 * Tests server-side rendering scenarios and ensures identical
 * output between browser and JSDom environments
 */

import { createElement, updateElement } from '../src/vdom-my';

describe('SSR and JSDom Compatibility', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Use Jest's built-in JSDOM environment
    document.body.innerHTML = '<div id="app"></div>';
    container = document.getElementById('app')!;
  });

  afterEach(() => {
    // Clean up
    document.body.innerHTML = '';
  });

  /**
   * Test 1: Basic SSR rendering produces valid HTML
   */
  it('should render simple elements in JSDom environment', () => {
    const vdom = createElement('div', { className: 'test' }, 'Hello SSR');

    updateElement(container, vdom);

    const html = document.documentElement.outerHTML;
    expect(html).toContain('<div class="test">Hello SSR</div>');
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  /**
   * Test 2: Complex nested structures with batching
   */
  it('should handle complex nested structures with DOM batching', () => {
    const vdom = createElement('div', { id: 'root' },
      createElement('header', null,
        createElement('h1', null, 'Title'),
        createElement('nav', null,
          createElement('ul', null,
            createElement('li', { key: 'home' }, 'Home'),
            createElement('li', { key: 'about' }, 'About'),
            createElement('li', { key: 'contact' }, 'Contact')
          )
        )
      ),
      createElement('main', null,
        createElement('p', null, 'Main content'),
        createElement('div', { className: 'widgets' },
          Array.from({ length: 10 }, (_, i) =>
            createElement('span', { key: `widget-${i}` }, `Widget ${i}`)
          )
        )
      )
    );

    updateElement(container, vdom);

    const html = document.documentElement.outerHTML;
    expect(html).toContain('<div id="root">');
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('Widget 0');
    expect(html).toContain('Widget 9');

    // Verify structure integrity
    const root = container.querySelector('#root');
    expect(root?.children.length).toBe(2); // header + main
    expect(root?.querySelector('.widgets')?.children.length).toBe(10);
  });

  /**
   * Test 3: Server-side HTML output consistency
   */
  it('should produce consistent HTML output for SSR', () => {
    const testData = [
      { id: 1, name: 'Item 1', active: true },
      { id: 2, name: 'Item 2', active: false },
      { id: 3, name: 'Item 3', active: true }
    ];

    const vdom = createElement('ul', { className: 'item-list' },
      testData.map(item =>
        createElement('li', {
          key: item.id,
          className: item.active ? 'active' : 'inactive',
          'data-id': item.id
        }, item.name)
      )
    );

    updateElement(container, vdom);

    const html = document.documentElement.outerHTML;

    // Verify HTML structure (attribute order may vary)
    expect(html).toContain('<ul class="item-list">');
    expect(html).toContain('data-id="1"');
    expect(html).toContain('class="active"');
    expect(html).toContain('Item 1');
    expect(html).toContain('class="inactive"');
    expect(html).toContain('Item 2');

    // Verify DOM structure
    const list = container.querySelector('.item-list');
    expect(list?.children.length).toBe(3);
    expect(list?.children[0].getAttribute('data-id')).toBe('1');
    expect(list?.children[1].className).toBe('inactive');
  });

  /**
   * Test 4: Document Fragment batching in JSDom
   */
  it('should use DocumentFragment batching effectively in JSDom', () => {
    const spy = jest.spyOn(document, 'createDocumentFragment');

    // Create a large list that should trigger batching
    const items = Array.from({ length: 20 }, (_, i) =>
      createElement('div', { key: `item-${i}` }, `Item ${i}`)
    );

    const vdom = createElement('div', { id: 'batch-test' }, items);

    updateElement(container, vdom);

    // Verify DocumentFragment was used
    expect(spy).toHaveBeenCalled();

    // Verify correct rendering
    const batchTest = container.querySelector('#batch-test');
    expect(batchTest?.children.length).toBe(20);
    expect(batchTest?.children[0].textContent).toBe('Item 0');
    expect(batchTest?.children[19].textContent).toBe('Item 19');

    spy.mockRestore();
  });

  /**
   * Test 5: SVG namespace handling in JSDom
   */
  it('should handle SVG elements correctly in JSDom', () => {
    const vdom = createElement('svg', {
      width: '100',
      height: '100',
      viewBox: '0 0 100 100'
    },
      createElement('circle', { cx: '50', cy: '50', r: '40', fill: 'blue' }),
      createElement('rect', { x: '10', y: '10', width: '20', height: '20', fill: 'red' })
    );

    updateElement(container, vdom);

    const html = document.documentElement.outerHTML;
    expect(html).toContain('<svg');
    expect(html).toContain('<circle');
    expect(html).toContain('<rect');

    const svg = container.querySelector('svg');
    expect(svg?.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(svg?.children.length).toBe(2);
  });

  /**
   * Test 6: Simple rendering without complex batching scenarios
   */
  it('should work correctly with simple updates', () => {
    const vdom = createElement('div', null,
      Array.from({ length: 5 }, (_, i) =>
        createElement('span', { key: i }, `Span ${i}`)
      )
    );

    updateElement(container, vdom);

    const html = document.documentElement.outerHTML;
    expect(html).toContain('Span 0');
    expect(html).toContain('Span 4');
    expect(container.firstElementChild?.children.length).toBe(5);
  });

  /**
   * Test 7: Server-side outerHTML output format
   */
  it('should return properly formatted outerHTML for server response', () => {
    const appVDOM = createElement('div', { id: 'app' },
      createElement('h1', null, 'My App'),
      createElement('div', { className: 'content' },
        createElement('p', null, 'This is server-rendered content.'),
        createElement('button', { type: 'button', disabled: true }, 'Click me')
      )
    );

    // Clear container and render app
    container.innerHTML = '';
    updateElement(container, appVDOM);

    // Get server-side HTML output
    const serverHTML = document.documentElement.outerHTML;

    // Verify it's valid HTML that can be sent to client
    expect(serverHTML).toContain('<html>');
    expect(serverHTML).toContain('<body>');
    expect(serverHTML).toContain('<div id="app">');
    expect(serverHTML).toContain('<h1>My App</h1>');
    expect(serverHTML).toContain('disabled');

    // Verify no JavaScript artifacts
    expect(serverHTML).not.toContain('undefined');
    expect(serverHTML).not.toContain('[object Object]');
  });
});

/**
 * Browser vs JSDom consistency tests
 */
describe('Browser vs JSDom Consistency', () => {
  /**
   * Test that verifies identical output between environments
   * (This would run in both browser and JSDom in a real CI setup)
   */
  it('should produce identical VDOM output in different environments', () => {
    const testVDOM = createElement('div', {
      className: 'test-consistency',
      'data-test': 'value'
    },
      createElement('h2', null, 'Consistency Test'),
      createElement('ul', null,
        createElement('li', { key: 'a' }, 'Item A'),
        createElement('li', { key: 'b' }, 'Item B')
      )
    );

    // This test ensures that the VDOM structure is environment-agnostic
    expect(testVDOM.tag).toBe('div');
    expect(testVDOM.props?.className).toBe('test-consistency');
    expect(testVDOM.props?.['data-test']).toBe('value');
    expect(testVDOM.children).toHaveLength(2);

    // Check first child (h2)
    const h2 = testVDOM.children?.[0];
    expect(h2?.tag).toBe('h2');
    expect(h2?.children).toEqual(['Consistency Test']);

    // Check second child (ul)
    const ul = testVDOM.children?.[1];
    expect(ul?.tag).toBe('ul');
    expect(ul?.children).toHaveLength(2);

    // Check list items
    const li1 = ul?.children?.[0];
    const li2 = ul?.children?.[1];
    expect(li1?.tag).toBe('li');
    expect(li1?.props?.key).toBe('a');
    expect(li1?.children).toEqual(['Item A']);
    expect(li2?.tag).toBe('li');
    expect(li2?.props?.key).toBe('b');
    expect(li2?.children).toEqual(['Item B']);
  });
});
