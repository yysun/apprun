import app from './apprun';
import { safeGlobalAssign } from './type-utils';
export { app, Component, on, update, event, customElement, ROUTER_404_EVENT, ROUTER_EVENT, safeHTML } from './apprun';
import { createElement, render, Fragment, html, svg, run } from './vdom-lit-html';
export { html, svg, render, run };
app.createElement = createElement;
app.render = render;
app.Fragment = Fragment;
export default app;
if (typeof window === 'object') {
    const globalWindow = window;
    safeGlobalAssign(globalWindow, {
        'React': globalWindow['_React'] || app,
        'html': html,
        'svg': svg,
        'run': run
    });
}
//# sourceMappingURL=apprun-html.js.map