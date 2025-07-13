/**
 * Main AppRun framework entry point
 *
 * This file:
 * 1. Assembles core AppRun modules into a complete framework
 * 2. Exports public API and types
 * 3. Initializes global app instance with:
 *    - Virtual DOM rendering
 *    - Component system
 *    - Router with improved null safety
 *    - Web component support
 *    - Type-safe React integration
 *
 * Key exports:
 * - app: Global event system instance
 * - Component: Base component class
 * - Decorators: @on, @update, @customElement
 * - Router events and configuration
 * - Web component registration
 *
 * Features:
 * - Event-driven architecture with pub/sub pattern
 * - Virtual DOM rendering with multiple renderer support
 * - Component lifecycle management
 * - Client-side routing with hash/path support
 * - Web Components integration
 * - React compatibility layer
 * - TypeScript support with strong typing
 *
 * Type Safety Improvements (v3.35.1):
 * - Added null checks for DOM event targets
 * - Improved global window object assignments with proper typing
 * - Enhanced React integration parameter validation
 * - Better error handling for invalid event handlers
 * - Safer element access with proper type assertions
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
      const no_init_route = document.body.hasAttribute('apprun-no-init') || app['no-init-route'] || false;
      const use_hash = app.find('#') || app.find('#/') || false;

      // console.log(`AppRun ${app.version} started with ${use_hash ? 'hash' : 'path'} routing. Initial load: ${init_load ? 'disabled' : 'enabled'}.`);
      window.addEventListener('hashchange', () => route(location.hash));
      window.addEventListener('popstate', () => route(location.pathname));

      if (use_hash) {
        !no_init_route && route(location.hash);
      } else {
        !no_init_route && route(location.pathname);
        document.body.addEventListener('click', e => {
          const element = e.target as HTMLElement;
          if (!element) return;

          const menu = (element.tagName === 'A' ? element : element.closest('a')) as HTMLAnchorElement;
          if (menu &&
            menu.origin === location.origin &&
            menu.pathname) {
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
    const globalWindow = window as any;
    globalWindow['Component'] = Component as ComponentType;
    globalWindow['_React'] = globalWindow['React'];
    globalWindow['React'] = app;
    globalWindow['on'] = on as OnDecorator;
    globalWindow['customElement'] = customElement;
    globalWindow['safeHTML'] = safeHTML;
  }

  app.use_render = (render, mode = 0) => {
    if (mode === 0) {
      app.render = (el, vdom) => render(vdom, el); // react style
    } else {
      app.render = (el, vdom) => render(el, vdom); // apprun style
    }
  };

  app.use_react = (React, ReactDOM) => {
    if (!React || !ReactDOM) {
      console.error('AppRun use_react: React and ReactDOM parameters are required');
      return;
    }

    if (typeof React.createElement !== 'function') {
      console.error('AppRun use_react: Invalid React object - createElement method not found');
      return;
    }

    if (!React.Fragment) {
      console.error('AppRun use_react: Invalid React object - Fragment not found');
      return;
    }

    app.h = app.createElement = React.createElement;
    app.Fragment = React.Fragment;

    // React 18+ uses createRoot API
    if (React.version && React.version.startsWith('18')) {
      if (!ReactDOM.createRoot || typeof ReactDOM.createRoot !== 'function') {
        console.error('AppRun use_react: ReactDOM.createRoot not found in React 18+');
        return;
      }
      app.render = (el, vdom) => {
        if (!el || vdom === undefined) return;
        if (!(el as any)._root) (el as any)._root = ReactDOM.createRoot(el);
        (el as any)._root.render(vdom);
      }
    } else {
      // Legacy React versions
      if (!ReactDOM.render || typeof ReactDOM.render !== 'function') {
        console.error('AppRun use_react: ReactDOM.render not found in legacy React');
        return;
      }
      app.render = (el, vdom) => ReactDOM.render(vdom, el);
    }
  }
}
