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
export class HelloComponent extends Component {
  model = 'world';
  view = state => <div>
    <h1>Hello: {state}</h1>
    <input oninput={e => this.run('input', e)} />
  </div>

  @on('#hello')
  hello = state => state

  @on('input')
  oninput = (_, e) => e.target.value
}

export class HelloStateComponent extends Component {
  model = 'world';
  view = state => <div>
    <div>Test push state</div>
    <h1>Hello: {state}</h1>
    <input oninput={e=>this.run('input', e)}/>
  </div>

  @on('#hello-pushstate')
  hello = (state, pushState) => pushState || state

  @on('input')
  oninput = (_, e) => {
    history.pushState(null, null, '#hello-pushstate/' + e.target.value);
    return e.target.value
  }
}

export class HelloDelayComponent extends Component {
  model = 'world';
  view = state => <div>
    <div>Test delayed event (1s)</div>
    <h1>Hello: {state}</h1>
    <input oninput={e => this.run('input', e)} />
  </div>

  @on('#hello-delayed')
  hello = state => state

  update = {
    'input': [(_, e) => e.target.value, { delay: 1000, debug: true }],
  }
}

export class HelloDirectiveComponent extends Component {
  model = 'world';
  view = state => {
    app.createElement = createElement(this);
    const ret = <div>
      <div>Test directive</div>
      <h1>Hello: {state}</h1>
      <table>
        <tr>
          <td>Default event:</td>
          <td>&lt;input oninput /&gt;</td>
          <td><input value={state} oninput /></td>
        </tr>
        <tr>
          <td>Named event:</td>
          <td>&lt;input oninput='oninput' /&gt;</td>
          <td><input value={state} oninput='oninput' /></td>
        </tr>
        <tr>
          <td>Set target:</td>
          <td>&lt;input oninput={'{this}'} /&gt;</td>
          <td><input value={state} oninput={this} /></td>
        </tr>
        <tr>
          <td>Set target and name:</td>
          <td>&lt;input oninput={'{[this, "oninput"]}'} /&gt;</td>
          <td><input value={state} oninput={[this, 'oninput']} /></td>
        </tr>
      </table>
    </div>
    app.createElement = h;
    return ret;
  }

  @on('#hello-directive')
  hello = state => state

  @on('oninput')
  oninput = (_, e) => e.target.value // will be converted to update functions
}

export default (element) => {
  new HelloComponent().mount(element);
  new HelloStateComponent().mount(element);
  new HelloDelayComponent().mount(element);
  new HelloDirectiveComponent().mount(element);
}