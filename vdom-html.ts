import morph = require('morphdom')

export function updateElement(element, html) {
  console.assert(!!element);

  if (typeof html === 'string') {
    if (element.firstChild) {
      morph(element.firstChild, html);
    } else {
      element.innerHTML = html;
    }
  }

}



