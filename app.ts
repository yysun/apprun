export class App {

  private _events: Object;
  public start;

  constructor() {
    this._events = {};
  }

  on(name: string, fn: (...p) => void, options: any = null) {
    options = options || {};
    if (options.debug) console.debug('on: ' + name);
    this._events[name] = this._events[name] || [];
    this._events[name].push({ fn: fn, options: options });
  }

  run(name: string, ...p) {
    let args = [];
    for (let i = 1, j = arguments.length; i < j; i++) {
      args.push(arguments[i]);
    }
    const subscribers = this._events[name];
    console.assert(!!subscribers, 'No subscriber for event: ' + name);
    if (subscribers) this._events[name] = subscribers.filter((sub) => {
      let {fn, options} = sub;
      if (options.delay) {
        this.delay(name, fn, args, options);
      } else {
        if (options.debug) console.debug('run: ' + name, args);
        fn.apply(this, args);
      }
      return !sub.options.once;
    });
  }

  private delay(name, fn, args, options) {
    if (options._t) clearTimeout(options._t);
    options._t = setTimeout(() => {
      clearTimeout(options._t);
      if (options.debug) console.debug(`run-delay ${options.delay}:`  + name, args);
      fn.apply(this, args);
    }, options.delay);
  }
}

let app =  new App();
export default app;