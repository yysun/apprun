import app from './apprun';
export { app, Component, on, update, event, customElement, ROUTER_404_EVENT, ROUTER_EVENT } from './apprun';
import { createElement, render, Fragment, html, svg, run } from './vdom-lit-html';
export { html, svg, render, run };
app.createElement = createElement;
app.render = render;
app.Fragment = Fragment;
export default app;
if (typeof window === 'object') {
    window['html'] = html;
    window['svg'] = svg;
    window['run'] = run;
}
//# sourceMappingURL=apprun-html.js.map