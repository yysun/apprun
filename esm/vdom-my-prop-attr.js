/**
 * VDOM Property and Attribute Handler
 * Standards-compliant property/attribute handling with caching and special element support
 * Features: Skip logic for preserving user interactions during VDOM reconciliation
 * Exports: updateProps - Main function for DOM element property updates
 * Updated: 2025-01-14 - Added skip logic for focus-sensitive, scroll, and media properties
 */
import { find, html, svg } from 'property-information';
const ATTR_PROPS = '_props';
const propertyInfoCache = new Map();
// Merge old and new props, handling className -> class conversion and null cleanup
function mergeProps(oldProps, newProps) {
    if (newProps) {
        newProps['class'] = newProps['class'] || newProps['className'];
        delete newProps['className'];
    }
    if (!oldProps || Object.keys(oldProps).length === 0)
        return newProps || {};
    if (!newProps || Object.keys(newProps).length === 0) {
        const props = {};
        Object.keys(oldProps).forEach(p => props[p] = null);
        return props;
    }
    const props = {};
    Object.keys(oldProps).forEach(p => {
        if (!(p in newProps))
            props[p] = null;
    });
    Object.keys(newProps).forEach(p => props[p] = newProps[p]);
    return props;
}
// Convert kebab-case to camelCase for dataset keys
function convertKebabToCamelCase(str) {
    if (str.length <= 1)
        return str.toLowerCase();
    return str.split('-').map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
}
// Cached property information lookup
function getPropertyInfo(name, isSvg) {
    const cacheKey = `${name}:${isSvg}`;
    let info = propertyInfoCache.get(cacheKey);
    if (info === undefined) {
        info = find(isSvg ? svg : html, name) || null;
        propertyInfoCache.set(cacheKey, info);
    }
    return info;
}
// Specialized handlers for different attribute types
function setDatasetAttribute(element, attributeName, value) {
    const camelKey = convertKebabToCamelCase(attributeName.slice(5));
    if (value == null) {
        delete element.dataset[camelKey];
    }
    else {
        element.dataset[camelKey] = String(value);
    }
}
function setEventHandler(element, name, value) {
    if (!name.startsWith('on'))
        return;
    if (!value || typeof value === 'function') {
        element[name] = value;
    }
    else if (typeof value === 'string') {
        if (value)
            element.setAttribute(name, value);
        else
            element.removeAttribute(name);
    }
}
function setBooleanAttribute(element, attributeName, value) {
    if (shouldSetBooleanAttribute(value)) {
        element.setAttribute(attributeName, attributeName);
    }
    else {
        element.removeAttribute(attributeName);
    }
}
function setElementProperty(element, propertyName, value) {
    try {
        element[propertyName] = value;
    }
    catch (error) {
        setElementAttribute(element, propertyName, value, false);
    }
}
function setElementAttribute(element, attributeName, value, isSvg) {
    if (value == null) {
        element.removeAttribute(attributeName);
        return;
    }
    const stringValue = String(value);
    if (isSvg && attributeName.includes(':')) {
        const [prefix] = attributeName.split(':');
        if (prefix === 'xlink') {
            element.setAttributeNS('http://www.w3.org/1999/xlink', attributeName, stringValue);
        }
        else {
            element.setAttribute(attributeName, stringValue);
        }
    }
    else {
        element.setAttribute(attributeName, stringValue);
    }
}
function shouldSetBooleanAttribute(value) {
    if (value == null || value === false || value === '')
        return false;
    if (value === true)
        return true;
    if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        return lowerValue !== 'false' && value !== '0';
    }
    return Boolean(value);
}
// Core property/attribute setting function - handles all property types with skip logic
function setAttributeOrProperty(element, name, value, isSvg) {
    // Check if we should skip this property update to preserve user interaction
    if (shouldSkipPatch(element, name)) {
        return;
    }
    // Special cases with dedicated handling
    if (name === 'style') {
        if (element.style.cssText)
            element.style.cssText = '';
        if (typeof value === 'string')
            element.style.cssText = value;
        else if (value && typeof value === 'object') {
            for (const s in value) {
                if (element.style[s] !== value[s])
                    element.style[s] = value[s];
            }
        }
        return;
    }
    if (name === 'key') {
        if (value !== undefined && value !== null)
            element.key = value;
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
        }
        else if (info.mustUseProperty && !isSvg) {
            setElementProperty(element, info.property, value);
        }
        else {
            setElementAttribute(element, info.attribute, value, isSvg);
        }
    }
    else {
        // Fallback handling for unknown attributes
        if (name.startsWith('aria-') || name === 'role') {
            setElementAttribute(element, name, value, isSvg);
        }
        else if (name in element || element[name] !== undefined) {
            setElementProperty(element, name, value);
        }
        else {
            setElementAttribute(element, name, value, isSvg);
        }
    }
}
// Skip logic for preventing user interaction disruption during VDOM reconciliation
function shouldSkipPatch(dom, prop) {
    if (document.activeElement === dom) {
        return ['value', 'selectionStart', 'selectionEnd', 'selectionDirection']
            .includes(prop);
    }
    if (prop === 'scrollTop' || prop === 'scrollLeft') {
        return true;
    }
    if (dom instanceof HTMLMediaElement &&
        ['currentTime', 'paused', 'playbackRate', 'volume'].includes(prop)) {
        return true;
    }
    return false; // default: allow normal diff logic
}
function isValidAttributeName(name) {
    return /^[a-zA-Z_:][\w\-:.]*$/.test(name) &&
        !name.includes('<') && !name.includes('>') && !name.includes('"') && !name.includes("'");
}
// Main exported function for updating element properties
export function updateProps(element, props, isSvg) {
    // console.assert(!!element);
    const cached = element[ATTR_PROPS] || {};
    const merged = mergeProps(cached, props);
    element[ATTR_PROPS] = props || {};
    applyPropertiesToElement(element, merged, props, isSvg);
}
// Apply merged properties to element with ref handling
function applyPropertiesToElement(element, mergedProps, originalProps, isSvg) {
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
//# sourceMappingURL=vdom-my-prop-attr.js.map