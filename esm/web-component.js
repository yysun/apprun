export const customElement = (componentClass, options = {}) => class CustomElement extends HTMLElement {
    constructor() {
        super();
    }
    get component() { return this._component; }
    get state() { return this._component.state; }
    static get observedAttributes() {
        return options.observedAttributes;
    }
    connectedCallback() {
        if (this.isConnected && !this._component) {
            const opts = options || {};
            this._shadowRoot = opts.shadow ? this.attachShadow({ mode: 'open' }) : this;
            const props = {};
            Array.from(this.attributes).forEach(item => props[item.name] = item.value);
            // add getters/ setters to allow observation on observedAttributes
            (opts.observedAttributes || []).forEach(name => {
                props[name] = this[name];
                Object.defineProperty(this, name, {
                    get() {
                        return props[name];
                    },
                    set(value) {
                        // trigger change event
                        this.attributeChangedCallback(name, props[name], value);
                    },
                    configurable: true,
                    enumerable: true
                });
            });
            const children = this.children ? Array.from(this.children) : [];
            children.forEach(el => el.parentElement.removeChild(el));
            this._component = new componentClass(Object.assign(Object.assign({}, props), { children })).mount(this._shadowRoot, opts);
            // attach props to component
            this._component._props = props;
            if (this._component.mounted) {
                const new_state = this._component.mounted(props, children, this._component.state);
                if (typeof new_state !== 'undefined')
                    this._component.state = new_state;
            }
            this.on = this._component.on.bind(this._component);
            this.run = this._component.run.bind(this._component);
            if (!(opts.render === false))
                this._component.run('.');
        }
    }
    disconnectedCallback() {
        var _a, _b, _c, _d;
        (_b = (_a = this._component) === null || _a === void 0 ? void 0 : _a.unload) === null || _b === void 0 ? void 0 : _b.call(_a);
        (_d = (_c = this._component) === null || _c === void 0 ? void 0 : _c.unmount) === null || _d === void 0 ? void 0 : _d.call(_c);
        this._component = null;
    }
    attributeChangedCallback(name, oldValue, value) {
        var _a;
        (_a = this._component) === null || _a === void 0 ? void 0 : _a.run('attributeChanged', name, oldValue, value);
        // store the new property/ attribute
        this._component._props[name] = value;
        if (value !== oldValue && !(options.render === false)) {
            window.requestAnimationFrame(() => {
                var _a;
                // re-render state with new combined props on next animation frame
                (_a = this._component) === null || _a === void 0 ? void 0 : _a.run('.');
            });
        }
    }
};
export default (name, componentClass, options) => {
    (typeof customElements !== 'undefined') && customElements.define(name, customElement(componentClass, options));
};
//# sourceMappingURL=web-component.js.map