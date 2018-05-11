import app from './app';

const cache = {}

export default function (componentClass, id, props) {
  const component = cache[id] ? cache[id] :
    (cache[id] = new componentClass(props).mount(id));
  if (component.mounted) component.mounted(props);
  return <div id={id}>
    {component.__render()}
  </div>
}