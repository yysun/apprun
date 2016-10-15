/// <reference path="../virtual-dom.d.ts" />

import h = require('virtual-dom/h');
import patch = require('virtual-dom/patch');
import diff = require('virtual-dom/diff');
import VNode = require('virtual-dom/vnode/vnode');
import VText = require('virtual-dom/vnode/vtext');
import createElement = require('virtual-dom/create-element');

export default function updateElement(element, vtree) {
  console.assert(!!element);
  if (element.vtree) {
    const patches = diff(element.vtree, vtree);
    patch(element.firstChild, patches);
  } else {
    const node = createElement(vtree);
    element.appendChild(node);
  }
  element.vtree = vtree;
}