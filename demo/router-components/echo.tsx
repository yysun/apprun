import app from '../../index'

var model = 'world';

const Hello = ({name}) => <div>Hello: {name}</div>;

const view = (val) => {
  return <div>
    <Hello name={val}/>
    <input value={val} oninput={function() { app.run('render', this.value)}}/>
  </div>
};

const update = {
  '#echo': (model, pushState) => pushState || model,
  'render': (_, val) => {
    history.pushState(null, null, '#echo/' + val);
    return val;
  }
}

export default (element) => app.start(element, model, view, update);
