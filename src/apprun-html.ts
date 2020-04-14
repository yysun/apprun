import app from './apprun'
export {
  app, Component, View, Action, Update, on, update, event, EventOptions,
  customElement, CustomElementOptions,
  ROUTER_404_EVENT, ROUTER_EVENT
} from './apprun'
import { createElement, render, Fragment } from './vdom-html';

app.createElement = createElement;
app.render = render;
app.Fragment = Fragment;

export default app;
