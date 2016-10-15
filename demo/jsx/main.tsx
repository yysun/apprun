/** @jsx h */
import h = require('virtual-dom/h');
const hyper = {createElement: (el, props, ...children) => h(el,props, children)};

import app from '../../index';

var model = 'hello world';

// const view = (model) => {
//   return <div>
//     <div>{model}</div>
//     <input value={model} oninput = {app.run('render', this.value)}/>
//   </div>
// };

const view = (val) => {
  return <div>
    <div>{val}</div>
    <input value={val} oninput={function() { app.run('render', this.value)}}/>
  </div>
};

var update = {
  'render': (_, val) => val
}

const element = document.getElementById('my-app');
app.start(element, model, view, update);