import app from '../src/apprun';
import { ROUTER_EVENT, ROUTER_404_EVENT } from '../src/router';

describe('router', () => {

  beforeAll(() => {
    // DOMContentLoaded not called in Jest
    window.onpopstate = () => app.run('route', location.hash || location.pathname);
  });

  it('should not fire event if not initialize', () => {
    const fn = jasmine.createSpy('fn');
    app.on(ROUTER_EVENT, fn);
    expect(fn).not.toHaveBeenCalled();
  });

  it('should fire events if initialized', () => {
    const fn1 = jasmine.createSpy('fn1');
    const fn2 = jasmine.createSpy('fn2');
    app.on('#', fn1);
    app.on(ROUTER_EVENT, fn2);
    app.run('route', '');
    expect(fn1).toHaveBeenCalledWith();
    expect(fn2).toHaveBeenCalledWith('#');
  });

  it('should fire events if location hash changes', (done) => {
    const fn3 = jasmine.createSpy('fn3');
    const fn4 = jasmine.createSpy('fn4');
    app.on('#x', fn3);
    app.on(ROUTER_EVENT, fn4);
    document.location.href = '#x';
    setTimeout(() => {
      expect(fn3).toHaveBeenCalledWith();
      expect(fn4).toHaveBeenCalledWith('#x');
      done();
    }, 100);
  });

  it('should route location path', () => {
    const fn1 = jasmine.createSpy('fn1');
    const fn2 = jasmine.createSpy('fn2');
    app.on('/home', fn1);
    app.on(ROUTER_EVENT, fn2);
    app.run('route', '/home');
    expect(fn1).toHaveBeenCalledWith();
    expect(fn2).toHaveBeenCalledWith('/home');
  });

  it('should route location all path', () => {
    const fn1 = jasmine.createSpy('fn1');
    const fn2 = jasmine.createSpy('fn2');
    app.on('/x', fn1);
    app.on(ROUTER_EVENT, fn2);
    app.run('route', '/x/y/z');
    expect(fn1).toHaveBeenCalledWith('y', 'z');
    expect(fn2).toHaveBeenCalledWith('/x', 'y', 'z');
  });

  it('should not convert / to #', () => {
    const fn1 = jasmine.createSpy('fn1');
    const fn2 = jasmine.createSpy('fn2');
    app.on('#', fn1);
    app.on('/', fn2);
    app.run('route', '/');
    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalled();
  });

  it('should not invoke a default route handler if there is an event handler for # based URI', () => {
    const fn1 = jasmine.createSpy('fn1');
    const fn2 = jasmine.createSpy('fn2');
    const fn3 = jasmine.createSpy('fn3');

    app.on(ROUTER_EVENT, fn1);
    app.on(ROUTER_404_EVENT, fn2);
    app.on('#foo', fn3);

    app.run('route', '#foo');

    expect(fn1).toHaveBeenCalledWith('#foo');
    expect(fn2).not.toHaveBeenCalled();
    expect(fn3).toHaveBeenCalled();

    app.off(ROUTER_EVENT, fn1);
    app.off(ROUTER_404_EVENT, fn2);
    app.off('#foo', fn3);
  });

  it('should not invoke a default route handler if there is an event handler for / based URI', () => {
    const fn1 = jasmine.createSpy('fn1');
    const fn2 = jasmine.createSpy('fn2');
    const fn3 = jasmine.createSpy('fn3');

    app.on(ROUTER_EVENT, fn1);
    app.on(ROUTER_404_EVENT, fn2);
    app.on('/foo', fn3);

    app.run('route', '/foo');

    expect(fn1).toHaveBeenCalledWith('/foo');
    expect(fn2).not.toHaveBeenCalledWith('/foo');
    expect(fn3).toHaveBeenCalled();

    app.off(ROUTER_EVENT, fn1);
    app.off(ROUTER_404_EVENT, fn2);
    app.off('/foo', fn3);
  });

  it('should not invoke a default route handler if there is an event handler for a non # or / based URI', () => {
    const fn1 = jasmine.createSpy('fn1');
    const fn2 = jasmine.createSpy('fn2');
    const fn3 = jasmine.createSpy('fn3');

    app.on(ROUTER_EVENT, fn1);
    app.on(ROUTER_404_EVENT, fn2);
    app.on('foo', fn3);

    app.run('route', 'foo');

    expect(fn1).toHaveBeenCalledWith('foo');
    expect(fn2).not.toHaveBeenCalledWith('foo');
    expect(fn3).toHaveBeenCalled();

    app.off(ROUTER_EVENT, fn1);
    app.off(ROUTER_404_EVENT, fn2);
    app.off('foo', fn3);
  });

  it('should invoke a default route handler if there is no event handler for # based URI', () => {
    const fn1 = jasmine.createSpy('fn1');
    const fn2 = jasmine.createSpy('fn2');
    spyOn(console, 'assert');

    app.on(ROUTER_EVENT, fn1);
    app.on(ROUTER_404_EVENT, fn2);

    app.run('route', '#foo');

    expect(fn1).toHaveBeenCalledWith('#foo');
    expect(fn2).toHaveBeenCalledWith('#foo');
    expect(console.assert).toHaveBeenCalled();

    app.off(ROUTER_EVENT, fn1);
    app.off(ROUTER_404_EVENT, fn2);
  });

  it('should invoke a default route handler if there is no event handler for / based URI', () => {
    const fn1 = jasmine.createSpy('fn1');
    const fn2 = jasmine.createSpy('fn2');
    spyOn(console, 'assert');

    app.on(ROUTER_EVENT, fn1);
    app.on(ROUTER_404_EVENT, fn2);

    app.run('route', '/foo');

    expect(fn1).toHaveBeenCalledWith('/foo');
    expect(fn2).toHaveBeenCalledWith('/foo');
    expect(console.assert).toHaveBeenCalled();

    app.off(ROUTER_EVENT, fn1);
    app.off(ROUTER_404_EVENT, fn2);
  });

  it('should invoke a default route handler if there is no event handler for a non # or / based URI', () => {
    const fn1 = jasmine.createSpy('fn1');
    const fn2 = jasmine.createSpy('fn2');
    spyOn(console, 'assert');

    app.on(ROUTER_EVENT, fn1);
    app.on(ROUTER_404_EVENT, fn2);

    app.run('route', 'foo/fred');

    expect(fn1).toHaveBeenCalledWith('foo/fred');
    expect(fn2).toHaveBeenCalledWith('foo/fred');
    expect(console.assert).toHaveBeenCalled();

    app.off(ROUTER_EVENT, fn1);
    app.off(ROUTER_404_EVENT, fn2);
  });

  it('should allow removing the default route function', () => {
    const fn1 = jasmine.createSpy('fn1');
    const fn2 = jasmine.createSpy('fn2');
    app.on(ROUTER_EVENT, fn1);
    app.on(ROUTER_404_EVENT, fn2);

    app['route'] = null;
    app.run('route', '');

    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).not.toHaveBeenCalled();

    app.off(ROUTER_EVENT, fn1);
    app.off(ROUTER_404_EVENT, fn2);
  });

  it('should allow overriding the default route function', () => {
    const fn3 = jasmine.createSpy('fn3');
    const fn4 = jasmine.createSpy('fn4');

    app.on('x', fn3);
    app.on(ROUTER_EVENT, fn4);

    app['route'] = url => { app.run('x', url) };
    app.run('route', '#xx');

    expect(fn3).toHaveBeenCalledWith('#xx');
    expect(fn4).not.toHaveBeenCalled();
  });

  it('should allow to disable the init route call', () => {
    app.route = jest.fn(() => { });
    document.body.setAttribute('apprun-no-init', 'apprun-no-init');
    expect(app.route).not.toHaveBeenCalled();
  });

});