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
    const element = render(createElement('div', null, 'x'));
    expect(element.nodeName).toEqual('DIV');
    expect(element.textContent).toEqual('x');
    render(createElement("div", { style: { left: '5px' } }));
    expect(element.style.left).toEqual('5px');
    render(createElement("div", { style: { top: '50px' } }));
    expect(element.style.top).toEqual('50px');
    expect(element.style.left).toEqual('');
  });

  it('it should reset class and style', () => {
    const element = render(createElement('div', {
      class: 'a',
      style: { left: '5px' }
    }, 'x'));
    expect(element.nodeName).toEqual('DIV');
    expect(element.className).toEqual('a');
    expect(element.textContent).toEqual('x');
    expect(element.style.left).toEqual('5px');
    render(createElement("div", null));
    expect(element.nodeName).toEqual('DIV');
    expect(element.style.left).toEqual('');
    expect(element.className).toEqual('');
    expect(element.textContent).toEqual('');
  });

  it('it should reset className and style', () => {
    const element = render(createElement('div', {
      className: 'a',
      style: { left: '5px' }
    }, 'x'));
    expect(element.nodeName).toEqual('DIV');
    expect(element.className).toEqual('a');
    expect(element.textContent).toEqual('x');
    expect(element.style.left).toEqual('5px');
    render(createElement("div", null));
    expect(element.nodeName).toEqual('DIV');
    expect(element.style.left).toEqual('');
    expect(element.className).toEqual('');
    expect(element.textContent).toEqual('');
  });

  it('it should flatten children', () => {
    const nodes = [1, 2, 3].map(i => createElement("li", null, i));
    const node = createElement("ul", null, nodes);
    expect(node.children.length).toEqual(3);
  });

  it('it should render array of nodes', () => {
    const element = render(createElement('div', null, 'a'));
    const nodes = {
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

  it('it should update textarea', () => {
    root.innerHTML = "<div><textarea></textarea></div>";
    render(createElement('textarea', null, "a"));
    expect(root.outerHTML).toBe('<div><textarea>a</textarea></div>');
    render(createElement('textarea', null, "b"));
    expect(root.outerHTML).toBe('<div><textarea>b</textarea></div>');
  });

  it('it should support DOM custom attribute', () => {
    const element = render(createElement('div', { "my-a": "a" }, ""));
    expect(element.getAttribute("my-a")).toBe('a');
  });

  it('it should allow to update DOM custom attribute', () => {
    let element = render(createElement('div', { "my": "a" }, ""));
    expect(element["my"]).toBe('a');
    element = render(createElement('div', { "my": "b" }, ""));
    expect(element["my"]).toBe('b');

  });

  it('it should support class attribute', () => {
    let element = render(createElement('div', { "className": "a"} ));
    expect(element.className).toBe('a');
    expect(element.getAttribute('class')).toBe('a');
    element = render(createElement('div', { "class": "b" }));
    expect(element.className).toBe('b');
  });

  it('it should support class attribute for svg', () => {
    let  element = render(createElement('svg', { "class": "a" }));
    expect(element.getAttribute('class')).toBe('a');
    element = render(createElement('svg', { "className": "b" }));
    expect(element.getAttribute('class')).toBe('b');
  });

  it('it should reset event handler', () => {
    const element = render(createElement('div', {
      class: 'a',
      onclick: () => {}
    }, 'x'));
    expect(element.nodeName).toEqual('DIV');
    expect(element.className).toEqual('a');
    expect(element.onclick).not.toBeNull();
    render(createElement("div", {className: 'b'}));
    expect(element.nodeName).toEqual('DIV');
    expect(element.className).toEqual('b');
    expect(element.onclick).toBeNull();
  });

  it('it should reset className with class', () => {
    const element = render(createElement('div', { className: 'a'}));
    expect(element.nodeName).toEqual('DIV');
    expect(element.className).toEqual('a');
    render(createElement("div", {class: 'b'}));
    expect(element.className).toEqual('b');
    render(createElement("div"));
    expect(element.className).toBe('');
    expect(element.getAttribute('class')).toBeNull();
  });

  it('it should reset class with className', () => {
    const element = render(createElement('div', { class: 'a'}));
    expect(element.nodeName).toEqual('DIV');
    expect(element.className).toEqual('a');
    render(createElement("div", {className: 'b'}));
    expect(element.className).toEqual('b');
    render(createElement("div"));
    expect(element.className).toBe('');
    expect(element.getAttribute('class')).toBeNull();
  });

  it('it should clear id', () => {
    const element = render(createElement('div', { id: 'a' }));
    render(createElement('div'));
    expect(element.id).toBe('');
  });

  const SVG_XML_URI = 'http://www.w3.org/2000/svg';
  const XMLNS_URI = 'http://www.w3.org/2000/xmlns/';
  const XLINK_XML_URI = 'http://www.w3.org/1999/xlink';
  const XML_URI = 'http://www.w3.org/XML/1998/namespace';

  // Make sure each allowed camel case to xml case attribute conversion happens.
  [ {camel: 'xlinkHref',    qualifiedName: 'xlink:href',    namespace: XLINK_XML_URI},
    {camel: 'xlinkType',    qualifiedName: 'xlink:type',    namespace: XLINK_XML_URI},
    {camel: 'xlinkRole',    qualifiedName: 'xlink:role',    namespace: XLINK_XML_URI},
    {camel: 'xlinkArcrole', qualifiedName: 'xlink:arcrole', namespace: XLINK_XML_URI},
    {camel: 'xlinkTitle',   qualifiedName: 'xlink:title',   namespace: XLINK_XML_URI},
    {camel: 'xlinkShow',    qualifiedName: 'xlink:show',    namespace: XLINK_XML_URI},
    {camel: 'xlinkActuate', qualifiedName: 'xlink:actuate', namespace: XLINK_XML_URI},
    {camel: 'xmlBase',      qualifiedName: 'xml:base',      namespace: XML_URI},
    {camel: 'xmlLang',      qualifiedName: 'xml:lang',      namespace: XML_URI},
    {camel: 'xmlSpace',     qualifiedName: 'xml:space',     namespace: XML_URI},
    {camel: 'xmlnsXlink',   qualifiedName: 'xmlns:xlink',   namespace: XMLNS_URI}
  ].forEach((substitution) => {
    const attrValue = 'http://www.example.com/whatever';

    it(`it should support XML camel cased attribute conversion for svg elements - ${substitution.camel}`, () => {
      const localName = substitution.qualifiedName.substring(substitution.qualifiedName.indexOf(":") + 1);

      const element = render(createElement('svg', { [substitution.camel]: attrValue }));
      expect(element.nodeName).toEqual('svg');
      expect(element.getAttribute(substitution.qualifiedName)).toEqual(attrValue);
      expect(element.getAttributeNS(substitution.namespace, localName)).toEqual(attrValue);
    });

    it(`it should support XML attribute for svg elements - ${substitution.qualifiedName}`, () => {
      const localName = substitution.qualifiedName.substring(substitution.qualifiedName.indexOf(":") + 1);

      const element = render(createElement('svg', { [substitution.qualifiedName]: attrValue }));
      expect(element.nodeName).toEqual('svg');
      expect(element.getAttribute(substitution.qualifiedName)).toEqual(attrValue);
      expect(element.getAttributeNS(substitution.namespace, localName)).toEqual(attrValue);
    });
  });

  it('it should not support XML attributes conversion for non svg elements', () => {
    const attrName = 'xlinkHref';
    const attrValue = 'http://www.example.com/whatever';

    const element = render(createElement('div', { [attrName]: attrValue }));

    expect(element.nodeName).toEqual('DIV');
    expect(element.getAttribute(attrName)).toEqual(null);
    expect(element.getAttribute("xlink:href")).toEqual(null);
  });

  it('it should be able to change attribute values', () => {
    const xlinkHrefAttrName = 'xlinkHref';
    const xlinkHrefAttrValue1 = 'http://www.example.com/whatever';
    const xlinkHrefAttrValue2 = 'http://www.example.com/somethingelse';

    const element = render(
      createElement('svg', { 'xmlns:xlink': XLINK_XML_URI, xmlns: SVG_XML_URI }, null,
        createElement('a', { [xlinkHrefAttrName]: xlinkHrefAttrValue1 }), null
    ));

    expect(element.nodeName).toEqual('svg');
    expect(element.firstChild.nodeName).toEqual('a');

    expect(element.firstChild.getAttributeNS(XLINK_XML_URI, 'href')).toEqual(xlinkHrefAttrValue1);
   
    render(
      createElement('svg', { 'xmlns:xlink': XLINK_XML_URI, xmlns: SVG_XML_URI }, null,
        createElement('a', { [xlinkHrefAttrName]: xlinkHrefAttrValue2 }), null
    ));

    expect(element.firstChild.getAttributeNS(XLINK_XML_URI, 'href')).toEqual(xlinkHrefAttrValue2);
  });

  it('it should work with lookupNamespaceURI', () => {
    const xlinkHrefAttrName = 'xlinkHref';
    const xlinkHrefAttrValue = 'http://www.example.com/whatever';

    const element = render(
      createElement('svg', { 'xmlns:xlink': XLINK_XML_URI, xmlns: SVG_XML_URI }, null,
        createElement('a', { [xlinkHrefAttrName]: xlinkHrefAttrValue }), null
    ));

    expect(element.nodeName).toEqual('svg');
    expect(element.firstChild.nodeName).toEqual('a');

    expect(element.lookupNamespaceURI("xlink")).toEqual(XLINK_XML_URI);
    expect(element.getAttributeNS(XMLNS_URI, "xlink")).toEqual(XLINK_XML_URI);
    expect(element.firstChild.getAttributeNS(XLINK_XML_URI, 'href')).toEqual(xlinkHrefAttrValue);
  });
});
