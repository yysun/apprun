import app, { Component, View, Action, Update, on, update } from './apprun'
import { createElement, render } from './vdom-html';

app.createElement = createElement;
app.render = render;

export default app;
export { Component, View, Action, Update, on, update };