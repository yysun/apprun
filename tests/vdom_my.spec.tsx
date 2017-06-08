import { } from 'jasmine';
import { h, updateElement } from '../vdom-my';


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
    const element = render(h('div', null));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('');
  });

  it('should create element with text', () => {
    const element = render(h('div', null, 'x'));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('x');
  });

  it('should create element with number', () => {
    const element = render(h('div', null, 0));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('0');
  });

  it('should create element without text', () => {
    const element = render(h('div', null, ''));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('');
  });

  it('should replace element\'s text', () => {
    const element = render(h('div', null, 'x'));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('x');
    render(h('div', null, 'xx'));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('xx');
  });

  it('should re-create element', () => {
    const element = render(h('div', null, 'x'));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('x');
    render(h('p', null, 'xx'));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('x');
    expect(root.firstChild.nodeName).toEqual('P');
    expect(root.firstChild.textContent).toEqual('xx');
  });

  it('should replace element with text', () => {
    let element = render(h('div', null,
      h('div', null, 'x')));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('x');
    element = render(h('div', null, 'xx'));
    expect(root.firstChild.nodeName).toEqual('DIV');
    expect(root.firstChild.textContent).toEqual('xx');
    expect(root.firstChild.children.length).toEqual(0);
  });

  it('it should update className', () => {

    const element = render(h('div', { className: 'a' }, 'x'));
    expect(element.className).toEqual('a');
    render(h('div', { className: 'a b' }, 'xx'));
    expect(element.className).toEqual('a b');
  });

  it('it should reset and apply new style', () => {

    let element = render(h('div', null, 'x'));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('x');
    render(h("div", { style: { left: '5px' } }));
    expect(element.style.left).toEqual('5px');
    render(h("div", { style: { top: '50px' } }));
    expect(element.style.top).toEqual('50px');
    expect(element.style.left).toEqual('');
  });

  it('it should flatten children', () => {
    const nodes = [1, 2, 3].map(i => h("li", null, i));
    const node = h("ul", null, nodes);
    expect(node.children.length).toEqual(3);
  });

  it('it should render array of nodes', () => {
    const element = render(h('div', 'a'));
    let nodes = {
      tag: "div",
      props: null,
      children: [h('div', null, 'x'), h('div', null, 'xx')]
    };
    render(nodes);
    expect(element.childNodes[0].textContent).toEqual('x');
    expect(element.childNodes[1].textContent).toEqual('xx');
  });

  it('it should render array of text', () => {
    const element = render(h('div', 'a'));
    const nodes =
      { "tag": "div", "props": null, "children": [{ "tag": "div", "props": null, "children": ["Hello: ", "world"] }] }
    for (let i = 0; i < 5; i++){
      render(nodes);
      expect(element.textContent).toEqual('Hello: world');
    }
  });

  it('it should reuse element based on key', () => {
    const element = render(h('div', null, [
        h('div', {key: 'a'}), 
        h('div', {key: 'b'}),
      ]));
    element.childNodes[1].k = 'b';
    render(h('div', null, [
      h('div', {key: 'b'}, 'x')
    ]));

    expect(element.firstChild.textContent).toEqual('x');
    expect(element.firstChild.k).toBe('b')
    expect(element.childNodes.length).toBe(1)
  });

  it('it should retain element based on key', () => {
    const element = render(h('div', null, [
        h('div', {key: 'a'}), 
        h('div', {key: 'b'}),
      ]));
    element.childNodes[0].k = 'a';
    element.childNodes[1].k = 'b';
    render(h('div', null, [
      h('div', {key: 'b'}, 'x'),
      h('div', {key: 'a'}, 'xx')
    ]));

    expect(element.childNodes[0].textContent).toEqual('x');
    expect(element.childNodes[0].k).toBe('b')
    
    expect(element.childNodes[1].textContent).toEqual('xx');
    expect(element.childNodes[1].k).toBe('a')
  });

});
