import app, { Component } from '../../src/apprun'

app.on('$', (key, props, component) => {
  if (key === '$animation') {
    const value = props[key];
    if (typeof value === 'string') {
      props.class = `animated ${value}`;
    }
  }
});

export class MyComponent extends Component {
  state = {
    animation: true
  }

  view = state => <>
    <img $animation={state.animation && 'bounce infinite'} src='logo.png' />
    <div $animation='bounceInRight'>
      <button $onclick='start-animation'>start</button>
      <button $onclick='stop-animation'>stop</button>
    </div>
  </>

  update = {
    '#animation': state => state,
    'start-animation': state => ({ ...state, animation: true }),
    'stop-animation': state => ({...state, animation: false})
  }
}

export default (element) => new MyComponent().mount(element);