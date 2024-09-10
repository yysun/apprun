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
    app.use_render = (render, mode = 0) => mode === 0 ?
        app.render = (el, vdom) => render(vdom, el) : // react style
        app.render = (el, vdom) => render(el, vdom); // apprun style
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