import { createElement, updateElement } from '../src/vdom-my';

describe('vdom-my', () => {
  let root;
  beforeEach(() => {
    root = document.createElement('div');
  });

  function render(vnode) {
    updateElement(root, vnode);
    return root.firstChild;
  }

  it('should create element', () => {
    const element = render(createElement('div', null));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('');
  });

  it('should create element with text', () => {
    const element = render(createElement('div', null, 'x'));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('x');
  });

  it('should create element with number', () => {
    const element = render(createElement('div', null, 0));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('0');
  });

  it('should create element without text', () => {
    const element = render(createElement('div', null, ''));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('');
  });

  it('should replace element\'s text', () => {
    const element = render(createElement('div', null, 'x'));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('x');
    render(createElement('div', null, 'xx'));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('xx');
  });

  it('should re-create element', () => {
    const element = render(createElement('div', null, 'x'));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('x');
    render(createElement('p', null, 'xx'));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('x');
    expect(root.firstChild.nodeName).toEqual('P');
    expect(root.firstChild.textContent).toEqual('xx');
  });

  it('should replace element with text', () => {
    let element = render(createElement('div', null,
      createElement('div', null, 'x')));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('x');
    element = render(createElement('div', null, 'xx'));
    expect(root.firstChild.nodeName).toEqual('DIV');
    expect(root.firstChild.textContent).toEqual('xx');
    expect(root.firstChild.children.length).toEqual(0);
  });

  it('it should update className', () => {

    const element = render(createElement('div', { className: 'a' }, 'x'));
    expect(element.className).toEqual('a');
    render(createElement('div', { className: 'a b' }, 'xx'));
    expect(element.className).toEqual('a b');
  });

  it('it should reset and apply new style', () => {
    let element = render(createElement('div', null, 'x'));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('x');
    render(createElement("div", { style: { left: '5px' } }));
    expect(element.style.left).toEqual('5px');
    render(createElement("div", { style: { top: '50px' } }));
    expect(element.style.top).toEqual('50px');
    expect(element.style.left).toEqual('');
  });

  it('it should reset class and style', () => {
    let element = render(createElement('div', {
      className: 'a',
      style: { left: '5px' }
    }, 'x'));
    expect(element.nodeName).toEqual('DIV');
    expect(element.className).toEqual('a');
    expect(element.textContent).toEqual('x');
    expect(element.style.left).toEqual('5px');
    render(createElement("div", null));
    expect(element.style.left).toEqual('');
    expect(element.className).toEqual('');
  });

  it('it should flatten children', () => {
    const nodes = [1, 2, 3].map(i => createElement("li", null, i));
    const node = createElement("ul", null, nodes);
    expect(node.children.length).toEqual(3);
  });

  it('it should render array of nodes', () => {
    const element = render(createElement('div', null, 'a'));
    let nodes = {
      tag: "div",
      props: null,
      children: [createElement('div', null, 'x'), createElement('div', null, 'xx')]
    };
    render(nodes);
    expect(element.childNodes[0].textContent).toEqual('x');
    expect(element.childNodes[1].textContent).toEqual('xx');
  });

  it('it should render array of text', () => {
    const element = render(createElement('div', null, 'a'));
    const nodes =
      { "tag": "div", "props": null, "children": [{ "tag": "div", "props": null, "children": ["Hello: ", "world"] }] }
    for (let i = 0; i < 5; i++){
      render(nodes);
      expect(element.textContent).toEqual('Hello: world');
    }
  });

  it('it should reuse element based on key', () => {
    const element = render(createElement('div', null, [
        createElement('div', {key: 'a'}),
        createElement('div', {key: 'b'}),
      ]));
    element.childNodes[1].k = 'b';
    render(createElement('div', null, [
      createElement('div', {key: 'b'}, 'x')
    ]));

    expect(element.firstChild.textContent).toEqual('x');
    expect(element.firstChild.k).toBe('b')
    expect(element.childNodes.length).toBe(1)
  });

  it('it should retain element based on key', () => {
    const element = render(createElement('div', null, [
        createElement('div', {key: 'a'}),
        createElement('div', {key: 'b'}),
      ]));
    element.childNodes[0].k = 'a';
    element.childNodes[1].k = 'b';
    render(createElement('div', null, [
      createElement('div', {key: 'b'}, 'x'),
      createElement('div', {key: 'a'}, 'xx')
    ]));

    expect(element.childNodes[0].textContent).toEqual('x');
    expect(element.childNodes[0].k).toBe('b')

    expect(element.childNodes[1].textContent).toEqual('xx');
    expect(element.childNodes[1].k).toBe('a')
  });


  it('it should remove element', () => {
    const element = render(createElement('div', null,
      createElement('input', null),
      createElement('input', null),
      createElement('input', null)
    ));
    expect(element.childNodes.length).toBe(3)

    render(createElement('div', null,
      createElement('img', null),
      null,
      createElement('img', null),
    ));
    expect(element.childNodes.length).toBe(2)
    expect(element.outerHTML).toBe('<div><img><img></div>');
  });

  it('it should remove text child', () => {
    root.innerHTML = "text";
    const element = root;

    render(createElement('div', null,
      createElement('img', null),
      null,
      createElement('img', null),
    ));
    expect(element.childNodes.length).toBe(1)
    expect(element.outerHTML).toBe('<div><div><img><img></div></div>');
  });

  it('it should remove children', () => {
    root.innerHTML = "<div>1</div><div>2</div>";
    const element = root;

    render(createElement('div', null,
      createElement('img', null),
      null,
      createElement('img', null),
    ));
    expect(element.childNodes.length).toBe(1)
    expect(element.outerHTML).toBe('<div><div><img><img></div></div>');
  });
});
