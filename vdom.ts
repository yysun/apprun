/// <reference path="./virtual-dom.d.ts" />

import h = require('virtual-dom/h');
import patch = require('virtual-dom/patch');
import diff = require('virtual-dom/diff');
import VNode = require('virtual-dom/vnode/vnode');
import VText = require('virtual-dom/vnode/vtext');
import createElement = require('virtual-dom/create-element');
import virtualize = require('vdom-virtualize');
import html2vdom = require('html-to-vdom');
const convertHTML = html2vdom({ VNode, VText });
const convertHTMLWithKey = convertHTML.bind(null, {
  getVNodeKey: function (attributes) {
    return attributes.id;
  }
});

export function updateElement(element, html) {
  console.assert(!!element);
  const vtree = (typeof html === 'string') ? convertHTMLWithKey(html) : html;
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

export function updateElementVtree(element) {
  console.assert(!!element);
  if (element.firstChild) {
    element.firstChild.vtree = virtualize(element.firstChild);
  }
}

import app from './app';
app.h = (el, props, ...children) => (typeof el === 'string') ?
    h(el, props, children) : el(props, children);

app.createElement = app.h;