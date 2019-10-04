import createComponent from './createComponent';
import { VNode } from './types';
export type Element = any; //HTMLElement | SVGSVGElement | SVGElement;

const ATTR_PROPS = '_props';

function collect(children) {
  const ch = [];
  const push = (c) => {
    if (c !== null && c !== undefined && c !== '' && c !== false) {
      ch.push((typeof c === 'function' || typeof c === 'object') ? c : `${c}`);
    }
  }
  children && children.forEach(c => {
    if (Array.isArray(c)) {
      c.forEach(i => push(i));
    } else {
      push(c);
    }
  });
  return ch;
}

export function createElement(tag: string | Function | [], props?: {}, ...children) {
  const ch = collect(children);
  if (typeof tag === 'string') return { tag, props, children: ch };
  else if (Array.isArray(tag)) return tag; // JSX fragments - babel
  else if (tag === undefined && children) return ch; // JSX fragments - typescript
  else if (Object.getPrototypeOf(tag).__isAppRunComponent) return { tag, props, children: ch } // createComponent(tag, { ...props, children });
  else if (typeof tag === 'function') return tag(props, ch);
  else throw new Error(`Unknown tag in vdom ${tag}`);
};

const keyCache = {};

export const updateElement = render;

export function render(element: Element, nodes: VNode | VNode[], parent = {}) {
  // console.log('render', element, node);
  // tslint:disable-next-line
  if (nodes == null) return;

  nodes = createComponent(nodes, parent);

  if (!element) return;
  if (Array.isArray(nodes)) {
    updateChildren(element, nodes);
  } else {
    updateChildren(element, [nodes]);
  }
}

function same(el: Element, node: VNode) {
  // if (!el || !node) return false;
  const key1 = el.nodeName;
  const key2 = `${node.tag || ''}`;
  return key1.toUpperCase() === key2.toUpperCase();
}

function update(element: Element, node: VNode) {
  console.assert(!!element);
  //console.log('update', element, node);
  if (!same(element, node)) {
    element.parentNode.replaceChild(create(node), element);
    return;
  }
  updateChildren(element, node.children);
  updateProps(element, node.props);
}

function updateChildren(element, children) {
  const len = Math.min(element.childNodes.length, children.length);
  for (let i = 0; i < len; i++) {
    const child = children[i];
    const el = element.childNodes[i];
    if (child instanceof HTMLElement) {
      element.insertBefore(child, el);
    }
    else if (typeof child === 'string') {
      if (el.textContent !== child) {
        if (el.nodeType === 3) {
          el.textContent = child
        } else {
          element.replaceChild(createText(child), el);
        }
      }
    } else {
      const key = child.props && child.props['key'];
      if (key) {
        if (el.key === key) {
          update(element.childNodes[i], child);
        } else {
          const old = keyCache[key];
          if (old) {
            element.insertBefore(old, el);
            element.appendChild(el);
            update(element.childNodes[i], child);
          } else {
            element.insertBefore(create(child), el);
          }
        }
      } else {
        update(element.childNodes[i], child);
      }
    }
  }

  let n = element.childNodes.length;
  while (n > len) {
    element.removeChild(element.lastChild);
    n--;
  }

  if (children.length > len) {
    const d = document.createDocumentFragment();
    for (let i = len; i < children.length; i++) {
      d.appendChild(create(children[i]));
    }
    element.appendChild(d);
  }
}

function createText(node) {
  if (node.indexOf('_html:') === 0) { // ?
    const div = document.createElement('div');
    div.insertAdjacentHTML('afterbegin', node.substring(6))
    return div;
  } else {
    return document.createTextNode(node);
  }
}

// Would prefer to use lookupNamespaceURI, but this seems to only work once the element is attached to the DOM
// so use this kludge.
const SVG_XML_URI = 'http://www.w3.org/2000/svg';
const XLINK_XML_URI = 'http://www.w3.org/1999/xlink';
const XMLNS_URI = 'http://www.w3.org/2000/xmlns/';
const XML_URI = 'http://www.w3.org/XML/1998/namespace';
const xmlNamespaces = { // prefix to uri key value pairs
  xlink: XLINK_XML_URI,
  xml: XML_URI,
  xmlns: XMLNS_URI,
};  

