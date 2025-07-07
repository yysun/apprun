import { createElement, updateElement, Fragment } from './vdom-my';
import { render, svg, html, noChange } from 'lit';
import { directive, Directive, PartType } from 'lit/directive.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import app from './apprun';
function _render(element, vdom, parent) {
    if (!vdom)
        return;
    if (typeof vdom === 'string') {
        if (!element['_$litPart$'])
            element.replaceChildren();
        render(html `${unsafeHTML(vdom)}`, element);
    }
    else if (vdom['_$litType$']) {
        if (!element['_$litPart$'])
            element.replaceChildren();
        render(vdom, element);
    }
    else {
        updateElement(element, vdom, parent);
        element['_$litPart$'] = undefined;
    }
}
export class RunDirective extends Directive {
    constructor(partInfo) {
        super(partInfo);
        // When necessary, validate part in constructor using `part.type`
        if (partInfo.type !== PartType.EVENT) { // In lit v3, use PartType.EVENT
            throw new Error('run() can only be used in event handlers');
        }
    }
    // Override update to perform any direct DOM manipulation
    update(part, props) {
        /* Any imperative updates to DOM/parts would go here */
        const element = part.element;
        const name = part.name;
        const [eventOrFn, ...args] = props;
        const getComponent = () => {
            let el = element;
            let component = el['_component'];
            while (!component && el) {
                el = el.parentElement;
                component = el && el['_component'];
            }
            console.assert(!!component, 'Component not found.');
            return component;
        };
        if (typeof eventOrFn === 'string') {
            element[`on${name}`] = e => {
                const component = getComponent();
                component ? component.run(eventOrFn, ...args, e) : app.run(eventOrFn, ...args, e);
            };
        }
        else if (typeof eventOrFn === 'function') {
            element[`on${name}`] = e => getComponent().setState(eventOrFn(getComponent().state, ...args, e));
        }
        return this.render();
    }
    render() {
        return noChange;
    }
}
const run = directive(RunDirective);
export { createElement, Fragment, html, svg, _render as render, run };
//# sourceMappingURL=vdom-lit-html.js.map