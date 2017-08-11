import app from './app';

const cache = {}

export default function (componentClass, id) {
  if (!cache[id]) cache[id] = new componentClass().mount(id);
  return <div id={id}>
    {cache[id].render()}
  </div>
}