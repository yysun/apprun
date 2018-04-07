import app from './app';
import { createElement, render } from './vdom';
import { Component, View, Action, Update } from './component';
import Router from './router';
import { on, update } from './decorator';

export type VNode = {
  tag: string,
  props: {},
  children: Array<VNode>
} | string;

export interface IApp {
  start<T>(element: Element, model: T, view: View<T>, update: Update<T>,
    options?: { history?, rendered?: (state: T) => void}): Component<T>;
  on(name: string, fn: (...args: any[]) => void, options?: any): void;
  run(name: string, ...args: any[]): void;
  createElement(tag: string | Function, props, ...children): VNode;
  render(element: HTMLElement, node: VNode): void;
}

app.createElement = createElement;
app.render = render;

app.start = <T>(element: HTMLElement | string, model: T, view: View<T>, update: Update<T>,
  options?: { history?, rendered?: (state: T) => void }) : Component<T> => {
  const opts = Object.assign(options || {}, { render: true, global_event: true });
  const component = new Component<T>(model, view, update);
  if (options && options.rendered) component.rendered = options.rendered;
  component.mount(element, opts);
  return component;
};

let _app: IApp = app;
if (typeof window === 'object') {
  if (window['app'] && window['app']['start']) {
    _app = window['app'];
  } else {
    window['app'] = _app;
    document.addEventListener("DOMContentLoaded", () => new Router());
  }
}

export type StatelessComponent<T={}> = (args: T) => VNode | void;
export { Component, View, Action, Update, on, update };
export default _app;

app.on('debug', _ => 0);