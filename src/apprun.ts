import app from './app';
import { createElement, render } from './vdom';
import { Component, View, Action, Update } from './component';
import Router from './router';
import { on, update } from './decorator';

app.createElement = createElement;
app.render = render;

app.start = <T>(element: HTMLElement | string, model: T, view: View<T>, update: Update<T>, options?: { history }) => {
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
export { Component, View, Action, Update, on, update };

