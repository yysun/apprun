type VNode = {
  tag: string,
  props: {},
  children: Array<VNode | string>
}

type Element = any; //HTMLElement | SVGSVGElement | SVGElement;

const ATTR_PROPS = '_props';

export const h = (tag: string | Function, props: {}, ...children) => {
  let ch = [];
  const push = (c) => {
    ch.push((typeof c === 'function' || typeof c === 'object') ? c : `${c}`);
  }
  children.forEach(c => {
    if (Array.isArray(c)) {
      c.forEach(i => push(i));
    } else {
      push(c);
    }
  });
  if (typeof tag === 'string') return { tag, props, children: ch };
  return tag(props, ch);
};

export const updateElement = render;

function render(element: Element, node: VNode) {
  // console.log('render', element, node);
  if (!node || !element) return;
  if (!element.firstChild) {
    element.appendChild(create(node));
  } else {
    update(element.firstChild, node);
  }
}

function update(element: Element, node: VNode) {
  console.assert(!!element);
  //console.log('update', element, node);

  if (!same(element, node)) {
    element.parentNode.replaceChild(create(node), element);
    return;
  }

  //console.log('update', element, node);
  const len = Math.min(element.childNodes.length, node.children.length);
  for (let i=0; i<len; i++) {
    const child = node.children[i];
    if (typeof child === 'string') {
      if (element.childNodes[i].textContent !== child)
        element.replaceChild(document.createTextNode(child), element.childNodes[i]);
    } else {
      update(element.childNodes[i], child);
    }
  }

  let n = element.childNodes.length;
  while (n > len) {
    element.removeChild(element.lastChild);
    n--;
  }

  if (node.children.length) {
    const d = document.createDocumentFragment();
    for (let i=len; i<node.children.length; i++) {
      d.appendChild(create(node.children[i]));
    }
    element.appendChild(d);
  }

  updateProps(element, node.props);
}

function same(el: Element, node: VNode) {
  if (!el || !node) return false;
  const key1 = `${el.nodeName}`;
  const key2 = `${node.tag || ''}`;
  return key1.toLowerCase() === key2.toLowerCase();
}

function create(node: VNode | string) : Element {
  console.assert(node !== null && node !== undefined);
  // console.log('create', node, typeof node);

  if (typeof node === "string") return document.createTextNode(node);

  const element = (node.tag === "svg")
        ? document.createElementNS("http://www.w3.org/2000/svg", node.tag)
        : document.createElement(node.tag);

  setProps(element, node.props);

  if (node.children) node.children.forEach(child => element.appendChild(create(child)));

  return element
}

function setProps(element: Element, props: {}) {
  console.assert(!!element);
  if (!props) return;
  // console.log('setProps', element, props);

  element[ATTR_PROPS] = props;
  for(let name in props) {
    const value = props[name];
    if (name === 'style') {
      for (let s in value) {
        element.style[s] = value[s];
      }
    } else {
      element[name] = value;
    }
  }
}

function mergeProps(a:{}, b:{}) :{} {
  const props = [];
  if(a) Object.keys(a).forEach(p=>props[p]=null);
  if(b) Object.keys(b).forEach(p=>props[p]=b[p]);
  return props;
}

function updateProps(element: Element, props: {}) {
  console.assert(!!element);
  // console.log('updateProps', element, props);

  props = mergeProps(element[ATTR_PROPS], props);
  element[ATTR_PROPS] = props;
  for(let name in props) {
    const value = props[name];
    if (name === 'style') {
      if (element.style.cssText) element.style.cssText = '';
      for (let s in value) {
        if (element.style[s] !== value[s]) element.style[s] = value[s];
      }
    } else {
      if (element[name] !== value) element[name] = value;
    }
  }
}