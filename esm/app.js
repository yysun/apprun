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
        let subscribers = this._events[name] || [];
        console.assert(subscribers && subscribers.length > 0, 'No subscriber for event: ' + name);
        // Update the list of subscribers by pulling out those which will run once.
        // We must do this update prior to running any of the events in case they
        // cause additional events to be turned off or on.
        this._events[name] = subscribers.filter((sub) => {
            return !sub.options.once;
        });
        subscribers.forEach((sub) => {
            const { fn, options } = sub;
            if (options.delay) {
                this.delay(name, fn, args, options);
            }
            else {
                fn.apply(this, args);
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
            fn.apply(this, args);
        }, options.delay);
    }
}
const AppRunVersions = 'AppRun-2';
let app;
const root = (typeof self === 'object' && self.self === self && self) ||
    (typeof global === 'object' && global.global === global && global);
if (root['app'] && root['_AppRunVersions']) {
    app = root['app'];
}
else {
    app = new App();
    root['app'] = app;
    root['_AppRunVersions'] = AppRunVersions;
}
export default app;
//# sourceMappingURL=app.js.map