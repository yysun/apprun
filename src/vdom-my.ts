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
  else return tag(props, ...children); // JSX component
}

function createComponent(node, parent) {
  if (typeof node?.tag === 'function') return node.tag(node.props, ...node.children);
  else return node;
}

export const updateElement = (element: Element | string, nodes: VDOM, component = {}) => {
  // console.assert(!!element);

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
 * Smart key-to-element mapping for efficient lookups
 * Maps keys to both DOM elements and their current positions
 */
interface KeyedElementInfo {
  element: Element;
  oldIndex: number;
}

/**
 * Efficiently reconcile children with greedy diff algorithm
 * Supports mixed keyed/unkeyed children with minimal DOM operations
 */
function updateChildren(element: Element, children: any[], isSvg: boolean) {
  const old_len = element.childNodes?.length || 0;
  const new_len = children?.length || 0;

  // Check if we need keyed reconciliation
  const hasKeys = children && children.some(child =>
    child && typeof child === 'object' && child.props &&
    child.props.key !== undefined && child.props.key !== null
  );

  if (hasKeys) {
    reconcileKeyedChildren(element, children, isSvg);
  } else {
    reconcileUnkeyedChildren(element, children, isSvg);
  }
}

/**
 * Advanced keyed reconciliation using greedy diff algorithm
 * Reuses existing DOM elements when possible, minimizing operations
 */
function reconcileKeyedChildren(element: Element, children: any[], isSvg: boolean) {
  const oldChildren = Array.from(element.childNodes);
  const newChildren: Element[] = [];

  // Build map of existing keyed elements
  const keyedElements = new Map<any, KeyedElementInfo>();
  oldChildren.forEach((child, index) => {
    const childElement = child as Element;
    const key = (childElement as any).__apprun_key;
    if (key !== undefined && key !== null) {
      keyedElements.set(key, { element: childElement, oldIndex: index });
    }
  });

  // Process each new child
  children.forEach((child, index) => {
    if (!child || (typeof child !== 'object' && typeof child !== 'string')) {
      newChildren.push(create(child, isSvg));
      return;
    }

    if (typeof child === 'string') {
      newChildren.push(create(child, isSvg));
      return;
    }

    const key = child.props?.key;

    if (key !== undefined && key !== null) {
      // Keyed element - try to reuse existing
      const existing = keyedElements.get(key);
      if (existing) {
        // Reuse existing element - update in place
        const existingElement = existing.element;
        update(existingElement, child, isSvg);
        (existingElement as any).__apprun_key = key;
        newChildren.push(existingElement);
        keyedElements.delete(key); // Mark as used
      } else {
        // Create new keyed element
        const newElement = create(child, isSvg);
        (newElement as any).__apprun_key = key;
        newChildren.push(newElement);
      }
    } else {
      // Non-keyed element in mixed list - create fresh
      newChildren.push(create(child, isSvg));
    }
  });

  // Apply the efficiently computed changes
  applyChildrenChanges(element, newChildren);
}

/**
 * Simple reconciliation for non-keyed children
 * Optimized for common cases with minimal operations
 */
function reconcileUnkeyedChildren(element: Element, children: any[], isSvg: boolean) {
  const oldChildren = Array.from(element.childNodes);
  const oldLength = oldChildren.length;
  const newLength = children?.length || 0;

  // Update/create children
  for (let i = 0; i < newLength; i++) {
    const child = children[i];

    if (i < oldLength) {
      const oldChild = oldChildren[i] as Element;

      if (typeof child === 'string') {
        if (oldChild.nodeType === Node.TEXT_NODE) {
          if (oldChild.textContent !== child) {
            oldChild.textContent = child;
          }
        } else {
          element.replaceChild(createText(child), oldChild);
        }
      } else if (child && typeof child === 'object' && child.tag) {
        if (same(oldChild, child)) {
          update(oldChild, child, isSvg);
        } else {
          element.replaceChild(create(child, isSvg), oldChild);
        }
      } else {
        element.replaceChild(create(child, isSvg), oldChild);
      }
    } else {
      // Append new children
      element.appendChild(create(child, isSvg));
    }
  }

  // Remove extra old children
  for (let i = oldLength - 1; i >= newLength; i--) {
    element.removeChild(oldChildren[i]);
  }
}

/**
 * Efficiently apply children changes to DOM using minimal operations
 * Uses insertBefore for proper positioning without full reconstruction
 * Optimized to minimize DOM queries and operations
 */
function applyChildrenChanges(element: Element, newChildren: Element[]) {
  const currentChildren = Array.from(element.childNodes);
  const currentLength = currentChildren.length;
  const newLength = newChildren.length;

  // Create a Set for O(1) lookup of elements that should remain
  const newChildrenSet = new Set(newChildren);

  // Step 1: Remove elements that are no longer needed (from end to avoid index shifts)
  for (let i = currentLength - 1; i >= 0; i--) {
    const child = currentChildren[i];
    if (!newChildrenSet.has(child as Element)) {
      element.removeChild(child);
    }
  }

  // Step 2: Position elements correctly using efficient insertBefore strategy
  for (let i = 0; i < newLength; i++) {
    const newChild = newChildren[i];
    const currentChild = element.childNodes[i];

    if (currentChild !== newChild) {
      if (i >= element.childNodes.length) {
        // Append at the end - no reference node needed
        element.appendChild(newChild);
      } else {
        // Insert before current child at position i
        element.insertBefore(newChild, currentChild);
      }
    }
    // If currentChild === newChild, element is already in correct position
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
