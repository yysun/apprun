import app from './apprun'
export { app, Component, View, Action, Update, on, update, customElement, CustomElementOptions } from './apprun'
import { createElement, render, Fragment } from './vdom-html';

app.createElement = createElement;
app.render = render;
app.Fragment = Fragment;

export default app;
