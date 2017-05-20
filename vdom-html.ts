import morph = require('morphdom')

export function updateElement(element, html) {
  console.assert(!!element);

  if (typeof html === 'string') {
    morph(element, html);
  }
}



