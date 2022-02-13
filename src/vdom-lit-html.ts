import { createElement, updateElement, Fragment } from './vdom-my';


import { render, svg, html, noChange, nothing } from 'lit-html';
import { directive, Directive, Part, PartInfo, PartType, EventPart } from 'lit-html/directive.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

function _render(element, vdom, parent?) {
  if (!vdom) return;
  if (typeof vdom === 'string') {
    render(html`${unsafeHTML(vdom)}`, element);
  } else if ('_$litType$' in vdom) {
    if (!element['_$litPart$']) element.replaceChildren();
    render(vdom, element);
  } else {
    updateElement(element, vdom, parent);
    element['_$litPart$'] = undefined;
  }
}

export class RunDirective extends Directive {
  // State stored in class field
  value: number | undefined;
  constructor(partInfo: PartInfo) {
    super(partInfo);
    // When necessary, validate part in constructor using `part.type`
    if (partInfo.type !== PartType.EVENT) {
      throw new Error('${run} can only be used in event handlers');
    }
  }
  // Optional: override update to perform any direct DOM manipulation
  update(part: Part, params) {
    /* Any imperative updates to DOM/parts would go here */

    let { element, name } = part as EventPart;
    const getComponent = () => {
      let component = element['_component'];
      while (!component && element) {
        element = element.parentElement;
        component = element && element['_component'];
      }
      console.assert(!!component, 'Component not found.');
      return component;
    }
    const [event, ...args] = params;
    if (typeof event === 'string') {
      element[`on${name}`] = e => getComponent().run(event, ...args, e);
    } else if (typeof event === 'function') {
      element[`on${name}`] = e => getComponent().setState(event(getComponent().state, ...args, e));
    }
    return this.render();
  }
  render() {
    return noChange;
  }
}

const run = directive(RunDirective) as any;
export { createElement, Fragment, html, svg, _render as render, run };

