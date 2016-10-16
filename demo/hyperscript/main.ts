import app from '../../apprun-jsx/index';
import hh = require('virtual-dom/h');

const h = app.h;

const model = 'hello world';

const view = (val) => {
  return h('div', {},
    h('div', {}, val),
    h('input', {
      value: val,
      oninput: function() { app.run('render', this.value)}
    }, null)
  );
};

const update = {
  'render': (_, val) => val,
};

const element = document.getElementById('my-app');
const component = app.start(element, model, view, update);


