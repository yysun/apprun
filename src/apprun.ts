import app from './app';
import { createElement, render, Fragment } from './vdom';
import { Component } from './component';
import { VNode, View, Action, Update } from './types';
import { on, update } from './decorator';
import route from './router';
import webComponent from './web-component';

export interface IApp {
  start<T>(element?: Element | string, model?: T, view?: View<T>, update?: Update<T>,
    options?: { history?, rendered?: (state: T) => void}): Component<T>;
  on(name: string, fn: (...args: any[]) => void, options?: any): void;
  run(name: string, ...args: any[]): void;
  createElement(tag: string | Function, props, ...children): VNode | VNode[];
  render(element: HTMLElement, node: VNode): void;
  Fragment(props, ...children): any[];
  webComponent(name: string, componentClass, options?): void;
}

app.createElement = createElement;
app.render = render;
app.Fragment = Fragment;
app.webComponent = webComponent;

app.start = <T>(element?: HTMLElement | string, model?: T,  view?: View<T>, update?: Update<T>,
  options?: { history?, rendered?: (state: T) => void }) : Component<T> => {
    const opts = Object.assign(options || {}, { render: true, global_event: true });
    const component = new Component<T>(model, view, update);
    if (options && options.rendered) component.rendered = options.rendered;
    component.mount(element, opts);
    return component;
};

let _app: IApp = app;
declare var global;
const root = global || window;
if (root['app'] && root['app']['start']) {
  _app = root['app'];
} else {
  root['app'] = _app;
  if (typeof document === 'object') {
    document.addEventListener("DOMContentLoaded", () => {
      window.onpopstate = () => route(location.hash || location.pathname);
      route(location.hash);
    });
  }
}
export type StatelessComponent<T={}> = (args: T) => string | VNode | void;
export { Component, View, Action, Update, on, update };
export { update as event };
export default _app;

app.on('debug', _ => 0);