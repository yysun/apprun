import app from '../../src/apprun'

const model = 0;

const view = (model) => <div>
    <h1>{model}</h1>
    <button $onclick="DECREASE">-1</button>
    <button $onclick="INCREASE">+1</button>
  </div>;
;

const update = {
  '#counter': (model) => model,
  'INCREASE': (model) => model + 1,
  'DECREASE': (model) => model - 1
};

export default (element) => app.start(element, model, view, update, {render: false});


