/// <reference path="virtual-dom.d.ts" />

import h = require('virtual-dom/h');
import patch = require('virtual-dom/patch');
import diff = require('virtual-dom/diff');
import VNode = require('virtual-dom/vnode/vnode');
import VText = require('virtual-dom/vnode/vtext');
import createElement = require('virtual-dom/create-element');
import html2vdom = require('html-to-vdom');
const convertHTML = html2vdom({ VNode, VText });
const convertHTMLWithKey = convertHTML.bind(null, {
  getVNodeKey: function (attributes) {
    return attributes.id;
  }
});

export default function updateElement(element, html) {
  console.assert(!!element);
  const vtree = (typeof html === 'string') ? convertHTMLWithKey(html) : html;
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
  element.vtree = vtree;
}

import app from './app';
app.h = (el, props, ...children) => h(el, props, children);
app.createElement = app.h;