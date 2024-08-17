import app, { Component } from '../../src/apprun'

app.on('$', ({ key, props }) => {
  if (key === '$animation') {
    const value = props[key];
    if (typeof value === 'string') {
      props.class = `animated ${value}`;
    }
  }
});

export class AniComponent extends Component {
  state = {
    animation: true
  }

  view = state => <>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.min.css"></link>
    <img $animation={state.animation && 'bounce infinite'} src='logo.png' />
    <div $animation='bounceInRight'>
      <button disabled={state.animation} $onclick='start-animation'>start</button>
      <button disabled={!state.animation} $onclick='stop-animation'>stop</button>
    </div>
  </>

  update = {
    '#animation': state => state,
    'start-animation': state => ({ ...state, animation: true }),
    'stop-animation': state => ({...state, animation: false})
  }
}

export default (element) => new AniComponent().mount(element);