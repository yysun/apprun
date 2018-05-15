import app from './app';

const cache = {}

export default function (componentClass, state) {
  let id = state && state['id'];
  let key = state && (state['key'] || state['id']);
  if (!id) id = `_${componentClass.name}_${Date.now()}`;

  const component = key && cache[key] ? cache[key] :
  (cache[key] = new componentClass(state).mount(id));
  if (component.mounted) setTimeout(()=>component.mounted(state), 0);

  return <div id={id} _component={component}>
    {component.view && component.view(component.state)}
  </div>
}