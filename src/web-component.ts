declare var customElements;

export type CustomElementOptions = {
  render?, shadow?, history?, global_event?: boolean;
  observedAttributes?: string[]
};

export const customElement = (componentClass, options: CustomElementOptions = {}) => class CustomElement extends HTMLElement {
  private _shadowRoot;
  private _component;
  public on;
  public run;
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
        if (this[name] !== undefined) props[name] = this[name];
        Object.defineProperty(this, name, {
          get(): any {
            return props[name];
          },
          set(this: CustomElement, value: unknown) {
            // trigger change event
            this.attributeChangedCallback(name, props[name], value)
          },
          configurable: true,
          enumerable: true
        });
      })

      const children = this.children ? Array.from(this.children) : [];
      children.forEach(el => el.parentElement.removeChild(el));
      this._component = new componentClass({ ...props, children }).mount(this._shadowRoot, opts);
      // attach props to component
      this._component._props = props;
      // expose dispatchEvent
      this._component.dispatchEvent = this.dispatchEvent.bind(this)
      if (this._component.mounted) {
        const new_state = this._component.mounted(props, children, this._component.state);
        if (typeof new_state !== 'undefined') this._component.state = new_state;
      }
      this.on = this._component.on.bind(this._component);
      this.run = this._component.run.bind(this._component);
      if (!(opts.render===false)) this._component.run('.');
    }
  }

  disconnectedCallback() {
    this._component?.unload?.();
    this._component?.unmount?.();
    this._component = null;
  }

  attributeChangedCallback(name, oldValue, value) {
    this._component?.run('attributeChanged', name, oldValue, value);
    // store the new property/ attribute
    this._component && (this._component._props[name] = value)
    if (value !== oldValue && !(options.render === false)) {
      window.requestAnimationFrame(() => {
        // re-render state with new combined props on next animation frame
        this._component?.run('.')
      })
    }
  }
}

export default (name: string, componentClass, options?: CustomElementOptions) => {
  (typeof customElements !== 'undefined') && customElements.define(name, customElement(componentClass, options))
}
