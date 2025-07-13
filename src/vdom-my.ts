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

/**
 * Comprehensive attribute normalization map for React/HTML compatibility
 * Maps React-style attributes to their HTML equivalents
 */
const ATTRIBUTE_NORMALIZATION_MAP: { [key: string]: string } = {
  // React → HTML attribute mapping
  'className': 'class',
  'htmlFor': 'for',
  'acceptCharset': 'accept-charset',
  'accessKey': 'accesskey',
  'allowFullScreen': 'allowfullscreen',
  'autoComplete': 'autocomplete',
  'autoFocus': 'autofocus',
  'autoPlay': 'autoplay',
  'cellPadding': 'cellpadding',
  'cellSpacing': 'cellspacing',
  'charSet': 'charset',
  'classID': 'classid',
  'colSpan': 'colspan',
  'contentEditable': 'contenteditable',
  'contextMenu': 'contextmenu',
  'crossOrigin': 'crossorigin',
  'dateTime': 'datetime',
  'encType': 'enctype',
  'formAction': 'formaction',
  'formEncType': 'formenctype',
  'formMethod': 'formmethod',
  'formNoValidate': 'formnovalidate',
  'formTarget': 'formtarget',
  'frameBorder': 'frameborder',
  'hrefLang': 'hreflang',
  'inputMode': 'inputmode',
  'itemID': 'itemid',
  'itemProp': 'itemprop',
  'itemRef': 'itemref',
  'itemScope': 'itemscope',
  'itemType': 'itemtype',
  'keyParams': 'keyparams',
  'keyType': 'keytype',
  'marginHeight': 'marginheight',
  'marginWidth': 'marginwidth',
  'maxLength': 'maxlength',
  'mediaGroup': 'mediagroup',
  'minLength': 'minlength',
  'noValidate': 'novalidate',
  'radioGroup': 'radiogroup',
  'readOnly': 'readonly',
  'rowSpan': 'rowspan',
  'spellCheck': 'spellcheck',
  'srcDoc': 'srcdoc',
  'srcLang': 'srclang',
  'srcSet': 'srcset',
  'tabIndex': 'tabindex',
  'useMap': 'usemap'
};

/**
 * Normalize attribute name to HTML standard
 * Handles React-style camelCase to HTML kebab-case conversion
 */
function normalizeAttributeName(name: string): string {
  // Check explicit mapping first
  if (ATTRIBUTE_NORMALIZATION_MAP[name]) {
    return ATTRIBUTE_NORMALIZATION_MAP[name];
  }

  // Handle data- and aria- attributes (already lowercase in most cases)
  if (name.startsWith('data-') || name.startsWith('aria-')) {
    return name.toLowerCase();
  }

  // Return as-is for other attributes (style, class, id, etc.)
  return name;
}

/**
 * Categorize attributes for proper handling
 * Returns the appropriate handler type for the given attribute
 */
function categorizeAttribute(name: string, isSvg: boolean): 'property' | 'attribute' | 'boolean-attribute' {
  // Properties that should be set as DOM properties (not attributes)
  // Note: Form control properties like checked, disabled, selected are handled as boolean attributes
  const DOM_PROPERTIES = /^(value|selectedIndex|defaultValue|defaultChecked|defaultSelected|key)$/;

  // Boolean attributes that should be set/removed (not set to string values)
  // These follow HTML5 specification where presence = true, absence = false
  const BOOLEAN_ATTRIBUTES = /^(allowfullscreen|async|autofocus|autoplay|capture|checked|controls|default|defer|disabled|formnovalidate|hidden|itemscope|loop|multiple|muted|open|readonly|required|reversed|selected|truespeed)$/;

  // Attributes that should always be set as HTML attributes
  const FORCED_ATTRIBUTES = /^(id|class|for|role|title|lang|dir|accesskey|contenteditable|draggable|spellcheck|translate|tabindex|accept-charset|autocomplete|maxlength|minlength|data-|aria-|xmlns|viewbox|stroke|fill|d|cx|cy|r|x|y|width|height|href|src|alt|type|name|placeholder|pattern)$/i;

  // SVG elements should use attributes for most properties
  if (isSvg) {
    return BOOLEAN_ATTRIBUTES.test(name) ? 'boolean-attribute' : 'attribute';
  }

  // Check for boolean attributes first (before other categorizations)
  if (BOOLEAN_ATTRIBUTES.test(name)) {
    return 'boolean-attribute';
  }

  // Check specific categories
  if (FORCED_ATTRIBUTES.test(name) || name.includes('-')) {
    return 'attribute';
  }

  if (DOM_PROPERTIES.test(name)) {
    return 'property';
  }

  // Default to attribute for unknown properties
  return 'attribute';
}

