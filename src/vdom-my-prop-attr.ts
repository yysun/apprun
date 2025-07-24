/**
 * VDOM Property and Attribute Handler
 * Standards-compliant property/attribute handling with caching and special element support
 * Features: Skip logic for preserving user interactions during VDOM reconciliation
 * Exports: updateProps - Main function for DOM element property updates
 * Updated: 2025-01-14 - Skip logic for focus-sensitive (selection), scroll, and media properties
 */

import { find, html, svg } from 'property-information';

const ATTR_PROPS = '_props';
const propertyInfoCache = new Map<string, any>();

// Merge old and new props, handling className -> class conversion and null cleanup
function mergeProps(oldProps: { [key: string]: any }, newProps: { [key: string]: any }): { [key: string]: any } {
  if (newProps) {
    newProps['class'] = newProps['class'] || newProps['className'];
    delete newProps['className'];
  }

  if (!oldProps || Object.keys(oldProps).length === 0) return newProps || {};
  if (!newProps || Object.keys(newProps).length === 0) {
    const props: { [key: string]: any } = {};
    Object.keys(oldProps).forEach(p => props[p] = null);
    return props;
  }

  const props: { [key: string]: any } = {};
  Object.keys(oldProps).forEach(p => {
    if (!(p in newProps)) props[p] = null;
  });
  Object.keys(newProps).forEach(p => props[p] = newProps[p]);
  return props;
}

// Convert kebab-case to camelCase for dataset keys
function convertKebabToCamelCase(str: string): string {
  if (str.length <= 1) return str.toLowerCase();
  return str.split('-').map((word, index) =>
    index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join('');
}

// Cached property information lookup
function getPropertyInfo(name: string, isSvg: boolean) {
  const cacheKey = `${name}:${isSvg}`;
  let info = propertyInfoCache.get(cacheKey);
  if (info === undefined) {
    info = find(isSvg ? svg : html, name) || null;
    propertyInfoCache.set(cacheKey, info);
  }
  return info;
}


// Specialized handlers for different attribute types
function setDatasetAttribute(element: Element, attributeName: string, value: any): void {
  const camelKey = convertKebabToCamelCase(attributeName.slice(5));
  if (value == null) {
    delete (element as HTMLElement).dataset[camelKey];
  } else {
    (element as HTMLElement).dataset[camelKey] = String(value);
  }
}

function setEventHandler(element: Element, name: string, value: any): void {
  if (!name.startsWith('on')) return;

  if (!value || typeof value === 'function') {
    (element as any)[name] = value;
  } else if (typeof value === 'string') {
    if (value) element.setAttribute(name, value);
    else element.removeAttribute(name);
  }
}

function setBooleanAttribute(element: Element, attributeName: string, value: any): void {
  if (shouldSetBooleanAttribute(value)) {
    element.setAttribute(attributeName, attributeName);
  } else {
    element.removeAttribute(attributeName);
  }
}

function setElementProperty(element: Element, propertyName: string, value: any): void {
  try {
    (element as any)[propertyName] = value;
  } catch (error) {
    setElementAttribute(element, propertyName, value, false);
  }
}

function setElementAttribute(element: Element, attributeName: string, value: any, isSvg: boolean): void {
  if (value == null) {
    element.removeAttribute(attributeName);
    return;
  }

  const stringValue = String(value);
  if (isSvg && attributeName.includes(':')) {
    const [prefix] = attributeName.split(':');
    if (prefix === 'xlink') {
      element.setAttributeNS('http://www.w3.org/1999/xlink', attributeName, stringValue);
    } else {
      element.setAttribute(attributeName, stringValue);
    }
  } else {
    element.setAttribute(attributeName, stringValue);
  }
}

function shouldSetBooleanAttribute(value: any): boolean {
  if (value == null || value === false || value === '') return false;
  if (value === true) return true;
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    return lowerValue !== 'false' && value !== '0';
  }
  return Boolean(value);
}

