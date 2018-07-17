import { createElement, updateElement, Fragment } from './vdom-my';
import morph = require('morphdom')

export function render(element, html, parent?) {
  if (typeof html === 'string') {
    html = html.trim();
    if (element.firstChild) {
      morph(element.firstChild, html);
    } else {
      element.innerHTML = html;
    }
  } else {
    updateElement(element, html, parent);
  }
}
export { createElement, Fragment };