export function updateProps(element: Element, props: {}, isSvg) {
  // console.assert(!!element);

  // Capture protected properties before any reset/update operations
  const protectedProps = getProtectedProperties(element);

  // Normalize all attribute names upfront using comprehensive mapping
  if (props) {
    const normalizedProps = {};
    for (const name in props) {
      const normalizedName = normalizeAttributeName(name);
      normalizedProps[normalizedName] = props[name];
    }
    props = normalizedProps;
  }

  // Only reset properties that are being explicitly set
  // Don't call resetCommonProperties for partial updates
  if (props) {
    resetSpecificProperties(element, Object.keys(props));
  }

  // Apply new properties
  if (!props) return;

  for (const name in props) {
    const value = props[name];

    // Skip applying new value if this property is protected
    if (protectedProps.hasOwnProperty(name)) {
      continue; // Keep the protected value
    }

    // Normalize attribute name to HTML standard
    const normalizedAttributeName = normalizeAttributeName(name);

    if (normalizedAttributeName.startsWith('data-')) {
      setDatasetAttribute(element, normalizedAttributeName, value);
    } else if (normalizedAttributeName === 'style') {
      setElementStyle(element as HTMLElement, value);
    } else if (normalizedAttributeName.startsWith('xlink')) {
      const xname = normalizedAttributeName.replace('xlink', '').toLowerCase();
      if (value == null || value === false) {
        element.removeAttributeNS('http://www.w3.org/1999/xlink', xname);
      } else {
        setAttributeWithNamespace(element, `xlink:${xname}`, value, isSvg);
      }
    } else if (normalizedAttributeName.startsWith('on')) {
      setEventHandler(element, normalizedAttributeName, value, true);
    } else {
      // Use intelligent categorization for all other attributes
      const handlerType = categorizeAttribute(normalizedAttributeName, isSvg);

      if (handlerType === 'property') {
        element[normalizedAttributeName] = value;
      } else if (handlerType === 'boolean-attribute') {
        // HTML5 boolean attributes: presence = true, absence = false
        // Handle various falsy values that should remove the attribute
        if (shouldSetBooleanAttribute(value)) {
          if (isValidAttributeName(normalizedAttributeName)) {
            setAttributeWithNamespace(element, normalizedAttributeName, normalizedAttributeName, isSvg);
          }
        } else {
          element.removeAttribute(normalizedAttributeName);
        }
      } else { // 'attribute'
        if (value != null) {
          if (isValidAttributeName(normalizedAttributeName)) {
            setAttributeWithNamespace(element, normalizedAttributeName, String(value), isSvg);
          }
        } else {
          element.removeAttribute(normalizedAttributeName);
        }
      }
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

/**
 * Validates if an attribute name is valid for HTML/SVG elements
 * HTML attribute names must not contain spaces, control characters, or certain symbols
 */
function isValidAttributeName(name: string): boolean {
  // HTML attribute names cannot contain spaces, quotes, >, /, =, control characters
  return /^[^\s"'>\/=\x00-\x1F\x7F-\x9F]+$/.test(name);
}

/**
 * Sets an attribute with proper namespace handling for SVG elements
 */
function setAttributeWithNamespace(element: Element, name: string, value: string, isSvg: boolean): void {
  if (!isValidAttributeName(name)) {
    return; // Skip invalid attribute names
  }

  // SVG namespace mappings
  const SVG_NAMESPACE_ATTRS = {
    'xmlns': 'http://www.w3.org/2000/xmlns/',
    'xmlns:xlink': 'http://www.w3.org/2000/xmlns/',
    'xml:lang': 'http://www.w3.org/XML/1998/namespace',
    'xml:space': 'http://www.w3.org/XML/1998/namespace'
  };

  // XLink namespace attributes (deprecated but still used)
  const XLINK_NAMESPACE_ATTRS = /^xlink:(href|title|show|actuate|role|arcrole|type)$/;

  if (isSvg) {
    // Handle specific namespace attributes
    if (SVG_NAMESPACE_ATTRS[name]) {
      element.setAttributeNS(SVG_NAMESPACE_ATTRS[name], name, value);
      return;
    }

    // Handle xlink namespace attributes
    if (XLINK_NAMESPACE_ATTRS.test(name)) {
      element.setAttributeNS('http://www.w3.org/1999/xlink', name, value);
      return;
    }
  }

  // Default to regular setAttribute
  element.setAttribute(name, value);
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
 * Enhanced dataset attribute handler with robust kebab-case to camelCase conversion
 */
function setDatasetAttribute(element: Element, attributeName: string, value: any): void {
  // Extract the data attribute name (remove 'data-' prefix)
  const dname = attributeName.substring(5);

  // Enhanced kebab-case to camelCase conversion
  // Handles cases like 'a-b-c-d-e' -> 'aBcDe'
  const cname = convertKebabToCamelCase(dname);

  if (value != null) {
    element.dataset[cname] = String(value);
  } else {
    delete element.dataset[cname];
  }
}

/**
 * Converts kebab-case to camelCase with improved handling of single characters
 * Examples:
 * - 'user-id' -> 'userId'
 * - 'a-b-c-d-e' -> 'aBcDe'
 * - 'very-long-name' -> 'veryLongName'
 * - 'single' -> 'single'
 */
function convertKebabToCamelCase(kebabStr: string): string {
  return kebabStr.replace(/-(.)/g, (match, letter) => letter.toUpperCase());
}

/**
 * Enhanced style property handler with comprehensive CSS support
 * Handles: string styles, object styles, CSS custom properties, automatic px units
 */
function setElementStyle(element: HTMLElement, value: any): void {
  // Clear existing styles first
  if (element.style.cssText) {
    element.style.cssText = '';
  }

  if (value == null) {
    return; // No styles to set
  }

  if (typeof value === 'string') {
    // Handle CSS text string
    element.style.cssText = value;
  } else if (typeof value === 'object') {
    // Handle style object
    for (const styleProp in value) {
      const styleValue = value[styleProp];

      // Skip null/undefined values
      if (styleValue == null) {
        continue;
      }

      // Handle CSS custom properties (CSS variables)
      if (styleProp.startsWith('--')) {
        element.style.setProperty(styleProp, String(styleValue));
      } else {
        // Handle regular CSS properties using direct assignment
        const processedValue = processCSSValue(styleProp, styleValue);
        element.style[styleProp] = processedValue;
      }
    }
  }
}

/**
 * Process CSS values with automatic px unit addition for numeric values
 */
function processCSSValue(property: string, value: any): string {
  if (typeof value === 'number') {
    // Properties that should NOT get automatic 'px' units
    const unitlessProperties = new Set([
      'opacity', 'zIndex', 'fontWeight', 'lineHeight', 'flex', 'flexGrow',
      'flexShrink', 'order', 'gridColumn', 'gridRow', 'columnCount',
      'fillOpacity', 'strokeOpacity', 'animationIterationCount'
    ]);

    if (unitlessProperties.has(property)) {
      return String(value);
    } else {
      // Add 'px' for numeric values on dimensional properties
      return `${value}px`;
    }
  }

  return String(value);
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
 * Reset only specific properties that are being updated
 * This prevents clearing unrelated attributes during partial updates
 */
function resetSpecificProperties(element: Element, propsToReset: string[]) {
  propsToReset.forEach(prop => {
    if (prop === 'class' || prop === 'className') {
      element.removeAttribute('class');
    } else if (prop === 'id') {
      element.removeAttribute('id');
    } else if (prop === 'style') {
      // Only reset style if style is being updated
      if (element.style.cssText) {
        element.style.cssText = '';
      }
    } else if (prop.startsWith('data-')) {
      // Only reset specific dataset attribute
      const dataKey = prop.slice(5); // Remove 'data-' prefix
      const camelKey = convertKebabToCamelCase(dataKey);
      delete element.dataset[camelKey];
    } else if (prop.startsWith('aria-')) {
      element.removeAttribute(prop);
    } else if (prop.startsWith('on')) {
      // Reset specific event handler
      if (element[prop]) {
        element[prop] = null;
      }
    }
    // For other attributes, we don't need to pre-reset since they'll be overwritten
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

/**
 * Determines if a boolean attribute should be set based on its value
 * HTML5 boolean attributes follow the rule: presence = true, absence = false
 */
function shouldSetBooleanAttribute(value: any): boolean {
  // Falsy values that should remove the attribute
  if (value === false || value === null || value === undefined) {
    return false;
  }

  // String "false" should also remove the attribute (React convention)
  if (value === 'false' || value === 'False' || value === 'FALSE') {
    return false;
  }

  // Empty string should remove the attribute
  if (value === '') {
    return false;
  }

  // String "0" should remove the attribute
  if (value === '0') {
    return false;
  }

  // Number 0 should remove the attribute
  if (value === 0) {
    return false;
  }

  // All other truthy values should set the attribute
  return true;
}

/**
 * Enhanced event handler assignment with addEventListener support
 * Handles both onclick style and on:event-name style events
 */
function setEventHandler(element: Element, name: string, value: any, isUpdate = false): void {
  // Handle on:event-name pattern for addEventListener
  if (name.startsWith('on:')) {
    const eventName = name.slice(3); // Remove 'on:' prefix

    // Store reference to current listener for cleanup
    const listenerKey = `__apprun_listener_${eventName}`;
    const currentListener = (element as any)[listenerKey];

    // Remove old listener if it exists
    if (currentListener && isUpdate) {
      element.removeEventListener(eventName, currentListener);
      delete (element as any)[listenerKey];
    }

    // Add new listener if value is a function
    if (typeof value === 'function') {
      element.addEventListener(eventName, value);
      (element as any)[listenerKey] = value;
    }

    return;
  }

  // Handle standard onclick style events
  if (name.startsWith('on') && name.length > 2) {
    if (!value || typeof value === 'function') {
      (element as any)[name] = value;
    }
    return;
  }
}
