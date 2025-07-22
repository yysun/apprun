/**
 * Core AppRun application class and singleton instance
 *
 * This file provides:
 * 1. App class - The core event system implementation with pub/sub capabilities
 *    - on(): Subscribe to events with options (once, delay, global)
 *    - off(): Unsubscribe from events with proper cleanup
 *    - run(): Publish events synchronously with error handling
 *    - runAsync(): Publish events asynchronously with Promise support, returns handler values
 *    - query(): Deprecated alias for runAsync() - use runAsync() instead
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
 * // Publish events (fire-and-forget)
 * app.run('event-name', ...args);
 *
 * // Get return values from event handlers
 * app.runAsync('event-name', data).then(results => {
 *   // Handle results array
 * });
 * ```
 */
import { APPRUN_VERSION_GLOBAL } from './version';
export class App {
    constructor() {
        this._events = {};
    }
    on(name, fn, options = {}) {
        this._events[name] = this._events[name] || [];
        this._events[name].push({ fn, options });
    }
    off(name, fn) {
        const subscribers = this._events[name] || [];
        this._events[name] = subscribers.filter((sub) => sub.fn !== fn);
    }
    find(name) {
        return this._events[name];
    }
    run(name, ...args) {
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
            }
            else {
                try {
                    Object.keys(options).length > 0 ? fn.apply(this, [...args, options]) : fn.apply(this, args);
                }
                catch (error) {
                    console.error(`Error in event handler for '${name}':`, error);
                }
            }
            return !sub.options.once;
        });
        return subscribers.length;
    }
    once(name, fn, options = {}) {
        this.on(name, fn, { ...options, once: true });
    }
    delay(name, fn, args, options) {
        if (options._t)
            clearTimeout(options._t);
        options._t = setTimeout(() => {
            clearTimeout(options._t);
            try {
                Object.keys(options).length > 0 ? fn.apply(this, [...args, options]) : fn.apply(this, args);
            }
            catch (error) {
                console.error(`Error in delayed event handler for '${name}':`, error);
            }
        }, options.delay);
    }
    runAsync(name, ...args) {
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
            }
            catch (error) {
                console.error(`Error in async event handler for '${name}':`, error);
                return Promise.reject(error);
            }
        });
        return Promise.all(promises);
    }
    /**
     * @deprecated Use runAsync() instead. app.query() will be removed in a future version.
     */
    query(name, ...args) {
        console.warn('app.query() is deprecated. Use app.runAsync() instead.');
        return this.runAsync(name, ...args);
    }
    getSubscribers(name, events) {
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
let _app;
const root = (typeof window !== 'undefined' ? window :
    typeof global !== 'undefined' ? global :
        typeof self !== 'undefined' ? self : {});
if (root.app && root._AppRunVersions) {
    _app = root.app;
}
else {
    _app = new App();
    root.app = _app;
    root._AppRunVersions = AppRunVersions;
}
export default _app;
//# sourceMappingURL=app.js.map