function create(node: VNode | string | HTMLElement | SVGElement, isSvg = false): Element {
  console.assert(node !== null && node !== undefined);
  // console.log('create', node, typeof node);
  if ((node instanceof HTMLElement) || (node instanceof SVGElement)) return node;
  if (typeof node === "string") return createText(node);
  if (!node.tag || (typeof node.tag === 'function')) return createText(JSON.stringify(node));
  isSvg = isSvg || node.tag === "svg";
  const element = isSvg
    ? document.createElementNS(SVG_XML_URI, node.tag)
    : document.createElement(node.tag);

  updateProps(element, node.props);

  if (node.children) node.children.forEach(child => element.appendChild(create(child, isSvg)));

  return element
}

function mergeProps(oldProps: {}, newProps: {}): {} {
  newProps['class'] = newProps['class'] || newProps['className'];
  delete newProps['className'];
  const props = {};
  if (oldProps) Object.keys(oldProps).forEach(p => props[p] = null);
  if (newProps) Object.keys(newProps).forEach(p => props[p] = newProps[p]);
  return props;
}

function updateProps(element: Element, props: {}) {
  console.assert(!!element);
  // console.log('updateProps', element, props);
  const cached = element[ATTR_PROPS] || {};
  props = mergeProps(cached, props || {});
  element[ATTR_PROPS] = props;
  for (const name in props) {
    const value = props[name];
    // if (cached[name] === value) continue;
    // console.log('updateProps', name, value);
    if (name === 'style') {
      if (element.style.cssText) element.style.cssText = '';
      for (const s in value) {
        if (element.style[s] !== value[s]) element.style[s] = value[s];
      }
    } else if (name.startsWith('data-')) {
      const dname = name.substring(5);
      const cname = dname.replace(/-(\w)/g, (match) => match[1].toUpperCase());
      if (element.dataset[cname] !== value) {
        if (value || value === "") element.dataset[cname] = value;
        else delete element.dataset[cname];
      }
    } else if (name === 'id' || name === 'class' || name.startsWith("role") || name.indexOf("-") > 0) {
      if (element.getAttribute(name) !== value) {
        if (value) element.setAttribute(name, value);
        else element.removeAttribute(name);
      }
    } else if (element instanceof SVGElement) {
      let setName = name;
      let getName = name;
      let namespace = null;

      // We allow a couple of camel case to xml conversions since JSX gacks on ":" in attribute names
      // Permit anything starting with "xlink:", "xmlns:", "xml:". 
      if(name.search(/^xlink[A-Z]/) >= 0 || name.search(/^xmlns[A-Z]/) >= 0) {
        // xlinkXxxx to xlink:xxxx and xmlnsXxxx to xmlns:xxxx
        setName = name.substring(0,5) + ":" + name[5].toLowerCase() + name.substring(6);
      } else if(name.search(/^xml[A-Z]/) >= 0) {
        // xmlXxxx to xml:xxxx
        setName = name.substring(0,3) + ":" + name[3].toLowerCase() + name.substring(4);
      }

      // If there is a ":" in the name then we have a namespaced attribute.
      const colonPos = setName.indexOf(":");
      if(colonPos >= 0) {
        const xmlnsPrefix = setName.substring(0, colonPos);
        const localName = setName.substring(colonPos + 1);

        // Is this a namespace or a namespace declaration?
        if(xmlnsPrefix === "xmlns") {
          xmlNamespaces[localName] = value;

          // All xmlns entries are name spaced to XML see:         
          // https://www.w3.org/TR/DOM-Level-3-Core/core.html#Namespaces-Considerations
          namespace = xmlNamespaces[xmlnsPrefix];
        } else {
          namespace = xmlNamespaces[xmlnsPrefix];
          getName = localName;
        }
      } else if(setName === "xmlns") {
          // All xmlns entries are name spaced to XML see:         
          // https://www.w3.org/TR/DOM-Level-3-Core/core.html#Namespaces-Considerations
          namespace = xmlNamespaces[setName];
      }

      if (element.getAttributeNS(namespace, getName) !== value) {
        if (value) element.setAttributeNS(namespace, setName, value);
        else element.removeAttributeNS(namespace, getName);
      }  
    } else if (element[name] !== value) {
        element[name] = value;
    }
    if (name === 'key' && value) keyCache[value] = element;
  }
}

export function Fragment(props, ...children): any[] {
  return collect(children);
}