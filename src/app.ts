/**
 * Core AppRun application class and singleton instance
 *
 * This file provides:
 * 1. App class - The core event system implementation with pub/sub capabilities
 *    - on(): Subscribe to events with options (once, delay, global)
 *    - off(): Unsubscribe from events with proper cleanup
 *    - run(): Publish events synchronously with error-event reporting
 *    - runAsync(): Publish events asynchronously with Promise support, returns handler values
 *    - query(): Deprecated alias for runAsync() - use runAsync() instead
 *
 * 2. Default app singleton - Global event bus instance
 *    - Created once and reused across the application
 *    - Stored in global scope (window/global) with version tracking
 *    - Prevents duplicate instances across different versions
 *
 * Features:
 * - Event wildcards support with indexed wildcard subscriptions (events ending with '*')
 * - Delayed event execution with subscription-owned timeout management
 * - Once-only event subscriptions, including wildcard subscriptions
 * - Async event handling with Promise.all
 * - Central error event reporting with console fallback
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
 * // Publish events (fire-and-forget)
 * app.run('event-name', ...args);
 * 
 * // Get return values from event handlers
 * app.runAsync('event-name', data).then(results => {
 *   // Handle results array
 * });
 * ```
 */

import { EventOptions } from './types'
import { APPRUN_VERSION_GLOBAL } from './version'

type Subscriber = { fn: (...args: any[]) => any, options: EventOptions, _t?: any };
type SubscriberCall = Subscriber & { _source?: Subscriber };
type WildcardSubscriber = { name: string, prefix: string, sub: Subscriber };

export class App {

  _events: { [key: string]: Subscriber[] };
  private _wildcard_events: WildcardSubscriber[];
  private _reporting_error = false;

  constructor() {
    this._events = {} as { [key: string]: Subscriber[] };
    this._wildcard_events = [];
  }

  on(name: string, fn: (...args: any[]) => any, options: EventOptions = {}): void {
    this._events[name] = this._events[name] || [];
    const sub = { fn, options };
    this._events[name].push(sub);
    if (name.endsWith('*')) {
      this._wildcard_events.push({ name, prefix: name.replace('*', ''), sub });
      this._wildcard_events.sort((a, b) => b.name.length - a.name.length);
    }
  }

  off(name: string, fn: (...args: any[]) => any): void {
    const subscribers = this._events[name] || [];

    this._events[name] = subscribers.filter((sub) => sub.fn !== fn);
    if (name.endsWith('*')) {
      this._wildcard_events = this._wildcard_events.filter(item => !(item.name === name && item.sub.fn === fn));
    }
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
        this.delay(name, sub, args);
      } else {
        try {
          Object.keys(options).length > 0 ? fn.apply(this, [...args, options]) : fn.apply(this, args);
        } catch (error) {
          this.reportError(name, error, { phase: 'run', args });
        }
      }
    });

    return subscribers.length;
  }

  once(name: string, fn: (...args: any[]) => any, options: EventOptions = {}): void {
    this.on(name, fn, { ...options, once: true });
  }

  private delay(name: string, sub: SubscriberCall, args: any[]): void {
    const source = sub._source || sub;
    const { fn, options } = sub;
    if (source._t) clearTimeout(source._t);
    source._t = setTimeout(() => {
      clearTimeout(source._t);
      source._t = null;
      try {
        Object.keys(options).length > 0 ? fn.apply(this, [...args, options]) : fn.apply(this, args);
      } catch (error) {
        this.reportError(name, error, { phase: 'delay', args });
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
        const result = Object.keys(options).length > 0 ? fn.apply(this, [...args, options]) : fn.apply(this, args);
        return Promise.resolve(result).catch(error => {
          this.reportError(name, error, { phase: 'runAsync', args });
          return Promise.reject(error);
        });
      } catch (error) {
        this.reportError(name, error, { phase: 'runAsync', args });
        return Promise.reject(error);
      }
    });
    return Promise.all(promises);
  }

  private reportError(name: string, error: any, context: any = {}): void {
    const payload = { event: name, error, app: this, ...context };
    const errorSubscribers = name === 'error' || this._reporting_error ? [] : this.getSubscribers('error', this._events);
    if (errorSubscribers.length > 0) {
      this._reporting_error = true;
      try {
        errorSubscribers.forEach(sub => {
          try {
            sub.fn.call(this, payload);
          } catch (errorHandlerError) {
            console.error(`Error in error event handler:`, errorHandlerError);
          }
        });
      } finally {
        this._reporting_error = false;
      }
    } else if (context.phase === 'delay') {
      console.error(`Error in delayed event handler for '${name}':`, error);
    } else if (context.phase === 'runAsync') {
      console.error(`Error in async event handler for '${name}':`, error);
    } else {
      console.error(`Error in event handler for '${name}':`, error);
    }
  }

  /**
   * @deprecated Use runAsync() instead. app.query() will be removed in a future version.
   */
  query(name: string, ...args: any[]): Promise<any[]> {
    console.warn('app.query() is deprecated. Use app.runAsync() instead.');
    return this.runAsync(name, ...args);
  }

  private removeOnceWildcardSubscriber(evt: string, sub: Subscriber): void {
    this._events[evt] = (this._events[evt] || []).filter(item => item !== sub);
    this._wildcard_events = this._wildcard_events.filter(item => item.sub !== sub);
  }

  private getSubscribers(name: string, events: { [key: string]: Subscriber[] }): SubscriberCall[] {
    const subscribers = events[name] || [];
    const calls: SubscriberCall[] = subscribers.slice();

    // Update the list of subscribers by pulling out those which will run once.
    // We must do this update prior to running any of the events in case they
    // cause additional events to be turned off or on.
    events[name] = subscribers.filter((sub) => {
      return !sub.options.once;
    });
    this._wildcard_events.filter(({ prefix }) => name.startsWith(prefix))
      .forEach(({ name: evt, sub }) => {
        if (sub.options.once) this.removeOnceWildcardSubscriber(evt, sub);
        calls.push({
          ...sub,
          _source: sub,
          options: { ...sub.options, event: name }
        });
      });
    return calls;
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