// Core property/attribute setting function - handles all property types with skip logic
function setAttributeOrProperty(element: Element, name: string, value: any, isSvg: boolean): void {
  // Check if we should skip this property update to preserve user interaction
  if (shouldSkipPatch(element as HTMLElement, name)) {
    return;
  }

  // Special cases with dedicated handling
  if (name === 'style') {
    if ((element as HTMLElement).style.cssText) (element as HTMLElement).style.cssText = '';
    if (typeof value === 'string') (element as HTMLElement).style.cssText = value;
    else if (value && typeof value === 'object') {
      for (const s in value) {
        if ((element as HTMLElement).style[s] !== value[s]) (element as HTMLElement).style[s] = value[s];
      }
    }
    return;
  }

  if (name === 'key') {
    if (value !== undefined && value !== null) (element as any).key = value;
    return;
  }

  if (name.startsWith('data-')) {
    setDatasetAttribute(element, name, value);
    return;
  }

  if (name.startsWith('on')) {
    setEventHandler(element, name, value);
    return;
  }

  // Form elements with special property requirements
  if ((element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') &&
    (name === 'value' || name === 'selected' || name === 'selectedIndex')) {
    setElementProperty(element, name, value);
    return;
  }

  // Input checked needs both property and attribute
  if (element.tagName === 'INPUT' && name === 'checked') {
    setElementProperty(element, name, value);
    setBooleanAttribute(element, name, value);
    return;
  }

  // Use property information for standard attributes
  const info = getPropertyInfo(name, isSvg);
  if (info) {
    if (info.boolean || info.overloadedBoolean) {
      setBooleanAttribute(element, info.attribute, value);
    } else if (info.mustUseProperty && !isSvg) {
      setElementProperty(element, info.property, value);
    } else {
      setElementAttribute(element, info.attribute, value, isSvg);
    }
  } else {
    // Fallback handling for unknown attributes
    if (name.startsWith('aria-') || name === 'role') {
      setElementAttribute(element, name, value, isSvg);
    } else if (name in element || (element as any)[name] !== undefined) {
      setElementProperty(element, name, value);
    } else {
      setElementAttribute(element, name, value, isSvg);
    }
  }
}

// Skip logic for preventing user interaction disruption during VDOM reconciliation
function shouldSkipPatch(dom: HTMLElement, prop: string): boolean {
  if (document.activeElement === dom) {
    return ['selectionStart', 'selectionEnd', 'selectionDirection']
      .includes(prop);
  }
  if (prop === 'scrollTop' || prop === 'scrollLeft') {
    return true;
  }
  if (dom instanceof HTMLMediaElement &&
    ['currentTime', 'paused', 'playbackRate', 'volume'].includes(prop)) {
    return true;
  }
  return false;           // default: allow normal diff logic
}

function isValidAttributeName(name: string): boolean {
  return /^[a-zA-Z_:][\w\-:.]*$/.test(name) &&
    !name.includes('<') && !name.includes('>') && !name.includes('"') && !name.includes("'");
}


// Main exported function for updating element properties
export function updateProps(element: Element, props: { [key: string]: any }, isSvg: boolean): void {
  // console.assert(!!element);
  const cached = element[ATTR_PROPS] || {};
  const merged = mergeProps(cached, props);
  element[ATTR_PROPS] = props || {};

  applyPropertiesToElement(element, merged, props, isSvg);
}

// Apply merged properties to element with ref handling
function applyPropertiesToElement(
  element: Element,
  mergedProps: { [key: string]: any },
  originalProps: { [key: string]: any } | null,
  isSvg: boolean
): void {
  for (const name in mergedProps) {
    if (isValidAttributeName(name)) {
      setAttributeOrProperty(element, name, mergedProps[name], isSvg);
    }
  }

  // Handle ref callback
  if (mergedProps && typeof mergedProps['ref'] === 'function') {
    window.requestAnimationFrame(() => mergedProps['ref'](element));
  }
}
