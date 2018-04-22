import { Component } from './component';
declare var customElements;

export default (name: string, componentClass) => {
  customElements.define(name, class extends HTMLElement {
    component;
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
      this.component = new componentClass(props).start(this);
    }
    // connectedCallback() {
    // }
    // disconnectedCallback() {
    // }
    // attributeChangedCallback(attrName, oldVal, newVal) {
    // }
  })
}

