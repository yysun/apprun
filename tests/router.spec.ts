import app from '../src/apprun';
import { ROUTER_EVENT, ROUTER_404_EVENT } from '../src/router';

describe('router', () => {

  beforeAll(() => {
    // DOMContentLoaded not called in Jest
    window.onpopstate = () => app.run('route', location.hash || location.pathname);
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  afterEach(() => {
    delete app['debug'];
  });

  it('should guard path router link interception for native browser behaviors', () => {
    const fn = jasmine.createSpy('fn');
    app.on('/native', fn);

    const dispatch = (link: HTMLAnchorElement, event: MouseEvent) => {
      Object.defineProperty(event, 'target', { value: link });
      document.body.dispatchEvent(event);
      return event;
    };

    const sameOriginLink = document.createElement('a');
    sameOriginLink.href = '/native';
    expect(dispatch(sameOriginLink, new MouseEvent('click', { ctrlKey: true, bubbles: true, cancelable: true })).defaultPrevented).toBe(false);

    const metaLink = document.createElement('a');
    metaLink.href = '/native';
    expect(dispatch(metaLink, new MouseEvent('click', { metaKey: true, bubbles: true, cancelable: true })).defaultPrevented).toBe(false);

    const shiftLink = document.createElement('a');
    shiftLink.href = '/native';
    expect(dispatch(shiftLink, new MouseEvent('click', { shiftKey: true, bubbles: true, cancelable: true })).defaultPrevented).toBe(false);

    const altLink = document.createElement('a');
    altLink.href = '/native';
    expect(dispatch(altLink, new MouseEvent('click', { altKey: true, bubbles: true, cancelable: true })).defaultPrevented).toBe(false);

    const secondaryButtonLink = document.createElement('a');
    secondaryButtonLink.href = '/native';
    expect(dispatch(secondaryButtonLink, new MouseEvent('click', { button: 1, bubbles: true, cancelable: true })).defaultPrevented).toBe(false);

    const preventedLink = document.createElement('a');
    preventedLink.href = '/native';
    const prevented = new MouseEvent('click', { bubbles: true, cancelable: true });
    prevented.preventDefault();
    expect(dispatch(preventedLink, prevented).defaultPrevented).toBe(true);

    const targetLink = document.createElement('a');
    targetLink.href = '/native';
    targetLink.target = '_blank';
    expect(dispatch(targetLink, new MouseEvent('click', { bubbles: true, cancelable: true })).defaultPrevented).toBe(false);

    const downloadLink = document.createElement('a');
    downloadLink.href = '/native';
    downloadLink.setAttribute('download', '');
    expect(dispatch(downloadLink, new MouseEvent('click', { bubbles: true, cancelable: true })).defaultPrevented).toBe(false);

    const externalRelLink = document.createElement('a');
    externalRelLink.href = '/native';
    externalRelLink.rel = 'external noopener';
    expect(dispatch(externalRelLink, new MouseEvent('click', { bubbles: true, cancelable: true })).defaultPrevented).toBe(false);

    const externalOriginLink = document.createElement('a');
    externalOriginLink.href = 'https://example.com/native';
    expect(dispatch(externalOriginLink, new MouseEvent('click', { bubbles: true, cancelable: true })).defaultPrevented).toBe(false);

    expect(fn).not.toHaveBeenCalled();
    app.off('/native', fn);
  });

  it('should route plain same-origin path links', () => {
    const link = document.createElement('a');
    const event = new MouseEvent('click', { button: 0, bubbles: true, cancelable: true });
    const fn = jasmine.createSpy('fn');
    const pushState = jest.spyOn(history, 'pushState').mockImplementation(() => { });
    link.href = '/plain-link';
    link.textContent = 'Plain link';
    app.on('/plain-link', fn);
    Object.defineProperty(event, 'target', { value: link.firstChild });

    document.body.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(pushState).toHaveBeenCalledWith(null, '', '/plain-link');
    expect(fn).toHaveBeenCalled();

    app.off('/plain-link', fn);
    pushState.mockRestore();
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
    app['debug'] = true; // no-subscriber assert is gated behind debug
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
    app['debug'] = true; // no-subscriber assert is gated behind debug
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
    app['debug'] = true; // no-subscriber assert is gated behind debug
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
