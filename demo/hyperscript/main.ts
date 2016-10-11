import app from '../../index';
import h = require('virtual-dom/h');

const model = 0;

const view = (model) => {
  return h('div', {
    style: {
      textAlign: 'center',
      lineHeight: (100 + model) + 'px',
      border: '1px solid red',
      width: (100 + model) + 'px',
      height: (100 + model) + 'px'
    }
  }, [String(model)]);
};

const update = {
  'render': (model) => model + 1,
};

const element = document.getElementById('my-app');
const component = app.start(element, model, view, update);

setInterval(()=>app.run('render'), 1000);

