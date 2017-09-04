
import app, { App } from './app';

export class Component extends App {

  element;
  private _history = [];
  private _history_idx = -1;
  private enable_history;
  private state_changed: string;
  private global_event;

  private renderState(state) {
    if (!this.view) return;
    const html = this.view(state);
    const el = (typeof this.element === 'string') ?
      document.getElementById(this.element) : this.element;
    if (el && app.render) app.render(el, html);
    if (el) el['_component'] = this;
  }

  public setState(state, render = true, history = false) {
    
    if (state instanceof Promise) {
      // state will be rendered, but not saved
      if (render) this.renderState(state);
      // state will be saved when promise is resolved
      state.then(s => {
        this.setState(s, render, history)
      }).catch(err => {
        console.error(err);
        throw err;
      })
    } else {
      this.state = state;
      if (render) this.renderState(state);
      if (history && this.enable_history) {
        this._history = [...this._history, state];
        this._history_idx = this._history.length - 1;
      }
      if (this.state_changed) this.run(this.state_changed, this.state);
    }
  }

  constructor(
    protected state?,
    protected view?,
    protected update?,
    protected options?) {
    super();
  }

  public mount(element = null, options: any = {}) {

    console.assert(!this.element, 'Component already mounted.')
    this.options = options = Object.assign(this.options || {}, options);
    this.element = element;

    this.state_changed = options.event && (options.event.name || 'state_changed');
    this.global_event = options.global_event;
    this.enable_history = !!options.history;

    if (this.enable_history) {
      const prev = () => {
        this._history_idx --;
        if (this._history_idx >=0) {
          this.setState(this._history[this._history_idx], true);
        }
        else {
          this._history_idx = 0;
        }
      };

      const next = () => {
        this._history_idx ++;
        if (this._history_idx < this._history.length) {
          this.setState(this._history[this._history_idx], true);
        }
        else {
          this._history_idx = this._history.length - 1;
        }
      };
      this.on(options.history.prev || 'history-prev', prev)
      this.on(options.history.next || 'history-next', next)
    }
    this.add_actions();
    if (this.state === undefined) this.state = this['model'];
    if (options.render) {
      this.setState(this.state, true, true);
    } else {
      this.setState(this.state, false, true);
    }
    return this;
  }

  is_global_event(name: string): boolean {
    return name && (name.startsWith('#') || name.startsWith('/'));
  }

  add_action(name, action, options: any = {}, fn?) {
    if (!action || typeof action !== 'function') return;
    this.on(name, (...p) => {
      this.setState(action(this.state, ...p),
        options.render !== false,
        options.history !== false);
      if (typeof fn === 'function') fn(this.state);
    }, options);
  }

  add_actions() {
    const actions = this.update || {};
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
      } else if (Array.isArray(action) && typeof action[0] === 'function') {

        if (typeof action[1] === 'function') {
          this.add_action(name, action[0], {}, action[1]);
        } else {
          this.add_action(name, action[0], action[1], action[2]);
        }
      }
    });
  }

  start = (element = null, options: any = {}): Component => {
    if (typeof options.startRun === 'undefined') options.render = true;
    return this.mount(element, options);
  }

  render = () => this.view(this.state);

  public run(name: string, ...args) {
    return this.global_event || this.is_global_event(name) ?
      app.run(name, ...args) :
      super.run(name, ...args);
  }

  public on(name: string, fn: (...args) => void, options?: any) {
    return this.global_event || this.is_global_event(name) ?
      app.on(name, fn, options) :
      super.on(name, fn, options);
  }

  public updateState (object) {
    const state = Object.assign(this.state, object);
    this.setState(state);
  }

}
