/**
 * File: vdom-my-prop-attr.ts
 * Purpose: Standards-compliant property and attribute handling for VDOM operations
 * Features: Property-information based attribute normalization, enhanced style/dataset/event handling, property caching and nullification
 * Implementation: Extracted from vdom-my.ts for better modularity and standards compliance
 * Updated: 2025-07-13 - Cleaned up unused exports, only updateProps is exported for external use
 * 
 * EXPORTS:
 * - updateProps: Main function for updating DOM element properties (used by vdom-my.ts and tests)
 * 
 * INTERNAL FUNCTIONS (previously exported but unused externally):
 * - convertKebabToCamelCase: Converts kebab-case to camelCase for dataset properties
 * - setElementStyle: Enhanced style property handling with CSS custom properties
 * - setDatasetAttribute: Dataset attribute processing with proper conversion
 * - setEventHandler: Event handler assignment with addEventListener support
 * - setAttributeOrProperty: Standards-compliant attribute/property setting
 * - getProtectedProperties: Gets properties to preserve during updates
 * 
 * REMOVED:
 * - resetSpecificProperties: Was exported but never used externally
 */

import { find, html, svg } from 'property-information';

/**
 * Property caching key for storing previous properties on DOM elements
 * Restored from backup to enable property change tracking and nullification
 */
const ATTR_PROPS = '_props';

/**
 * Merge old and new properties with nullification of old properties
 * Restored from backup implementation to prevent DOM contamination
 * Ensures DOM contains ONLY properties present in current VDOM
 * 
 * OPTIMIZED: Fast-path for common scenarios and reduced object allocation
 */
function mergeProps(oldProps: { [key: string]: any }, newProps: { [key: string]: any }): { [key: string]: any } {
  try {
    // Handle className normalization (from backup)
    if (newProps) {
      newProps['class'] = newProps['class'] || newProps['className'];
      delete newProps['className'];
    }

    // OPTIMIZATION: Fast-path when no cached properties exist
    if (!oldProps || Object.keys(oldProps).length === 0) {
      return newProps || {};
    }

    // OPTIMIZATION: Fast-path when no new properties provided
    if (!newProps || Object.keys(newProps).length === 0) {
      // Still need to nullify old properties
      const props: { [key: string]: any } = {};
      const oldKeys = Object.keys(oldProps);
      oldKeys.forEach(p => {
        props[p] = null;
      });
      return props;
    }

    // EDGE CASE: Handle malformed cached properties gracefully
    let oldKeys: string[];
    try {
      oldKeys = Object.keys(oldProps);
    } catch (error) {
      console.warn('Malformed cached properties detected, falling back to new properties only:', error);
      return newProps;
    }

    // EDGE CASE: Handle malformed new properties gracefully
    let newKeys: string[];
    try {
      newKeys = Object.keys(newProps);
    } catch (error) {
      console.warn('Malformed new properties detected, applying cleanup only:', error);
      const props: { [key: string]: any } = {};
      oldKeys.forEach(p => {
        props[p] = null;
      });
      return props;
    }

    // OPTIMIZATION: Check if properties actually changed to avoid unnecessary work
    if (oldKeys.length === newKeys.length) {
      let hasChanges = false;
      for (const key of newKeys) {
        if (!(key in oldProps) || oldProps[key] !== newProps[key]) {
          hasChanges = true;
          break;
        }
      }
      if (!hasChanges) {
        // No changes detected - return cached props to avoid work
        return oldProps;
      }
    }

    const props: { [key: string]: any } = {};

    // First, nullify all old properties that are not in new props
    oldKeys.forEach(p => {
      if (!(p in newProps)) {
        props[p] = null;
      }
    });

    // Then apply all new properties
    newKeys.forEach(p => props[p] = newProps[p]);

    return props;
  } catch (error) {
    // FALLBACK: If mergeProps fails completely, return new properties only
    console.error('Critical error in mergeProps, falling back to new properties only:', error);
    return newProps || {};
  }
}

