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

export function createElement(tag: string | Function, props?: {}, ...children) {
  const ch = collect(children);
  if (typeof tag === 'string') return { tag, props, children: ch };
  else if (tag === undefined && children) return ch; // JSX fragments
  else if (Object.getPrototypeOf(tag).__isAppRunComponent) {
    return { tag, props, children: ch } // createComponent(tag, { ...props, children });
  }
  else
    return tag(props, ch);
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
    if (typeof child === 'string') {
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

function create(node: VNode | string, isSvg = false): Element {
  console.assert(node !== null && node !== undefined);
  // console.log('create', node, typeof node);

  if (typeof node === "string") return createText(node);
  if (!node.tag || (typeof node.tag === 'function')) return createText(JSON.stringify(node));
  isSvg = isSvg || node.tag === "svg";
  const element = isSvg
    ? document.createElementNS("http://www.w3.org/2000/svg", node.tag)
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
    } else if (name === 'class' || name.startsWith("role") || name.indexOf("-") > 0 ||
      element instanceof SVGElement) {
      if (element.getAttribute(name) !== value) {
        if (value) element.setAttribute(name, value);
        else element.removeAttribute(name);
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