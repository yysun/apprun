import { createElement, updateElement, Fragment } from './vdom-my';
import * as morphdom from 'morphdom';

export function render(element, html) {
  console.assert(!!element);
  if (typeof html === 'string') {
    if (element.firstChild) {
      morphdom(element.firstChild, html);
    } else {
      element.innerHTML = html;
    }
  } else {
    updateElement(element, html);
  }
}
export { createElement, Fragment };

