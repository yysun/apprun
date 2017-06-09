import { } from 'jasmine';
import app, { Component } from '../index-zero';
// import Component from '../component';

const model = 'x';
const view = _ => '';
const update = {
  hi: (_, val) => val
}

describe('Component', () => {

  it('should allow element to be null', () => {
    const component = new Component(null, model, view, update);
    expect(component).not.toBeUndefined();
  });

  it('should not trigger update and should have local event', () => {
    spyOn(update, 'hi');
    const component = new Component(null, model, view, update);
    app.run('hi', 'xx');
    expect(update.hi).not.toHaveBeenCalled();
    component.start('xxx');
    component.run('hi', 'xxxx');
    expect(update.hi).toHaveBeenCalledWith('xxx', 'xxxx');    
  });

  it('created by app.start should trigger update immediately', () => {
    spyOn(update, 'hi');
    app.start(null, model, view, update);
    app.run('hi', 'xx');
    expect(update.hi).toHaveBeenCalledWith('x', 'xx');
  });

  it('should not trigger view', () => {
    const view = jasmine.createSpy('view');
    const component = new Component(document.body, model, view, update);
    expect(view).not.toHaveBeenCalledWith('x');
    component.run('hi', 'xx');
    expect(view).toHaveBeenCalledWith('xx');
  });

  it('created by app.start should trigger view', () => {
    const view = jasmine.createSpy('view');
    const component = app.start(document.body, model, view, update);
    expect(view).toHaveBeenCalledWith('x');
    app.run('hi', 'xx');
    expect(view).toHaveBeenCalledWith('xx');
  }); 

  it('should track history', () => {
    const view = jasmine.createSpy('view');
    app.start(document.body, model, view, update, {history:true});
    app.run('hi', 'xx');
    app.run('hi', 'xxx');
    app.run('history-prev');
    app.run('history-next');
    expect(view.calls.allArgs()).toEqual([['x'], ['xx'], ['xxx'], ['xx'], ['xxx']]);
  });

  it('should track history with custom event name', () => {
    const view = jasmine.createSpy('view');
    app.start(document.body, model, view, update, {history:{prev:'prev', next:'next'}});
    app.run('hi', 'xx');
    app.run('hi', 'xxx');
    app.run('prev');
    app.run('next');
    expect(view.calls.allArgs()).toEqual([['x'], ['xx'], ['xxx'], ['xx'], ['xxx']]);
  });

  it('should trigger state changed event with default event name', () => {
    const spy = jasmine.createSpy('spy');
    app.on('state_changed', state => { spy(state); });
    app.start(document.body, model, view, update, {event:true});
    expect(spy).toHaveBeenCalledWith('x');
    app.run('hi', 'abc');
    expect(spy).toHaveBeenCalledWith('abc');
  });

  it('should trigger state changed event with custom event name', () => {
    const spy = jasmine.createSpy('spy');
    app.on('changed', state => { spy(state); });
    const component = app.start(document.body, model, view, update, {event:{name:'changed'}});
    expect(spy).toHaveBeenCalledWith('x');
    app.run('hi', 'ab');
    expect(spy).toHaveBeenCalledWith('ab');
  });

  it('should trigger scoped event', () => {
    const component = app.start(document.body, model, view, update, { global_event: false });
    expect(component.State).toEqual('x');
    app.run('hi', 'xx');
    expect(component.State).toEqual('x');
    component.run('hi', 'xx');
    expect(component.State).toEqual('xx');
    component.run('hi', 'xxx');
    expect(component.State).toEqual('xxx');
    component.run('hi', 'xxxx');
    expect(component.State).toEqual('xxxx');
  });
})