import { VDOM, VNode } from './types';
import directive from './directive';
import { Component } from './component';
export type Element = any; //HTMLElement | SVGSVGElement | SVGElement;

export function Fragment(props?: {}, ...children: any[]): any[] {
  return collect(children);
}

const ATTR_PROPS = '_props';

function collect(children: any[]): any[] {
  const ch: any[] = [];
  const push = (c: any) => {
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

export const updateElement = (element: Element, nodes: VDOM, component = {}) => {
  // tslint:disable-next-line
  if (nodes == null || nodes === false) return;
  const el = (typeof element === 'string' && element) ?
    document.getElementById(element) || document.querySelector(element) : element;
  nodes = directive(nodes, component);
  render(el, nodes, component);
}

function render(element: HTMLElement, nodes: VDOM, parent = {}) {
  // tslint:disable-next-line
  if (nodes == null || nodes === false) return;
  nodes = createComponent(nodes, parent);
  if (!element) return;
  const isSvg = element.nodeName === "SVG";
  if (Array.isArray(nodes)) {
    updateChildren(element, nodes, isSvg);
  } else {
    updateChildren(element, [nodes], isSvg);
  }
}

function same(el: Element, node: VNode): boolean {
  // if (!el || !node) return false;
  const key1 = el.nodeName;
  const key2 = `${node.tag || ''}`;
  return key1.toUpperCase() === key2.toUpperCase();
}

function update(element: Element, node: VNode, isSvg: boolean) {
  if (node['_op'] === 3) return;
  // console.assert(!!element);
  isSvg = isSvg || node.tag === "svg";
  if (!same(element, node)) {
    element.parentNode.replaceChild(create(node, isSvg), element);
    return;
  }
  !(node['_op'] & 2) && updateChildren(element, node.children, isSvg);
  !(node['_op'] & 1) && updateProps(element, node.props, isSvg);
}

function updateChildren(element: Element, children: any[], isSvg: boolean): void {
  const old_len = element.childNodes?.length || 0;
  const new_len = children?.length || 0;
  const len = Math.min(old_len, new_len);
  for (let i = 0; i < len; i++) {
    const child = children[i] as VNode;
    if (child['_op'] === 3) continue;
    const el = element.childNodes[i];
    if (typeof child === 'string') {
      if (el.textContent !== child) {
        if (el.nodeType === 3) {
          el.nodeValue = child
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
          // console.log(el.key, key);
          const old = keyCache[key];
          if (old) {
            const temp = old.nextSibling;
            element.insertBefore(old, el);
            temp ? element.insertBefore(el, temp) : element.appendChild(el);
            update(element.childNodes[i], child, isSvg);
          } else {
            element.replaceChild(create(child, isSvg), el);
          }
        }
      } else {
        update(element.childNodes[i], child, isSvg);
      }
    }
  }

  let n = element.childNodes?.length || 0;
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

export const safeHTML = (html: string): any[] => {
  const div = document.createElement('section');
  div.insertAdjacentHTML('afterbegin', html)
  return Array.from(div.children);
}

function createText(node: string): Text | HTMLDivElement {
  if (node?.indexOf('_html:') === 0) {
    const div = document.createElement('div');
    div.insertAdjacentHTML('afterbegin', node.substring(6))
    return div;
  } else {
    return document.createTextNode(node ?? '');
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

function mergeProps(oldProps: Record<string, any>, newProps: Record<string, any>): Record<string, any> {
  newProps['class'] = newProps['class'] || newProps['className'];
  delete newProps['className'];
  const props = {};
  if (oldProps) Object.keys(oldProps).forEach(p => props[p] = null);
  if (newProps) Object.keys(newProps).forEach(p => props[p] = newProps[p]);
  return props;
}

export function updateProps(element: Element, props: Record<string, any>, isSvg: boolean): void {
  // console.assert(!!element);
  const cached = element[ATTR_PROPS] || {};
  props = mergeProps(cached, props || {});
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
    } else if (name.startsWith('on')) {
      if (!value || typeof value === 'function') {
        element[name] = value;
      } else if (typeof value === 'string') {
        if (value) element.setAttribute(name, value);
        else element.removeAttribute(name);
      }
    } else if (/^id$|^class$|^list$|^readonly$|^contenteditable$|^role|-|^for$/g.test(name) || isSvg) {
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
    window.requestAnimationFrame(() => props['ref'](element));
  }
}

function render_component(node: VNode, parent: any, idx: number): Element {
  const { props, children } = node;
  const tag = node.tag as any;
  let key = `_${idx}`;
  let id = props && props['id'];
  if (!id) id = `_${idx}${Date.now()}`;
  else key = id;
  let asTag = 'section';
  if (props && props['as']) {
    asTag = props['as'];
    delete props['as'];
  }
  if (!parent.__componentCache) parent.__componentCache = {};
  let component = parent.__componentCache[key] as Component;
  if (!component || !(component instanceof tag) || !component.element) {
    const element = document.createElement(asTag);
    component = parent.__componentCache[key] = new tag({ ...props, children }).mount(element, { render: true });
  } else {
    component.renderState(component.state);
  }
  if (component.mounted) {
    const new_state = component.mounted(props, children, component.state);
    (typeof new_state !== 'undefined') && component.setState(new_state);
  }
  updateProps(component.element, props, false);
  return component.element;
}

function createComponent(node, parent, idx = 0) {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(child => createComponent(child, parent, idx++));
  let vdom = node;
  if (node && typeof node.tag === 'function' && Object.getPrototypeOf(node.tag).__isAppRunComponent) {
    vdom = render_component(node, parent, idx);
  }
  if (vdom && Array.isArray(vdom.children)) {
    const new_parent = vdom.props?._component;
    if (new_parent) {
      let i = 0;
      vdom.children = vdom.children.map(child => createComponent(child, new_parent, i++));
    } else {
      vdom.children = vdom.children.map(child => createComponent(child, parent, idx++));
    }
  }
  return vdom;
}
