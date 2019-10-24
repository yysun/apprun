export class App {

  private _events: Object;

  public start;
  public createElement;
  public render;
  public Fragment;

  constructor() {
    this._events = {};
  }

  on(name: string, fn: (...args) => void, options: any = {}): void {
    this._events[name] = this._events[name] || [];
    this._events[name].push({ fn, options });
  }

  off(name: string, fn: (...args) => void): void {
    let subscribers = this._events[name];
    if (subscribers) {
      subscribers = subscribers.filter((sub) => sub.fn !== fn);
      if (subscribers.length) this._events[name] = subscribers;
      else delete this._events[name]
    }
  }

  find(name: string): any {
    return this._events[name];
  }

  run(name: string, ...args): number {
    let subscribers = this._events[name];
    console.assert(!!subscribers, 'No subscriber for event: ' + name);
    if (subscribers) {
      subscribers = subscribers.filter((sub) => {
        const { fn, options } = sub;
        if (options.delay) {
          this.delay(name, fn, args, options);
        } else {
          fn.apply(this, args);
        }
        return !sub.options.once;
      });
      if (subscribers.length) this._events[name] = subscribers;
      else delete this._events[name]
    }

    return subscribers ? subscribers.length : 0;
  }

  once(name: string, fn, options: any = {}): void {
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

const AppRunVersions = 'AppRun-1';
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
