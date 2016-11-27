import app from './app';

type Model = any;
type View = (model: Model) => string;
type Action = (model: Model, ...p) => Model;
type Update = { [name: string]: Action };

export default class ComponentBase {

  protected updateElement;
  protected updateElementVtree;

  protected initVdom() {
  }

  private _history = [];
  private _history_idx = -1;
  private enable_history;
  private state_changed: string;

  get State() {
    return this.state;
  }

  protected set_state(state) {
    this.state = state;
    if (state && state.view && typeof state.view === 'function') {
      state.view(this.state);
      state.view = undefined;
      if (this.element.firstChild && this.updateElementVtree) this.updateElementVtree(this.element);
    } else if (this.view) {
      const html = this.view(this.state);
      if (html && this.updateElement) this.updateElement(this.element, html);
    }
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

  constructor(protected element: HTMLElement,
    protected state: any,
    protected view: (any) => string,
    update: Update = {},
    options?) {

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

    this.view = view;
    this.add_actions(update);
    this.push_state(state);
  }

  add_actions(actions) {
    Object.keys(actions).forEach(action => {
      app.on(action, (...p) => {
        this.push_state(actions[action](this.State, ...p));
      });
    });
  }
};
