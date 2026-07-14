/**
 * AppRun browser-routing bootstrap regression coverage.
 *
 * Executes the real listeners installed by src/apprun.ts and verifies the
 * 6.0.0 default-off hash/native contract, explicit pretty-link opt-in,
 * last-call precedence, base-path handling, and initial-route suppression.
 */

import { ROUTER_EVENT } from '../src/router';

type CapturedListeners = Record<string, EventListener[]>;

type RoutingHarness = {
  app: any;
  bodyListeners: CapturedListeners;
  documentListeners: CapturedListeners;
  windowListeners: CapturedListeners;
};

const captureListeners = (target: EventTarget, listeners: CapturedListeners) =>
  jest.spyOn(target, 'addEventListener').mockImplementation(((type: string, listener: EventListener) => {
    listeners[type] = listeners[type] || [];
    listeners[type].push(listener);
  }) as any);

const invoke = (listener: EventListener, event: Event): void => {
  listener.call(null, event);
};

const loadApp = async (url = '/'): Promise<RoutingHarness> => {
  jest.resetModules();
  delete (window as any).app;
  delete (window as any)._AppRunVersions;

  history.replaceState(null, '', url);
  document.body.innerHTML = '';
  document.body.removeAttribute('apprun-no-init');

  const bodyListeners: CapturedListeners = {};
  const documentListeners: CapturedListeners = {};
  const windowListeners: CapturedListeners = {};

  captureListeners(document, documentListeners);
  captureListeners(window, windowListeners);
  captureListeners(document.body, bodyListeners);

  const { default: app } = await import('../src/apprun');
  return { app, bodyListeners, documentListeners, windowListeners };
};

const startApp = (harness: RoutingHarness): void => {
  const listener = harness.documentListeners.DOMContentLoaded?.[0];
  expect(listener).toBeDefined();
  invoke(listener, new Event('DOMContentLoaded'));
};

