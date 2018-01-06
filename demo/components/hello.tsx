import app, { Component, on } from '../../src/apprun'

let h = app.createElement;
const createElement = (component) => (tag, props, ...children) => {
  if (props) Object.keys(props).forEach(key => {
    if (key.startsWith('on') && typeof event !== 'function') {
      const event = props[key];
      if (typeof event === 'boolean') {
        props[key] = e => component.run(key, e);
      } else if (typeof event === 'string') {
        props[key] = e => component.run(event, e)
      } else if (event instanceof Component) {
        props[key] = e => event.run(key, e)
      } else if (Array.isArray(event)) {
        props[key] = e => event[0].run(event[1] || key, e)
      }
    }
  });
  return h(tag, props, ...children)
}

const Hello = ({ name }) => <div>Hello: {name}</div>;

class HelloComponent extends Component {
  model = 'world'; // model can be used as initial state

  view = (val) => {
    app.createElement = createElement(this);
    const ret = <div>
      <Hello name={val} />
      Delayed event: <input value={val} oninput={e=>this.run('input', e)} /><br />
      Default event: <input value={val} oninput /><br />
      Named event: <input value={val} oninput='oninput' /><br />
      Set target: <input value={val} oninput={this} /><br />
      Set target and name: <input value={val} oninput={[this, 'oninput']} />
    </div>
    app.createElement = h;
    return ret;
  };

  update = {
    '#hello': (model, pushState) => pushState || model,
    'input': [(_, e) => e.target.value, {delay: 1000, debug: true}],
    //'oninput': (_, e) => e.target.value
  }

  @on('oninput')
  oninput = (_, e) => e.target.value // will be converted to update functions
}

export default (element) => new HelloComponent().mount(element);