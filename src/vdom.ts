import { createElement, updateElement, Fragment } from './vdom-my';
export function render(element, html) {
  console.assert(!!element);
  updateElement(element, html);
}
export { createElement, Fragment };


