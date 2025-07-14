/*
 * Virtual DOM Implementation - Two-Phase Key-Based Reconciliation (Best Practice)
 * 
 * Features:
 * - Modern two-phase reconciliation algorithm
 * - Local key maps (no global state/memory leaks)
 * - Proper keyed element reuse with state preservation
 * - Minimal DOM operations through smart element movement
 * - Clean separation between keyed and non-keyed reconciliation
 * - SVG namespace support
 * 
 * Best Practices Applied:
 * - Local key maps instead of global cache
 * - Clear phase separation for maintainability
 * - Type-safe element handling
 * - Memory-efficient approach
 * 
 * Last updated: 2025-07-13
 * Performance target: Optimal for modern applications with proper key usage
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

/**
 * Two-Phase Key-Based Reconciliation Algorithm (Best Practice Implementation)
 * 
 * Phase 1: Build key maps for efficient element lookup
 * Phase 2: Reconcile elements with optimal reuse and minimal DOM operations
 * 
 * Features:
 * - Local key maps (no global state/memory leaks)
 * - Proper keyed element reuse for performance
 * - Minimal DOM manipulations (move vs recreate)
 * - Support for mixed keyed/non-keyed children
 * - Clean separation of concerns
 */

/**
 * Main updateChildren function using modern two-phase reconciliation
 */
function updateChildren(element: Element, children: any[], isSvg: boolean) {
  if (!children || children.length === 0) {
    // Clear all children
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
    return;
  }

  const oldChildren = Array.from(element.childNodes) as Element[];

  // Check if we have any keyed elements - if not, use optimized simple approach
  const hasKeyedChildren = children.some(child =>
    child && typeof child === 'object' && child.props && child.props.key !== undefined && child.props.key !== null
  );

  if (!hasKeyedChildren) {
    // Use optimized non-keyed reconciliation
    updateChildrenWithoutKeys(element, oldChildren, children, isSvg);
  } else {
    // Use two-phase keyed reconciliation with local key maps
    updateChildrenWithKeys(element, oldChildren, children, isSvg);
  }
}

/**
 * Two-phase reconciliation for keyed children using local key maps
 */
function updateChildrenWithKeys(element: Element, oldChildren: Element[], children: any[], isSvg: boolean) {
  // Phase 1: Build key maps for efficient lookup
  const oldKeyMap = new Map<string, Element>();
  const oldNonKeyed: Element[] = [];

  // Map existing children by their keys
  oldChildren.forEach(child => {
    const key = (child as any).key;
    if (key !== undefined && key !== null) {
      oldKeyMap.set(key, child);
    } else {
      oldNonKeyed.push(child);
    }
  });

  // Phase 2: Process new children and build reconciled element list
  const newElements: Element[] = [];
  let nonKeyedIndex = 0;

  for (let i = 0; i < children.length; i++) {
    const newChild = children[i];
    let newElement: Element;

    if (typeof newChild === 'string') {
      // Text node
      newElement = createText(newChild);
    } else if (newChild instanceof HTMLElement || newChild instanceof SVGElement) {
      // Direct element
      newElement = newChild;
    } else if (newChild && typeof newChild === 'object' && newChild.props && newChild.props.key !== undefined && newChild.props.key !== null) {
      // Keyed element - try to reuse existing
      const key = newChild.props.key;
      const oldElement = oldKeyMap.get(key);

      if (oldElement) {
        // Reuse existing keyed element
        newElement = oldElement;
        update(newElement, newChild, isSvg);
        oldKeyMap.delete(key); // Mark as used
      } else {
        // Create new keyed element
        newElement = create(newChild, isSvg);
      }
    } else {
      // Non-keyed element - try to reuse non-keyed old element
      if (nonKeyedIndex < oldNonKeyed.length) {
        const oldElement = oldNonKeyed[nonKeyedIndex];
        if (same(oldElement, newChild)) {
          // Tags match - can update in place
          newElement = oldElement;
          update(newElement, newChild, isSvg);
        } else {
          // Tags don't match - create new element
          newElement = create(newChild, isSvg);
        }
        nonKeyedIndex++;
      } else {
        // Create new element
        newElement = create(newChild, isSvg);
      }
    }

    newElements.push(newElement);
  }

  // Phase 3: Update DOM efficiently with minimal operations
  updateDOMOrder(element, newElements);
}

/**
 * Efficiently update DOM to match new element order
 * Uses insertBefore for optimal element movement
 */
function updateDOMOrder(parent: Element, newElements: Element[]) {
  const currentElements = Array.from(parent.childNodes) as Element[];

  // Update each position to match target order
  for (let i = 0; i < newElements.length; i++) {
    const targetElement = newElements[i];
    const currentElement = parent.childNodes[i] as Element;

    if (currentElement !== targetElement) {
      if (currentElement) {
        // Insert target element at correct position
        parent.insertBefore(targetElement, currentElement);
      } else {
        // Append if no current element at this position
        parent.appendChild(targetElement);
      }
    }
  }

  // Remove extra children
  while (parent.childNodes.length > newElements.length) {
    const lastChild = parent.lastChild;
    if (lastChild) {
      parent.removeChild(lastChild);
    } else {
      break; // Safety break
    }
  }
}

/**
 * Optimized reconciliation for non-keyed children
 */
function updateChildrenWithoutKeys(element: Element, oldChildren: Element[], children: any[], isSvg: boolean) {
  const oldLength = oldChildren.length;
  const newLength = children.length;
  const minLength = Math.min(oldLength, newLength);

  // Update existing children in place
  for (let i = 0; i < minLength; i++) {
    const oldChild = oldChildren[i];
    const newChild = children[i];

    if (typeof newChild === 'string') {
      if (oldChild.nodeType === 3) {
        // Text node - update content
        if (oldChild.textContent !== newChild) {
          (oldChild as any).nodeValue = newChild;
        }
      } else {
        // Replace non-text with text
        element.replaceChild(createText(newChild), oldChild);
      }
    } else if (newChild instanceof HTMLElement || newChild instanceof SVGElement) {
      // Direct element insertion
      element.replaceChild(newChild, oldChild);
    } else {
      // VNode - update existing element
      update(oldChild, newChild, isSvg);
    }
  }

  // Remove extra old children
  for (let i = oldLength - 1; i >= newLength; i--) {
    element.removeChild(oldChildren[i]);
  }

  // Add new children
  if (newLength > oldLength) {
    const fragment = document.createDocumentFragment();
    for (let i = oldLength; i < newLength; i++) {
      fragment.appendChild(create(children[i], isSvg));
    }
    element.appendChild(fragment);
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

  // Use updateProps for consistent property handling
  updateProps(element, node.props, isSvg);

  // Store key on element for reconciliation (local handling, no global cache)
  if (node.props && (node.props as any).key !== undefined && (node.props as any).key !== null) {
    const key = (node.props as any).key;
    (element as any).key = key;
  }

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
