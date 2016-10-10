/// <reference path="virtual-dom.d.ts" />

import h = require('virtual-dom/h');
import patch = require('virtual-dom/patch');
import diff = require('virtual-dom/diff');
import VNode = require('virtual-dom/vnode/vnode');
import VText = require('virtual-dom/vnode/vtext');
import createElement = require('virtual-dom/create-element');
import html2vdom = require('html-to-vdom');
const convertHTML = html2vdom({ VNode, VText});
const convertHTMLWithKey = convertHTML.bind(null, {
  getVNodeKey: function (attributes) {
    return attributes.id;
  }
});

export default function updateElement(element, html) {
  console.assert(!!element);
  const vtree = (typeof html === 'string') ? convertHTMLWithKey(html) : html;
  if (element.vtree) {
    const patches = diff(element.vtree, vtree);
    patch(element.firstChild, patches);
  } else {
    const node = createElement(vtree);
    element.appendChild(node);
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
//     const node = createElement(vtree);
//     element.appendChild(node);
//     worker.postMessage({vtree: null, html});
//   }

// }