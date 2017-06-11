import app from './app';
import Component from './component';
import Router from './router';

export default app;
export { Component, Router };

export type Model = any;
export type View = (model: Model) => string | Function;
export type Action = (model: Model, ...p) => Model;
export type Update = { [name: string]: Action };

app.start = (element: HTMLElement, model: Model, view: View, update: Update, options:any={}) => {
  if (typeof options.global_event === 'undefined') options.global_event = true;
  const component = new Component(element, model, view, update, options);
  component.start();
  return component;
}

if (typeof window === 'object') {
  window['app'] = app;
  document.addEventListener("DOMContentLoaded", () => new Router());
}
