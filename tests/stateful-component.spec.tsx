import app, { Component } from '../src/apprun';

describe('Stateful Component', () => {

  it('should pass props to the constructor', () => {
    class Child extends Component {
      view = (state) => {
        return <div>{state}</div>
      }
      constructor({ n }) {
        super();
        expect(n).toBe('7');
      }
    }
    class Main extends Component {
      view = (state) => {
        return <div>
          <Child n='7' />
        </div>
      }
    }
    new Main().start();
  });

  it('should set props as state', () => {
    class Child extends Component {
      view = (state) => {
        expect(state.n).toBe('8');
        return <div>{state.n}</div>
      }
    }
    class Main extends Component {
      view = (state) => {
        return <div>
          <Child n='8'/>
        </div>
      }
    }
    new Main().start();
  });

  it('should render children', () => {
    class Child extends Component {
      view = (state) => <div>
        {state.children}
      </div>
    }
    class Main extends Component {
      view = (state) => {
        return <div>
          <Child>
            <p>child</p>
          </Child>
        </div>
      }
    }
    const element = document.createElement('div');
    app.render(element, <Main />);
    expect(element.textContent).toBe('child');
  });

  it('should call mounted function when created', (done) => {
    class Child extends Component {
      view = (state) => {
        return <div>{state.n}</div>
      }
      mounted = (state) => {
        expect(state.n).toBe(0);
        done()
      }
    }
    class Main extends Component {
      state = 0
      view = (state) => {
        return <div>
          <Child n={0}/>
        </div>
      }
    }
    new Main().start();
  });

  it('should call rendered function when created', (done) => {
    class Child extends Component {
      view = (state) => {
        return <div>{state.n}</div>
      }
      rendered = (state) => {
        expect(state.n).toBe(0);
        done()
      }
    }
    class Main extends Component {
      state = 0
      view = (state) => {
        return <div>
          <Child n={0} />
        </div>
      }
    }
    const element = document.createElement('div');
    app.render(element, <Main />);
  });

  it('should call mounted function when refreshed', (done) => {
    class Child extends Component {
      view = (state) => {
        return <div>{state.n}</div>
      }
      mounted = (state) => {
        if (state.n === 1) done();
      }
    }
    class Main extends Component {
      state = 0
      view = (state) => {
        return <div>
          <Child n={state}/>
        </div>
      }
      update = {
        '+1': state => state + 1
      }
    }
    const component = new Main().start();
    component.run('+1');
  });

  it('should allow async event inside the mounted function', () => {
    class Child3 extends Component {
      view = (state) => {
        return <div>{state.n}</div>
      }
      mounted = (n) => {
        if (n !== this.state) this.run('init-async', n);
      }
      update = {
        'init-async': async (state, value) => {
          return new Promise(resolve => {
            resolve(value);
          })
        }
      }
    }

    class Main extends Component {
      view = (state) => {
        return <div>
          <Child3 n='a' />
        </div>
      }
    }

    const element = document.createElement('div');
    app.render(element, <Main/>);
    expect(element.textContent).toEqual('a');
  });

  it('should off all events after unmount', () => {
    class Ch extends Component {
      update = {
        '#1': state=> state,
        '#2': state => state,
        '1': state=> state,
        '2': state=> state,
      }
    }
    
    const component = new Ch().mount();
    expect(app['_events']['#1'].length).toBe(1);
    expect(app['_events']['#2'].length).toBe(1);
    expect(component['_app']['_events']['1'].length).toBe(1);
    expect(component['_app']['_events']['2'].length).toBe(1);
    component.unmount();
    expect(app['_events']['#1']).toBeUndefined();
    expect(app['_events']['#2']).toBeUndefined();
    expect(component['_app']['_events']['1']).toBeUndefined();
    expect(component['_app']['_events']['2']).toBeUndefined();

  });
});