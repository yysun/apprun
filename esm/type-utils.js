/**
 * Type Safety Utilities for AppRun
 *
 * This file provides utility functions and types to improve type safety
 * across the AppRun framework, including:
 * 1. Safe type assertions with null checks
 * 2. Global object assignment helpers
 * 3. Event target type guards
 * 4. Function validation utilities
 */
/**
 * Safely cast event target to specific HTML element type with null check
 */
export function safeEventTarget(event) {
    return event?.target instanceof HTMLElement ? event.target : null;
}
/**
 * Type guard to check if an object is a valid function
 */
export function isFunction(obj) {
    return typeof obj === 'function';
}
/**
 * Type guard to check if an object is a valid HTML element
 */
export function isHTMLElement(obj) {
    return obj instanceof HTMLElement;
}
/**
 * Safely assign properties to global object with type checking
 */
export function safeGlobalAssign(globalObj, assignments) {
    if (typeof globalObj === 'object' && globalObj !== null) {
        Object.keys(assignments).forEach(key => {
            globalObj[key] = assignments[key];
        });
    }
}
/**
 * Safely get property from global object with fallback
 */
export function safeGlobalGet(globalObj, property, fallback) {
    if (typeof globalObj === 'object' && globalObj !== null) {
        return globalObj[property] ?? fallback;
    }
    return fallback;
}
/**
 * Type-safe wrapper for DOM element queries
 */
export function safeQuerySelector(selector, context = document) {
    try {
        return context.querySelector(selector);
    }
    catch (error) {
        console.warn(`Invalid selector: ${selector}`, error);
        return null;
    }
}
/**
 * Type-safe wrapper for DOM element by ID
 */
export function safeGetElementById(id) {
    try {
        return document.getElementById(id);
    }
    catch (error) {
        console.warn(`Error getting element by id: ${id}`, error);
        return null;
    }
}
/**
 * Validate and safely execute a function with error handling
 */
export function safeExecute(fn, args, context, errorMessage) {
    if (!isFunction(fn)) {
        if (errorMessage) {
            console.warn(errorMessage, fn);
        }
        return undefined;
    }
    try {
        return context ? fn.apply(context, args) : fn(...args);
    }
    catch (error) {
        console.error(errorMessage || 'Error executing function:', error);
        return undefined;
    }
}
//# sourceMappingURL=type-utils.js.map