/**
 * Property information cache for performance optimization
 * Avoids repeated lookups for the same property names
 * ENHANCED: Memory leak protection with cache size limits
 */
const propertyInfoCache = new Map<string, any>();
const kebabToCamelCache = new Map<string, string>();

// Cache size limits to prevent memory leaks
const MAX_CACHE_SIZE = 1000;

/**
 * Clear caches when they get too large to prevent memory leaks
 */
function maintainCacheSize() {
  if (propertyInfoCache.size > MAX_CACHE_SIZE) {
    // Clear oldest half of entries (simple LRU-like behavior)
    const entries = Array.from(propertyInfoCache.entries());
    propertyInfoCache.clear();
    entries.slice(-MAX_CACHE_SIZE / 2).forEach(([key, value]) => {
      propertyInfoCache.set(key, value);
    });
  }

  if (kebabToCamelCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(kebabToCamelCache.entries());
    kebabToCamelCache.clear();
    entries.slice(-MAX_CACHE_SIZE / 2).forEach(([key, value]) => {
      kebabToCamelCache.set(key, value);
    });
  }
}

/**
 * Convert kebab-case strings to camelCase for dataset properties
 * OPTIMIZED: Cached conversion with better edge case handling and memory protection
 */
function convertKebabToCamelCase(str: string): string {
  // OPTIMIZATION: Use cache for frequent conversions
  let camelCase = kebabToCamelCache.get(str);
  if (camelCase !== undefined) {
    return camelCase;
  }

  // Handle single character or empty strings
  if (str.length <= 1) {
    camelCase = str.toLowerCase();
  } else {
    // Split by hyphens and convert to camelCase
    camelCase = str.split('-').map((word, index) => {
      if (index === 0) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join('');
  }

  // Cache the result with memory protection
  kebabToCamelCache.set(str, camelCase);

  // MEMORY PROTECTION: Maintain cache size
  if (kebabToCamelCache.size % 100 === 0) {
    maintainCacheSize();
  }

  return camelCase;
}

/**
 * Get property information using property-information package for standards compliance
 * OPTIMIZED: Cached lookups for better performance with memory leak protection
 */
function getPropertyInfo(name: string, isSvg: boolean) {
  const cacheKey = `${name}:${isSvg}`;
  let info = propertyInfoCache.get(cacheKey);

  if (info === undefined) {
    const schema = isSvg ? svg : html;
    info = find(schema, name) || null; // Store null for cache hits
    propertyInfoCache.set(cacheKey, info);

    // MEMORY PROTECTION: Maintain cache size
    if (propertyInfoCache.size % 100 === 0) {
      maintainCacheSize();
    }
  }

  return info;
}

/**
 * Enhanced style property handling with CSS custom properties support and proper cleanup
 * Handles both string styles and object styles with automatic px units and nullification
 */
function setElementStyle(element: HTMLElement, value: any): void {
  if (!element.style) return;

  if (value === null || value === undefined) {
    // Complete style reset when nullified
    element.style.cssText = '';
    return;
  }

  if (typeof value === 'string') {
    // Handle string styles (cssText)
    element.style.cssText = value;
  } else if (value && typeof value === 'object') {
    // For object styles, we need to reset existing styles first to prevent contamination
    // Get current style properties to clean up
    const currentStyles = element.style.cssText;
    const currentProps = new Set<string>();

    // Parse existing cssText to find current properties
    if (currentStyles) {
      const declarations = currentStyles.split(';');
      declarations.forEach(decl => {
        const colonIndex = decl.indexOf(':');
        if (colonIndex > 0) {
          const propName = decl.substring(0, colonIndex).trim();
          if (propName) {
            currentProps.add(propName);
          }
        }
      });
    }

    // Remove properties not in new value object
    currentProps.forEach(prop => {
      if (!(prop in value)) {
        if (prop.startsWith('--')) {
          element.style.removeProperty(prop);
        } else {
          // Convert kebab-case to camelCase for property access
          const camelProp = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
          if (camelProp in element.style) {
            (element.style as any)[camelProp] = '';
          } else {
            element.style.removeProperty(prop);
          }
        }
      }
    });

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
function setDatasetAttribute(element: Element, attributeName: string, value: any): void {
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

/**
 * Standards-compliant attribute/property setting using property-information
 */
function setAttributeOrProperty(element: Element, name: string, value: any, isSvg: boolean): void {
  // SPECIAL CASE: For form controls, always use property for certain props
  // This is because attributes and properties can be disconnected after user interaction
  if ((element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') &&
    (name === 'value' || name === 'selected' || name === 'selectedIndex')) {
    setElementProperty(element, name, value);
    return;
  }

  // SPECIAL CASE: For checkbox 'checked', set both property and attribute
  // HTML5 spec requires both for boolean attributes on form controls
  if (element.tagName === 'INPUT' && name === 'checked') {
    setElementProperty(element, name, value);
    setBooleanAttribute(element, name, value);
    return;
  }

  const info = getPropertyInfo(name, isSvg);

  if (info) {
    // Use property-information guidance (OPTIMIZED: cached lookup)
    if (info.boolean || info.overloadedBoolean) {
      // Boolean attribute (including overloadedBoolean like 'hidden')
      setBooleanAttribute(element, info.attribute, value);
    } else if (info.mustUseProperty && !isSvg) {
      // Must use property (like checked, selected, value for form elements)
      setElementProperty(element, info.property, value);
    } else {
      // Use attribute
      setElementAttribute(element, info.attribute, value, isSvg);
    }
  } else {
    // ENHANCED: Optimized fallback for unknown attributes
    if (name.startsWith('data-')) {
      setDatasetAttribute(element, name, value);
    } else if (name.startsWith('aria-') || name === 'role') {
      setElementAttribute(element, name, value, isSvg);
    } else if (name.startsWith('on')) {
      // Event handlers should be handled separately
      setEventHandler(element, name, value, true);
    } else {
      // OPTIMIZATION: Try as property first for better performance
      try {
        if (name in element || (element as any)[name] !== undefined) {
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
    // For boolean attributes, set the value to the attribute name
    element.setAttribute(attributeName, attributeName);
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
  if (value == null) {
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
  if (value == null || value === false || value === '') return false;
  if (value === true) return true;
  if (typeof value === 'string') {
    // HTML5 spec: presence of attribute = true, absence = false
    // Handle case-insensitive "false" values
    const lowerValue = value.toLowerCase();
    return lowerValue !== 'false' && value !== '0';
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
 * Gets properties that should be protected from updates to preserve critical UI state
 * Focus: Scroll positions, Input values when focused, and Focus state
 */
function getProtectedProperties(element: Element): { [key: string]: any } {
  const protectedProps: { [key: string]: any } = {};

  // Check if element is currently focused
  const isFocused = document.activeElement === element;

  // Protect input values only when focused (to preserve typing state)
  if (isFocused) {
    if (element.tagName === 'INPUT') {
      const input = element as HTMLInputElement;
      if (input.type === 'text' || input.type === 'password' || input.type === 'email' ||
        input.type === 'search' || input.type === 'tel' || input.type === 'url') {
        protectedProps.value = input.value;
        protectedProps.selectionStart = input.selectionStart;
        protectedProps.selectionEnd = input.selectionEnd;
      }
    } else if (element.tagName === 'TEXTAREA') {
      const textarea = element as HTMLTextAreaElement;
      protectedProps.value = textarea.value;
      protectedProps.selectionStart = textarea.selectionStart;
      protectedProps.selectionEnd = textarea.selectionEnd;
    }
  }

  // Always protect scroll positions (critical for UX)
  if ('scrollTop' in element && 'scrollLeft' in element) {
    const scrollable = element as HTMLElement;
    if (scrollable.scrollTop > 0 || scrollable.scrollLeft > 0) {
      protectedProps.scrollTop = scrollable.scrollTop;
      protectedProps.scrollLeft = scrollable.scrollLeft;
    }
  }

  return protectedProps;
}

/**
 * Update element properties with DOM contamination prevention
 * ENHANCED: Comprehensive error handling, memory protection, and edge case management
 */
export function updateProps(element: Element, props: { [key: string]: any }, isSvg: boolean): void {
  try {
    // OPTIMIZATION: Early exit if no properties to apply
    if (!props || Object.keys(props).length === 0) {
      // Still need to cleanup if there are cached properties
      const cached = (element as any)[ATTR_PROPS];
      if (cached && Object.keys(cached).length > 0) {
        try {
          // Apply nullification to cleanup old properties
          const mergedProps = mergeProps(cached, {});
          (element as any)[ATTR_PROPS] = {};
          applyPropertiesToElement(element, mergedProps, props, isSvg);
        } catch (cleanupError) {
          console.warn('Error during property cleanup, continuing:', cleanupError);
          // Clear cache to prevent future issues
          (element as any)[ATTR_PROPS] = {};
        }
      }
      return;
    }

    // Capture protected properties before any updates
    let protectedProps: { [key: string]: any } = {};
    try {
      protectedProps = getProtectedProperties(element);
    } catch (error) {
      console.warn('Could not capture protected properties, continuing without protection:', error);
    }

    // Get cached properties from previous update (restored from backup)
    let cached: { [key: string]: any } = {};
    try {
      cached = (element as any)[ATTR_PROPS] || {};
    } catch (error) {
      console.warn('Could not access cached properties, starting fresh:', error);
      (element as any)[ATTR_PROPS] = {};
    }

    // Merge old and new properties with nullification (restored from backup)
    const mergedProps = mergeProps(cached, props);

    // OPTIMIZATION: Only update cache if properties actually changed
    if (mergedProps !== cached) {
      try {
        (element as any)[ATTR_PROPS] = mergedProps;
      } catch (error) {
        console.warn('Could not cache properties, continuing without caching:', error);
      }
    }

    // Apply merged properties using current sophisticated property handling
    applyPropertiesToElement(element, mergedProps, props, isSvg, protectedProps);
  } catch (error) {
    // CRITICAL FALLBACK: If updateProps fails completely, try direct property application
    console.error('Critical error in updateProps, attempting direct property application:', error);
    try {
      // Clear any corrupted cache
      (element as any)[ATTR_PROPS] = {};
      // Apply properties directly without merging
      applyPropertiesToElement(element, props || {}, props, isSvg);
    } catch (fallbackError) {
      console.error('Fallback property application also failed:', fallbackError);
    }
  }
}

/**
 * Apply properties to element - extracted for better performance and readability
 */
function applyPropertiesToElement(
  element: Element,
  mergedProps: { [key: string]: any },
  originalProps: { [key: string]: any } | null,
  isSvg: boolean,
  protectedProps: { [key: string]: any } = {}
): void {
  // Apply merged properties using current sophisticated property handling
  for (const name in mergedProps) {
    const value = mergedProps[name];

    if (!isValidAttributeName(name)) {
      console.warn(`Invalid attribute name: ${name}`);
      continue;
    }

    // Handle special cases
    if (name === 'style') {
      setElementStyle(element as HTMLElement, value);
    } else if (name === 'key') {
      // Handle key property for keyed reconciliation (from backup)
      if (value !== undefined && value !== null) {
        (element as any).key = value;
      }
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

  // Handle ref callback (only from current props, not merged)
  if (originalProps && typeof originalProps['ref'] === 'function') {
    originalProps['ref'](element);
  }
}
