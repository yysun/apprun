/**
 * File: vdom-my-prop-attr.ts
 * Purpose: Simplified standards-compliant property and attribute handling for VDOM operations
 * Features: Property caching, style/dataset/event handling, standards compliance
 * Updated: 2025-07-14 - Simplified implementation removing over-optimization
 * Export: updateProps - Main function for updating DOM element properties
 */

import { find, html, svg } from 'property-information';

const ATTR_PROPS = '_props';
const propertyInfoCache = new Map<string, any>();

function mergeProps(oldProps: { [key: string]: any }, newProps: { [key: string]: any }): { [key: string]: any } {
  if (newProps) {
    newProps['class'] = newProps['class'] || newProps['className'];
    delete newProps['className'];
  }

  if (!oldProps || Object.keys(oldProps).length === 0) {
    return newProps || {};
  }

  if (!newProps || Object.keys(newProps).length === 0) {
    const props: { [key: string]: any } = {};
    Object.keys(oldProps).forEach(p => {
      props[p] = null;
    });
    return props;
  }

  const props: { [key: string]: any } = {};

  Object.keys(oldProps).forEach(p => {
    if (!(p in newProps)) {
      props[p] = null;
    }
  });

  Object.keys(newProps).forEach(p => props[p] = newProps[p]);

  return props;
}

function convertKebabToCamelCase(str: string): string {
  if (str.length <= 1) return str.toLowerCase();
  return str.split('-').map((word, index) => {
    if (index === 0) return word.toLowerCase();
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join('');
}

function getPropertyInfo(name: string, isSvg: boolean) {
  const cacheKey = `${name}:${isSvg}`;
  let info = propertyInfoCache.get(cacheKey);
  if (info === undefined) {
    const schema = isSvg ? svg : html;
    info = find(schema, name) || null;
    propertyInfoCache.set(cacheKey, info);
  }
  return info;
}


function setDatasetAttribute(element: Element, attributeName: string, value: any): void {
  const dataKey = attributeName.slice(5);
  const camelKey = convertKebabToCamelCase(dataKey);
  if (value == null) {
    delete (element as HTMLElement).dataset[camelKey];
  } else {
    (element as HTMLElement).dataset[camelKey] = String(value);
  }
}

function setEventHandler(element: Element, name: string, value: any): void {
  if (name.startsWith('on')) {
    if (!value || typeof value === 'function') {
      (element as any)[name] = value;
    } else if (typeof value === 'string') {
      if (value) element.setAttribute(name, value);
      else element.removeAttribute(name);
    }
  }
}

function setAttributeOrProperty(element: Element, name: string, value: any, isSvg: boolean): void {
  if ((element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') &&
    (name === 'value' || name === 'selected' || name === 'selectedIndex')) {
    setElementProperty(element, name, value);
    return;
  }

  if (element.tagName === 'INPUT' && name === 'checked') {
    setElementProperty(element, name, value);
    setBooleanAttribute(element, name, value);
    return;
  }

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
    if (name.startsWith('data-')) {
      setDatasetAttribute(element, name, value);
    } else if (name.startsWith('aria-') || name === 'role') {
      setElementAttribute(element, name, value, isSvg);
    } else if (name.startsWith('on')) {
      setEventHandler(element, name, value);
    } else {
      if (name in element || (element as any)[name] !== undefined) {
        setElementProperty(element, name, value);
      } else {
        setElementAttribute(element, name, value, isSvg);
      }
    }
  }
}

function setBooleanAttribute(element: Element, attributeName: string, value: any): void {
  const shouldSet = shouldSetBooleanAttribute(value);
  if (shouldSet) {
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

function shouldSetBooleanAttribute(value: any): boolean {
  if (value == null || value === false || value === '') return false;
  if (value === true) return true;
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    return lowerValue !== 'false' && value !== '0';
  }
  return Boolean(value);
}

function getProtectedProperties(element: Element): { [key: string]: any } {
  const protectedProps: { [key: string]: any } = {};
  if (document.activeElement === element && element.tagName === 'TEXTAREA') {
    const textarea = element as HTMLTextAreaElement;
    protectedProps.value = textarea.value;
    protectedProps.selectionStart = textarea.selectionStart;
    protectedProps.selectionEnd = textarea.selectionEnd;
  }
  return protectedProps;
}

function isValidAttributeName(name: string): boolean {
  return /^[a-zA-Z_:][\w\-:.]*$/.test(name) &&
    !name.includes('<') && !name.includes('>') && !name.includes('"') && !name.includes("'");
}


export function updateProps(element: Element, props: { [key: string]: any }, isSvg: boolean): void {
  if (!props || Object.keys(props).length === 0) {
    const cached = (element as any)[ATTR_PROPS];
    if (cached && Object.keys(cached).length > 0) {
      const mergedProps = mergeProps(cached, {});
      (element as any)[ATTR_PROPS] = {};
      applyPropertiesToElement(element, mergedProps, props, isSvg, {});
    }
    return;
  }

  const protectedProps = getProtectedProperties(element);
  const cached = (element as any)[ATTR_PROPS] || {};
  const mergedProps = mergeProps(cached, props);
  (element as any)[ATTR_PROPS] = props || {};
  applyPropertiesToElement(element, mergedProps, props, isSvg, protectedProps);
}

function applyPropertiesToElement(
  element: Element,
  mergedProps: { [key: string]: any },
  originalProps: { [key: string]: any } | null,
  isSvg: boolean,
  protectedProps: { [key: string]: any } = {}
): void {
  for (const name in mergedProps) {
    const value = mergedProps[name];

    if (!isValidAttributeName(name)) continue;

    if (name === 'style') {
      if ((element as HTMLElement).style.cssText) (element as HTMLElement).style.cssText = '';
      if (typeof value === 'string') (element as HTMLElement).style.cssText = value;
      else {
        for (const s in value) {
          if ((element as HTMLElement).style[s] !== value[s]) (element as HTMLElement).style[s] = value[s];
        }
      }
    } else if (name === 'key') {
      if (value !== undefined && value !== null) {
        (element as any).key = value;
      }
    } else if (name.startsWith('data-')) {
      setDatasetAttribute(element, name, value);
    } else if (name.startsWith('on')) {
      setEventHandler(element, name, value);
    } else {
      setAttributeOrProperty(element, name, value, isSvg);
    }
  }

  Object.keys(protectedProps).forEach(prop => {
    (element as any)[prop] = protectedProps[prop];
  });

  if (originalProps && typeof originalProps['ref'] === 'function') {
    originalProps['ref'](element);
  }
}
