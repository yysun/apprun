import app from './app';
import { createElement, render, Fragment } from './vdom';
import { Component } from './component';
import { VNode, View, Action, Update, EventOptions, ActionOptions } from './types';
import { on, update, customElement } from './decorator';
import webComponent, { CustomElementOptions } from './web-component';
import { Route, route, ROUTER_EVENT, ROUTER_404_EVENT } from './router';

export interface IApp {
  start<T, E=any>(element?: Element | string, model?: T, view?: View<T>, update?: Update<T, E>,
    options?: { history?, rendered?: (state: T) => void}): Component<T, E>;
  on(name: string, fn: (...args: any[]) => void, options?: any): void;
  off(name: string, fn: (...args: any[]) => void): void;
  run(name: string, ...args: any[]): number;
  createElement(tag: string | Function, props, ...children): VNode | VNode[];
  render(element: HTMLElement, node: VNode): void;
  Fragment(props, ...children): any[];
  route?: Route;
  webComponent(name: string, componentClass, options?: CustomElementOptions): void;
}

app.createElement = createElement;
app.render = render;
app.Fragment = Fragment;
app.webComponent = webComponent;

app.start = <T, E=any>(element?: HTMLElement | string, model?: T,  view?: View<T>, update?: Update<T, E>,
  options?: { history?, rendered?: (state: T) => void }) : Component<T, E> => {
    const opts = {...options, render: true, global_event: true };
    const component = new Component<T, E>(model, view, update);
    if (options && options.rendered) component.rendered = options.rendered;
    component.mount(element, opts);
    return component;
};

const NOOP = _ => {/* Intentionally empty */ }
app.on('$', NOOP);
app.on('debug', _ => NOOP);
app.on(ROUTER_EVENT, NOOP);
app.on('#', NOOP);
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
export { app, Component, View, Action, Update, on, update, EventOptions, ActionOptions }
export { update as event };
export { ROUTER_EVENT, ROUTER_404_EVENT };
export { customElement, CustomElementOptions };
export default app as IApp;

if (typeof window === 'object') {
  window['Component'] = Component;
  window['React'] = app;
  window['on'] = on;
  window['customElement'] = customElement;
}


