/**
 * Core AppRun application class and singleton instance
 * 
 * This file provides:
 * 1. App class - The core event system implementation with pub/sub capabilities
 *    - on(): Subscribe to events
 *    - off(): Unsubscribe from events  
 *    - run(): Publish events synchronously
 *    - runAsync(): Publish events asynchronously
 *    - query(): Alias for runAsync
 * 
 * 2. Default app singleton - Global event bus instance
 *    - Created once and reused across the application
 *    - Stored in global scope (window/global)
 *    - Version tracked to prevent duplicate instances
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
 * ```
 */

import { EventOptions} from './types'
export class App {

  _events: Object;

  public start;
  public h;
  public createElement;
  public render;
  public Fragment;
  public webComponent;
  public safeHTML;
  public use_render;
  public use_react;

  constructor() {
    this._events = {};
  }

  on(name: string, fn: (...args) => void, options: EventOptions = {}): void {
    this._events[name] = this._events[name] || [];
    this._events[name].push({ fn, options });
  }

  off(name: string, fn: (...args) => void): void {
    const subscribers = this._events[name] || [];

    this._events[name] = subscribers.filter((sub) => sub.fn !== fn);
  }

  find(name: string): any {
    return this._events[name];
  }

  run(name: string, ...args): number {
    const subscribers = this.getSubscribers(name, this._events);
    console.assert(subscribers && subscribers.length > 0, 'No subscriber for event: ' + name);
    subscribers.forEach((sub) => {
      const { fn, options } = sub;
      if (options.delay) {
        this.delay(name, fn, args, options);
      } else {
        Object.keys(options).length > 0 ? fn.apply(this, [...args, options]) : fn.apply(this, args);
      }
      return !sub.options.once;
    });

    return subscribers.length;
  }

  once(name: string, fn, options: EventOptions = {}): void {
    this.on(name, fn, { ...options, once: true });
  }

  private delay(name, fn, args, options): void {
    if (options._t) clearTimeout(options._t);
    options._t = setTimeout(() => {
      clearTimeout(options._t);
      Object.keys(options).length > 0 ? fn.apply(this, [...args, options]) : fn.apply(this, args);
    }, options.delay);
  }

  runAsync(name: string, ...args): Promise<any[]> {
    const subscribers = this.getSubscribers(name, this._events);
    console.assert(subscribers && subscribers.length > 0, 'No subscriber for event: ' + name);
    const promises = subscribers.map(sub => {
      const { fn, options } = sub;
      return Object.keys(options).length > 0 ? fn.apply(this, [...args, options]) : fn.apply(this, args);
    });
    return Promise.all(promises);
  }

  query(name: string, ...args): Promise<any[]> {
    return this.runAsync(name, ...args);
  }

  private getSubscribers(name: string, events) {
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

const AppRunVersions = 'AppRun-3';
let app: App;
const root = (typeof self === 'object' && self.self === self && self) ||
  (typeof global === 'object' && global.global === global && global)
if (root['app'] && root['_AppRunVersions']) {
  app = root['app'];
} else {
  app = new App();
  root['app'] = app;
  root['_AppRunVersions'] = AppRunVersions;
}
export default app;
