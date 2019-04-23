import { createElement, updateElement, Fragment } from './vdom-my';
import morph = require('morphdom')

export function render(element, html, parent?) {
  if (typeof html === 'string') {
    html = html.trim();
    if (element.firstChild) {
      const el = element.cloneNode(false);
      el.innerHTML = html;
      morph(element, el);
    } else {
      element.innerHTML = html;
    }
  } else {
    updateElement(element, html, parent);
  }
}
export { createElement, Fragment };

