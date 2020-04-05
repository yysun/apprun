import createComponent from './createComponent';
import { VDOM, VNode } from './types';
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

const keyCache = new WeakMap();

export const updateElement = render;

export function render(element: Element, nodes: VDOM, parent = {}) {
  // console.log('render', element, node);
  // tslint:disable-next-line
  if (nodes == null || nodes === false) return;

  nodes = createComponent(nodes, parent);

  const isSvg = element?.nodeName === "SVG";

  if (!element) return;
  if (Array.isArray(nodes)) {
    updateChildren(element, nodes, isSvg);
  } else {
    updateChildren(element, [nodes], isSvg);
  }
}

function same(el: Element, node: VNode) {
  // if (!el || !node) return false;
  const key1 = el.nodeName;
  const key2 = `${node.tag || ''}`;
  return key1.toUpperCase() === key2.toUpperCase();
}

function update(element: Element, node: VNode, isSvg: boolean) {
  // console.assert(!!element);
  isSvg = isSvg || node.tag === "svg";
  if (!same(element, node)) {
    element.parentNode.replaceChild(create(node, isSvg), element);
    return;
  }
  updateChildren(element, node.children, isSvg);
  updateProps(element, node.props, isSvg);
}

function updateChildren(element, children, isSvg: boolean) {
  const old_len = element.childNodes?.length || 0;
  const new_len = children?.length || 0;
  const len = Math.min(old_len, new_len);
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
    } else if (child instanceof HTMLElement || child instanceof SVGElement) {
        element.insertBefore(child, el);
    } else {
      const key = child.props && child.props['key'];
      if (key) {
        if (el.key === key) {
          update(element.childNodes[i], child, isSvg);
        } else {
          const old = keyCache[key];
          if (old) {
            element.insertBefore(old, el);
            element.appendChild(el);
            update(element.childNodes[i], child, isSvg);
          } else {
            element.insertBefore(create(child, isSvg), el);
          }
        }
      } else {
        update(element.childNodes[i], child, isSvg);
      }
    }
  }

  let n = element.childNodes.length;
  while (n > len) {
    element.removeChild(element.lastChild);
    n--;
  }

  if (new_len > len) {
    const d = document.createDocumentFragment();
    for (let i = len; i < children.length; i++) {
      d.appendChild(create(children[i], isSvg));
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

function create(node: VNode | string | HTMLElement | SVGElement, isSvg: boolean): Element {
  // console.assert(node !== null && node !== undefined);
  if ((node instanceof HTMLElement) || (node instanceof SVGElement)) return node;
  if (typeof node === "string") return createText(node);
  if (!node.tag || (typeof node.tag === 'function')) return createText(JSON.stringify(node));
  isSvg = isSvg || node.tag === "svg";
  const element = isSvg
    ? document.createElementNS("http://www.w3.org/2000/svg", node.tag)
    : document.createElement(node.tag);

  updateProps(element, node.props, isSvg);
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

function updateProps(element: Element, props: {}, isSvg) {
  // console.assert(!!element);
  const cached = element[ATTR_PROPS] || {};
  props = mergeProps(cached, props || {});
  if (props === {}) return;
  if (Object.keys(props).filter(p=>p.startsWith('on')).length === 0 &&
    JSON.stringify(cached) === JSON.stringify(props)) return;
  // console.log(JSON.stringify(cached) , JSON.stringify(props), Object.keys(cached), Object.keys(props));
  element[ATTR_PROPS] = props;

  for (const name in props) {
    const value = props[name];
    // if (cached[name] === value) continue;
    // console.log('updateProps', name, value);
    if (name.startsWith('data-')) {
      const dname = name.substring(5);
      const cname = dname.replace(/-(\w)/g, (match) => match[1].toUpperCase());
      if (element.dataset[cname] !== value) {
        if (value || value === "") element.dataset[cname] = value;
        else delete element.dataset[cname];
      }
    } else if (name === 'style') {
      if (element.style.cssText) element.style.cssText = '';
      if (typeof value === 'string') element.style.cssText = value;
      else {
        for (const s in value) {
          if (element.style[s] !== value[s]) element.style[s] = value[s];
        }
      }
    } else if (name.startsWith('xlink')) {
      const xname = name.replace('xlink', '').toLowerCase();
      if (value == null || value === false) {
        element.removeAttributeNS('http://www.w3.org/1999/xlink', xname);
      } else {
        element.setAttributeNS('http://www.w3.org/1999/xlink', xname, value);
      }
    } else if (/id|class|role|-/g.test(name) || isSvg) {
      if (element.getAttribute(name) !== value) {
        if (value) element.setAttribute(name, value);
        else element.removeAttribute(name);
      }
    } else if (element[name] !== value) {
        element[name] = value;
    }
    if (name === 'key' && value) keyCache[value] = element;
  }
  if (props && typeof props['ref'] === 'function') {
    window.requestAnimationFrame(()=>props['ref'](element));
  }
}

export function Fragment(props, ...children): any[] {
  return collect(children);
}