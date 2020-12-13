import app from './app';
function render(node, parent, idx) {
    const { tag, props, children } = node;
    let key = `_${idx}`;
    let id = props && props['id'];
    if (!id)
        id = `_${idx}${Date.now()}`;
    else
        key = id;
    if (!parent.__componentCache)
        parent.__componentCache = {};
    let component = parent.__componentCache[key];
    if (!component || !(component instanceof tag)) {
        component = parent.__componentCache[key] = new tag(Object.assign(Object.assign({}, props), { children })).mount(id);
    }
    let state = component.state;
    if (component.mounted) {
        const new_state = component.mounted(props, children, component.state);
        state = (typeof new_state !== 'undefined') ? state = new_state : component.state;
    }
    if (state instanceof Promise) {
        const render = el => {
            component.element = el;
            Promise.all([state]).then(v => {
                if (v[0])
                    component.setState(v[0]);
                else
                    component.setState(component.state);
            });
        };
        return app.h("section", Object.assign({}, props, { ref: e => render(e), _component: component }));
    }
    else if (state != null) {
        const vdom = component._view(state, props);
        const render = el => {
            component.element = el;
            component.state = state;
            component.renderState(state, vdom);
        };
        return app.h("section", Object.assign({}, props, { ref: e => render(e), _component: component }), vdom);
    }
    else {
        return app.h("section", Object.assign({}, props, { _component: component }));
    }
}
export default function createComponent(node, parent, idx = 0) {
    var _a;
    if (typeof node === 'string')
        return node;
    if (Array.isArray(node))
        return node.map(child => createComponent(child, parent, idx++));
    let vdom = node;
    if (node && typeof node.tag === 'function' && Object.getPrototypeOf(node.tag).__isAppRunComponent) {
        vdom = render(node, parent, idx);
    }
    if (vdom && Array.isArray(vdom.children)) {
        const new_parent = (_a = vdom.props) === null || _a === void 0 ? void 0 : _a._component;
        if (new_parent) {
            let i = 0;
            vdom.children = vdom.children.map(child => createComponent(child, new_parent, i++));
        }
        else {
            vdom.children = vdom.children.map(child => createComponent(child, parent, idx++));
        }
    }
    return vdom;
}
//# sourceMappingURL=createComponent.js.map