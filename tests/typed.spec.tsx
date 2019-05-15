import app, { View, Action, Update, Component, StatelessComponent, on, update, event } from '../src/apprun';

const element = document.createElement('div');
const state = { msg: 'Hello' };
type State = typeof state;
type Events = '#' | '#1' | '#2' | '#3' | '#4' | '#5';

describe('app', () => {
  it('should support global application - typed state', () => {
    const view: View<State> = (state) => <div>
      <h1>{state.msg}</h1>
    </div>;
    const update: Update<State> = {
      '#': (state) => state,
    }
    app.start<State>(element, state, view, update);
    expect(element.textContent).toBe('Hello');
  })

  it('should support global application - typed state and events', () => {
    const view: View<State> = (state) => <div>
      <h1>{state.msg}</h1>
    </div>;
    const update: Update<State, Events> = [
      ['#', state => state],
      ['#1', state => state]
    ]
    app.start<State, Events>(element, state, view, update);
    expect(element.textContent).toBe('Hello');
  })

  it('should support component - typed state', () => {
    class MyComponent extends Component<State> {
      state = { msg: 'World' };
      view: View<State> = state => <h1>{state.msg}</h1>;
      update = {
        '#1': state => state,
        '#2': (state: State) => state,
        '#3': async (state: State) => state
      }
      @on('#4')
      route: Action<State> = (state) => state
      @update('#5')
      route1(state) {
        return state;
      }
    }
    new MyComponent().start(element);
    expect(element.textContent).toBe('World');
  })

  it('should support component - typed state and events', () => {
    class MyComponent extends Component<State, Events> {
      state = { msg: 'World' };
      view: View<State> = state => <h1>{state.msg}</h1>;
      update: Update<State, Events> = [
        ['#1', state => state],
        ['#2', (state: State) => state],
        ['#3', async (state: State) => state]
      ]
      @on<Events>('#4')
      route: Action<State> = (state) => state
      @update<Events>('#5')
      route1(state) {
        return state;
      }
      @event<Events>('#')
      route2(state) {
        return state;
      }
    }
    new MyComponent().start(element);
    expect(element.textContent).toBe('World');
  })

  it('should support typed stateless component', () => {
    const a = { msg: 'Hello' };
    const List1: StatelessComponent<typeof a> = (a) => <div>{a.msg}</div>;
    const List2: StatelessComponent<typeof a> = (a) => '';
    const List3: StatelessComponent<typeof a> = (a) => { };

    expect(List1(a)).toEqual({ tag: 'div', props: null, children: ['Hello'] });
    expect(List2(a)).toBe('');
    expect(List3(a)).toBe(undefined);
  })

})
