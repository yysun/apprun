import app, { Component } from '../../index'

const Hello = ({ name }) => <div>Hello: {name}</div>;

class HelloComponent extends Component {
  state = 'world';

  view = (val) => {
    return <div>
      <Hello name={val} />
      <input value={val} oninput={ (e)=> this.run('input', e)} />
    </div>
  };

  update = {
    '#hello': (model, pushState) => pushState || model,
    'input': [(_, e) => e.target.value, {delay: 1000, debug: true}]
  }
}

export default (element) => new HelloComponent().mount(element);