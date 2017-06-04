import { } from 'jasmine';
import { h, updateElement } from '../vdom-my';


fdescribe('vdom-my', () => {
  let root;
  beforeEach(()=>{
    root = document.createElement('div');
    root.textContent = '';
  });

  function render(vnode) {
    updateElement(root, vnode);
  }

  it('should create element', () => {
    render(h('div', null));
    const element = root.firstChild;
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('');
  });

  it('should create element with text', () => {
    render(h('div', null, 'x'));
    const element = root.firstChild;
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('x');
  });

  it('should replace element\s text', () => {
    render(h('div', null, 'x'));

    const element = root.firstChild;
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('x');

    render(h('div', null, 'xx'));

    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('xx');
  });

  it('should re-create element', () => {
    render(h('div', null, 'x'));
    const element = root.firstChild;
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('x');

    render(h('p', null, 'xx'));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('x');
    expect(root.firstChild.nodeName).toEqual('P');
    expect(root.firstChild.textContent).toEqual('xx');
  });

  it('should replace element with text', () => {
    render(h('div', null,
      h('div', null, 'x')));

    const element = root.firstChild.firstChild;
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('x');

    render(h('div', null, 'xx'));
    expect(root.firstChild.nodeName).toEqual('DIV');
    expect(root.firstChild.textContent).toEqual('xx');
    expect(root.firstChild.children.length).toEqual(0);
  });

});
