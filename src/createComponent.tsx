import app from './app';

function render(node, parent, idx) {
  const { tag, props, children } = node;

  let id = props && props['id'];
  let key = `_${idx}_`
  if (!id) {
    id = `_${idx}_`;
  } else {
    key = `_${id}_`;
  }

  if (!parent.__componentCache) parent.__componentCache = {};
  let component = parent.__componentCache[key];
  if (!component) {
    component = parent.__componentCache[key] = new tag({ ...props, children }).mount(id);
  }
  component.mounted && component.mounted(props, children);
  const state = component.state;
  let vdom = '';
  if (!(state instanceof Promise) && component.view) {
    vdom = component.view(state, props);
    component.rendered && setTimeout(() => component.rendered(state, props));
  }
  return <section {...props} id={id}>{vdom}</section>;
}

let _idx = 0;
function createComponent(node, parent, idx = 0) {
  if (idx === 0) _idx = 0;
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(child => createComponent(child, parent, _idx++));
  let vdom = node;
  if (node && typeof (node.tag) === 'function' && Object.getPrototypeOf(node.tag).__isAppRunComponent) vdom = render(node, parent, _idx++);
  if (vdom && vdom.children) vdom.children = vdom.children.map(child => createComponent(child, parent, _idx++));
  return vdom;
 }

export default createComponent;
