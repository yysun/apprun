/**
 * AppRun lit-html renderer entry point
 *
 * Provides the AppRun public API with lit-html rendering primitives. Browser global
 * installation is explicit through app.use_globals(), which extends the core globals
 * with html, svg, and run for script-tag users without mutating globals on import.
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

const useAppGlobals = app.use_globals;
app.use_globals = () => {
  useAppGlobals && useAppGlobals();
  if (typeof window !== 'object') return;
  const globalWindow = window as SafeGlobalContext;
  safeGlobalAssign(globalWindow, { html, svg, run });
};
