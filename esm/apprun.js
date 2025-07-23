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
 *
 * Features:
 * - Event-driven architecture with pub/sub pattern
 * - Virtual DOM rendering with multiple renderer support
 * - Component lifecycle management
 * - Client-side routing with hash/path support
 * - Web Components integration
 * - React compatibility layer
 * - TypeScript support with strong typing
 * - Batch component mounting with addComponents(element, components)
 *
 * Type Safety Improvements (v3.35.1):
 * - Added null checks for DOM event targets
 * - Improved global window object assignments with proper typing
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
import { createElement, render, Fragment, safeHTML } from './vdom';
import { Component } from './component';
import { on, update, customElement } from './decorator';
import { route, ROUTER_EVENT, ROUTER_404_EVENT } from './router';
import webComponent from './web-component';
import addComponents from './add-components';
import { APPRUN_VERSION } from './version';
const app = _app;
export default app;
export { App, app, Component, on, update, Fragment, safeHTML };
export { update as event };
export { ROUTER_EVENT, ROUTER_404_EVENT };
export { customElement };
if (!app.start) {
    app.version = APPRUN_VERSION;
    app.h = app.createElement = createElement;
    app.render = render;
    app.Fragment = Fragment;
    app.webComponent = webComponent;
    app.safeHTML = safeHTML;
    app.start = (element, state, view, update, options) => {
        const opts = { render: true, global_event: true, ...options };
        const component = new Component(state, view, update);
        if (options && options.rendered)
            component.rendered = options.rendered;
        if (options && options.mounted)
            component.mounted = options.mounted;
        component.start(element, opts);
        return component;
    };
    // Deprecated: app.query is deprecated in favor of app.runAsync
    app.query = app.query || app.runAsync;
    const NOOP = _ => { };
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
            }
            else {
                !no_init_route && (() => {
                    const basePath = app.basePath || '';
                    let initialPath = location.pathname;
                    // Strip base path if present
                    if (basePath && initialPath.startsWith(basePath)) {
                        initialPath = initialPath.substring(basePath.length);
                        if (!initialPath.startsWith('/'))
                            initialPath = '/' + initialPath;
                    }
                    route(initialPath);
                })();
                document.body.addEventListener('click', e => {
                    const element = e.target;
                    if (!element)
                        return;
                    const menu = (element.tagName === 'A' ? element : element.closest('a'));
                    if (menu &&
                        menu.origin === location.origin &&
                        menu.pathname) {
                        e.preventDefault();
                        // Handle base path for navigation
                        const basePath = app.basePath || '';
                        const fullPath = basePath + menu.pathname;
                        history.pushState(null, '', fullPath);
                        route(menu.pathname); // Route with relative path (without base path)
                    }
                });
            }
        });
    }
    if (typeof window === 'object') {
        const globalWindow = window;
        globalWindow['Component'] = Component;
        globalWindow['_React'] = globalWindow['React'];
        globalWindow['React'] = app;
        globalWindow['on'] = on;
        globalWindow['customElement'] = customElement;
        globalWindow['safeHTML'] = safeHTML;
    }
    app.use_render = (render, mode = 0) => {
        if (mode === 0) {
            app.render = (el, vdom) => render(vdom, el); // react style
        }
        else {
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
                if (!el || vdom === undefined)
                    return;
                if (!el._root)
                    el._root = ReactDOM.createRoot(el);
                el._root.render(vdom);
            };
        }
        else {
            // Legacy React versions
            if (!ReactDOM.render || typeof ReactDOM.render !== 'function') {
                console.error('AppRun use_react: ReactDOM.render not found in legacy React');
                return;
            }
            app.render = (el, vdom) => ReactDOM.render(vdom, el);
        }
    };
    app.addComponents = addComponents;
}
//# sourceMappingURL=apprun.js.map