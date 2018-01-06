import app, { Component } from './apprun'
import { createElement, render } from './vdom-html';

app.createElement = createElement;
app.render = render;

export default app;
export { Component };