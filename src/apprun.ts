import app from './app';
import { createElement, render, Fragment } from './vdom';
import { Component } from './component';
import { VNode, View, Action, Update } from './types';
import { on, update } from './decorator';
import route, { ROUTER_EVENT, ROUTER_404_EVENT } from './router';

export { ROUTER_EVENT, ROUTER_404_EVENT } from './router';

export interface IApp {
  start<T>(element?: Element | string, model?: T, view?: View<T>, update?: Update<T>,
    options?: { history?, rendered?: (state: T) => void}): Component<T>;
  on(name: string, fn: (...args: any[]) => void, options?: any): void;
  off(name: string, fn: (...args: any[]) => void): void;
  run(name: string, ...args: any[]): number;
  createElement(tag: string | Function, props, ...children): VNode | VNode[];
  render(element: HTMLElement, node: VNode): void;
  Fragment(props, ...children): any[];
}

app.createElement = createElement;
app.render = render;
app.Fragment = Fragment;

app.start = <T>(element?: HTMLElement | string, model?: T,  view?: View<T>, update?: Update<T>,
  options?: { history?, rendered?: (state: T) => void }) : Component<T> => {
    const opts = Object.assign(options || {}, { render: true, global_event: true });
    const component = new Component<T>(model, view, update);
    if (options && options.rendered) component.rendered = options.rendered;
    component.mount(element, opts);
    return component;
};

app.on(ROUTER_EVENT, _ => { });
app.on('#', _ => { });
app['route'] = route;
app.on('route', url => app['route'] && app['route'](url));

if (typeof document === 'object') {
  document.addEventListener("DOMContentLoaded", () => {
    if (app['route'] === route) {
      window.onpopstate = () => route(location.hash);
      route(location.hash);
    }
  });
}

export type StatelessComponent<T={}> = (args: T) => string | VNode | void;
export { app, Component, View, Action, Update, on, update };
export { update as event };
export default app as IApp;

if (typeof window === 'object') {
  window['Component'] = Component;
}

app.on('debug', _ => 0);