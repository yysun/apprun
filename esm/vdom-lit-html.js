import { createElement, updateElement, Fragment } from './vdom-my';
import { html, render, TemplateResult, svg } from 'lit-html';
import { unsafeHTML } from "lit-html/directives/unsafe-html";
function _render(element, vdom, parent) {
    if (typeof vdom === 'string') {
        render(html `${unsafeHTML(vdom)}`, element);
    }
    else if (vdom instanceof TemplateResult) {
        render(vdom, element);
    }
    else {
        updateElement(element, vdom, parent);
    }
}
export { createElement, Fragment, html, svg, _render as render };
//# sourceMappingURL=vdom-lit-html.js.map