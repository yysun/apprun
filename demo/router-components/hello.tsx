import {Component} from '../../index';

const Hello = ({ name }) => <div>Hello: {name}</div>;

class HelloComponent extends Component {
  state = 'world';

  view = (val) => {
    return <div>
      <Hello name={val} />
      <input value={val} oninput={function () { app.run('render', this.value) }} />
    </div>
  };

  update = {
    '#hello': (model, pushState) => pushState || model,
    'render': (_, val) => {
      history.pushState(null, null, '#hello/' + val);
      return val;
    }
  }
}

export default (element) => app = new HelloComponent().mount(element);