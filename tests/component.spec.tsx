import app from '../app';
import { Component } from '../component';
class TestComponent extends Component {

  state = 'x';
  view = (state) => state
  update = {
    'hi': (state, value) => value,
    '#hi': (state, value) => value
  }
}

describe('Component', ()=> {

  let component;
  beforeEach(() => {
    component = new TestComponent();

  });

  it('should allow element to be undefined', ()=> {
    spyOn(component, 'view');
    expect(component.element).toBeUndefined()
    expect(component.view).not.toHaveBeenCalled();
  })

  it('should trigger view when mounted', ()=> {
    spyOn(component, 'view');
    component.mount(document.body);
    expect(component.element).toBe(document.body);
    expect(component.view).toHaveBeenCalled();
  })

  it('should not trigger view when mounted hidden', () => {
    spyOn(component, 'view');
    component.mount(document.body, {hidden: true});
    expect(component.element).toBe(document.body);
    expect(component.view).not.toHaveBeenCalled();
  })


  it('should handle local events', ()=> {
    component.mount(document.body);
    spyOn(component, 'view');
    component.run('hi');
    expect(component.view).toHaveBeenCalled();
  })

  it('should not handle unknown global events', ()=> {
    component.mount(document.body);
    spyOn(component, 'view');
    app.run('hi');
    expect(component.view).not.toHaveBeenCalled();
  })

  it('should handle global events', ()=> {
    component.mount(document.body);
    spyOn(component, 'view');
    app.run('#hi');
    expect(component.view).toHaveBeenCalled();
  })


  it('should track history', () => {
    spyOn(component, 'view');
    component.mount(document.body, { history: true });
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
    spyOn(component, 'view');
    component.mount(document.body, { history: { prev: 'prev', next: 'next' } });
    expect(component.view).toHaveBeenCalledWith('x');
    component.run('hi', 'xx');
    expect(component.view).toHaveBeenCalledWith('xx');
    component.run('hi', 'xxx');
    expect(component.view).toHaveBeenCalledWith('xxx');
    component.run('prev');
    expect(component.view).toHaveBeenCalledWith('xx');
    component.run('next');
    expect(component.view).toHaveBeenCalledWith('xxx');
  });

  it('should trigger state changed event to global with default event name', () => {
    const spy = jasmine.createSpy('spy');
    app.on('state_changed', state => { spy(state); });
    component.mount(document.body, { event: true });
    expect(spy).toHaveBeenCalledWith('x');
    component.run('hi', 'abc');
    expect(spy).toHaveBeenCalledWith('abc');
  });

  it('should trigger state changed event to global with custom event name', () => {
    const spy = jasmine.createSpy('spy');
    app.on('changed', state => { spy(state); });
    component.mount(document.body, { event: { name: 'changed' } });
    expect(spy).toHaveBeenCalledWith('x');
    component.run('hi', 'ab');
    expect(spy).toHaveBeenCalledWith('ab');
  });

  it('should convert methods to local events', () => {
    const spy = jasmine.createSpy('spy');
    class Test extends Component {
      state = -1;
      method1 = (...args) => {
        spy(...args)
      }
    }
    const t = new Test().mount(document.body);
    spyOn(t, 'method1');
    t.run('method1', 0, 1, 2)
    expect(spy).toHaveBeenCalledWith(-1, 0, 1, 2);
  });

  it('should handle async update', (done) => {
    const fn = async () => new Promise((resolve, reject) => {
      window.setTimeout(() => {
        resolve('xx');
      }, 100);
    });
    const spy = jasmine.createSpy('spy');
    class Test extends Component {
      state = -1;
      method1 = async (...args) => {
        const v = await fn();
        return v;
      }
      view = state => spy(state);
    }
    const t = new Test().start();
    t.run('method1')
    window.setTimeout(() => {
      const callArgs = spy.calls.allArgs();
      expect(callArgs[0][0]).toBe(-1);
      expect(callArgs[1][0] instanceof Promise).toBeTruthy();
      expect(callArgs[2][0]).toBe('xx');
      done()
    }, 200);
  });

  it('should support tuple in update', () => {
    let i = 0;
    class Test extends Component {
      state = -1;

      update = {
        'method1': [ _ => i++, { once: true } ],
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
        'method1': [ async _ => {
          const t = await fn();
          i++
        }, 
        { once: true } ],
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
        'method1': [_ => ++i, {}, ['m1', 'm2', '#m3']]
      }
    }
    const t = new Test().start();
    t.run('method1');
    t.run('m1');
    t.run('m2');
    app.run('#m3');

    expect(i).toBe(4);
  });

});


