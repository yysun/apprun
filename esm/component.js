import app, { App } from './app';
import { Reflect } from './decorator';
import directive from './directive';
const componentCache = {};
app.on('get-components', o => o.components = componentCache);
const REFRESH = state => state;
export class Component {
    constructor(state, view, update, options) {
        this.state = state;
        this.view = view;
        this.update = update;
        this.options = options;
        this._app = new App();
        this._actions = [];
        this._global_events = [];
        this._history = [];
        this._history_idx = -1;
        this._history_prev = () => {
            this._history_idx--;
            if (this._history_idx >= 0) {
                this.setState(this._history[this._history_idx], { render: true, history: false });
            }
            else {
                this._history_idx = 0;
            }
        };
        this._history_next = () => {
            this._history_idx++;
            if (this._history_idx < this._history.length) {
                this.setState(this._history[this._history_idx], { render: true, history: false });
            }
            else {
                this._history_idx = this._history.length - 1;
            }
        };
        this.start = (element = null, options) => {
            return this.mount(element, Object.assign(Object.assign({}, options), { render: true }));
        };
    }
    render(element, node) {
        app.render(element, node, this);
    }
    _view(state, p = null) {
        if (!this.view)
            return;
        const h = app.createElement;
        app.createElement = (tag, props, ...children) => {
            props && Object.keys(props).forEach(key => {
                if (key.startsWith('$')) {
                    directive(key, props, tag, this);
                    delete props[key];
                }
            });
            return h(tag, props, ...children);
        };
        const html = p ? this.view(state, p) : this.view(state);
        app.createElement = h;
        return html;
    }
    renderState(state, vdom = null) {
        if (!this.view)
            return;
        const html = vdom || this._view(state);
        app['debug'] && app.run('debug', {
            component: this,
            state,
            vdom: html || '[vdom is null - no render]',
        });
        if (typeof document !== 'object')
            return;
        const el = (typeof this.element === 'string') ?
            document.getElementById(this.element) : this.element;
        if (el) {
            const tracking_attr = '_c';
            if (!this.unload) {
                el.removeAttribute && el.removeAttribute(tracking_attr);
            }
            else if (el['_component'] !== this || el.getAttribute(tracking_attr) !== this.tracking_id) {
                this.tracking_id = new Date().valueOf().toString();
                el.setAttribute(tracking_attr, this.tracking_id);
                if (typeof MutationObserver !== 'undefined') {
                    if (!this.observer)
                        this.observer = new MutationObserver(changes => {
                            if (changes[0].oldValue === this.tracking_id || !document.body.contains(el)) {
                                this.unload(this.state);
                                this.observer.disconnect();
                                this.observer = null;
                            }
                        });
                    this.observer.observe(document.body, {
                        childList: true, subtree: true,
                        attributes: true, attributeOldValue: true, attributeFilter: [tracking_attr]
                    });
                }
            }
            el['_component'] = this;
        }
        if (!vdom)
            this.render(el, html);
        this.rendered && this.rendered(this.state);
    }
    setState(state, options = { render: true, history: false }) {
        if (state instanceof Promise) {
            // Promise will not be saved or rendered
            // state will be saved and rendered when promise is resolved
            state.then(s => {
                this.setState(s, options);
            }).catch(err => {
                console.error(err);
                throw err;
            });
            this._state = state;
        }
        else {
            this._state = state;
            if (state == null)
                return;
            this.state = state;
            if (options.render !== false)
                this.renderState(state);
            if (options.history !== false && this.enable_history) {
                this._history = [...this._history, state];
                this._history_idx = this._history.length - 1;
            }
            if (typeof options.callback === 'function')
                options.callback(this.state);
        }
    }
    mount(element = null, options) {
        var _a, _b;
        console.assert(!this.element, 'Component already mounted.');
        this.options = options = Object.assign(Object.assign({}, this.options), options);
        this.element = element;
        this.global_event = options.global_event;
        this.enable_history = !!options.history;
        if (this.enable_history) {
            this.on(options.history.prev || 'history-prev', this._history_prev);
            this.on(options.history.next || 'history-next', this._history_next);
        }
        if (options.route) {
            this.update = this.update || {};
            this.update[options.route] = REFRESH;
        }
        this.add_actions();
        this.state = (_b = (_a = this.state) !== null && _a !== void 0 ? _a : this['model']) !== null && _b !== void 0 ? _b : {};
        if (options.render) {
            this.setState(this.state, { render: true, history: true });
        }
        else {
            this.setState(this.state, { render: false, history: true });
        }
        if (app['debug']) {
            const id = typeof element === 'string' ? element : element.id;
            componentCache[id] = componentCache[id] || [];
            componentCache[id].push(this);
        }
        return this;
    }
    is_global_event(name) {
        return name && (this.global_event ||
            this._global_events.indexOf(name) >= 0 ||
            name.startsWith('#') || name.startsWith('/') || name.startsWith('@'));
    }
    add_action(name, action, options = {}) {
        if (!action || typeof action !== 'function')
            return;
        if (options.global)
            this._global_events.push(name);
        this.on(name, (...p) => {
            const newState = action(this.state, ...p);
            app['debug'] && app.run('debug', {
                component: this,
                'event': name,
                e: p,
                state: this.state,
                newState,
                options
            });
            this.setState(newState, options);
        }, options);
    }
    add_actions() {
        const actions = this.update || {};
        Reflect.getMetadataKeys(this).forEach(key => {
            if (key.startsWith('apprun-update:')) {
                const meta = Reflect.getMetadata(key, this);
                actions[meta.name] = [this[meta.key].bind(this), meta.options];
            }
        });
        const all = {};
        if (Array.isArray(actions)) {
            actions.forEach(act => {
                const [name, action, opts] = act;
                const names = name.toString();
                names.split(',').forEach(n => all[n.trim()] = [action, opts]);
            });
        }
        else {
            Object.keys(actions).forEach(name => {
                const action = actions[name];
                if (typeof action === 'function' || Array.isArray(action)) {
                    name.split(',').forEach(n => all[n.trim()] = action);
                }
            });
        }
        if (!all['.'])
            all['.'] = REFRESH;
        Object.keys(all).forEach(name => {
            const action = all[name];
            if (typeof action === 'function') {
                this.add_action(name, action);
            }
            else if (Array.isArray(action)) {
                this.add_action(name, action[0], action[1]);
            }
        });
    }
    run(event, ...args) {
        const name = event.toString();
        return this.is_global_event(name) ?
            app.run(name, ...args) :
            this._app.run(name, ...args);
    }
    on(event, fn, options) {
        const name = event.toString();
        this._actions.push({ name, fn });
        return this.is_global_event(name) ?
            app.on(name, fn, options) :
            this._app.on(name, fn, options);
    }
    unmount() {
        var _a;
        (_a = this.observer) === null || _a === void 0 ? void 0 : _a.disconnect();
        this._actions.forEach(action => {
            const { name, fn } = action;
            this.is_global_event(name) ?
                app.off(name, fn) :
                this._app.off(name, fn);
        });
    }
}
Component.__isAppRunComponent = true;
//# sourceMappingURL=component.js.map