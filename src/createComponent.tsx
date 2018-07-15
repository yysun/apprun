import app from './app';

const cache = {}
export default function (componentClass, props) {
  let id = props && props['id'];
  if (!id) id = `_${componentClass.name}_${performance.now()}`;
  const component = (id && cache[id]) ? cache[id] :
  (cache[id] = new componentClass(props).mount(id));
  if (component.mounted) setTimeout(() => component.mounted(props), 0);
  if (component.rendered) setTimeout(() => component.rendered(component.state), 0);
  return <div id={id}>
    {component.view && component.view(component.state)}
  </div>
}