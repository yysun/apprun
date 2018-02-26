import app from './app';
import { createElement, render } from './vdom';
import { Component } from './component';
import Router from './router';
import { on, update } from './decorator';

export type Model = any;
export type View = (model: Model) => string | Function;
export type Action = (model: Model, ...p) => Model;
export type Update = { [name: string]: Action | {}[] };

app.createElement = createElement;
app.render = render;

app.start = (element: HTMLElement | string, model: Model, view: View, update: Update, options?: { history }) => {
  const opts = Object.assign(options || {}, { render: true, global_event: true} )
  const component = new Component(model, view, update);
  component.mount(element, opts);
  return component;
}

let _app = app;
if (typeof window === 'object') {
  if (window['app'] && window['app']['start']) {
    _app = window['app'];
  } else {
    window['app'] = _app;
    document.addEventListener("DOMContentLoaded", () => new Router());
  }
}

export default _app;
export { Component, on, update };