import app, { Component, customElement } from '../../src/apprun';

@customElement("my-counter")
class MyApp extends Component {

  view = ({ num, children }) => <div>
    <h1>{num}</h1>
    {children}
  </div>

  update = {
    '-1': state => ({...state, num: state.num - 1}),
    '+1': state => ({...state, num: state.num + 1})
  }

  mounted = ({ num }, children) => ({ num: parseInt(num), children });

  rendered = ({ num }) => {
    this.element.setAttribute('num', num);
  }
}
