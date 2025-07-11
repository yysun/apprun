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
import { on, update, customElement } from './decorator';
import webComponent from './web-component';
import { route, ROUTER_EVENT, ROUTER_404_EVENT } from './router';
export { App, app, Component, on, update, Fragment, safeHTML };
export { update as event };
export { ROUTER_EVENT, ROUTER_404_EVENT };
export { customElement };
export default app;
if (!app.start) {
    app.version = '3.35.0';
    app.h = app.createElement = createElement;
    app.render = render;
    app.Fragment = Fragment;
    app.webComponent = webComponent;
    app.safeHTML = safeHTML;
    app.start = (element, model, view, update, options) => {
        const opts = Object.assign({ render: true, global_event: true }, options);
        const component = new Component(model, view, update);
        if (options && options.rendered)
            component.rendered = options.rendered;
        if (options && options.mounted)
            component.mounted = options.mounted;
        component.start(element, opts);
        return component;
    };
    const NOOP = _ => { };
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
            }
            else {
                init_load && route(location.pathname);
                document.body.addEventListener('click', e => {
                    const element = e.target;
                    const menu = (element.tagName === 'A' ? element : element.closest('a'));
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
    if (typeof window === 'object') {
        window['Component'] = Component;
        window['_React'] = window['React'];
        window['React'] = app;
        window['on'] = on;
        window['customElement'] = customElement;
        window['safeHTML'] = safeHTML;
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
        app.h = app.createElement = React.createElement;
        app.Fragment = React.Fragment;
        app.render = (el, vdom) => ReactDOM.render(vdom, el);
        if (React.version && React.version.startsWith('18')) {
            app.render = (el, vdom) => {
                if (!el || !vdom)
                    return;
                if (!el._root)
                    el._root = ReactDOM.createRoot(el);
                el._root.render(vdom);
            };
        }
    };
}
//# sourceMappingURL=apprun.js.map