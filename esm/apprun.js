import app from './app';
import { createElement, render, Fragment, safeHTML } from './vdom';
import { Component } from './component';
import { on, update, customElement } from './decorator';
import webComponent from './web-component';
import { route, ROUTER_EVENT, ROUTER_404_EVENT } from './router';
app.h = app.createElement = createElement;
app.render = render;
app.Fragment = Fragment;
app.webComponent = webComponent;
app.start = (element, model, view, update, options) => {
    const opts = Object.assign({ render: true, global_event: true }, options);
    const component = new Component(model, view, update);
    if (options && options.rendered)
        component.rendered = options.rendered;
    component.mount(element, opts);
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
            if (!document.body.hasAttribute('apprun-no-init'))
                route(location.hash);
        }
    });
}
export { app, Component, on, update, Fragment, safeHTML };
export { update as event };
export { ROUTER_EVENT, ROUTER_404_EVENT };
export { customElement };
export default app;
if (typeof window === 'object') {
    window['Component'] = Component;
    window['React'] = app;
    window['on'] = on;
    window['customElement'] = customElement;
}
//# sourceMappingURL=apprun.js.map