export const customElement = (componentClass, options = {}) => class CustomElement extends HTMLElement {
    constructor() {
        super();
    }
    get component() { return this._component; }
    get state() { return this._component.state; }
    static get observedAttributes() {
        // attributes need to be set to lowercase in order to get observed
        return (options.observedAttributes || []).map(attr => attr.toLowerCase());
    }
    connectedCallback() {
        if (this.isConnected && !this._component) {
            const opts = options || {};
            this._shadowRoot = opts.shadow ? this.attachShadow({ mode: 'open' }) : this;
            const observedAttributes = (opts.observedAttributes || []);
            const attrMap = observedAttributes.reduce((map, name) => {
                const lc = name.toLowerCase();
                if (lc !== name) {
                    map[lc] = name;
                }
                return map;
            }, {});
            this._attrMap = (name) => attrMap[name] || name;
            const props = {};
            Array.from(this.attributes).forEach(item => props[this._attrMap(item.name)] = item.value);
            // add getters/ setters to allow observation on observedAttributes
            observedAttributes.forEach(name => {
                if (this[name] !== undefined)
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
            requestAnimationFrame(() => {
                const children = this.children ? Array.from(this.children) : [];
                children.forEach(el => el.parentElement.removeChild(el));
                this._component = new componentClass(Object.assign(Object.assign({}, props), { children })).mount(this._shadowRoot, opts);
                // attach props to component
                this._component._props = props;
                // expose dispatchEvent
                this._component.dispatchEvent = this.dispatchEvent.bind(this);
                if (this._component.mounted) {
                    const new_state = this._component.mounted(props, children, this._component.state);
                    if (typeof new_state !== 'undefined')
                        this._component.state = new_state;
                }
                this.on = this._component.on.bind(this._component);
                this.run = this._component.run.bind(this._component);
                if (!(opts.render === false))
                    this._component.run('.');
            });
        }
    }
    disconnectedCallback() {
        var _a, _b, _c, _d;
        (_b = (_a = this._component) === null || _a === void 0 ? void 0 : _a.unload) === null || _b === void 0 ? void 0 : _b.call(_a);
        (_d = (_c = this._component) === null || _c === void 0 ? void 0 : _c.unmount) === null || _d === void 0 ? void 0 : _d.call(_c);
        this._component = null;
    }
    attributeChangedCallback(name, oldValue, value) {
        if (this._component) {
            // camelCase attributes arrive only in lowercase
            const mappedName = this._attrMap(name);
            // store the new property/ attribute
            this._component._props[mappedName] = value;
            this._component.run('attributeChanged', mappedName, oldValue, value);
            if (value !== oldValue && !(options.render === false)) {
                window.requestAnimationFrame(() => {
                    // re-render state with new combined props on next animation frame
                    this._component.run('.');
                });
            }
        }
    }
};
export default (name, componentClass, options) => {
    (typeof customElements !== 'undefined') && customElements.define(name, customElement(componentClass, options));
};
//# sourceMappingURL=web-component.js.map