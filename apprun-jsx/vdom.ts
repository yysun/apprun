/// <reference path="../virtual-dom.d.ts" />

import h = require('virtual-dom/h');
import patch = require('virtual-dom/patch');
import diff = require('virtual-dom/diff');
import VNode = require('virtual-dom/vnode/vnode');
import VText = require('virtual-dom/vnode/vtext');
import createElement = require('virtual-dom/create-element');

export default function updateElement(element, vtree) {
  console.assert(!!element);
  if (element.firstChild && element.vtree) {
    const patches = diff(element.vtree, vtree);
    patch(element.firstChild, patches);
  } else {
    const node = createElement(vtree);
    if (element.firstChild) {
      element.replaceChild(node, element.firstChild);
    } else {
      element.appendChild(node);
    }
  }
}

import app from '../app';
app.h = (el, props, ...children) => h(el, props, children);
app.createElement = app.h;