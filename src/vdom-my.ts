import { VDOM, VNode } from './types';
import directive from './directive';
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
  const hasKeysInNewChildren = children?.some(child =>
    child && typeof child === 'object' && child.props &&
    child.props.key !== undefined && child.props.key !== null
  );

  if (hasKeysInNewChildren) {
    reconcileKeyedChildren(element, children, isSvg);
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

/**
 * Efficient keyed children reconciliation using greedy diff algorithm
 * Uses Map-based lookups for O(1) key access and minimal DOM operations
 */
function reconcileKeyedChildren(element: Element, children: any[], isSvg: boolean) {
  const oldChildren = Array.from(element.childNodes);
  const oldLen = oldChildren.length;
  const newLen = children.length;

  // Build map of existing keyed elements for O(1) lookup
  const keyedElementMap = new Map<string, KeyedElementInfo>();
  const unkeyedElements: Element[] = [];

  // Categorize existing DOM elements
  for (let i = 0; i < oldLen; i++) {
    const el = oldChildren[i] as Element;
    if (el && el.key !== undefined && el.key !== null) {
      keyedElementMap.set(el.key, { element: el, oldIndex: i });
    } else {
      unkeyedElements.push(el);
    }
  }

  // Greedy diff algorithm: process new children and build final DOM structure
  const finalChildren: Element[] = [];
  let unkeyedIndex = 0;

  for (let i = 0; i < newLen; i++) {
    const child = children[i];
    if (child == null) continue;

    const key = child.props?.key;

    if (key !== undefined && key !== null) {
      // Handle keyed element
      const existingInfo = keyedElementMap.get(key);
      if (existingInfo) {
        // Reuse existing keyed element
        update(existingInfo.element, child as VNode, isSvg);
        finalChildren.push(existingInfo.element);
        keyedElementMap.delete(key); // Mark as used
      } else {
        // Create new keyed element
        const newElement = create(child, isSvg);
        finalChildren.push(newElement);
      }
    } else {
      // Handle unkeyed element - try to reuse if available
      if (unkeyedIndex < unkeyedElements.length) {
        const existingEl = unkeyedElements[unkeyedIndex];
        if (typeof child === 'string') {
          // Handle text nodes
          if (existingEl.nodeType === 3) {
            if (existingEl.nodeValue !== child) {
              existingEl.nodeValue = child;
            }
            finalChildren.push(existingEl);
          } else {
            // Replace with text node
            const textNode = createText(child);
            finalChildren.push(textNode);
          }
        } else if (child instanceof HTMLElement || child instanceof SVGElement) {
          // Direct DOM element
          finalChildren.push(child);
        } else if (child && typeof child === 'object') {
          // VNode - try to update existing element
          if (same(existingEl, child as VNode)) {
            update(existingEl, child as VNode, isSvg);
            finalChildren.push(existingEl);
          } else {
            // Create new element as types don't match
            const newElement = create(child, isSvg);
            finalChildren.push(newElement);
          }
        }
        unkeyedIndex++;
      } else {
        // No more unkeyed elements to reuse, create new
        const newElement = create(child, isSvg);
        finalChildren.push(newElement);
      }
    }
  }

  // Apply changes to DOM efficiently using insertBefore strategy
  applyChildrenChanges(element, finalChildren);
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

export function updateProps(element: Element, props: {}, isSvg) {
  // console.assert(!!element);

  // Capture protected properties before any reset/update operations
  const protectedProps = getProtectedProperties(element);

  // Handle className normalization upfront
  if (props && props['className']) {
    props = { ...props, class: props['className'] };
    delete props['className'];
  }

  // Reset commonly used properties that might persist
  resetCommonProperties(element);

  // Apply new properties
  if (!props) return;

  for (const name in props) {
    const value = props[name];

    // Skip applying new value if this property is protected
    if (protectedProps.hasOwnProperty(name)) {
      continue; // Keep the protected value
    }

    if (name.startsWith('data-')) {
      const dname = name.substring(5);
      const cname = dname.replace(/-(\w)/g, (match) => match[1].toUpperCase());
      if (value || value === "") element.dataset[cname] = value;
      else delete element.dataset[cname];
    } else if (name === 'style') {
      if (element.style.cssText) element.style.cssText = '';
      if (typeof value === 'string') element.style.cssText = value;
      else {
        for (const s in value) {
          element.style[s] = value[s];
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
      if (value) element.setAttribute(name, value);
      else element.removeAttribute(name);
    } else {
      element[name] = value;
    }
    // Set key property on DOM element for reconciliation (no global cache needed)
    if (name === 'key' && value !== undefined && value !== null) {
      element.key = value;
    }
  }

  // Restore protected properties after all other properties have been set
  Object.keys(protectedProps).forEach(prop => {
    (element as any)[prop] = protectedProps[prop];
  });

  if (props && typeof props['ref'] === 'function') {
    window.requestAnimationFrame(() => props['ref'](element));
  }
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

/**
 * Reset commonly used properties to ensure clean state
 * This aggressive reset strategy eliminates the need for complex property diffing
 * Protection of interactive properties is handled at the updateProps level
 */
function resetCommonProperties(element: Element) {
  // Reset common attributes
  element.removeAttribute('class');
  element.removeAttribute('id');
  element.removeAttribute('role');

  // Reset common aria attributes
  const ariaAttrs = ['aria-label', 'aria-hidden', 'aria-expanded', 'aria-selected'];
  ariaAttrs.forEach(attr => element.removeAttribute(attr));

  // Reset data attributes by clearing dataset
  Object.keys(element.dataset).forEach(key => {
    delete element.dataset[key];
  });

  // Reset style
  if (element.style.cssText) {
    element.style.cssText = '';
  }

  // Reset form properties aggressively (protection happens in updateProps)
  const tagName = element.tagName;

  if (tagName === 'INPUT') {
    const input = element as HTMLInputElement;
    input.value = '';
    input.checked = false;
  } else if (tagName === 'TEXTAREA') {
    (element as HTMLTextAreaElement).value = '';
  } else if (tagName === 'SELECT') {
    (element as HTMLSelectElement).selectedIndex = -1;
  } else if (tagName === 'OPTION') {
    (element as HTMLOptionElement).selected = false;
  }

  // Reset scroll position
  element.scrollTop = 0;
  element.scrollLeft = 0;

  // Reset event handlers
  const eventProps = ['onclick', 'onchange', 'oninput', 'onsubmit', 'onload'];
  eventProps.forEach(prop => {
    if (element[prop]) {
      element[prop] = null;
    }
  });
}

/**
 * Get protected properties for a specific element type to preserve UX during updates
 * Returns object with properties that should not be reset for interactive elements
 */
function getProtectedProperties(element: Element): { [key: string]: any } {
  const protectedProps: { [key: string]: any } = {};
  const tagName = element.tagName;
  const isActiveElement = element === document.activeElement;

  // Form elements - protect critical interactive state
  if (tagName === 'INPUT') {
    const inputType = (element as HTMLInputElement).type;

    // Protect value for text-like inputs when focused
    if (isActiveElement && ['text', 'password', 'email', 'url', 'tel', 'search'].includes(inputType)) {
      protectedProps.value = (element as HTMLInputElement).value;
      protectedProps.selectionStart = (element as HTMLInputElement).selectionStart;
      protectedProps.selectionEnd = (element as HTMLInputElement).selectionEnd;
      protectedProps.selectionDirection = (element as HTMLInputElement).selectionDirection;
    }

    // Protect checked state for checkboxes/radios
    if (['checkbox', 'radio'].includes(inputType)) {
      protectedProps.checked = (element as HTMLInputElement).checked;
    }
  }

  // Textarea - protect content and selection when focused
  else if (tagName === 'TEXTAREA' && isActiveElement) {
    protectedProps.value = (element as HTMLTextAreaElement).value;
    protectedProps.selectionStart = (element as HTMLTextAreaElement).selectionStart;
    protectedProps.selectionEnd = (element as HTMLTextAreaElement).selectionEnd;
    protectedProps.selectionDirection = (element as HTMLTextAreaElement).selectionDirection;
  }

  // Select - protect selected state
  else if (tagName === 'SELECT') {
    protectedProps.selectedIndex = (element as HTMLSelectElement).selectedIndex;
    protectedProps.value = (element as HTMLSelectElement).value;
  }

  // Option - protect selected state
  else if (tagName === 'OPTION') {
    protectedProps.selected = (element as HTMLOptionElement).selected;
  }

  // Scrollable elements - protect scroll position
  if (element.scrollTop > 0 || element.scrollLeft > 0) {
    protectedProps.scrollTop = element.scrollTop;
    protectedProps.scrollLeft = element.scrollLeft;
  }

  return protectedProps;
}
