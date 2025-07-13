/**
 * File: vdom-my-prop-attr.ts
 * Purpose: Standards-compliant property and attribute handling for VDOM operations
 * Features: Property-information based attribute normalization, enhanced style/dataset/event handling
 * Implementation: Extracted from vdom-my.ts for better modularity and standards compliance
 * Created: 2024-07-13
 */

import { find, html, svg } from 'property-information';

/**
 * Convert kebab-case strings to camelCase for dataset properties
 * Enhanced version with better edge case handling
 */
export function convertKebabToCamelCase(str: string): string {
  // Handle single character or empty strings
  if (str.length <= 1) return str.toLowerCase();

  // Split by hyphens and convert to camelCase
  return str.split('-').map((word, index) => {
    if (index === 0) return word.toLowerCase();
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join('');
}

/**
 * Get property information using property-information package for standards compliance
 */
function getPropertyInfo(name: string, isSvg: boolean) {
  const schema = isSvg ? svg : html;
  return find(schema, name);
}

/**
 * Enhanced style property handling with CSS custom properties support
 * Handles both string styles and object styles with automatic px units
 */
export function setElementStyle(element: HTMLElement, value: any): void {
  if (!element.style) return;

  if (typeof value === 'string') {
    // Handle string styles (cssText)
    element.style.cssText = value;
  } else if (value && typeof value === 'object') {
    // Handle object styles
    for (const property in value) {
      const cssValue = value[property];

      if (cssValue == null) {
        // Remove property if value is null/undefined
        if (property.startsWith('--')) {
          // CSS custom property
          element.style.removeProperty(property);
        } else {
          element.style.removeProperty(property);
        }
      } else {
        const processedValue = processCSSValue(property, cssValue);

        if (property.startsWith('--')) {
          // CSS custom properties (CSS variables)
          element.style.setProperty(property, processedValue);
        } else {
          // Regular CSS properties
          (element.style as any)[property] = processedValue;
        }
      }
    }
  }
}

/**
 * Process CSS values with automatic unit addition for dimensional properties
 */
function processCSSValue(property: string, value: any): string {
  if (typeof value === 'number' && value !== 0) {
    // Properties that should get 'px' units when numeric
    const pxProperties = /^(width|height|top|right|bottom|left|margin|padding|border|fontSize|lineHeight|letterSpacing|wordSpacing|textIndent|maxWidth|maxHeight|minWidth|minHeight|borderRadius|borderWidth|outlineWidth|columnGap|rowGap|gap|flexBasis|inset|blockSize|inlineSize)$/i;

    if (pxProperties.test(property) || property.includes('Width') || property.includes('Height')) {
      return `${value}px`;
    }
  }

  return String(value);
}

/**
 * Enhanced dataset attribute processing with proper conversion
 */
export function setDatasetAttribute(element: Element, attributeName: string, value: any): void {
  // Extract the data key (remove 'data-' prefix)
  const dataKey = attributeName.slice(5);
  const camelKey = convertKebabToCamelCase(dataKey);

  if (value == null) {
    // Remove dataset attribute
    delete (element as HTMLElement).dataset[camelKey];
  } else {
    // Set dataset attribute (always as string)
    (element as HTMLElement).dataset[camelKey] = String(value);
  }
}

/**
 * Enhanced event handler assignment with addEventListener support
 * Handles both onclick style and on:event-name style events
 */
export function setEventHandler(element: Element, name: string, value: any, isUpdate = false): void {
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

/**
 * Standards-compliant attribute/property setting using property-information
 */
export function setAttributeOrProperty(element: Element, name: string, value: any, isSvg: boolean): void {
  const info = getPropertyInfo(name, isSvg);

  if (info) {
    // Use property-information guidance
    if (info.boolean) {
      // Boolean attribute
      setBooleanAttribute(element, info.attribute, value);
    } else if (info.mustUseProperty && !isSvg) {
      // Must use property (like checked, selected, value for form elements)
      setElementProperty(element, info.property, value);
    } else {
      // Use attribute
      setElementAttribute(element, info.attribute, value, isSvg);
    }
  } else {
    // Fallback for unknown attributes
    if (name.startsWith('data-')) {
      setDatasetAttribute(element, name, value);
    } else if (name.startsWith('aria-') || name.startsWith('role')) {
      setElementAttribute(element, name, value, isSvg);
    } else {
      // Try as property first, fallback to attribute
      try {
        if (name in element) {
          setElementProperty(element, name, value);
        } else {
          setElementAttribute(element, name, value, isSvg);
        }
      } catch {
        setElementAttribute(element, name, value, isSvg);
      }
    }
  }
}

/**
 * Set boolean attributes following HTML5 specification
 */
function setBooleanAttribute(element: Element, attributeName: string, value: any): void {
  const shouldSet = shouldSetBooleanAttribute(value);

  if (shouldSet) {
    element.setAttribute(attributeName, '');
  } else {
    element.removeAttribute(attributeName);
  }
}

/**
 * Set element property directly
 */
function setElementProperty(element: Element, propertyName: string, value: any): void {
  try {
    (element as any)[propertyName] = value;
  } catch (error) {
    // Fallback to attribute if property setting fails
    console.warn(`Failed to set property ${propertyName}:`, error);
    setElementAttribute(element, propertyName, value, false);
  }
}

/**
 * Set element attribute with namespace support
 */
function setElementAttribute(element: Element, attributeName: string, value: any, isSvg: boolean): void {
  if (value == null || value === false) {
    element.removeAttribute(attributeName);
    return;
  }

  const stringValue = String(value);

  if (isSvg && attributeName.includes(':')) {
    // Handle namespaced attributes for SVG
    const [prefix, localName] = attributeName.split(':');
    if (prefix === 'xlink') {
      element.setAttributeNS('http://www.w3.org/1999/xlink', attributeName, stringValue);
    } else {
      element.setAttribute(attributeName, stringValue);
    }
  } else {
    element.setAttribute(attributeName, stringValue);
  }
}

/**
 * Determine if a value should set a boolean attribute
 */
function shouldSetBooleanAttribute(value: any): boolean {
  if (value == null || value === false) return false;
  if (value === true || value === '') return true;
  if (typeof value === 'string') {
    // HTML5 spec: presence of attribute = true, absence = false
    // But some frameworks pass "false" as string, so handle that
    return value !== 'false';
  }
  // Truthy values set the attribute
  return Boolean(value);
}

/**
 * Check if attribute name is valid (security check)
 */
function isValidAttributeName(name: string): boolean {
  // Basic validation - prevent script injection and invalid characters
  return /^[a-zA-Z_:][\w\-:.]*$/.test(name) &&
    !name.includes('<') &&
    !name.includes('>') &&
    !name.includes('"') &&
    !name.includes("'");
}

/**
 * Reset only specific properties that are being updated
 * This prevents clearing unrelated attributes during partial updates
 */
export function resetSpecificProperties(element: Element, propsToReset: string[]): void {
  propsToReset.forEach(prop => {
    if (prop === 'class' || prop === 'className') {
      element.removeAttribute('class');
    } else if (prop === 'id') {
      element.removeAttribute('id');
    } else if (prop === 'style') {
      // Only reset style if style is being updated
      const htmlElement = element as HTMLElement;
      if (htmlElement.style && htmlElement.style.cssText) {
        htmlElement.style.cssText = '';
      }
    } else if (prop.startsWith('data-')) {
      // Only reset specific dataset attribute
      const dataKey = prop.slice(5); // Remove 'data-' prefix
      const camelKey = convertKebabToCamelCase(dataKey);
      delete (element as HTMLElement).dataset[camelKey];
    } else if (prop.startsWith('aria-')) {
      element.removeAttribute(prop);
    } else if (prop.startsWith('on')) {
      // Reset specific event handler
      if ((element as any)[prop]) {
        (element as any)[prop] = null;
      }
    }
    // For other attributes, we don't need to pre-reset since they'll be overwritten
  });
}

/**
 * Get protected properties for UX preservation during updates
 */
export function getProtectedProperties(element: Element): { [key: string]: any } {
  const protectedProps: { [key: string]: any } = {};
  const tagName = element.tagName;

  // Only protect if element is focused (active)
  const isActive = document.activeElement === element;
  if (!isActive) return protectedProps;

  // Protect form control values and state
  if (tagName === 'INPUT') {
    const input = element as HTMLInputElement;
    if (input.type === 'text' || input.type === 'password' || input.type === 'email' || input.type === 'search' || input.type === 'tel' || input.type === 'url') {
      protectedProps.value = input.value;
      protectedProps.selectionStart = input.selectionStart;
      protectedProps.selectionEnd = input.selectionEnd;
      protectedProps.selectionDirection = input.selectionDirection;
    } else if (input.type === 'checkbox' || input.type === 'radio') {
      protectedProps.checked = input.checked;
    }
  } else if (tagName === 'TEXTAREA') {
    const textarea = element as HTMLTextAreaElement;
    protectedProps.value = textarea.value;
    protectedProps.selectionStart = textarea.selectionStart;
    protectedProps.selectionEnd = textarea.selectionEnd;
    protectedProps.selectionDirection = textarea.selectionDirection;
  } else if (tagName === 'SELECT') {
    protectedProps.selectedIndex = (element as HTMLSelectElement).selectedIndex;
  }

  return protectedProps;
}

/**
 * Main property update function with standards compliance
 */
export function updateProps(element: Element, props: { [key: string]: any }, isSvg: boolean): void {
  if (!props) return;

  // Capture protected properties before any updates
  const protectedProps = getProtectedProperties(element);

  // Only reset properties that are being explicitly set
  if (props) {
    resetSpecificProperties(element, Object.keys(props));
  }

  // Apply new properties using standards-compliant methods
  for (const name in props) {
    const value = props[name];

    if (!isValidAttributeName(name)) {
      console.warn(`Invalid attribute name: ${name}`);
      continue;
    }

    // Handle special cases
    if (name === 'style') {
      setElementStyle(element as HTMLElement, value);
    } else if (name.startsWith('data-')) {
      setDatasetAttribute(element, name, value);
    } else if (name.startsWith('on')) {
      setEventHandler(element, name, value, true);
    } else {
      // Use standards-compliant attribute/property setting
      setAttributeOrProperty(element, name, value, isSvg);
    }
  }

  // Restore protected properties
  Object.keys(protectedProps).forEach(prop => {
    (element as any)[prop] = protectedProps[prop];
  });

  // Handle ref callback
  if (props && typeof props['ref'] === 'function') {
    props['ref'](element);
  }
}
