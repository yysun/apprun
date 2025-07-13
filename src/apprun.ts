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
import { APPRUN_VERSION } from './version';

export type StatelessComponent<T = {}> = (args: T) => string | VNode | void;
type OnDecorator = {
  <T = any>(options?: any): (constructor: Function) => void;
  <E = string>(events?: E, options?: any): (target: any, key: string) => void;
};

export {
  App,
  app,
  Component,
  View,
  Action,
  Update,
  on,
  update,
  EventOptions,
  ActionOptions,
  MountOptions,
  Fragment,
  safeHTML
}
export { update as event };
export { ROUTER_EVENT, ROUTER_404_EVENT };
export { customElement, CustomElementOptions, AppStartOptions };
export default app as IApp;

export interface IApp {
  start<T, E = any>(element?: Element | string, model?: T, view?: View<T>, update?: Update<T, E>,
    options?: AppStartOptions<T>): Component<T, E>;
  on(name: string, fn: (...args: any[]) => void, options?: any): void;
  once(name: string, fn: (...args: any[]) => void, options?: any): void;
  off(name: string, fn: (...args: any[]) => void): void;
  run(name: string, ...args: any[]): number;
  find(name: string): any | any[];
  query(name: string, ...args: any[]): Promise<any[]>;
  runAsync(name: string, ...args: any[]): Promise<any[]>;
  h(tag: string | Function, props, ...children): VNode | VNode[];
  createElement(tag: string | Function, props, ...children): VNode | VNode[];
  render(element: Element | string, node: VNode): void;
  Fragment(props, ...children): any[];
  route?: Route;
  webComponent(name: string, componentClass, options?: CustomElementOptions): void;
  safeHTML(html: string): any[];
  use_render(render, mode?: 0 | 1);
  use_react(React, ReactDOM);
  version: string;
}

if (!app.start) {

  app.version = APPRUN_VERSION;

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

  app.once = app.once || ((name: string, fn: (...args: any[]) => void, options: any = {}) => {
    app.on(name, fn, { ...options, once: true });
  });

  app.query = app.query || app.runAsync;

  const NOOP = _ => {/* Intentionally empty */ }
  // app.on('$', NOOP);
  app.on('debug', _ => NOOP);
  app.on(ROUTER_EVENT, NOOP);
  app.on(ROUTER_404_EVENT, NOOP);
  app.route = route;
  app.on('route', url => app['route'] && app['route'](url));

  if (typeof document === 'object') {
    document.addEventListener("DOMContentLoaded", () => {
      const init_load = document.body.hasAttribute('apprun-no-init') || app['no-init-route'] || false;
      const use_hash = app.find('#') || app.find('#/') || false;

      // console.log(`AppRun ${app.version} started with ${use_hash ? 'hash' : 'path'} routing. Initial load: ${init_load ? 'disabled' : 'enabled'}.`);
      window.addEventListener('hashchange', () => route(location.hash));
      window.addEventListener('popstate', () => route(location.pathname));

      if (use_hash) {
        init_load && route(location.hash);
      } else {
        init_load && route(location.pathname);
        document.body.addEventListener('click', e => {
          const element = e.target as HTMLElement;
          const menu = (element.tagName === 'A' ? element : element.closest('a')) as HTMLAnchorElement;
          if (menu &&
            menu.origin === location.origin) {
            e.preventDefault();
            history.pushState(null, '', menu.pathname);
            route(menu.pathname);
          }
        });
      }
    });
  }

  type ComponentType = typeof Component & {
    <T = any>(options?: any): (constructor: Function) => void;
  };

  if (typeof window === 'object') {
    window['Component'] = Component as ComponentType;
    window['_React'] = window['React'];
    window['React'] = app;
    window['on'] = on as OnDecorator;
    window['customElement'] = customElement;
    window['safeHTML'] = safeHTML;
  }

  app.use_render = (render, mode = 0) => {
    if (mode === 0) {
      app.render = (el, vdom) => render(vdom, el); // react style
    } else {
      app.render = (el, vdom) => render(el, vdom); // apprun style
    }
  };

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
