import app from '../src/app';
import { Component } from '../src/component';

app.on('hi', _ => { })

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
    }
  }
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

  it('should not trigger when update returns null or undefined with async', () => {
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


  it('should track history', () => {
    spyOn(component, 'view');
    component.start(document.body, { history: true });
    expect(component.view).toHaveBeenCalledWith('x');
    component.run('hi', 'xx');
    expect(component.view).toHaveBeenCalledWith('xx');
    component.run('hi', 'xxx');
    expect(component.view).toHaveBeenCalledWith('xxx');
    component.run('history-prev');
    expect(component.view).toHaveBeenCalledWith('xx');
    component.run('history-next');
    expect(component.view).toHaveBeenCalledWith('xxx');
  });

  it('should track history with custom event name', () => {
    // spyOn(component, 'view');
    component.start(document.body, { history: { prev: 'prev', next: 'next' } });
    // expect(component.view).toHaveBeenCalledWith('x');
    // component.run('hi', 'xx');
    // expect(component.view).toHaveBeenCalledWith('xx');
    // component.run('hi', 'xxx');
    // expect(component.view).toHaveBeenCalledWith('xxx');
    // component.run('prev');
    // expect(component.view).toHaveBeenCalledWith('xx');
    // component.run('next');
    // expect(component.view).toHaveBeenCalledWith('xxx');


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
    expect(component.view).toHaveBeenCalledWith('x');
    app.run('hi', 'xx');
    expect(component.view).toHaveBeenCalledWith('xx');
    app.run('hi', 'xxx');
    expect(component.view).toHaveBeenCalledWith('xxx');
    app.run('prev');
    expect(component.view).toHaveBeenCalledWith('xx');
    app.run('next');
    expect(component.view).toHaveBeenCalledWith('xxx');
  });

  it('should call rendered function', () => {
    const spy = jasmine.createSpy('spy');
    component.rendered = state => spy(state);
    component.start(document.body, { event: true });
    expect(spy).toHaveBeenCalledWith('x');
    component.run('hi', 'abc');
    expect(spy).toHaveBeenCalledWith('abc');
  });


  // xit('should trigger state changed event with default event name', () => {
  //   const spy = jasmine.createSpy('spy');
  //   component.on('state_changed', state => { spy(state); });
  //   component.start(document.body, { event: true });
  //   expect(spy).toHaveBeenCalledWith('x');
  //   component.run('hi', 'abc');
  //   expect(spy).toHaveBeenCalledWith('abc');
  // });

  // xit('should not trigger state changed event when mount', () => {
  //   const spy = jasmine.createSpy('spy');
  //   component.mount(document.body, { event: true })
  //     .on('state_changed', state => { spy(state); });
  //   expect(spy).not.toHaveBeenCalledWith('x');
  //   component.run('hi', 'abc');
  //   expect(spy).toHaveBeenCalledWith('abc');
  // });


  // xit('should trigger state changed global event with default event name', () => {
  //   const spy = jasmine.createSpy('spy');
  //   app.on('#state_changed', state => { spy(state); });
  //   component.start(document.body, { event: { name: '#state_changed' } });
  //   expect(spy).toHaveBeenCalledWith('x');
  //   component.run('hi', 'abc');
  //   expect(spy).toHaveBeenCalledWith('abc');
  // });


  // xit('should trigger state changed event with custom event name', () => {
  //   const spy = jasmine.createSpy('spy');
  //   component.on('changed', state => { spy(state); });
  //   component.start(document.body, { event: { name: 'changed' } });
  //   expect(spy).toHaveBeenCalledWith('x');
  //   component.run('hi', 'ab');
  //   expect(spy).toHaveBeenCalledWith('ab');
  // });

  // xit('should convert methods to local events', () => {
  //   let i = 0;
  //   class Test extends Component {
  //     state = -1;
  //   }
  //   const t = new Test().mount(document.body, { event: true });
  //     t.on('state_changed', state => i = 1);
  //   t.start()
  //   expect(i).toBe(1)
  // });


  it('should handle async update', (done) => {
    const fn = async () => new Promise((resolve, reject) => {
      window.setTimeout(() => {
        resolve('xx');
      }, 100);
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
    }, 200);
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
    t.run('method1');
    t.run('method1');

    expect(i).toEqual(1);
  });

  it('should support async tuple in update', (done) => {
    let i = 0;
    const fn = async () => new Promise<string>((resolve) => {
      window.setTimeout(() => {
        resolve('xx');
      }, 100);
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
    t.run('method1');
    t.run('method1');

    window.setTimeout(() => {
      expect(i).toBe(1);
      done();
    }, 500)
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

});


