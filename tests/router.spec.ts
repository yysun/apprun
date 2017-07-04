import { } from 'jasmine';
import app from '../app';
import Router from '../router';

describe('router', () => {

  it('should not fire event if not initialize', () => {
    const fn = jasmine.createSpy('fn');
    app.on('//', fn);
    expect(fn).not.toHaveBeenCalled();
  });

  it('should fire events if initialized', () => {
    const fn1 = jasmine.createSpy('fn1');
    const fn2 = jasmine.createSpy('fn2');
    app.on('/', fn1);
    app.on('//', fn2);
    new Router();
    expect(fn1).toHaveBeenCalledWith();
    expect(fn2).toHaveBeenCalledWith('/');
  });

  it('should fire events if location hash changes', (done) => {
    new Router();
    const fn1 = jasmine.createSpy('fn1');
    const fn2 = jasmine.createSpy('fn2');
    app.on('#x', fn1);
    app.on('//', fn2);
    document.location.href = '#x';
    setTimeout(() => {
      expect(fn1).toHaveBeenCalledWith();
      expect(fn2).toHaveBeenCalledWith('#x');
      done();
    }, 100);
  });

  // it('should fire events if location changes', (done) => {
  //   new Router();
  //   const fn1 = jasmine.createSpy('fn1');
  //   const fn2 = jasmine.createSpy('fn2');
  //   app.on('/x', fn1);
  //   app.on('//', fn2);
  //   // this will fail, because it will make page reload
  //   document.location.href = '/x';
  //   setTimeout(() => {
  //     expect(fn1).toHaveBeenCalledWith();
  //     expect(fn2).toHaveBeenCalledWith('/x');
  //     done();
  //   }, 100);
  // });

});