import { createElement, updateElement, Fragment } from './vdom-my';
import { html, render, TemplateResult, svg, directive, EventPart } from 'lit-html';
import { unsafeHTML } from "lit-html/directives/unsafe-html";

function _render(element, vdom, parent?) {
  if (typeof vdom === 'string') {
    render(html`${unsafeHTML(vdom)}`, element);
  } else if (vdom instanceof TemplateResult) {
    render(vdom, element)
  } else {
    updateElement(element, vdom, parent);
  }
}

const run = directive((event) => (part) => {
  if (!(part instanceof EventPart)) {
    throw new Error('${run} can only be used in event handlers');
  }
  let { element, eventName } = part;
  const getComponent = () => {
    let component = element['_component'];
    while (!component && element) {
      element = element.parentElement;
      component = element && element['_component'];
    }
    console.assert(!!component, 'Component not found.');
    return component;
  }
  if (typeof event === 'string') {
    element[`on${eventName}`] = e => getComponent().run(event, e);
  } else if (typeof event === 'function') {
    element[`on${eventName}`] = e => event(e);
  } else if (Array.isArray(event)) {
    const [handler, ...p] = event;
    if (typeof handler === 'string') {
      element[`on${eventName}`] = e => getComponent().run(handler, ...p, e);
    } else if (typeof handler === 'function') {
      element[`on${eventName}`] = e => getComponent().setState(handler(getComponent().state, ...p, e));
    }
  }
});

export { createElement, Fragment, html, svg, _render as render , run};