describe('AppRun routing bootstrap', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    document.body.removeAttribute('apprun-no-init');
    history.replaceState(null, '', '/');
  });

  it('uses hash routing and native links by default', async () => {
    const harness = await loadApp('/#start');
    const initialRoute = jest.fn();
    const nextRoute = jest.fn();
    harness.app.on('#start', initialRoute);
    harness.app.on('#next', nextRoute);

    startApp(harness);

    expect(initialRoute).toHaveBeenCalledTimes(1);
    expect(harness.windowListeners.hashchange).toHaveLength(1);
    expect(harness.windowListeners.popstate).toBeUndefined();
    expect(harness.bodyListeners.click).toBeUndefined();

    const anchor = document.createElement('a');
    anchor.href = '/next';
    anchor.textContent = 'Next';
    const click = new MouseEvent('click', { button: 0, bubbles: true, cancelable: true });
    anchor.dispatchEvent(click);

    expect(click.defaultPrevented).toBe(false);
    history.replaceState(null, '', '/#next');
    invoke(harness.windowListeners.hashchange[0], new Event('hashchange'));
    expect(nextRoute).toHaveBeenCalledTimes(1);
  });

  it.each([undefined, true])('enables pretty links explicitly with %s', async enabled => {
    const harness = await loadApp('/base/start');
    const initialRoute = jest.fn();
    harness.app.basePath = '/base';
    harness.app.on('/start', initialRoute);
    const nextRoute = jest.fn();
    harness.app.on('/next', nextRoute);
    harness.app.on('#legacy', jest.fn());

    enabled === undefined
      ? harness.app.use_prettyLink()
      : harness.app.use_prettyLink(enabled);
    startApp(harness);

    expect(initialRoute).toHaveBeenCalledTimes(1);
    expect(harness.windowListeners.popstate).toHaveLength(1);
    expect(harness.windowListeners.hashchange).toBeUndefined();
    expect(harness.bodyListeners.click).toHaveLength(1);

    const anchor = document.createElement('a');
    anchor.href = '/next';
    const click = new MouseEvent('click', { button: 0, bubbles: true, cancelable: true });
    Object.defineProperty(click, 'target', { value: anchor });
    invoke(harness.bodyListeners.click[0], click);

    expect(click.defaultPrevented).toBe(true);
    expect(location.pathname).toBe('/base/next');
    expect(nextRoute).toHaveBeenCalledTimes(1);
  });

  it('routes browser history through popstate in pretty-link mode', async () => {
    const harness = await loadApp('/start');
    harness.app.on('/start', jest.fn());
    const restoredRoute = jest.fn();
    harness.app.on('/restored', restoredRoute);
    harness.app.use_prettyLink(true);
    startApp(harness);

    history.replaceState(null, '', '/restored');
    invoke(harness.windowListeners.popstate[0], new PopStateEvent('popstate'));

    expect(restoredRoute).toHaveBeenCalledTimes(1);
  });

  it('uses hash routing and native links after an explicit false', async () => {
    const harness = await loadApp('/#start');
    const initialRoute = jest.fn();
    const nextRoute = jest.fn();
    harness.app.on('#start', initialRoute);
    harness.app.on('#next', nextRoute);
    harness.app.use_prettyLink(false);

    startApp(harness);

    expect(initialRoute).toHaveBeenCalledTimes(1);
    expect(harness.windowListeners.hashchange).toHaveLength(1);
    expect(harness.windowListeners.popstate).toBeUndefined();
    expect(harness.bodyListeners.click).toBeUndefined();

    history.replaceState(null, '', '/#next');
    invoke(harness.windowListeners.hashchange[0], new Event('hashchange'));
    expect(nextRoute).toHaveBeenCalledTimes(1);
  });

  it.each([
    { calls: [false, true], expected: 'path' },
    { calls: [true, false], expected: 'hash' }
  ])('lets the last pre-startup call select $expected mode', async ({ calls, expected }) => {
    const harness = await loadApp(expected === 'path' ? '/start' : '/#start');
    calls.forEach(enabled => harness.app.use_prettyLink(enabled));

    startApp(harness);

    if (expected === 'path') {
      expect(harness.windowListeners.popstate).toHaveLength(1);
      expect(harness.windowListeners.hashchange).toBeUndefined();
      expect(harness.bodyListeners.click).toHaveLength(1);
    } else {
      expect(harness.windowListeners.hashchange).toHaveLength(1);
      expect(harness.windowListeners.popstate).toBeUndefined();
      expect(harness.bodyListeners.click).toBeUndefined();
    }
  });

  it.each(['body-attribute', 'app-flag'])('suppresses only the initial path route with %s', async mode => {
    const harness = await loadApp('/initial');
    const routeEvent = jest.fn();
    const nextRoute = jest.fn();
    harness.app.on(ROUTER_EVENT, routeEvent);
    harness.app.on('/next', nextRoute);
    harness.app.use_prettyLink(true);
    if (mode === 'body-attribute') document.body.setAttribute('apprun-no-init', '');
    if (mode === 'app-flag') harness.app['no-init-route'] = true;

    startApp(harness);

    expect(routeEvent).not.toHaveBeenCalled();
    history.replaceState(null, '', '/next');
    invoke(harness.windowListeners.popstate[0], new PopStateEvent('popstate'));
    expect(nextRoute).toHaveBeenCalledTimes(1);
  });

  it.each(['body-attribute', 'app-flag'])('suppresses only the initial hash route with %s', async mode => {
    const harness = await loadApp('/#initial');
    const routeEvent = jest.fn();
    const nextRoute = jest.fn();
    harness.app.on(ROUTER_EVENT, routeEvent);
    harness.app.on('#next', nextRoute);
    if (mode === 'body-attribute') document.body.setAttribute('apprun-no-init', '');
    if (mode === 'app-flag') harness.app['no-init-route'] = true;

    startApp(harness);

    expect(routeEvent).not.toHaveBeenCalled();
    history.replaceState(null, '', '/#next');
    invoke(harness.windowListeners.hashchange[0], new Event('hashchange'));
    expect(nextRoute).toHaveBeenCalledTimes(1);
  });
});
