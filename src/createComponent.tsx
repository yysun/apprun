import { updateProps } from './vdom-my';

function render(node, parent, idx) {
  const { tag, props, children } = node;
  let key = `_${idx}`;
  let id = props && props['id'];
  if (!id) id = `_${idx}${Date.now()}`;
  else key = id;
  let asTag = 'section';
  if (props && props['as']) {
    asTag = props['as'];
    delete props['as'];
  }
  if (!parent.__componentCache) parent.__componentCache = {};
  let component = parent.__componentCache[key];
  if (!component || !(component instanceof tag) || !component.element) {
    const element = document.createElement(asTag);
    component = parent.__componentCache[key] = new tag({ ...props, children }).start(element);
  }
  if (component.mounted) {
    const new_state = component.mounted(props, children, component.state);
    (typeof new_state !== 'undefined') && component.setState(new_state);
  }
  updateProps(component.element, props, false);
  return component.element;
}

export default function createComponent(node, parent, idx = 0) {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(child => createComponent(child, parent, idx++));
  let vdom = node;
  if (node && typeof node.tag === 'function' && Object.getPrototypeOf(node.tag).__isAppRunComponent) {
    vdom = render(node, parent, idx);
  }
  if (vdom && Array.isArray(vdom.children)) {
    const new_parent = vdom.props?._component;
    if (new_parent) {
      let i = 0;
      vdom.children = vdom.children.map(child => createComponent(child, new_parent, i++));
    } else {
      vdom.children = vdom.children.map(child => createComponent(child, parent, idx++));
    }
  }
  return vdom;
}
