/// <reference path="./virtual-dom.d.ts" />

import vdomh = require('virtual-dom/h');
import patch = require('virtual-dom/patch');
import diff = require('virtual-dom/diff');
import VNode = require('virtual-dom/vnode/vnode');
import VText = require('virtual-dom/vnode/vtext');
import createElement = require('virtual-dom/create-element');
import virtualize = require('vdom-virtualize');

export function updateElement(element, vtree) {
  console.assert(!!element);
  if (element.firstChild) {
    const prev = element.firstChild.vtree || virtualize(element.firstChild);
    const patches = diff(prev, vtree);
    patch(element.firstChild, patches);
  } else {
    const node = createElement(vtree);
    element.appendChild(node);
  }
  element.firstChild.vtree = vtree;
}

export const h = (el, props, ...children) => (typeof el === 'string') ?
    vdomh(el, props, children) : el(props, children);
