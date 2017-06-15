import app from '../../index';
declare var hyperHTML;

const element = document.getElementById('my-app');
const render = hyperHTML.bind(element);
const model = 'hello world';
const view = (val) => render`<div><div>${val}</div>
              <input value="${val}" oninput="app.run(\'render\', this.value)"/></div>`;
window.addEventListener('hashchange', (e) => {
  app.run('route', location.hash);
});
var update = {
  'route': function (_, hash) {
    return hash.replace('#', '');
  },
  'render': function (_, val) {
    location.hash = '#' + val;
    return val;
  }
}
app.start(element, model, view, update);