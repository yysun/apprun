import app from './app';

const cache = {}

export default function (componentClass, id) {
  const component = cache[id] ? cache[id] : (cache[id] = new componentClass())
  component.mount && component.mount(id);
  return <div id={id}>
    {component.render() && component.render()}
  </div>
}