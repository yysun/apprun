import app from './app';

function render(node, parent, idx) {
  const { tag, props, children } = node;

  let id = props && props['id'];
  let key = `_${tag.name}_${idx}`
  if (!id) {
    id = `_${tag.name}_${idx}`;
  } else {
    key = `_${tag.name}_${id}`;
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
    vdom = component.view(state);
    component.rendered && setTimeout(() => component.rendered(state));
  }
  return <div id={id}>{vdom}</div>;
}

function createComponent(node, parent, idx = 0) {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(child => createComponent(child, parent, idx++));
  let vdom = node;
  if (node && node.tag && Object.getPrototypeOf(node.tag).__isAppRunComponent) vdom = render(node, parent, idx++);
  if (vdom && vdom.children) vdom.children = vdom.children.map(child => createComponent(child, parent, idx++));
  return vdom;
 }

export default createComponent;
