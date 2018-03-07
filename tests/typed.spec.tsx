import app, { View, Action, Update, IComponent, Component, on } from '../src/apprun';


const element = document.createElement('div');

const state = { msg: 'Hello' };
type State = typeof state;

describe('app', () => {
  it('should support global typed application', () => {

    const view: View<State> = (state) => <div>
      <h1>{state.msg}</h1>
    </div>;

    const update: Update<State> = {
      '#': (state) => state,
    }

    app.start(element, state, view, update);
    expect(element.textContent).toBe('Hello');

  })

  it('should support typed component', () => {
    class MyComponent extends Component implements IComponent<State> {

      state = { msg: 'World' };

      view: View<State> = state => <h1>{state.msg}</h1>;

      update = {
        '#1': state => state,
        '#2': (state: State) => state,
        '#3': async (state: State) => state
      }

      @on('#4')
      route: Action<State> = (state) => state
    }

    new MyComponent().start(element);
    expect(element.textContent).toBe('World');

  })

})
