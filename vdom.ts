import { h, updateElement } from './vdom-my';
import morph = require('morphdom')

export { h };
export function render(element, html) {
  console.assert(!!element);
  if (typeof html === 'string') {
    if (element.firstChild) {
      morph(element.firstChild, html);
    } else {
      element.innerHTML = html;
    }
  } else {
    render(element, html);
  }
}


