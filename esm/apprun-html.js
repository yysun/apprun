import app from './apprun';
export { app, Component, on, update, event, customElement, ROUTER_404_EVENT, ROUTER_EVENT } from './apprun';
import { createElement, render, Fragment } from './vdom-html';
app.createElement = createElement;
app.render = render;
app.Fragment = Fragment;
export default app;
//# sourceMappingURL=apprun-html.js.map