import { Component } from './component';
declare var customElements;

export const customElement = (componentClass, options?) => class extends HTMLElement {
   component;
   on;
   run;
  // shadowRoot;
  constructor() {
    super();
    // this.shadowRoot = this.attachShadow({ mode: 'open' });
    // this.shadowRoot.innerHTML = `<div></div>`
    const props = {}
    Array.from(this.attributes).forEach(item => props[item.name] = item.value);
    if (this.children) {
      props['children'] = Array.from(this.children);
      props['children'].forEach(el => el.parentElement.removeChild(el));
    }
    const opts = { global_event: options && options.global_event };
    this.component = new componentClass(props).start(this, options);
    this.on = this.component.on.bind(this.component);
    this.run = this.component.run.bind(this.component);
  }
  get state() { return this.component.state; }
}

export default (name: string, componentClass, options?) => {
  customElements && customElements.define(name, customElement(componentClass, options))
}

