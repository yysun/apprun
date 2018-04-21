
import app, { Component } from '../src/apprun';
import { toCustomElement } from '../src/web-component';

export default class MyComponent extends Component {
  state = 'hello'

  view = (state) => {
    return <div>
      {state}
    </div>
  }

  update = {
    // '#': (state) => state
  }
}

toCustomElement('my-app', MyComponent);