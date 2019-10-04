import { createElement, updateElement, Fragment } from './vdom-my';
import morphdom from 'morphdom';

export function render(element, html, parent?) {
  if (typeof html === 'string') {
    html = html.trim();
    if (element.firstChild) {
      const el = element.cloneNode(false);
      el.innerHTML = html;
      morphdom(element, el);
    } else {
      element.innerHTML = html;
    }
  } else {
    updateElement(element, html, parent);
  }
}
export { createElement, Fragment };

