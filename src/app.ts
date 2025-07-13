/**
 * Core AppRun application class and singleton instance
 *
 * This file provides:
 * 1. App class - The core event system implementation with pub/sub capabilities
 *    - on(): Subscribe to events with options (once, delay, global)
 *    - off(): Unsubscribe from events with proper cleanup
 *    - run(): Publish events synchronously with error handling
 *    - runAsync(): Publish events asynchronously with Promise support
 *    - query(): Alias for runAsync for backward compatibility
 *
 * 2. Default app singleton - Global event bus instance
 *    - Created once and reused across the application
 *    - Stored in global scope (window/global) with version tracking
 *    - Prevents duplicate instances across different versions
 *
 * Features:
 * - Event wildcards support (events ending with '*')
 * - Delayed event execution with timeout management
 * - Once-only event subscriptions
 * - Async event handling with Promise.all
 * - Global event bus shared across components
 * - Memory leak prevention with proper cleanup
 *
 * Type Safety Improvements (v3.35.1):
 * - Added validation for event handler functions
 * - Enhanced error handling in event execution
 * - Improved null checks in delayed event handling
 * - Better error reporting for invalid handlers
 *
 * Usage:
 * ```ts
 * // Subscribe to events
 * app.on('event-name', (state, ...args) => {
 *   // Handle event
 * });
 *
 * // Publish events
 * app.run('event-name', ...args);
 * 
 * // Async events
 * app.runAsync('async-event', data).then(results => {
 *   // Handle results
 * });
 * ```
 */

import { EventOptions } from './types'
import { APPRUN_VERSION_GLOBAL } from './version'

export class App {

  _events: { [key: string]: Array<{ fn: (...args: any[]) => any, options: EventOptions }> };

  public start: any;
  public h: any;
  public createElement: any;
  public render: any;
  public Fragment: any;
  public webComponent: any;
  public safeHTML: any;
  public use_render: any;
  public use_react: any;
  public route: any;

  public version: string;

  constructor() {
    this._events = {} as { [key: string]: Array<{ fn: (...args: any[]) => any, options: EventOptions }> };
  }

  on(name: string, fn: (...args: any[]) => any, options: EventOptions = {}): void {
    this._events[name] = this._events[name] || [];
    this._events[name].push({ fn, options });
  }

  off(name: string, fn: (...args: any[]) => any): void {
    const subscribers = this._events[name] || [];

    this._events[name] = subscribers.filter((sub) => sub.fn !== fn);
  }

  find(name: string): any {
    return this._events[name];
  }

  run(name: string, ...args: any[]): number {
    const subscribers = this.getSubscribers(name, this._events);
    console.assert(subscribers && subscribers.length > 0, 'No subscriber for event: ' + name);
    subscribers.forEach((sub) => {
      const { fn, options } = sub;
      if (!fn || typeof fn !== 'function') {
        console.error(`AppRun event handler for '${name}' is not a function:`, fn);
        return false;
      }
      if (options.delay) {
        this.delay(name, fn, args, options);
      } else {
        try {
          Object.keys(options).length > 0 ? fn.apply(this, [...args, options]) : fn.apply(this, args);
        } catch (error) {
          console.error(`Error in event handler for '${name}':`, error);
        }
      }
      return !sub.options.once;
    });

    return subscribers.length;
  }

  once(name: string, fn: (...args: any[]) => any, options: EventOptions = {}): void {
    this.on(name, fn, { ...options, once: true });
  }

  private delay(name: string, fn: (...args: any[]) => any, args: any[], options: EventOptions): void {
    if (options._t) clearTimeout(options._t);
    options._t = setTimeout(() => {
      clearTimeout(options._t);
      try {
        Object.keys(options).length > 0 ? fn.apply(this, [...args, options]) : fn.apply(this, args);
      } catch (error) {
        console.error(`Error in delayed event handler for '${name}':`, error);
      }
    }, options.delay);
  }

  runAsync(name: string, ...args: any[]): Promise<any[]> {
    const subscribers = this.getSubscribers(name, this._events);
    console.assert(subscribers && subscribers.length > 0, 'No subscriber for event: ' + name);
    const promises = subscribers.map(sub => {
      const { fn, options } = sub;
      if (!fn || typeof fn !== 'function') {
        console.error(`AppRun async event handler for '${name}' is not a function:`, fn);
        return Promise.resolve(null);
      }
      try {
        return Object.keys(options).length > 0 ? fn.apply(this, [...args, options]) : fn.apply(this, args);
      } catch (error) {
        console.error(`Error in async event handler for '${name}':`, error);
        return Promise.reject(error);
      }
    });
    return Promise.all(promises);
  }

  query(name: string, ...args: any[]): Promise<any[]> {
    return this.runAsync(name, ...args);
  }

  private getSubscribers(name: string, events: { [key: string]: Array<{ fn: (...args: any[]) => any, options: EventOptions }> }): Array<{ fn: (...args: any[]) => any, options: EventOptions }> {
    const subscribers = events[name] || [];

    // Update the list of subscribers by pulling out those which will run once.
    // We must do this update prior to running any of the events in case they
    // cause additional events to be turned off or on.
    events[name] = subscribers.filter((sub) => {
      return !sub.options.once;
    });
    Object.keys(events).filter(evt => evt.endsWith('*') && name.startsWith(evt.replace('*', '')))
      .sort((a, b) => b.length - a.length)
      .forEach(evt => subscribers.push(...events[evt].map(sub => ({
        ...sub,
        options: { ...sub.options, event: name }
      }))));
    return subscribers;
  }
}

const AppRunVersions = APPRUN_VERSION_GLOBAL;
let _app: App;
const root = (typeof window !== 'undefined' ? window :
  typeof global !== 'undefined' ? global :
    typeof self !== 'undefined' ? self : {}) as any;

if (root.app && root._AppRunVersions) {
  _app = root.app;
} else {
  _app = new App();
  root.app = _app;
  root._AppRunVersions = AppRunVersions;
}
export default _app;
