import { app, Component } from '../../src/apprun';

class A extends Component {
  view = () => <div>A</div>
}

class B extends Component {
  state = 0

  mounted = (props) => props;

  view = ({ n }) => <div>{n}</div>
}

class Main extends Component {
  state = false;
  view = state => <>
    <B n="1" />
    {state ? <A />: <div>aa</div>}
    <B n="2" />
    <B n="3" />
    <button $onclick='a'>a</button>
  </>

  update = {
    a: state => !state
  }
}

export default (element) => new Main().start(element, {route: '#test'});