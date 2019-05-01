import app, { Component, on } from '../../src/apprun'

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
    return <div>
      <div>Test directive</div>
      <h1>Hello: {state}</h1>
      <table>
        <tr>
          <td>Default event:</td>
          <td>&lt;input $oninput /&gt;</td>
          <td><input value={state} $oninput /></td>
        </tr>
        <tr>
          <td>Named event:</td>
          <td>&lt;input $oninput='ev1' /&gt;</td>
          <td><input value={state} $oninput='ev1' /></td>
        </tr>
        <tr>
          <td>Bind:</td>
          <td>&lt;input $bind /&gt;</td>
          <td><input value={state} $bind /></td>
        </tr>
      </table>
    </div>
  }

  @on('#hello-directive')
  hello = state => state

  @on('oninput, ev1')
  oninput = (_, e) => e.target.value // will be converted to update functions
}

export default (element) => {
  new HelloComponent().mount(element);
  new HelloStateComponent().mount(element);
  new HelloDelayComponent().mount(element);
  new HelloDirectiveComponent().mount(element);
}