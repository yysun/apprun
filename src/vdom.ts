import { createElement, updateElement, Fragment } from './vdom-my';
export function render(element, html, parent?) {
  updateElement(element, html, parent);
}
export { createElement, Fragment };


