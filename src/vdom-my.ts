/** * VDOM Implementation for AppRun
 * 
 * Notes for AppRun’s key prop
 * Use the key prop only if you need to preserve browser-side DOM state (such as cursor 
 * position in an <input>, focus, or maintaining state in inline components).
 *
 * For most use cases, especially with stateless or purely data-driven UIs, key is not
 * needed and may decrease performance by forcing DOM moves.
 *
 * AppRun aggressively updates DOM to match your vdom, so DOM node preservation is
 * only valuable when you intentionally depend on browser-managed state.
 *
 * | Use Case                      | Should I use `key`? | Why                   |
 * | ----------------------------- | ------------------- | --------------------- |
 * | Preserve input cursor/focus   | ✅ Yes               | Keeps browser state   |
 * | Inline stateful component     | ✅ Yes               | Preserves component   |
 * | Regular data list (stateless) | 🚫 No               | Unnecessary DOM moves |  
 * | Purely visual updates         | 🚫 No               | No state to preserve  |
 * 
 * Features:
 * - Virtual DOM rendering and diffing for efficient DOM updates
 * - JSX Fragment support for both Babel and TypeScript
 * - Element creation with props, children, and event handling
 * - SVG element support with proper namespace handling
 * - Component lifecycle management and caching
 * - Parent-scoped keyed element optimization for memory-safe DOM reuse
 * - Trusted HTML insertion and text node creation
 * - Directive processing integration
 * 
 * Implementation:
 * - Builds keyed lookup from the current parent element instead of global state
 * - Sweeps stale child component cache entries after each parent render
 * - Supports both string and function-based tags
 * - Handles component mounting and state management
 * - Optimized children updating with minimal DOM operations
 * - Memory-efficient child component caching tied to latest render usage
 * 
 * Recent Changes:
 * - 2026-06-19: Added trustedHTML alias and removed _html: text-prefix parsing
 * - 2026-06-19: Scoped keyed reconciliation to the current parent and added child component cache eviction
 * - 2026-06-19: Preserved explicit falsy component ids such as 0 in child component cache keys
 * - Added comprehensive key prop usage documentation and guidelines
 */

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

// Compatibility export. Keyed reconciliation is now parent-scoped and has no global cache.
export function clearKeyCache() {
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
  beginComponentCacheRender(parent);
  nodes = createComponent(nodes, parent);
  sweepComponentCache(parent);
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

function updateChildren(element, children, isSvg: boolean) {
  const keyedChildren = {};
  Array.from(element.childNodes || []).forEach((child: any) => {
    if (child.key !== undefined && child.key !== null) keyedChildren[keyId(child.key)] = child;
  });
  const old_len = element.childNodes?.length || 0;
  const new_len = children?.length || 0;
  const len = Math.min(old_len, new_len);
  for (let i = 0; i < len; i++) {
    const child = children[i];
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
      const key = child.props ? child.props['key'] : undefined;
      if (key !== undefined && key !== null) {
        if (el.key === key) {
          update(element.childNodes[i], child, isSvg);
        } else {
          // console.log(el.key, key);
          const old = keyedChildren[keyId(key)];
          if (old) {
            // const temp = old.nextSibling;
            element.insertBefore(old, el);
            // temp ? element.insertBefore(el, temp) : element.appendChild(el);
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

function keyId(key) {
  return `${typeof key}:${String(key)}`;
}

export const trustedHTML = (html: string) => {
  const div = document.createElement('section');
  div.insertAdjacentHTML('afterbegin', html)
  return Array.from(div.children);
}

/** @deprecated Use trustedHTML() for caller-owned trusted markup. */
export const safeHTML = trustedHTML;

function createText(node) {
  return document.createTextNode(node ?? '');
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

  if (node.props && (node.props as any).key !== undefined && (node.props as any).key !== null) {
    (element as any).key = (node.props as any).key;
  }
  return element
}

function beginComponentCacheRender(parent) {
  if (!parent || !parent.__componentCache) return;
  parent.__componentCacheUsed = {};
}

function markComponentCacheUsed(parent, key) {
  if (!parent) return;
  parent.__componentCacheUsed = parent.__componentCacheUsed || {};
  parent.__componentCacheUsed[key] = true;
}

function sweepComponentCache(parent) {
  if (!parent || !parent.__componentCache || !parent.__componentCacheUsed) return;
  Object.keys(parent.__componentCache).forEach(key => {
    if (!parent.__componentCacheUsed[key]) {
      parent.__componentCache[key]?.unmount?.();
      delete parent.__componentCache[key];
    }
  });
  parent.__componentCacheUsed = null;
}

function render_component(node, parent, idx) {
  const { tag, props, children } = node;
  const id = props && props['id'];
  const key = id !== undefined && id !== null ? String(id) : `_${idx}`;
  let asTag = 'section';
  if (props && props['as']) {
    asTag = props['as'];
    delete props['as'];
  }
  if (!parent.__componentCache) parent.__componentCache = {};
  markComponentCacheUsed(parent, key);
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
