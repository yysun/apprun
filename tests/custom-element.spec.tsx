import app from '../src/app';
import { createElement, render } from '../src/vdom';
import { Component } from '../src/component';

import { toCustomElement } from '../src/web-component';

declare var customElements;
describe('component', () => {
  it('should be able to export as custom element', () => {

    class C extends HTMLElement {
      constructor() {
        super();
      }
      connectedCallback() {
        this.innerHTML = "<div>hello world</div>";
      }
    }
    customElements.define('hello-world', C);

    const el= document.createElement('hello-world');
    document.body.appendChild(el);

    // expect(document.firstChild).toBe(el);
    // expect(el.innerHTML).toBe('<div>hello world</div>');

  })

})