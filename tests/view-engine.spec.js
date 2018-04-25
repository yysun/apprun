const toHTML = require('../viewEngine')('html');

describe('view engine', () => {
  it('should not convert vnode to HTML', () => {
    const html = toHTML({ tag: 'div', props: null, children: null});
    expect(html).toBe('<div></div>')
  });

  it('should not convert vnode array to HTML', () => {
    const html = toHTML([
      { tag: 'div', props: null, children: null },
      { tag: 'p', props: null, children: null }
    ]);
    expect(html).toBe('<div></div><p></p>');
  });

  it('should not convert vnode children to HTML', () => {
    const html = toHTML({
      tag: 'div', props: null, children: [
        { tag: 'p', props: null, children: null }]
    });
    expect(html).toBe('<div><p></p></div>');
  });

  it('should not convert vnode props HTML', () => {
    const html = toHTML({ tag: 'div', props: {id: 1}, children: null });
    expect(html).toBe('<div id="1"></div>')
  });

  it('should not convert vnode data attr HTML', () => {
    const html = toHTML({ tag: 'div', props: { 'data-a': 'a' }, children: null });
    expect(html).toBe('<div data-a="a"></div>')
  });

  it('should not convert vnode style props HTML', () => {
    const html = toHTML({
      tag: 'div',
      props: { id: 1, style: { color: 'red' } },
      children: null
    });
    expect(html).toBe('<div id="1" style="color:red"></div>')
  });

  it('should not convert vnode style props HTML', () => {
    const html = toHTML({
      tag: 'div', props: {
        id: 1,
        style: { color: 'red', 'background-color': 'green' }
      },
      children: null
    });
    expect(html).toBe('<div id="1" style="color:red;background-color:green"></div>')
  });
})