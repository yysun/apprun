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
    return root.firstChild;
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

  it('it should update className', () => {

    render(h('div', {className: 'a'}, 'x'));
    const element = root.firstChild;
    expect(element.className).toEqual('a');
    render(h('div', {className: 'a b'}, 'xx'));
    expect(element.className).toEqual('a b');

  });

  it('it should reset and apply new style', () => {

    let element = render(h('div', null, 'x'));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('x');


    // render(h("div", {
    //   style: style,
    // //   onmousedown: function (e) {},
    // //   onmousemove: function (e) {},
    // //   onmouseup: function (e) {}
    // }));

    element = render(h("div", { style: {left: '5px'}}));
    expect(element.style.left).toEqual('5px');

    render(h("div", { style: {top: '50px'}}));
    expect(element.style.top).toEqual('50px');
    expect(element.style.left).toEqual('');

  });

});
