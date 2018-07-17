
import app, { App } from './app';
import { Reflect } from './decorator'
import { VNode, View, Update } from './types';

const componentCache = {};
app.on('get-components', o => o.components = componentCache);

export class Component<T=any> {
  static __isAppRunComponent = true;
  private _app = new App();
  private _actions = [];
  private _state;
  element;
  private _history = [];
  private _history_idx = -1;
  private enable_history;
  private global_event;
  public rendered;
  public mounted;

  private renderState(state: T) {
    if (!this.view) return;
    const html = this.view(state);

    app.run('debug', {
      component: this,
      state,
      vdom: html || '[vdom is null - no render]',
    });

    if (typeof document !== 'object') return;

    const el = (typeof this.element === 'string') ?
      document.getElementById(this.element) : this.element;
    if (el) el['_component'] = this;
    app.render(el, html, this);
    if (this.rendered) (this.rendered(this.state));
  }

  public setState(state: T, options: { render: boolean, history: boolean, callback?}
    = { render: true, history: false}) {
    if (state instanceof Promise) {
      // Promise will not be saved or rendered
      // state will be saved and rendered when promise is resolved
      state.then(s => {
        this.setState(s, options)
      }).catch(err => {
        console.error(err);
        throw err;
      })
      this._state = state;
    } else {
      this._state = state;
      if (state == null) return;
      this.state = state;
      if (options.render !== false) this.renderState(state);
      if (options.history !== false && this.enable_history) {
        this._history = [...this._history, state];
        this._history_idx = this._history.length - 1;
      }
      if (typeof options.callback === 'function') options.callback(this.state);
    }
  }

  constructor(
    protected state?: T,
    protected view?: View<T>,
    protected update?: Update<T>,
    protected options?) {
  }

  start = (element = null,
    options: { render?: boolean, history?, global_event?: boolean } = { render: true }): Component<T> => {
    return this.mount(element, { ...options, render: true });
  }

  public mount(element = null, options?: { render?: boolean, history?, global_event?: boolean}) {

    console.assert(!this.element, 'Component already mounted.')
    this.options = options = Object.assign(this.options || {}, options);
    this.element = element;
    this.global_event = options.global_event;
    this.enable_history = !!options.history;

    if (this.enable_history) {
      const prev = () => {
        this._history_idx --;
        if (this._history_idx >=0) {
          this.setState(this._history[this._history_idx], { render: true, history: false });
        }
        else {
          this._history_idx = 0;
        }
      };

      const next = () => {
        this._history_idx ++;
        if (this._history_idx < this._history.length) {
          this.setState(this._history[this._history_idx], { render: true, history: false });
        }
        else {
          this._history_idx = this._history.length - 1;
        }
      };
      this.on(options.history.prev || 'history-prev', prev)
      this.on(options.history.next || 'history-next', next)
    }
    this.add_actions();
    if (this.state === undefined) this.state = this['model'] || {};
    if (options.render) {
      this.setState(this.state, { render: true, history: true });
    } else {
      this.setState(this.state, { render: false, history: true });
    }

    componentCache[element] = componentCache[element] || [];
    componentCache[element].push(this);
    return this;
  }

  is_global_event(name: string): boolean {
    return name && (name.startsWith('#') || name.startsWith('/'));
  }

  add_action(name: string, action, options: any = {}) {
    if (!action || typeof action !== 'function') return;
    this.on(name, (...p) => {
      const newState = action(this.state, ...p);

      app.run('debug', {
        component: this,
        'event': name,
        e: p,
        state: this.state,
        newState,
        options
      })

      this.setState(newState, options)
    }, options);
  }

  add_actions() {
    const actions = this.update || {};
    Reflect.getMetadataKeys(this).forEach(key => {
      if (key.startsWith('apprun-update:')) {
        const meta = Reflect.getMetadata(key, this)
        actions[meta.name] = [this[meta.key].bind(this), meta.options];
      }
    })
    const all = {};
    Object.keys(actions).forEach(name => {
      const action = actions[name];
      if (typeof action === 'function' || Array.isArray(action)) {
        name.split(',').forEach(n => all[n.trim()] = action)
      }
    })

    Object.keys(all).forEach(name => {
      const action = all[name];
      if (typeof action === 'function') {
        this.add_action(name, action);
      } else if (Array.isArray(action)) {
        this.add_action(name, action[0], action[1]);
      }
    });
  }

  public run(name: string, ...args) {
    return this.global_event || this.is_global_event(name) ?
      app.run(name, ...args) :
      this._app.run(name, ...args);
  }

  public on(name: string, fn: (...args) => void, options?: any) {
    this._actions.push({ name, fn });
    return this.global_event || this.is_global_event(name) ?
      app.on(name, fn, options) :
      this._app.on(name, fn, options);
  }

  public unmount() {
    this._actions.forEach(action => {
      const { name, fn } = action;
      this.global_event || this.is_global_event(name) ?
        app.off(name, fn) :
        this._app.off(name, fn);
    });
  }
}
