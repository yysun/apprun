/// <reference path="virtual-dom.d.ts" />

// import applyPatch = require('vdom-serialized-patch/patch');
// import serializePatch = require('vdom-serialized-patch/serialize');
// import createElement = require('virtual-dom/create-element');

import patch = require('virtual-dom/patch');
import diff = require('virtual-dom/diff');
import VNode = require('virtual-dom/vnode/vnode');
import VText = require('virtual-dom/vnode/vtext');
import html2vdom = require('html-to-vdom');
const convertHTML = html2vdom({ VNode, VText});
const convertHTMLWithKey = convertHTML.bind(null, {
  getVNodeKey: function (attributes) {
    return attributes.id;
  }
});

export default function updateElement(element, html) {
  console.assert(!!element);
  const vtree = convertHTMLWithKey(html);
  if (element.vtree) {
    const patches = diff(element.vtree, vtree);
    patch(element.firstChild, patches);
  } else {
    element.innerHTML = html;
  }
  element.vtree = vtree;
}

// import fromJson = require('vdom-as-json/fromJson');
// import toJson = require('vdom-as-json/toJson');
// const worker = new Worker("vdom.worker.js");

// export default function updateElement(element, html) {
//   console.assert(!!element);
//   worker.onmessage = ({data}) => {
//     const {vtree, patches} = data;
//     element.vtree = fromJson(vtree);
//     if (patches) {
//       requestAnimationFrame(() => {
//         patch(element.firstChild, patches)
//       });
//     }
//   }
//   if (element.vtree) {
//       worker.postMessage({vtree: toJson(element.vtree), html});
//   } else {
//     element.innerHTML = html;
//     worker.postMessage({vtree: null, html});
//   }

// }