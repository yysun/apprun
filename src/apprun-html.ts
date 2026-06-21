/**
 * AppRun lit-html renderer entry point
 *
 * Provides the AppRun public API with lit-html rendering primitives. The script-tag
 * build keeps the browser authoring surface: app, Component, on, customElement,
 * trustedHTML, safeHTML, html, svg, and run.
 */

import app from './apprun'
import { safeGlobalAssign, SafeGlobalContext } from './type-utils';
export {
  app, Component, View, Action, Update, on, update, event, EventOptions,
  customElement, CustomElementOptions,
  ROUTER_404_EVENT, ROUTER_EVENT, trustedHTML, safeHTML
} from './apprun'
import { createElement, render, Fragment, html, svg, run } from './vdom-lit-html';
export { html, svg, render, run }

app.createElement = createElement;
app.render = render;
app.Fragment = Fragment;

export default app;

const installHtmlGlobals = () => {
  if (typeof window !== 'object') return;
  const globalWindow = window as SafeGlobalContext;
  safeGlobalAssign(globalWindow, { html, svg, run });
};

installHtmlGlobals();
