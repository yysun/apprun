export const customElement = (componentClass, options = {}) => class extends HTMLElement {
    constructor() {
        super();
    }
    get component() { return this._component; }
    get state() { return this._component.state; }
    static get observedAttributes() {
        return Object.assign({}, options)['observedAttributes'];
    }
    connectedCallback() {
        if (this.isConnected && !this._component) {
            const opts = Object.assign({ render: true, shadow: false }, options);
            this._shadowRoot = opts.shadow ?
                this.attachShadow({ mode: 'open' }) : this;
            const props = {};
            Array.from(this.attributes).forEach(item => props[item.name] = item.value);
            const children = this.children ? Array.from(this.children) : [];
            children.forEach(el => el.parentElement.removeChild(el));
            this._component = new componentClass(Object.assign(Object.assign({}, props), { children })).mount(this._shadowRoot, opts);
            this._component.mounted && this._component.mounted(props, children);
            this.on = this._component.on.bind(this._component);
            this.run = this._component.run.bind(this._component);
        }
    }
    disconnectedCallback() {
        this._component.unmount();
        this._component = null;
    }
    attributeChangedCallback(...args) {
        this._component && this._component.run('attributeChanged', ...args);
    }
};
export default (name, componentClass, options) => {
    (typeof customElements !== 'undefined') && customElements.define(name, customElement(componentClass, options));
};
//# sourceMappingURL=web-component.js.map