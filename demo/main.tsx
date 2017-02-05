import app from '../index';

var model = 'world';

const Hello = ({name}) => <div>Hello: {name}</div>;

const view = (val) => {
  return <div>
    <Hello name={val}/>
    <input value={val} oninput={function() { app.run('render', this.value)}}/>
  </div>
};

var update = {
  'render': (_, val) => val
}

const element = document.getElementById('my-app');
app.start(element, model, view, update);