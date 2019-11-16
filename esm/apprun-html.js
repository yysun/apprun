import app from './apprun';
export { app, Component, on, update, event, customElement, ROUTER_404_EVENT, ROUTER_EVENT } from './apprun';
import { createElement, render, Fragment, html, svg } from './vdom-lit-html';
export { html, svg };
app.createElement = createElement;
app.render = render;
app.Fragment = Fragment;
export default app;
if (typeof window === 'object') {
    window['html'] = html;
    window['svg'] = svg;
}
//# sourceMappingURL=apprun-html.js.map