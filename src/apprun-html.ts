import app from './apprun'
export {
  app, Component, View, Action, Update, on, update, event, EventOptions,
  customElement, CustomElementOptions,
  ROUTER_404_EVENT, ROUTER_EVENT
} from './apprun'
import { createElement, render, Fragment, html, svg } from './vdom-lit-html';
export { html, svg }

app.createElement = createElement;
app.render = render;
app.Fragment = Fragment;

export default app;

if (typeof window === 'object') {
  window['html'] = html;
  window['svg'] = svg;
}
