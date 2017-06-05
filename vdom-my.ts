type VNode = {
  tag: string,
  props: {},
  children: Array<VNode | string>
}

type Element = any; //HTMLElement | SVGSVGElement | SVGElement;

export const h = (tag: string | Function, props: {}, ...children) => {
  const ch = children.map(c=>(typeof c === 'function' || typeof c === 'object') ? c: c.toString())
  if (typeof tag === 'string') return { tag, props, children: ch };
  console.log('h', tag, props, children)
  return tag(props, ch)
};

export const updateElement = render;

function render(element: Element, node: VNode) {
  // console.log('render', element, node);
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
      element.textContent = child;
    } else {
      update(element.childNodes[i], child);
    }
  }

  let n = element.childNodes.length;
  while (n > len) {
    element.removeChild(element.lastChild);
    n--;
  }

  for (let i=len; i<node.children.length; i++) {
    element.append(create(node.children[i]));
  }

  element.style.cssText = '';
  element.className = '';
  for(let p in element) {
    if(p.indexOf('on') === 0 && element[p])
      element[p] = null
  }
  setProps(element, node.props);
}

function same(el: Element, node: VNode) {
  if (!el || !node) return false;
  const key1 = el['key'] || el.id || el.nodeName;
  const key2 = (node.props && (node.props['key'] || node.props['id'])) || node.tag || '';
  return key1.toLowerCase() === key2.toLowerCase();
}

function create(node: VNode | string) : Text | HTMLElement | SVGSVGElement {
  console.assert(node !== null && node !== undefined);
  // console.log('create', node, typeof node);

  if (typeof node === "string") return document.createTextNode(node);

  const element = (node.tag === "svg")
        ? document.createElementNS("http://www.w3.org/2000/svg", node.tag)
        : document.createElement(node.tag);

  setProps(element, node.props);

  if (node.children) node.children.forEach(child => {
    element.appendChild(create(child));
  });

  return element
}

function setProps(element: Element, props: {}) {
  console.assert(!!element);
  // console.log('setProps', element, props);

  if (!props) return;

  for(let name in props) {
    const value = props[name];
    if (name === 'style') {
      for(let s in value) {
        element.style[s] = value[s];
      }
    } else {
      element[name] = value;
    }
  }
}
