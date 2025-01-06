/**
 * Main AppRun framework entry point
 * 
 * This file:
 * 1. Assembles core AppRun modules into a complete framework
 * 2. Exports public API and types
 * 3. Initializes global app instance with:
 *    - Virtual DOM rendering
 *    - Component system
 *    - Router
 *    - Web component support
 * 
 * Key exports:
 * - app: Global event system instance
 * - Component: Base component class
 * - Decorators: @on, @update, @customElement
 * - Router events and configuration
 * - Web component registration
 * 
 * Usage:
 * ```ts
 * import { app, Component } from 'apprun';
 * 
 * // Create components
 * class MyComponent extends Component {
 *   state = // Initial state
 *   view = state => // Render view
 *   update = {
 *     'event': (state, ...args) => // Handle events
 *   }
 * }
 * ```
 */

import app, { App } from './app';
import { createElement, render, Fragment, safeHTML } from './vdom';
import { Component } from './component';
import { VNode, View, Action, Update, EventOptions, ActionOptions, MountOptions, AppStartOptions } from './types';
import { on, update, customElement } from './decorator';
import webComponent, { CustomElementOptions } from './web-component';
import { Route, route, ROUTER_EVENT, ROUTER_404_EVENT } from './router';

export type StatelessComponent<T = {}> = (args: T) => string | VNode | void;
export { App, app, Component, View, Action, Update, on, update, EventOptions, ActionOptions, MountOptions, Fragment, safeHTML }
export { update as event };
export { ROUTER_EVENT, ROUTER_404_EVENT };
export { customElement, CustomElementOptions, AppStartOptions };
export default app as IApp;

export interface IApp {
  start<T, E = any>(element?: Element | string, model?: T, view?: View<T>, update?: Update<T, E>,
    options?: AppStartOptions<T>): Component<T, E>;
  on(name: string, fn: (...args: any[]) => void, options?: any): void;
  off(name: string, fn: (...args: any[]) => void): void;
  run(name: string, ...args: any[]): number;
  find(name: string): any | any[];
  h(tag: string | Function, props, ...children): VNode | VNode[];
  createElement(tag: string | Function, props, ...children): VNode | VNode[];
  render(element: Element | string, node: VNode): void;
  Fragment(props, ...children): any[];
  route?: Route;
  webComponent(name: string, componentClass, options?: CustomElementOptions): void;
  safeHTML(html: string): any[];
  use_render(render, mode?: 0 | 1);
  use_react(createRoot);
}

if (!app.start) {
  app.h = app.createElement = createElement;
  app.render = render;
  app.Fragment = Fragment;
  app.webComponent = webComponent;
  app.safeHTML = safeHTML;

  app.start = <T, E = any>(element?: Element | string, model?: T, view?: View<T>, update?: Update<T, E>,
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

  app.use_render = (render, mode = 0) =>
    mode === 0 ?
      app.render = (el, vdom) => render(vdom, el) : // react style
      app.render = (el, vdom) => render(el, vdom);  // apprun style

  app.use_react = (React, ReactDOM) => {
    app.h = app.createElement = React.createElement;
    app.Fragment = React.Fragment;
    app.render = (el, vdom) => ReactDOM.render(vdom, el);
    if (React.version && React.version.startsWith('18')) {
      app.render = (el, vdom) => {
        if (!el || !vdom) return;
        if (!el._root) el._root = ReactDOM.createRoot(el);
        el._root.render(vdom);
      }
    }
  }
}
