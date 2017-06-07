import app, { App } from './app';

type Model = any;
type View = (model: Model) => string | Function;
type Action = (model: Model, ...p) => Model;
type Update = { [name: string]: Action };

export default class ComponentBase {

  public app;
  protected updateElement;

  protected initVdom() {
  }

  private _history = [];
  private _history_idx = -1;
  private enable_history;
  private state_changed: string;
  private runScope;

  get State() {
    return this.state;
  }

  protected set_state(state) {
    this.state = state;
    const html = this.view(this.state);
    if (this.updateElement) this.updateElement(this.element, html);
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

  constructor(protected element: HTMLElement,
    protected state: any,
    protected view: View,
    update: Update = {},
    options?) {

    this.app = new App();
    this.initVdom();

    console.assert(!!element);
    options = options || {};
    this.enable_history = !!options.history;
    if (this.enable_history) {
      app.on(options.history.prev || 'history-prev', () => {
        this._history_idx --;
        if (this._history_idx >=0) {
          this.set_state(this._history[this._history_idx]);
        }
        else {
          this._history_idx = 0;
        }
      });
      app.on(options.history.next || 'history-next', () => {
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
    this.runScope = options.runScope;
    this.view = view;
    this.add_actions(update);
    // don't run immediately if scoped
    if (!options.runScope) this.push_state(state);
  }

  add_actions(actions) {
    Object.keys(actions).forEach(action => {
      if (this.runScope) {
        this.app.on(action, (...p) => {
          this.push_state(actions[action](this.State, ...p));        });
      } else {
        app.on(action, (...p) => {
          this.push_state(actions[action](this.State, ...p));
        });
      }
    });
  }

  public run(name: string, ...args) {
    return this.app.run(name, ...args);
  }

};
