export class App {

  private _events: Object;

  public start;
  public createElement;
  public render;
  public Fragment;

  constructor() {
    this._events = {};
  }

  on(name: string, fn: (...args) => void, options: any = {}) {
    this._events[name] = this._events[name] || [];
    this._events[name].push({ fn: fn, options: options });
  }

  off(name: string, fn: (...args) => void) {
    let subscribers = this._events[name];
    if (subscribers) {
      subscribers = subscribers.filter((sub) => sub.fn !== fn);
      if (subscribers.length) this._events[name] = subscribers;
      else delete this._events[name]
    }
  }

  run(name: string, ...args) {
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
  }

  once(name: string, fn, options: any = {}) {
    this.on(name, fn, { ...options, once: true });
  }

  private delay(name, fn, args, options) {
    if (options._t) clearTimeout(options._t);
    options._t = setTimeout(() => {
      clearTimeout(options._t);
      fn.apply(this, args);
    }, options.delay);
  }
}

let app: App;
declare var global;
const root = global || window;
if (root['app'] && root['app']['start']) {
  app = root['app'];
} else {
  app = new App();
  root['app'] = app;
}
export default app;
