import { createElement, updateElement, Fragment } from './vdom-my';
import { html, render, TemplateResult, svg, directive, EventPart, parts } from 'lit-html';
import { unsafeHTML } from "lit-html/directives/unsafe-html";

function _render(element, vdom, parent?) {
  if (typeof vdom === 'string') {
    render(html`${unsafeHTML(vdom)}`, element);
  } else if (vdom instanceof TemplateResult) {
    render(vdom, element);
  } else {
    updateElement(element, vdom, parent);
    parts.delete(element);
  }
}

const run = directive((event, ...args) => (part) => {
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
    element[`on${eventName}`] = e => getComponent().run(event, ...args, e);
  } else if (typeof event === 'function') {
    element[`on${eventName}`] = e => getComponent().setState(event(getComponent().state, ...args, e));
  }
});

export { createElement, Fragment, html, svg, _render as render, run };

