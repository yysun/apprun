/// <reference path="./virtual-dom.d.ts" />

import h = require('virtual-dom/h');
import patch = require('virtual-dom/patch');
import diff = require('virtual-dom/diff');
import VNode = require('virtual-dom/vnode/vnode');
import VText = require('virtual-dom/vnode/vtext');
import createElement = require('virtual-dom/create-element');
import virtualize = require('vdom-virtualize');

import morph = require('morphdom')

export function updateElement(element, html) {
  console.assert(!!element);

  if (typeof html === 'string') {
    if (element.firstChild) {
      morph(element.firstChild, html);
    } else {
      element.innerHTML = html;
    }
  } else {
    const vtree = html;
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
}

import app from './app';
app.h = (el, props, ...children) => (typeof el === 'string') ?
    h(el, props, children) : el(props, children);

app.createElement = app.h;


