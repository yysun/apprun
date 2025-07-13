import { VDOM, VNode } from './types';
import directive from './directive';
import { updateProps } from './vdom-my-prop-attr';

export type Element = any; //HTMLElement | SVGSVGElement | SVGElement;

export function Fragment(props, ...children): any[] {
  return collect(children);
}

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

export const updateElement = (element: Element | string, nodes: VDOM, component = {}) => {
  // tslint:disable-next-line
  if (nodes == null || nodes === false) return;
  const el = (typeof element === 'string' && element) ?
    document.getElementById(element) || document.querySelector(element) : element;
  nodes = directive(nodes, component);
  render(el, nodes, component);
}

function render(element: Element, nodes: VDOM, parent = {}) {
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

function updateChildren(element: Element, children: any[], isSvg: boolean) {
  const old_len = element.childNodes?.length || 0;
  const new_len = children?.length || 0;

  // Handle key-based reordering first if any children have keys
  const hasKeysInNewChildren = children?.some(child =>
    child && typeof child === 'object' && child.props && child.props.key !== undefined
  );

  if (hasKeysInNewChildren) {
    // Create a map of existing keyed elements
    const existingKeyedElements = new Map();
    for (let i = 0; i < old_len; i++) {
      const el = element.childNodes[i];
      if (el && (el as any).key) {
        existingKeyedElements.set((el as any).key, el);
      }
    }

    // Build new DOM structure
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < new_len; i++) {
      const child = children[i];
      if (child == null) continue;

      const key = child.props && child.props['key'];
      if (key && existingKeyedElements.has(key)) {
        // Reuse existing element
        const existingEl = existingKeyedElements.get(key);
        update(existingEl, child as VNode, isSvg);
        fragment.appendChild(existingEl);
        existingKeyedElements.delete(key); // Mark as used
      } else {
        // Create new element
        fragment.appendChild(create(child, isSvg));
      }
    }

    // Clear current children and append new structure
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
    element.appendChild(fragment);
    return;
  }

  // Original non-keyed logic
  const len = Math.min(old_len, new_len);
  for (let i = 0; i < len; i++) {
    const child = children[i];
    if (child == null) continue;
    const el = element.childNodes[i];
    if (!el) continue; // Safety check for undefined childNodes
    if (typeof child === 'string') {
      if (el.nodeType === 3) {
        if (el.nodeValue !== child) {
          el.nodeValue = child;
        }
      } else {
        element.replaceChild(createText(child), el);
      }
    } else if (child instanceof HTMLElement || child instanceof SVGElement) {
      element.replaceChild(child, el);
    } else if (child && typeof child === 'object') {
      update(element.childNodes[i], child as VNode, isSvg);
    }
  }

  // Remove extra old nodes
  while (element.childNodes.length > len) {
    element.removeChild(element.lastChild);
  }

  if (new_len > len) {
    const d = document.createDocumentFragment();
    for (let i = len; i < children.length; i++) {
      const child = children[i];
      if (child != null) {
        d.appendChild(create(child, isSvg));
      }
    }
    element.appendChild(d);
  }
}

export const safeHTML = (html: string) => {
  const div = document.createElement('section');
  div.insertAdjacentHTML('afterbegin', html)
  return Array.from(div.children);
}

function createText(node) {
  if (node?.indexOf('_html:') === 0) { // ?
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

  // Type guard for VNode objects - handle invalid node types gracefully
  if (!node || typeof node !== 'object' || !node.tag || (typeof node.tag === 'function')) {
    return createText(typeof node === 'object' ? JSON.stringify(node) : String(node ?? ''));
  }

  isSvg = isSvg || node.tag === "svg";
  const element = isSvg
    ? document.createElementNS("http://www.w3.org/2000/svg", node.tag)
    : document.createElement(node.tag);

  updateProps(element, node.props, isSvg);
  if (node.children) node.children.forEach(child => element.appendChild(create(child, isSvg)));
  return element
}

function render_component(node, parent, idx) {
  const { tag, props, children } = node;
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
  let component = parent.__componentCache[key];
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
