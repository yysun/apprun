import app, { Component } from '../src/apprun';

app.on('hi', _ => { })
app.on('debug', _ => { });

class TestComponent extends Component {

  state = 'x';
  view = (state) => state

  update = {
    'hi': (state, value) => value,
    '#hi': (state, value) => value,
    'hiNull': (state, value) => null,
    'hiAsync': async (state, value) => {
      return new Promise(resolve => {
        resolve(value);
      })
    },
    'hiAsyncNull': async (state, value) => {
    },
    'hi-global': [(state, value) => value, { global: true}]
  }
  rendered = () => { }
}

describe('Component', () => {

  let component;
  beforeEach(() => {
    component = new TestComponent();
  });

  it('should allow element to be undefined', () => {
    spyOn(component, 'view');
    expect(component.element).toBeUndefined()
    expect(component.view).not.toHaveBeenCalled();
  })

  it('should trigger view when mounted with render option', () => {
    spyOn(component, 'view');
    component.mount(document.body, { render: true });
    expect(component.element).toBe(document.body);
    expect(component.view).toHaveBeenCalled();
  })

  it('should not trigger view when mounted', () => {
    spyOn(component, 'view');
    component.mount(document.body);
    expect(component.element).toBe(document.body);
    expect(component.view).not.toHaveBeenCalled();
  })

  it('should trigger view when started', () => {
    spyOn(component, 'view');
    component.start(document.body);
    expect(component.element).toBe(document.body);
    expect(component.view).toHaveBeenCalled();
  })

  it('should not trigger when update returns null or undefined', () => {
    component.mount(document.body);
    spyOn(component, 'view');
    component.run('hi', null);
    expect(component.view).not.toHaveBeenCalled();
    component.run('hiNull');
    expect(component.view).not.toHaveBeenCalled();
  })

  it('should not trigger view when update returns null or undefined with async', () => {
    component.mount(document.body);
    spyOn(component, 'view');
    component.run('hiAsync', null);
    expect(component.view).not.toHaveBeenCalledWith(); //Promise
    expect(component.state).not.toBeNull();
    component.run('hiAsyncNull');
    expect(component.view).not.toHaveBeenCalledWith(); //Promise
    expect(component.state).not.toBeNull();
  })

  it('should handle local events', () => {
    component.mount(document.body);
    spyOn(component, 'view');
    component.run('hi', '');
    expect(component.view).toHaveBeenCalled();
  })

  it('should not handle unknown global events', () => {
    component.mount(document.body);
    spyOn(component, 'view');
    app.run('hi');
    expect(component.view).not.toHaveBeenCalled();
  })

  it('should handle global events', () => {
    component.mount(document.body);
    spyOn(component, 'view');
    app.run('#hi', '');
    expect(component.view).toHaveBeenCalled();
  })

  it('should handle individual global event', () => {
    component.mount(document.body);
    spyOn(component, 'view');
    app.run('hi-global', '');
    expect(component.view).toHaveBeenCalled();
  })

  it('should track history', () => {
    component.start(document.body, { history: true });
    expect(component.state).toBe('x');
    component.run('hi', 'xx');
    expect(component.state).toBe('xx');
    component.run('hi', 'xxx');
    expect(component.state).toBe('xxx');
    component.run('history-prev');
    expect(component.state).toBe('xx');
    component.run('history-next');
    expect(component.state).toBe('xxx');
  });

  it('should track history with custom event name', () => {
    component.start(document.body, { history: { prev: 'prev', next: 'next' } });
    expect(component.state).toBe('x');
    component.run('hi', 'xx');
    expect(component.state).toBe('xx');
    component.run('hi', 'xxx');
    expect(component.state).toBe('xxx');
    component.run('prev');
    expect(component.state).toBe('xx');
    component.run('next');
    expect(component.state).toBe('xxx');
  });

  it('should track history with global custom event name', () => {
    spyOn(component, 'view');
    component.mount(document.body, { render: true, history: { prev: 'prev', next: 'next' }, global_event: true });
    expect(component.state).toBe('x');
    app.run('hi', 'xx');
    expect(component.state).toBe('xx');
    app.run('hi', 'xxx');
    expect(component.state).toBe('xxx');
    app.run('prev');
    expect(component.state).toBe('xx');
    app.run('next');
    expect(component.state).toBe('xxx');

  });

  it('should call rendered function', () => {
    const spy = jasmine.createSpy('spy');
    component.rendered = state => spy(state);
    component.start(document.body);
    expect(spy).toHaveBeenCalledWith('x');
    component.run('hi', 'abc');
    expect(spy).toHaveBeenCalledWith('abc');
  });

  it('should handle async update', (done) => {
    const fn = async () => new Promise((resolve, reject) => {
      window.setTimeout(() => {
        resolve('xx');
      }, 10);
    });
    const spy = jasmine.createSpy('spy');
    class Test extends Component {
      state = -1;
      view = state => spy(state);
      update = {
        method1: async (...args) => {
          const v = await fn();
          return v;
        }
      }
    }
    const t = new Test().start();
    t.run('method1')
    window.setTimeout(() => {
      const callArgs = spy.calls.allArgs();
      expect(callArgs[0][0]).toBe(-1);
      expect(callArgs[1][0]).toBe('xx');
      done()
    }, 20);
  });

  it('should support tuple in update', () => {
    let i = 0;
    class Test extends Component {
      state = -1;

      update = {
        'method1': [_ => i++, { once: true }],
      }
    }

    const t = new Test().start();
    t.run('method1');
    // t.run('method1');
    // t.run('method1');

    expect(i).toEqual(1);
  });

  it('should support async tuple in update', (done) => {
    let i = 0;
    const fn = async () => new Promise<string>((resolve) => {
      window.setTimeout(() => {
        resolve('xx');
      }, 10);
    });

    class Test extends Component {
      state = -1;

      update = {
        'method1': [async _ => {
          const t = await fn();
          i++
        },
        { once: true }],
      }
    }

    const t = new Test().start();
    t.run('method1');
    // t.run('method1');
    // t.run('method1');

    window.setTimeout(() => {
      expect(i).toBe(1);
      done();
    }, 20)
  });

  it('should support update alias', () => {
    let i = 0;
    class Test extends Component {
      state = -1;
      update = {
        'method1, m1, m2, #m3': [_ => ++i, {}]
      }
    }
    const t = new Test().start();
    t.run('method1');
    t.run('m1');
    t.run('m2');
    app.run('#m3');

    expect(i).toBe(4);
  });

  it('should support call back', () => {
    let i = 0;
    class Test extends Component {
      state = -1;
      update = {
        'method1': [_ => ++i, { callback: _ => ++i }]
      }
    }
    const t = new Test().start();
    t.run('method1');
    expect(i).toBe(2);
  });

  it('should support options', () => {
    class Test extends Component {
      view = (state) => state
      update = {
        'method1': [(state, val) => val, { render: false }]
      }
    }
    const t = new Test();
    t.start(document.body);
    spyOn(t, 'view');
    t.run('method1', 'x');
    expect(t.view).not.toHaveBeenCalled();
  })

  it('should support call back, alias and options', () => {
    let i = 0;
    class Test extends Component {
      state = -1;
      update = {
        'method1, m1, m2, #m3': [_ => ++i, { callback: _ => ++i }]
      }
    }
    const t = new Test().start();
    t.run('method1');
    t.run('m1');
    t.run('m2');
    app.run('#m3');

    expect(i).toBe(8);
  });

  it('should save/attach component to element', () => {
    component.start(document.body);
    expect(document.body['_component']).toBe(component);
  })


  it('should clean up the element children', () => {
    class Test extends Component {
      view = () => <img src="a"/>
    }
    const div = document.createElement('div');
    const img1 = document.createElement('img');
    const img2 = document.createElement('img');
    div.appendChild(img1);
    div.appendChild(img2);
    const t = new Test().start(div);
    expect(div.children.length).toBe(1);
  });

  // it('should call destroy when component is replaced', () => {
  //// Jest does not support MutationObserver, run the following in browser console in V2 branch (ES6)
    // class Test extends Component {
    //   view = () => { }
    //   unload = () => console.log('destroy');
    // }
    // const div = document.createElement('div');
    // const t = new Test().start(div);
    // div.setAttribute('_c', null);

    // const e = document.querySelector('#my-app');
    // e.parentNode.removeChild(e)
  // });

  it('should add the . event by default', () => {
    class Test extends Component {
      state = 'a'
      view = state => <div>{state}</div>
    }
    const div = document.createElement('div');
    const t = new Test().mount(div);
    t.run('.');
    expect(div.innerHTML).toBe('<div>a</div>');

  })


  it('should route in mount option', () => {
    class Test extends Component {
      state = 'ab'
      view = state => <div>{state}</div>
    }
    const div = document.createElement('div');
    const t = new Test().mount(div, {route: '#test'});
    app.run('#test');
    expect(div.innerHTML).toBe('<div>ab</div>');

  })

  it('should allow initial state as a function', () => {
    class Test extends Component {
      state = () => 'abc'
      view = state => <div>{state}</div>
    }
    const div = document.createElement('div');
    const t = new Test().start(div);
    expect(div.innerHTML).toBe('<div>abc</div>');
  })

  it('should allow initial state as an async function', (done) => {
    class Test extends Component {
      state = async () => new Promise(resolve => setTimeout(() => resolve(100)));
      view = state => <div>{state}</div>
    }
    const div = document.createElement('div');
    const t = new Test().start(div);
    setTimeout(() => {
      expect(div.innerHTML).toBe('<div>100</div>');
      done();
    });
  })

  it('should wait existing promise state to be resolve in sequence', (done) => {
    class Test extends Component {
      state = async () => new Promise(resolve => setTimeout(() => resolve('old'), 35));
      view = state => <div>{state}</div>
    }
    const div = document.createElement('div');
    const t = new Test().start(div);
    t.setState(new Promise(resolve => setTimeout(() => resolve('new'), 25)));
    setTimeout(() => {
      expect(div.innerHTML).toBe('');
      done();
    }, 20);

    setTimeout(() => {
      expect(div.innerHTML).toBe('<div>new</div>');
      done();
    }, 30);

    setTimeout(() => {
      expect(div.innerHTML).toBe('<div>old</div>');
      done();
    }, 40);

  })

  it('should allow initial state as an async function - not render when mount', (done) => {
    class Test extends Component {
      state = async () => new Promise(resolve => setTimeout(() => resolve(100)));
      view = state => <div>{state}</div>
    }
    const div = document.createElement('div');
    const t = new Test().mount(div);
    setTimeout(() => {
      expect(div.innerHTML).toBe('');
      done();
    });
  })

  it('should allow initial state as an async function - wait', (done) => {
    class Test extends Component {
      state = async () => new Promise(resolve => setTimeout(() => resolve(100), 100));
      view = state => <div>{state}</div>
      update = {
        '.': state => {
          expect(state).toBe(100);
          done();
        }
      }
    }

    const div = document.createElement('div');
    const t = new Test().mount(div);
    // Promise.resolve(t['state']).then(state => {
    //   t['state'] = state;
    //   t.run('.')
    // });
    t.run('.'); 
  })

});


