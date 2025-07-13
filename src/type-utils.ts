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
export function safeEventTarget<T extends HTMLElement = HTMLElement>(event: Event): T | null {
  return event?.target instanceof HTMLElement ? event.target as T : null;
}

/**
 * Type guard to check if an object is a valid function
 */
export function isFunction(obj: any): obj is Function {
  return typeof obj === 'function';
}

/**
 * Type guard to check if an object is a valid HTML element
 */
export function isHTMLElement(obj: any): obj is HTMLElement {
  return obj instanceof HTMLElement;
}

/**
 * Safely assign properties to global object with type checking
 */
export function safeGlobalAssign<T extends Record<string, any>>(
  globalObj: any,
  assignments: T
): void {
  if (typeof globalObj === 'object' && globalObj !== null) {
    Object.keys(assignments).forEach(key => {
      globalObj[key] = assignments[key];
    });
  }
}

/**
 * Safely get property from global object with fallback
 */
export function safeGlobalGet<T>(
  globalObj: any,
  property: string,
  fallback?: T
): T | undefined {
  if (typeof globalObj === 'object' && globalObj !== null) {
    return globalObj[property] ?? fallback;
  }
  return fallback;
}

/**
 * Type-safe wrapper for DOM element queries
 */
export function safeQuerySelector<T extends Element = Element>(
  selector: string,
  context: Document | Element = document
): T | null {
  try {
    return context.querySelector<T>(selector);
  } catch (error) {
    console.warn(`Invalid selector: ${selector}`, error);
    return null;
  }
}

/**
 * Type-safe wrapper for DOM element by ID
 */
export function safeGetElementById<T extends HTMLElement = HTMLElement>(
  id: string
): T | null {
  try {
    return document.getElementById(id) as T | null;
  } catch (error) {
    console.warn(`Error getting element by id: ${id}`, error);
    return null;
  }
}

/**
 * Validate and safely execute a function with error handling
 */
export function safeExecute<T extends any[], R>(
  fn: ((...args: T) => R) | undefined | null,
  args: T,
  context?: any,
  errorMessage?: string
): R | undefined {
  if (!isFunction(fn)) {
    if (errorMessage) {
      console.warn(errorMessage, fn);
    }
    return undefined;
  }

  try {
    return context ? fn.apply(context, args) : fn(...args);
  } catch (error) {
    console.error(errorMessage || 'Error executing function:', error);
    return undefined;
  }
}

/**
 * Type definitions for improved global object safety
 */
export interface SafeGlobalWindow {
  Component?: any;
  _React?: any;
  React?: any;
  on?: any;
  customElement?: any;
  safeHTML?: any;
  html?: any;
  svg?: any;
  run?: any;
  [key: string]: any;
}

export type SafeGlobalContext = SafeGlobalWindow | typeof globalThis | any;
