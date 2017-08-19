import app from './app';

const cache = {}

export default function (componentClass, id, props) {
  const component = cache[id] ? cache[id] :
    (cache[id] = new componentClass(props).mount(id))
  return <div id={id}>
    {component.render() && component.render()}
  </div>
}