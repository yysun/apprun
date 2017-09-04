import app from './app';
import { Component } from './component';
import Router from './router';
import { createElement, render } from './vdom';

export type Model = any;
export type View = (model: Model) => string | Function;
export type Action = (model: Model, ...p) => Model;
export type Update = { [name: string]: Action };

app.createElement = createElement;
app.render = render;

app.start = (element: HTMLElement | string, model: Model, view: View, update: Update, options: any = {}) => {
  if (typeof options.global_event === 'undefined') options.global_event = true;
  const component = new Component(model, view, update);
  component.start(element, options);
  return component;
}

if (typeof window === 'object') {
  window['app'] = app;
  document.addEventListener("DOMContentLoaded", () => new Router());
}

export default app;
export { Component };