import { Events, EventOptions, AppStartOptions, VDOM, View, Update, CustomElementOptions } from './types'
import { Component } from './component';


export class App {

  _events: Events;
  public start: <T, E = any >(element ?: Element | string, model ?: T, view ?: View<T>, update ?: Update<T, E>,
        options?: AppStartOptions<T>) => Component<T, E>;
  public h: (tag: string | Function, props: any, ...children: any[]) => VDOM;
  public createElement: (tag: string | Function, props: any, ...children: any[]) => VDOM;
  public render: (element: Element | string, node: VDOM, component?: any) => void;
  public Fragment: (props: any, ...children: any[]) => any[];
  public webComponent: (name: string, componentClass: any, options?: CustomElementOptions) => void;
  public safeHTML: (html: string) => any[];
  public use_render: (render: (node: any, el: HTMLElement) => void, mode?: 0 | 1) => void;
  public use_react: (React: any, ReactDOM: any) => void;

  public route: (url: string) => void;

  constructor() {
    this._events = {};
  }

  on(name: string, fn: Function, options: EventOptions = {}): void {
    this._events[name] = this._events[name] || [];
    this._events[name].push({ fn, options });
  }

  off(name: string, fn: Function): void {
    const subscribers = this._events[name] || [];

    this._events[name] = subscribers.filter((sub) => sub.fn !== fn);
  }

  find(name: string): Array<{ fn: Function, options: EventOptions }> | undefined {
    return this._events[name];
  }

  run(name: string, ...args: any[]): number {
    const subscribers = this.getSubscribers(name, this._events);
    console.assert(subscribers && subscribers.length > 0, 'No subscriber for event: ' + name);
    subscribers.forEach((sub) => {
      const { fn, options } = sub;
      if (options.delay) {
        this.delay(name, fn, args, options);
      } else {
        Object.keys(options).length > 0 ? fn.apply(this, [...args, options]) : fn.apply(this, args);
      }
      return !sub.options.once;
    });

    return subscribers.length;
  }

  once(name: string, fn: Function, options: EventOptions = {}): void {
    this.on(name, fn, { ...options, once: true });
  }

  private delay(name: string, fn: Function, args: any[], options: EventOptions): void {
    if (options._t) clearTimeout(options._t as number);
    options._t = setTimeout(() => {
      clearTimeout(options._t as number);
      Object.keys(options).length > 0 ? fn.apply(this, [...args, options]) : fn.apply(this, args);
    }, options.delay);
  }

  runAsync(name: string, ...args: any[]): Promise<any[]> {
    const subscribers = this.getSubscribers(name, this._events);
    console.assert(subscribers && subscribers.length > 0, 'No subscriber for event: ' + name);
    const promises = subscribers.map(sub => {
      const { fn, options } = sub;
      return Object.keys(options).length > 0 ? fn.apply(this, [...args, options]) : fn.apply(this, args);
    });
    return Promise.all(promises);
  }

  query(name: string, ...args: any[]): Promise<any[]> {
    return this.runAsync(name, ...args);
  }

  private getSubscribers(name: string, events: Events): Array<{ fn: Function, options: EventOptions }> {
    const subscribers = events[name] || [];
    // Update the list of subscribers by pulling out those which will run once.
    // We must do this update prior to running any of the events in case they
    // cause additional events to be turned off or on.
    events[name] = subscribers.filter((sub) => {
      return !sub.options.once;
    });
    Object.keys(events).filter(evt => evt.endsWith('*') && name.startsWith(evt.replace('*', '')))
      .sort((a, b) => b.length - a.length)
      .forEach(evt => subscribers.push(...events[evt].map(sub => ({
        ...sub,
        options: { ...sub.options, event: name }
      }))));
    return subscribers;
  }
}

const AppRunVersions = 'AppRun-3';
let app: App;
const root = (typeof self === 'object' && self.self === self && self) ||
  (typeof global === 'object' && global.global === global && global)
if (root['app'] && root['_AppRunVersions']) {
  app = root['app'];
} else {
  app = new App();
  root['app'] = app;
  root['_AppRunVersions'] = AppRunVersions;
}
export default app;
