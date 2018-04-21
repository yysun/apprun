import { Component } from './component';

declare var customElements;
export const toCustomElement = (name: string, componentClass) => {
  customElements.define(name, class extends HTMLElement {
    component;
    // shadowRoot;
    constructor(props) {
      super();
      // this.shadowRoot = this.attachShadow({ mode: 'open' });
      // this.shadowRoot.innerHTML = `<div></div>`
      this.component = new componentClass(props).start(this);
    }
    connectedCallback() {
      this.component.render();
    }
    disconnectedCallback() {
    }
    attributeChangedCallback(attrName, oldVal, newVal) {

    }
  });
}

