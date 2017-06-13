import app, { Component } from '../component';
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

  it('should handle local events', ()=> {
    component.mount(document.body);
    spyOn(component, 'view');
    component.app.run('hi');
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

})

