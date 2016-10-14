/** @jsx h */
import h = require('virtual-dom/h');
const hyper = {createElement: h}

import app from '../../index';

const element = document.getElementById('my-app');
var model = 'hello world';

const view = (model) => {
  return <div>
    <div>{model}</div>
    <input value={model} oninput="app.run('render', this.value)"/>
  </div>
};

window.addEventListener('hashchange', (e) => {
  app.run('route', location.hash);
});
var update = {
  'route': function(_, hash) {
    return hash.replace('#', '');
  },
  'render': function (_, val) {
    location.hash = '#' + val;
    return val;
  }
}
app.start(element, model, view, update);