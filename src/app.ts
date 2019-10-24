import { EventOptions} from './types'
export class App {

  private _events: Object;

  public start;
  public createElement;
  public render;
  public Fragment;
  public webComponent;

  constructor() {
    this._events = {};
  }

  on(name: string, fn: (...args) => void, options: EventOptions = {}): void {
    this._events[name] = this._events[name] || [];
    this._events[name].push({ fn, options });
  }

  off(name: string, fn: (...args) => void): void {
    const subscribers = this._events[name] || [];
    
    this._events[name] = subscribers.filter((sub) => sub.fn !== fn);
  }

  find(name: string): any {
    return this._events[name];
  }

  run(name: string, ...args): number {
    let subscribers = this._events[name] || [];

    console.assert(subscribers && subscribers.length > 0, 'No subscriber for event: ' + name);

    // Update the list of subscribers by pulling out those which will run once.
    // We must do this update prior to running any of the events in case they
    // cause additional events to be turned off or on.
    this._events[name] = subscribers.filter((sub) => {
      return !sub.options.once;
    });

    subscribers.forEach((sub) => {
      const { fn, options } = sub;
      if (options.delay) {
        this.delay(name, fn, args, options);
      } else {
        fn.apply(this, args);
      }
      return !sub.options.once;
    });

    return subscribers.length;
  }

  once(name: string, fn, options: EventOptions = {}): void {
    this.on(name, fn, { ...options, once: true });
  }

  private delay(name, fn, args, options): void {
    if (options._t) clearTimeout(options._t);
    options._t = setTimeout(() => {
      clearTimeout(options._t);
      fn.apply(this, args);
    }, options.delay);
  }
}

const AppRunVersions = 'AppRun-2';
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
