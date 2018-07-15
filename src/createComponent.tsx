import app from './app';

const cache = {}
export default function (componentClass, props) {
  let id = props && props['id'];
  let component;
  if (id) {
    component = cache[id];
    if (!component) component = cache[id] = new componentClass(props).mount(id);
  } else {
    id = `_${componentClass.name}_${performance.now()}`;
    component = cache[componentClass];
    if (!component) component = cache[componentClass] = new componentClass(props).mount(id);
  }
  if (component.mounted) setTimeout(() => component.mounted(props), 0);
  if (component.rendered) setTimeout(() => component.rendered(component.state), 0);
  return <div id={id}>
    {component.view && component.view(component.state)}
  </div>
}