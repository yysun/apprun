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
      mounted = (props) => {
        expect(props.n).toBe(0);
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
      mounted = (props) => {
        if (props.n === 1) done();
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

  it('should allow async event inside the mounted function', (done) => {
    class Child3 extends Component {
      view = (state) => {
        return <div>{state.n}</div>
      }
      mounted = (n) => {
        if (n !== this.state) this.run('init-async', n);
      }
      update = {
        'init-async': async (state, value) =>
          new Promise(resolve =>
            setTimeout(() =>
              resolve(value))
          )
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
    document.body.appendChild(element);
    app.render(element, <Main />);
    setTimeout(() => {
      expect(element.textContent).toEqual('a');
      done();
    },10)
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

  it('should share same instance when refresh', (done) => {
    class Child extends Component {
      state = { n: 0 }
      view = (state) => {
        return <div>{state.n}</div>
      }
      mounted = ({ n }) => {
        // on second refresh, the state should retain
        if (n === 2 && this.state.n === 1) done();
        this.state.n = n;
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
    const element = document.createElement('div');
    const component = new Main().start(element);

    component.run('+1'); // triger a refresh
    component.run('+1'); // triger a refresh
  });

  it('should not share the same instance', () => {
    class Child extends Component {
      state = { n: 0 }
      view = (state) => {
        return <div>{state.n}</div>
      }
      constructor({n}) {
        super();
        this.state.n = n;
      }
      // mounted = ({ n }) => { this.setState({n}) }
    }
    class Main extends Component {
      state = 0
      view = (state) => {
        return <div>
          <Child n="1" />
          <div>
            <Child n="2"/>
          </div>
          <Child n="3"/>
        </div>
      }
      update = {
        '+1': state => state + 1
      }
    }
    const element = document.createElement('div');
    app.render(element, <Main />);
    expect(element.textContent).toBe("123");
  });

});