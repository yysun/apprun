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
 *    - Component batch mounting system
 *
 * Key exports:
 * - app: Global event system instance
 * - Component: Base component class
 * - Decorators: @on, @update, @customElement
 * - Router events and configuration
 * - Web component registration
 * - trustedHTML: Parses caller-owned trusted HTML
 *
 * Features:
 * - Event-driven architecture with pub/sub pattern
 * - Virtual DOM rendering with multiple renderer support
 * - Component lifecycle management
 * - Client-side routing with hash/path support and native link behavior guards
 * - Web Components integration
 * - React compatibility layer
 * - TypeScript support with strong typing
 * - Batch component mounting with addComponents(element, components)
 *
 * Type Safety Improvements (v3.35.1):
 * - Added null checks for DOM event targets
 * - Browser script-tag globals are limited to the app singleton in core builds
 * - Enhanced React integration parameter validation
 * - Better error handling for invalid event handlers
 * - Safer element access with proper type assertions
 *
 * Recent Changes:
 * - Modified addComponents to accept (element, components) where components is a key-value object with routes as keys and components as values
 * - Simplified component mounting API for better usability
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
 *
 * // Mount multiple components
 * app.addComponents(document.body, {
 *   '/home': MyComponent,
 *   '/about': AnotherComponent
 * });
 * ```
 */

import _app, { App } from './app';
import { createElement, render, Fragment, trustedHTML, safeHTML } from './vdom';
import { Component } from './component';
import { IApp, VNode, State, View, Action, Update, EventOptions, ActionOptions, MountOptions, AppStartOptions, CustomElementOptions, Element as AppRunElement } from './types';
import { on, update, customElement } from './decorator';
import { route, ROUTER_EVENT, ROUTER_404_EVENT } from './router';
import webComponent from './web-component';
import addComponents from './add-components';
import { APPRUN_VERSION } from './version';

export type StatelessComponent<T = {}> = (args: T) => string | VNode | void;

const app: IApp = _app as unknown as IApp;
export default app as IApp;

const shouldRouteLinkClick = (e: MouseEvent, menu?: HTMLAnchorElement): boolean => {
  if (!menu) return false;
  if (e.defaultPrevented) return false;
  if (e.button !== 0) return false;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if (menu.target && menu.target.toLowerCase() !== '_self') return false;
  if (menu.hasAttribute('download')) return false;
  if ((menu.getAttribute('rel') || '').toLowerCase().split(/\s+/).includes('external')) return false;
  return menu.origin === location.origin && !!menu.pathname;
};

const routeLinkClick = (e: MouseEvent, menu?: HTMLAnchorElement): boolean => {
  if (!shouldRouteLinkClick(e, menu)) return false;
  e.preventDefault();

  // Handle base path for navigation
  const basePath = app.basePath || '';
  const fullPath = basePath + menu.pathname;

  history.pushState(null, '', fullPath);
  route(menu.pathname); // Route with relative path (without base path)
  return true;
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
  trustedHTML,
  safeHTML
}
export { update as event };
export { ROUTER_EVENT, ROUTER_404_EVENT };
export { customElement, CustomElementOptions, AppStartOptions };

if (!app.start) {

  app.version = APPRUN_VERSION;

  app.h = app.createElement = createElement;
  app.render = render;
  app.Fragment = Fragment;
  app.webComponent = webComponent;
  app.trustedHTML = trustedHTML;
  app.safeHTML = safeHTML;

  app.start = <T, E = unknown>(element?: AppRunElement, state?: State<T>, view?: View<T>, update?: Update<T, E>,
    options?: AppStartOptions<T>): Component<T, E> => {
    const opts = { render: true, global_event: true, ...options };
    const component = new Component<T, E>(state, view, update);
    if (options && options.rendered) component.rendered = options.rendered;
    if (options && options.mounted) component.mounted = options.mounted;
    component.start(element, opts);
    return component;
  };

  const NOOP = _ => {/* Intentionally empty */ }
  app.on('/', NOOP);
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
        !no_init_route && (() => {
          const basePath = app.basePath || '';
          let initialPath = location.pathname;

          // Strip base path if present
          if (basePath && initialPath.startsWith(basePath)) {
            initialPath = initialPath.substring(basePath.length);
            if (!initialPath.startsWith('/')) initialPath = '/' + initialPath;
          }

          route(initialPath);
        })();
        document.body.addEventListener('click', e => {
          const target = e.target as Node;
          const element = target instanceof Element ? target : target?.parentElement;
          if (!element) return;

          const menu = (element.tagName === 'A' ? element : element.closest('a')) as HTMLAnchorElement;
          routeLinkClick(e, menu);
        });
      }
    });
  }

  if (typeof window === 'object') {
    const globalWindow = window as any;
    globalWindow['Component'] = Component;
    globalWindow['on'] = on;
    globalWindow['customElement'] = customElement;
    globalWindow['trustedHTML'] = trustedHTML;
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

  app.addComponents = addComponents;
}
