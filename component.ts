
import app, { App } from './app';

 export class Component extends App {

  element;
  private _history = [];
  private _history_idx = -1;
  private enable_history;
  private state_changed: string;
  private global_event;

  private render_state(state) {
    if (!this.view) return;
    const html = this.view(state);
    if (app.render) app.render(this.element, html);
  }

  private push_to_history(state) {
    if (this.enable_history) {
      this._history = [...this._history, state];
      this._history_idx = this._history.length - 1;
    }
    if (this.state_changed) {
      app.run(this.state_changed, this.state);
    }
  }

  protected set_state(state) {
    this.state = state;
    this.render_state(state);
  }

  private push_state(state) {
    if (state instanceof Promise) {
      // state will be rendered, but not saved
      this.render_state(state);
      // state will be saved when promise is resolved
      state.then(s => {
        this.set_state(s);
        this.push_to_history(s);
      }).catch((err) => {
        console.error(err);
        throw err;
      })
    } else {
      this.set_state(state);
      this.push_to_history(state);
    }
  }
  public setState (state){
    this.push_state(state);
  }

  constructor(
    protected state?,
    protected view?,
    protected update?,
    protected options?) {
    super();
  }

  public mount(element, options: any = {}) {

    console.assert(!this.element, 'Component already mounted.')
    this.options = options = Object.assign(this.options || {}, options);
    this.element = element;

    this.enable_history = !!options.history;
    if (this.enable_history) {
      this.on(options.history.prev || 'history-prev', () => {
        this._history_idx --;
        if (this._history_idx >=0) {
          this.set_state(this._history[this._history_idx]);
        }
        else {
          this._history_idx = 0;
        }
      });
      this.on(options.history.next || 'history-next', () => {
        this._history_idx ++;
        if (this._history_idx < this._history.length) {
          this.set_state(this._history[this._history_idx]);
        }
        else {
          this._history_idx = this._history.length - 1;
        }
      });
    }
    this.state_changed = options.event && (options.event.name || 'state_changed');
    this.global_event = options.global_event;
    this.add_actions();
    if (this.state === undefined) this.state = this['model'];
    this.push_state(this.state);
    return this;
  }

  is_global_event(name: string): boolean {
    return name && (name.startsWith('#') || name.startsWith('/'));
  }

  add_action(name, action, options?) {
    if (!action || typeof action !== 'function') return;
    if (!this.global_event && !this.is_global_event(name)) {
      this.on(name, (...p) => {
        this.push_state(action(this.state, ...p));
      }, options);
    } else {
      app.on(name, (...p) => {
        this.push_state(action(this.state, ...p));
      }, options);
    }
  }

  add_actions() {
    const actions = Object.assign(this.update || {}, this);
    Object.keys(actions).forEach(name => {
      const action = actions[name];
      if (typeof action === 'function') {
        this.add_action(name, action);
      } else if (Array.isArray(action) && typeof action[0] === 'function') {
        this.add_action(name, action[0], action[1]);
      }
    });
  }

  public run(name: string, ...args) {
    return this.is_global_event(name) ?
      app.run(name, ...args) :
      super.run(name, ...args);
  }

  start = (element?, options?) => this.mount(element, options);
}
