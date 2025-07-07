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
            if (options.delay) {
                this.delay(name, fn, args, options);
            }
            else {
                Object.keys(options).length > 0 ? fn.apply(this, [...args, options]) : fn.apply(this, args);
            }
            return !sub.options.once;
        });
        return subscribers.length;
    }
    once(name, fn, options = {}) {
        this.on(name, fn, Object.assign(Object.assign({}, options), { once: true }));
    }
    delay(name, fn, args, options) {
        if (options._t)
            clearTimeout(options._t);
        options._t = setTimeout(() => {
            clearTimeout(options._t);
            Object.keys(options).length > 0 ? fn.apply(this, [...args, options]) : fn.apply(this, args);
        }, options.delay);
    }
    runAsync(name, ...args) {
        const subscribers = this.getSubscribers(name, this._events);
        console.assert(subscribers && subscribers.length > 0, 'No subscriber for event: ' + name);
        const promises = subscribers.map(sub => {
            const { fn, options } = sub;
            return Object.keys(options).length > 0 ? fn.apply(this, [...args, options]) : fn.apply(this, args);
        });
        return Promise.all(promises);
    }
    query(name, ...args) {
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
            .forEach(evt => subscribers.push(...events[evt].map(sub => (Object.assign(Object.assign({}, sub), { options: Object.assign(Object.assign({}, sub.options), { event: name }) })))));
        return subscribers;
    }
}
const AppRunVersions = 'AppRun-3';
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