/**
 * AppRun routing bootstrap regression coverage.
 *
 * Features:
 * - Executes the real DOMContentLoaded listeners installed by src/apprun.ts.
 * - Verifies default hash routing and explicit pretty-link path routing.
 * - Covers startup opt-out, initial-route suppression, popstate, click, and basePath behavior.
 *
 * Implementation notes:
 * - Each test loads a fresh AppRun singleton and captures browser listeners before invoking them.
 * - Routing mode is configured before the captured DOMContentLoaded callback runs.
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

const invoke = (listener: EventListener, event: Event) => listener.call(null, event);

const loadApp = async (url = '/') : Promise<RoutingHarness> => {
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

const startApp = (harness: RoutingHarness) => {
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

  it('uses hash routing by default without intercepting body clicks', async () => {
    const harness = await loadApp('/#');
    const routeEvent = jest.fn();
    const nextHash = jest.fn();
    harness.app.on(ROUTER_EVENT, routeEvent);

    startApp(harness);

    expect(routeEvent).toHaveBeenCalledWith('#');
    expect(harness.windowListeners.hashchange).toHaveLength(1);
    expect(harness.windowListeners.popstate).toBeUndefined();
    expect(harness.bodyListeners.click).toBeUndefined();

    harness.app.on('#next', nextHash);
    history.replaceState(null, '', '/#next');
    invoke(harness.windowListeners.hashchange[0], new Event('hashchange'));
    expect(nextHash).toHaveBeenCalledTimes(1);
  });

  it.each([undefined, true])('enables pretty links with %s', async enabled => {
    const harness = await loadApp('/base/start');
    const initialRoute = jest.fn();
    const nextRoute = jest.fn();
    harness.app.basePath = '/base';
    harness.app.on('/start', initialRoute);
    harness.app.on('/next', nextRoute);

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
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    Object.defineProperty(click, 'target', { value: anchor });
    invoke(harness.bodyListeners.click[0], click);

    expect(click.defaultPrevented).toBe(true);
    expect(location.pathname).toBe('/base/next');
    expect(nextRoute).toHaveBeenCalledTimes(1);
  });

  it('routes browser history through popstate when pretty links are enabled', async () => {
    const harness = await loadApp('/start');
    harness.app.on('/start', jest.fn());
    const restoredRoute = jest.fn();
    harness.app.on('/restored', restoredRoute);
    harness.app.use_prettyLink();
    startApp(harness);

    history.replaceState(null, '', '/restored');
    invoke(harness.windowListeners.popstate[0], new PopStateEvent('popstate'));
    expect(restoredRoute).toHaveBeenCalledTimes(1);
  });

  it('lets an explicit opt-out override an earlier opt-in before startup', async () => {
    const harness = await loadApp('/#');
    harness.app.use_prettyLink(true);
    harness.app.use_prettyLink(false);

    startApp(harness);

    expect(harness.windowListeners.hashchange).toHaveLength(1);
    expect(harness.windowListeners.popstate).toBeUndefined();
    expect(harness.bodyListeners.click).toBeUndefined();
  });

  it.each(['body-attribute', 'app-flag'])('suppresses only the initial hash route with %s', async mode => {
    const harness = await loadApp('/#initial');
    const routeEvent = jest.fn();
    const nextHash = jest.fn();
    harness.app.on(ROUTER_EVENT, routeEvent);
    harness.app.on('#next', nextHash);
    if (mode === 'body-attribute') document.body.setAttribute('apprun-no-init', '');
    if (mode === 'app-flag') harness.app['no-init-route'] = true;

    startApp(harness);

    expect(routeEvent).not.toHaveBeenCalled();
    history.replaceState(null, '', '/#next');
    invoke(harness.windowListeners.hashchange[0], new Event('hashchange'));
    expect(nextHash).toHaveBeenCalledTimes(1);
  });

  it('suppresses only the initial path route when pretty links are enabled', async () => {
    const harness = await loadApp('/initial');
    const routeEvent = jest.fn();
    const nextRoute = jest.fn();
    harness.app.on(ROUTER_EVENT, routeEvent);
    harness.app.on('/next', nextRoute);
    harness.app['no-init-route'] = true;
    harness.app.use_prettyLink();

    startApp(harness);

    expect(routeEvent).not.toHaveBeenCalled();
    history.replaceState(null, '', '/next');
    invoke(harness.windowListeners.popstate[0], new PopStateEvent('popstate'));
    expect(nextRoute).toHaveBeenCalledTimes(1);
  });
});
