import app, { App } from './app';
import { createElement, render, Fragment, safeHTML } from './vdom';
import { Component } from './component';
import { VNode, View, Action, Update, EventOptions, ActionOptions, MountOptions, AppStartOptions, CustomElementOptions } from './types';
import { on, update, customElement } from './decorator';
import webComponent from './web-component';
import { Route, route, ROUTER_EVENT, ROUTER_404_EVENT } from './router';

export type StatelessComponent<T = {}> = (args: T) => string | VNode | void;
export { App, app, Component, View, Action, Update, on, update, EventOptions, ActionOptions, MountOptions, Fragment, safeHTML }
export { update as event };
export { ROUTER_EVENT, ROUTER_404_EVENT };
export { customElement, CustomElementOptions, AppStartOptions };
export default app;

// export interface IApp {
//   start<T, E = any>(element?: Element | string, model?: T, view?: View<T>, update?: Update<T, E>,
//     options?: AppStartOptions<T>): Component<T, E>;
//   on(name: string, fn: (...args: any[]) => void, options?: any): void;
//   off(name: string, fn: (...args: any[]) => void): void;
//   run(name: string, ...args: any[]): number;
//   find(name: string): any | any[];
//   h(tag: string | Function, props, ...children): VNode | VNode[];
//   createElement(tag: string | Function, props, ...children): VNode | VNode[];
//   render(element: Element, node: VNode): void;
//   Fragment(props, ...children): any[];
//   route?: Route;
//   webComponent(name: string, componentClass, options?: CustomElementOptions): void;
//   safeHTML(html: string): any[];
//   use_render(render: (node: VNode, el: Element) => void, mode?: 0 | 1): void;
//   use_react(createRoot: (container: Element) => { render: (element: VNode) => void }): void;
// }

if (!app.start) {
  app.h = app.createElement = createElement;
  app.render = render;
  app.Fragment = Fragment;
  app.webComponent = webComponent;
  app.safeHTML = safeHTML;

  app.start = <T, E = any>(element?: Element, model?: T, view?: View<T>, update?: Update<T, E>,
    options?: AppStartOptions<T>): Component<T, E> => {
    const opts = { render: true, global_event: true, ...options };
    const component = new Component<T, E>(model, view, update);
    if (options && options.rendered) component.rendered = options.rendered;
    if (options && options.mounted) component.mounted = options.mounted;
    component.start(element, opts);
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
        document.body.hasAttribute('apprun-no-init') || app['no-init-route'] || route(location.hash);
      }
    });
  }

  if (typeof window === 'object') {
    window['Component'] = Component;
    window['_React'] = window['React'];
    window['React'] = app;
    window['on'] = on;
    window['customElement'] = customElement;
    window['safeHTML'] = safeHTML;
  }

  app.use_render = (render: (node: any, el: HTMLElement) => void, mode: 0 | 1 = 0) =>
    mode === 0 ?
      app.render = (el: HTMLElement, vdom: any) => render(vdom, el) : // react style
      app.render = (el: Element, vdom: any) => render(el, vdom);      // apprun style

  app.use_react = (React: any, ReactDOM: any) => {
    app.h = app.createElement = React.createElement;
    app.Fragment = React.Fragment;
    app.render = (el: HTMLElement, vdom: any) => ReactDOM.render(vdom, el);
    if (React.version && React.version.startsWith('18')) {
      app.render = (el: HTMLElement, vdom: any) => {
        if (!el || !vdom) return;
        if (!el["_root"]) el["_root"] = ReactDOM.createRoot(el);
        el["_root"].render(vdom);
      }
    }
  }
}
