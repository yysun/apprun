import app, { Component, View, Action, Update, on, update } from './apprun'
import { createElement, render, Fragment } from './vdom-html';

app.createElement = createElement;
app.render = render;
app.Fragment = Fragment;

export default app;
export { app, Component, View, Action, Update, on, update };