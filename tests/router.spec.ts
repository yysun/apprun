import app from '../src/apprun';
import route from '../src/router';

describe('router', () => {

  beforeAll(() => {
    window.onpopstate = () => route(location.hash || location.pathname);
  });

  it('should not fire event if not initialize', () => {
    const fn = jasmine.createSpy('fn');
    app.on('//', fn);
    expect(fn).not.toHaveBeenCalled();
  });

  it('should fire events if initialized', () => {
    const fn1 = jasmine.createSpy('fn1');
    const fn2 = jasmine.createSpy('fn2');
    app.on('#', fn1);
    app.on('//', fn2);
    route('');
    expect(fn1).toHaveBeenCalledWith();
    expect(fn2).toHaveBeenCalledWith('#');
  });

  it('should fire events if location hash changes', (done) => {
    const fn3 = jasmine.createSpy('fn3');
    const fn4 = jasmine.createSpy('fn4');
    app.on('#x', fn3);
    app.on('//', fn4);
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
    app.on('//', fn2);
    app.run('route', '/home');
    expect(fn1).toHaveBeenCalledWith();
    expect(fn2).toHaveBeenCalledWith('/home');
  });

  it('should route location all path', () => {
    const fn1 = jasmine.createSpy('fn1');
    const fn2 = jasmine.createSpy('fn2');
    app.on('/x', fn1);
    app.on('//', fn2);
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

});