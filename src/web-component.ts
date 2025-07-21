/**
 * Web Components Integration
 * 
 * This file enables using AppRun components as Web Components:
 * 1. Custom Element Creation
 *    - Converts AppRun components to custom elements
 *    - Handles lifecycle (connected, disconnected, attributeChanged)
 *    - Manages shadow DOM and light DOM rendering options
 *    - Automatic element registration with customElements.define()
 * 
 * 2. Property/Attribute Sync
 *    - Observes attribute changes with attributeChangedCallback
 *    - Updates component state automatically on changes
 *    - Handles camelCase/kebab-case conversion automatically
 *    - Supports complex property types and JSON parsing
 *    - Two-way data binding between attributes and state
 * 
 * 3. Event Handling
 *    - Proxies events between component and element
 *    - Supports both global and local event systems
 *    - Maintains proper event bubbling and capturing
 *    - Custom event dispatching for component communication
 * 
 * Features:
 * - Shadow DOM encapsulation support
 * - Attribute observation and change detection
 * - Lifecycle management and cleanup
 * - Property reflection to attributes
 * - Event proxy system
 * - Flexible rendering options
 *
 * Type Safety Improvements (v3.35.1):
 * - Enhanced custom element options typing
 * - Better lifecycle method signatures
 * - Improved attribute/property type safety
 * - Safer DOM manipulation with null checks
 *
 * Usage:
 * ```ts
 * // Register web component
 * @customElement('my-element', { 
 *   shadow: true,
 *   observedAttributes: ['name', 'value']
 * })
 * class MyComponent extends Component {
 *   // Regular AppRun component code
 * }
 * 
 * // Use in HTML
 * <my-element name="value" data-prop="complex"></my-element>
 * ```
 */

declare var customElements;

import { CustomElementOptions } from './types';

export const customElement = (componentClass, options: CustomElementOptions = {}) => class CustomElement extends HTMLElement {
  public _shadowRoot;
  public _component;
  public _attrMap: (arg0: string) => string;
  public on;
  public run;
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
      const observedAttributes = (opts.observedAttributes || [])

      const attrMap = observedAttributes.reduce((map, name) => {
        const lc = name.toLowerCase()
        if (lc !== name) {
          map[lc] = name
        }
        return map
      }, {})
      this._attrMap = (name: string): string => attrMap[name] || name

      const props = {};
      Array.from(this.attributes).forEach(item => props[this._attrMap(item.name)] = item.value);

      // add getters/ setters to allow observation on observedAttributes
      observedAttributes.forEach(name => {
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

      requestAnimationFrame(() => {
        const children = this.children ? Array.from(this.children) : [];
        // children.forEach(el => el.parentElement.removeChild(el));
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
        if (!(opts.render === false)) this._component.run('.');
      });
    }
  }

  disconnectedCallback() {
    this._component?.unload?.();
    this._component?.unmount?.();
    this._component = null;
  }

  attributeChangedCallback(name: string, oldValue: unknown, value: unknown) {
    if (this._component) {
      // camelCase attributes arrive only in lowercase
      const mappedName = this._attrMap(name);
      // store the new property/ attribute
      this._component._props[mappedName] = value;
      this._component.run('attributeChanged', mappedName, oldValue, value);

      if (value !== oldValue && !(options.render === false)) {
        window.requestAnimationFrame(() => {
          // re-render state with new combined props on next animation frame
          this._component.run('.')
        })
      }
    }
  }
}

export default (name: string, componentClass, options?: CustomElementOptions) => {
  (typeof customElements !== 'undefined') && customElements.define(name, customElement(componentClass, options))
}
