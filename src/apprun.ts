import app from './app';
import { createElement, render } from './vdom';
import { Component } from './component';
import Router from './router';
import { on, update } from './decorator';

type IModel = any;
type IView = (model: IModel) => string | Function | void;
type IAction = (model: IModel, ...p) => IModel;
type IUpdate = { [name: string]: IAction | {}[] | void};

app.createElement = createElement;
app.render = render;

app.start = (element: HTMLElement | string, model: IModel, view: IView, update: IUpdate, options?: { history }) => {
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

export type View<T> = (state: T) => string | Function | void;
export type Action<T> = (state: T, ...p: any[]) => T | Promise<T>;
export type Update<T> = { [name: string]: Action<T> | {}[] | void; };

export interface IComponent<T> {
  readonly state: T;
  view: View<T>;
  update?: Update<T>;
}