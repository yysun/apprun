import app from '../../apprun-jsx/index';

var model = 'hello world';

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