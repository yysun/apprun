
import app, { Component, customElement } from '../src/apprun';

@customElement("my-app")
class MyApp extends Component {
  // state = 0/

  view = (state) => {
    return <div><h1>{state}</h1></div>
  }

  update = {
    '-1': (state) => state - 1,
    '+1': (state) => state + 1
  }

  children;
  rendered = state => {
    this.children.forEach(el => {
      this.element.firstElementChild.appendChild(el)
    });
    this.element.setAttribute('num', state);
  }

  constructor({ num, children } ) {
    super();
    this.children = children;
    this.state = parseInt(num);
  }
}
