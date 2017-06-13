
import app, { App } from './app';

export default app

 export class Component {

  element;
  state;
  view;
  update;
  render;

  app = new App();

  private _history = [];
  private _history_idx = -1;
  private enable_history;
  private state_changed: string;
  private global_event;

  protected set_state(state) {

    this.state = state;
    if (!this.view) return;
    const html = this.view(this.state);
    if(this.render) this.render(this.element, html);
  }

  private push_state(state) {
    this.set_state(state);
    if (this.enable_history) {
      this._history = [...this._history, state];
      this._history_idx = this._history.length - 1;
    }
    if (this.state_changed) {
      app.run(this.state_changed, this.state);
    }
  }

  public setState = (state) => this.push_state(state);

  public mount(element, options?) {

    this.element = element;
    options = options || {};
    this.enable_history = !!options.history;
    if (this.enable_history) {
      this.app.on(options.history.prev || 'history-prev', () => {
        this._history_idx --;
        if (this._history_idx >=0) {
          this.set_state(this._history[this._history_idx]);
        }
        else {
          this._history_idx = 0;
        }
      });
      this.app.on(options.history.next || 'history-next', () => {
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
    this.push_state(this.state);
    return this.app;
  }

  is_global_event(name: string): boolean {
    return name && name.startsWith('#');
  }

  add_actions() {
    const actions = this.update;
    Object.keys(actions).forEach(action => {
      if (!this.global_event && !this.is_global_event(action)) {
        this.app.on(action, (...p) => {
          this.push_state(actions[action](this.state, ...p));
        });
      } else {
        app.on(action, (...p) => {
          this.push_state(actions[action](this.state, ...p));
        });
      }
    });
  }

  public run(name: string, ...args) {
    return this.is_global_event(name) ?
      app.run(name, ...args):
      this.app.run(name, ...args);
  }

  constructor(model?, view?, update?) {
    this.state = model;
    this.view = view;
    this.update = update;
  }
}
